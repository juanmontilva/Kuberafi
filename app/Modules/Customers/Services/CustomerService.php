<?php

namespace App\Modules\Customers\Services;

use App\Models\Customer;
use App\Models\CustomerActivity;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CustomerService
{
    /**
     * Obtener clientes con filtros
     */
    public function getCustomers(User $user, array $filters = [])
    {
        $query = Customer::where('exchange_house_id', $user->exchange_house_id);
        
        // Búsqueda
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('email', 'ILIKE', "%{$search}%")
                  ->orWhere('phone', 'ILIKE', "%{$search}%")
                  ->orWhere('identification', 'ILIKE', "%{$search}%");
            });
        }
        
        // Filtro por tier
        if (!empty($filters['tier']) && $filters['tier'] !== 'all') {
            if ($filters['tier'] === 'pending') {
                $query->whereHas('orders', function($q) {
                    $q->where('status', 'pending');
                });
            } else {
                $query->where('tier', $filters['tier']);
            }
        }
        
        // Filtro por estado
        if (!empty($filters['status'])) {
            if ($filters['status'] === 'active') {
                $query->where('is_active', true)->where('is_blocked', false);
            } elseif ($filters['status'] === 'blocked') {
                $query->where('is_blocked', true);
            } elseif ($filters['status'] === 'inactive') {
                $query->where('is_active', false);
            }
        }
        
        return $query
            ->withCount(['orders as pending_orders_count' => function($q) {
                $q->where('status', 'pending');
            }])
            ->withSum(['orders as pending_orders_amount' => function($q) {
                $q->where('status', 'pending');
            }], 'base_amount')
            ->with(['orders' => function($q) {
                $q->select('customer_id', 'currency_pair_id', DB::raw('COUNT(*) as order_count'), DB::raw('SUM(base_amount) as total_base_amount'))
                    ->groupBy('customer_id', 'currency_pair_id')
                    ->with('currencyPair:id,symbol,base_currency,quote_currency');
            }])
            ->orderBy('total_volume', 'desc')
            ->paginate(20);
    }

    /**
     * Obtener estadísticas de clientes
     */
    public function getStats(User $user): array
    {
        $exchangeHouseId = $user->exchange_house_id;
        
        $tierStats = Customer::where('exchange_house_id', $exchangeHouseId)
            ->selectRaw('
                COUNT(*) as total,
                COUNT(CASE WHEN tier = \'vip\' THEN 1 END) as vip,
                COUNT(CASE WHEN tier = \'regular\' THEN 1 END) as regular,
                COUNT(CASE WHEN tier = \'new\' THEN 1 END) as new,
                COUNT(CASE WHEN tier = \'inactive\' THEN 1 END) as inactive,
                COALESCE(SUM(total_volume), 0) as total_volume
            ')
            ->first();
        
        $customersWithPendingOrders = Customer::where('exchange_house_id', $exchangeHouseId)
            ->whereHas('orders', function($q) {
                $q->where('status', 'pending');
            })
            ->count();
        
        $totalPendingAmount = \App\Models\Order::whereHas('customer', function($q) use ($exchangeHouseId) {
                $q->where('exchange_house_id', $exchangeHouseId);
            })
            ->where('status', 'pending')
            ->sum('base_amount');
        
        return [
            'total' => $tierStats->total,
            'vip' => $tierStats->vip,
            'regular' => $tierStats->regular,
            'new' => $tierStats->new,
            'inactive' => $tierStats->inactive,
            'total_volume' => $tierStats->total_volume,
            'customers_with_pending' => $customersWithPendingOrders,
            'total_pending_amount' => $totalPendingAmount,
        ];
    }

    /**
     * Transformar datos de clientes para incluir volumen por par
     */
    public function transformCustomersData($customers)
    {
        return $customers->getCollection()->transform(function ($customer) {
            $volumeByPair = $customer->orders->map(function ($order) {
                return [
                    'currency_pair' => $order->currencyPair ? [
                        'symbol' => $order->currencyPair->symbol,
                        'base_currency' => $order->currencyPair->base_currency,
                        'quote_currency' => $order->currencyPair->quote_currency,
                    ] : null,
                    'order_count' => $order->order_count,
                    'total_base_amount' => $order->total_base_amount,
                ];
            });
            
            $customer->volume_by_pair = $volumeByPair;
            unset($customer->orders);
            
            return $customer;
        });
    }

    /**
     * Obtener detalle completo de un cliente
     */
    public function getCustomerDetail(Customer $customer)
    {
        // Agregar conteos
        $customer->pending_orders_count = $customer->orders()
            ->where('status', 'pending')
            ->count();
        
        $customer->pending_orders_amount = $customer->orders()
            ->where('status', 'pending')
            ->sum('base_amount');
        
        // Volumen por par
        $volumeByPair = $customer->orders()
            ->selectRaw('
                currency_pair_id,
                COUNT(*) as order_count,
                SUM(base_amount) as total_base_amount,
                SUM(quote_amount) as total_quote_amount
            ')
            ->groupBy('currency_pair_id')
            ->with('currencyPair:id,symbol,base_currency,quote_currency')
            ->get()
            ->map(function ($item) {
                return [
                    'currency_pair' => $item->currencyPair ? [
                        'id' => $item->currencyPair->id,
                        'symbol' => $item->currencyPair->symbol,
                        'base_currency' => $item->currencyPair->base_currency,
                        'quote_currency' => $item->currencyPair->quote_currency,
                    ] : null,
                    'order_count' => $item->order_count,
                    'total_base_amount' => $item->total_base_amount,
                    'total_quote_amount' => $item->total_quote_amount,
                ];
            });
        
        $customer->volume_by_pair = $volumeByPair;
        
        return $customer;
    }

    /**
     * Crear un nuevo cliente
     */
    public function createCustomer(array $data, User $user): Customer
    {
        $customer = Customer::create([
            'exchange_house_id' => $user->exchange_house_id,
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'identification' => $data['identification'] ?? null,
            'address' => $data['address'] ?? null,
            'tier' => $data['tier'] ?? 'new',
            'tags' => $data['tags'] ?? null,
            'internal_notes' => $data['internal_notes'] ?? null,
            'kyc_status' => $data['kyc_status'] ?? 'pending',
            'is_active' => $data['is_active'] ?? true,
            'is_blocked' => $data['is_blocked'] ?? false,
            'blocked_reason' => $data['blocked_reason'] ?? null,
        ]);
        
        $this->recordActivity($customer, $user, 'note', 'Cliente creado', 'Cliente registrado manualmente en el sistema');
        
        return $customer;
    }

    /**
     * Actualizar cliente con tracking de cambios
     */
    public function updateCustomer(Customer $customer, array $data, User $user): Customer
    {
        // Detectar cambios importantes
        $oldTier = $customer->tier;
        $oldKycStatus = $customer->kyc_status;
        $oldIsBlocked = $customer->is_blocked;
        
        $customer->update($data);
        
        // Registrar cambios importantes
        if ($oldTier !== $customer->tier) {
            $this->recordActivity($customer, $user, 'tier_change', 'Cambio de categoría', "Cambió de {$oldTier} a {$customer->tier}");
        }
        
        if ($oldKycStatus !== $customer->kyc_status) {
            $this->recordActivity($customer, $user, 'kyc_update', 'Actualización de KYC', "Estado de KYC cambió a: {$customer->kyc_status}");
        }
        
        if (!$oldIsBlocked && $customer->is_blocked) {
            $this->recordActivity($customer, $user, 'status_change', 'Cliente bloqueado', $customer->blocked_reason);
        }
        
        return $customer;
    }

    /**
     * Eliminar cliente
     */
    public function deleteCustomer(Customer $customer): bool
    {
        return $customer->delete();
    }

    /**
     * Agregar actividad a un cliente
     */
    public function addActivity(Customer $customer, array $data, User $user): CustomerActivity
    {
        return CustomerActivity::create([
            'customer_id' => $customer->id,
            'user_id' => $user->id,
            'type' => $data['type'],
            'title' => $data['title'] ?? null,
            'description' => $data['description'],
            'requires_followup' => $data['requires_followup'] ?? false,
            'followup_date' => $data['followup_date'] ?? null,
        ]);
    }

    /**
     * Verificar pertenencia al exchange house
     */
    public function verifyOwnership(Customer $customer, User $user): bool
    {
        return $customer->exchange_house_id === $user->exchange_house_id;
    }

    /**
     * Registrar actividad del cliente
     */
    private function recordActivity(Customer $customer, User $user, string $type, string $title, string $description): void
    {
        CustomerActivity::create([
            'customer_id' => $customer->id,
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'description' => $description,
        ]);
    }
}
