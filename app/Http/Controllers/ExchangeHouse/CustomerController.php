<?php

namespace App\Http\Controllers\ExchangeHouse;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Models\Customer;
use App\Models\CustomerActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;
        
        $query = Customer::where('exchange_house_id', $exchangeHouseId);
        
        // Búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('email', 'ILIKE', "%{$search}%")
                  ->orWhere('phone', 'ILIKE', "%{$search}%")
                  ->orWhere('identification', 'ILIKE', "%{$search}%");
            });
        }
        
        // Filtro por tier o pendientes
        if ($request->filled('tier') && $request->tier !== 'all') {
            if ($request->tier === 'pending') {
                // Filtrar solo clientes con órdenes pendientes
                $query->whereHas('orders', function($q) {
                    $q->where('status', 'pending');
                });
            } else {
                $query->where('tier', $request->tier);
            }
        }
        
        // Filtro por estado
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true)->where('is_blocked', false);
            } elseif ($request->status === 'blocked') {
                $query->where('is_blocked', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }
        
        $customers = $query
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
        
        // Transformar los datos para incluir volumen por par
        $customers->getCollection()->transform(function ($customer) {
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
            unset($customer->orders); // Remover la relación orders para no enviar datos innecesarios
            
            return $customer;
        });
        
        // OPTIMIZADO: Una sola query para contar por tier
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
        
        // Contar clientes con órdenes pendientes
        $customersWithPendingOrders = Customer::where('exchange_house_id', $exchangeHouseId)
            ->whereHas('orders', function($q) {
                $q->where('status', 'pending');
            })
            ->count();
        
        // Suma total de órdenes pendientes
        $totalPendingAmount = \App\Models\Order::whereHas('customer', function($q) use ($exchangeHouseId) {
                $q->where('exchange_house_id', $exchangeHouseId);
            })
            ->where('status', 'pending')
            ->sum('base_amount');
        
        $stats = [
            'total' => $tierStats->total,
            'vip' => $tierStats->vip,
            'regular' => $tierStats->regular,
            'new' => $tierStats->new,
            'inactive' => $tierStats->inactive,
            'total_volume' => $tierStats->total_volume,
            'customers_with_pending' => $customersWithPendingOrders,
            'total_pending_amount' => $totalPendingAmount,
        ];
        
        return Inertia::render('ExchangeHouse/Customers', [
            'customers' => $customers,
            'stats' => $stats,
            'filters' => $request->only(['search', 'tier', 'status']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCustomerRequest $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        
        $validated = $request->validated();
        
        $customer = Customer::create([
            'exchange_house_id' => $user->exchange_house_id,
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'identification' => $validated['identification'] ?? null,
            'address' => $validated['address'] ?? null,
            'tier' => $validated['tier'] ?? 'new',
            'tags' => $validated['tags'] ?? null,
            'internal_notes' => $validated['internal_notes'] ?? null,
            'kyc_status' => $validated['kyc_status'] ?? 'pending',
            'is_active' => $validated['is_active'] ?? true,
            'is_blocked' => $validated['is_blocked'] ?? false,
            'blocked_reason' => $validated['blocked_reason'] ?? null,
        ]);
        
        // Registrar actividad de creación
        CustomerActivity::create([
            'customer_id' => $customer->id,
            'user_id' => $user->id,
            'type' => 'note',
            'title' => 'Cliente creado',
            'description' => 'Cliente registrado manualmente en el sistema',
        ]);
        
        return redirect()->back()->with('success', 'Cliente creado exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Customer $customer)
    {
        // Verificar que pertenece al exchange house del usuario
        $user = $request->user();
        if ($customer->exchange_house_id !== $user->exchange_house_id) {
            abort(403);
        }
        
        // OPTIMIZADO: Cargar órdenes con todas las relaciones necesarias
        $orders = $customer->orders()
            ->with([
                'currencyPair:id,symbol,base_currency,quote_currency',
                'user:id,name',
                'paymentMethodIn:id,name,currency',
                'paymentMethodOut:id,name,currency'
            ])
            ->orderByRaw("
                CASE 
                    WHEN status = 'pending' THEN 1
                    WHEN status = 'processing' THEN 2
                    WHEN status = 'completed' THEN 3
                    WHEN status = 'cancelled' THEN 4
                    WHEN status = 'failed' THEN 5
                    ELSE 6
                END
            ")
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();
        
        // Agregar conteo de órdenes pendientes
        $customer->pending_orders_count = $customer->orders()
            ->where('status', 'pending')
            ->count();
        
        $customer->pending_orders_amount = $customer->orders()
            ->where('status', 'pending')
            ->sum('base_amount');
        
        // Calcular volumen por par de divisas
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
        
        // Actividades con usuario que la creó
        $activities = $customer->activities()
            ->with('user:id,name')
            ->latest()
            ->paginate(20);
        
        // Cargar cuentas bancarias
        $bankAccounts = $customer->bankAccounts()->latest()->get();
        
        // Cargar divisas activas para el selector
        $currencies = \App\Models\Currency::where('is_active', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'symbol']);
        
        return Inertia::render('ExchangeHouse/CustomerDetail', [
            'customer' => $customer,
            'orders' => $orders,
            'activities' => $activities,
            'bankAccounts' => $bankAccounts,
            'currencies' => $currencies,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreCustomerRequest $request, Customer $customer)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        
        // Verificar que pertenece al exchange house del usuario
        if ($customer->exchange_house_id !== $user->exchange_house_id) {
            abort(403);
        }
        
        // Detectar cambios importantes
        $oldTier = $customer->tier;
        $oldKycStatus = $customer->kyc_status;
        $oldIsBlocked = $customer->is_blocked;
        
        $customer->update($request->validated());
        
        // Registrar cambios importantes como actividades
        if ($oldTier !== $customer->tier) {
            CustomerActivity::create([
                'customer_id' => $customer->id,
                'user_id' => $user->id,
                'type' => 'tier_change',
                'title' => 'Cambio de categoría',
                'description' => "Cambió de {$oldTier} a {$customer->tier}",
            ]);
        }
        
        if ($oldKycStatus !== $customer->kyc_status) {
            CustomerActivity::create([
                'customer_id' => $customer->id,
                'user_id' => $user->id,
                'type' => 'kyc_update',
                'title' => 'Actualización de KYC',
                'description' => "Estado de KYC cambió a: {$customer->kyc_status}",
            ]);
        }
        
        if (!$oldIsBlocked && $customer->is_blocked) {
            CustomerActivity::create([
                'customer_id' => $customer->id,
                'user_id' => $user->id,
                'type' => 'status_change',
                'title' => 'Cliente bloqueado',
                'description' => $customer->blocked_reason,
            ]);
        }
        
        return redirect()->back()->with('success', 'Cliente actualizado exitosamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Customer $customer)
    {
        $user = $request->user();
        
        // Verificar que pertenece al exchange house del usuario
        if ($customer->exchange_house_id !== $user->exchange_house_id) {
            abort(403);
        }
        
        $customer->delete();
        
        return redirect()->route('customers.index')->with('success', 'Cliente eliminado exitosamente');
    }
    
    /**
     * Agregar actividad/nota a un cliente
     */
    public function addActivity(Request $request, Customer $customer)
    {
        $user = $request->user();
        
        // Verificar que pertenece al exchange house del usuario
        if ($customer->exchange_house_id !== $user->exchange_house_id) {
            abort(403);
        }
        
        $validated = $request->validate([
            'type' => 'required|in:note,call,email,meeting,other',
            'title' => 'nullable|string|max:255',
            'description' => 'required|string',
            'requires_followup' => 'nullable|boolean',
            'followup_date' => 'nullable|date',
        ]);
        
        CustomerActivity::create([
            'customer_id' => $customer->id,
            'user_id' => $user->id,
            'type' => $validated['type'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'requires_followup' => $validated['requires_followup'] ?? false,
            'followup_date' => $validated['followup_date'] ?? null,
        ]);
        
        return redirect()->back()->with('success', 'Actividad registrada exitosamente');
    }
}
