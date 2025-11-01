<?php

namespace App\Modules\Payments\Services;

use App\Models\PaymentMethod;
use App\Models\OperatorCashBalance;
use App\Models\CashMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    /**
     * Obtener métodos de pago con balances
     */
    public function getPaymentMethodsWithBalances(User $user)
    {
        $exchangeHouse = $user->exchangeHouse;
        
        $paymentMethods = $exchangeHouse->paymentMethods()
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return $paymentMethods->map(function ($method) use ($user) {
            if ($user->isOperator()) {
                $balance = OperatorCashBalance::where('operator_id', $user->id)
                    ->where('payment_method_id', $method->id)
                    ->where('currency', $method->currency)
                    ->first();
                
                $method->current_balance = $balance ? $balance->balance : 0;
            } else {
                $totalBalance = OperatorCashBalance::where('payment_method_id', $method->id)
                    ->where('currency', $method->currency)
                    ->sum('balance');
                
                $method->current_balance = $totalBalance;
            }
            
            return $method;
        });
    }

    /**
     * Obtener estadísticas de métodos de pago
     */
    public function getStats($paymentMethods): array
    {
        return [
            'total' => $paymentMethods->count(),
            'active' => $paymentMethods->where('is_active', true)->count(),
            'by_currency' => $paymentMethods->groupBy('currency')->map->count(),
        ];
    }

    /**
     * Obtener monedas disponibles
     */
    public function getAvailableCurrencies()
    {
        $currencyPairs = \App\Models\CurrencyPair::where('is_active', true)->get();
        $availableCurrencies = collect();
        
        foreach ($currencyPairs as $pair) {
            $availableCurrencies->push([
                'code' => $pair->base_currency,
                'name' => $this->getCurrencyName($pair->base_currency),
            ]);
            $availableCurrencies->push([
                'code' => $pair->quote_currency,
                'name' => $this->getCurrencyName($pair->quote_currency),
            ]);
        }
        
        return $availableCurrencies->unique('code')->sortBy('code')->values();
    }

    /**
     * Crear método de pago
     */
    public function createPaymentMethod(array $data, User $user): PaymentMethod
    {
        return DB::transaction(function () use ($data, $user) {
            // Si se marca como default, desmarcar otros
            if ($data['is_default'] ?? false) {
                $this->unsetDefaultForCurrency($user->exchange_house_id, $data['currency']);
            }
            
            $initialBalance = $data['initial_balance'] ?? null;
            unset($data['initial_balance']);
            
            Log::info('Creando método de pago', [
                'user_id' => $user->id,
                'user_role' => $user->role,
                'initial_balance' => $initialBalance,
                'currency' => $data['currency'],
            ]);
            
            $paymentMethod = PaymentMethod::create([
                ...$data,
                'exchange_house_id' => $user->exchange_house_id,
            ]);
            
            // Crear saldo inicial si existe
            if ($initialBalance !== null && $initialBalance > 0) {
                $this->createInitialBalance($user, $paymentMethod, $initialBalance);
            }
            
            return $paymentMethod;
        });
    }

    /**
     * Actualizar método de pago
     */
    public function updatePaymentMethod(PaymentMethod $paymentMethod, array $data, User $user): PaymentMethod
    {
        // Si se marca como default, desmarcar otros
        if ($data['is_default'] ?? false) {
            $this->unsetDefaultForCurrency(
                $user->exchange_house_id,
                $data['currency'],
                $paymentMethod->id
            );
        }
        
        $paymentMethod->update($data);
        
        return $paymentMethod;
    }

    /**
     * Eliminar método de pago
     */
    public function deletePaymentMethod(PaymentMethod $paymentMethod): bool
    {
        // Verificar que no tenga órdenes asociadas
        if ($paymentMethod->orders()->exists()) {
            throw new \Exception('No se puede eliminar un método de pago con órdenes asociadas');
        }
        
        return $paymentMethod->delete();
    }

    /**
     * Alternar estado activo
     */
    public function toggleActive(PaymentMethod $paymentMethod): PaymentMethod
    {
        $paymentMethod->update([
            'is_active' => !$paymentMethod->is_active
        ]);
        
        return $paymentMethod;
    }

    /**
     * Verificar pertenencia al exchange house
     */
    public function verifyOwnership(PaymentMethod $paymentMethod, User $user): bool
    {
        return $paymentMethod->exchange_house_id === $user->exchange_house_id;
    }

    /**
     * Agregar fondos a un método de pago
     */
    public function addFunds(User $user, PaymentMethod $paymentMethod, float $amount, string $description): CashMovement
    {
        return DB::transaction(function () use ($user, $paymentMethod, $amount, $description) {
            $balance = OperatorCashBalance::firstOrCreate(
                [
                    'operator_id' => $user->id,
                    'payment_method_id' => $paymentMethod->id,
                    'currency' => $paymentMethod->currency,
                ],
                ['balance' => 0]
            );
            
            $balanceBefore = $balance->balance;
            $balance->balance += $amount;
            $balance->save();
            
            return CashMovement::create([
                'operator_id' => $user->id,
                'payment_method_id' => $paymentMethod->id,
                'type' => 'deposit',
                'currency' => $paymentMethod->currency,
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $balance->balance,
                'description' => $description,
            ]);
        });
    }

    /**
     * Retirar fondos de un método de pago
     */
    public function withdrawFunds(User $user, PaymentMethod $paymentMethod, float $amount, string $description): CashMovement
    {
        return DB::transaction(function () use ($user, $paymentMethod, $amount, $description) {
            $balance = OperatorCashBalance::where('operator_id', $user->id)
                ->where('payment_method_id', $paymentMethod->id)
                ->where('currency', $paymentMethod->currency)
                ->firstOrFail();
            
            if ($balance->balance < $amount) {
                throw new \Exception('Saldo insuficiente');
            }
            
            $balanceBefore = $balance->balance;
            $balance->balance -= $amount;
            $balance->save();
            
            return CashMovement::create([
                'operator_id' => $user->id,
                'payment_method_id' => $paymentMethod->id,
                'type' => 'withdrawal',
                'currency' => $paymentMethod->currency,
                'amount' => -$amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $balance->balance,
                'description' => $description,
            ]);
        });
    }

    /**
     * Obtener balance de un operador
     */
    public function getBalance(User $user, PaymentMethod $paymentMethod): float
    {
        $balance = OperatorCashBalance::where('operator_id', $user->id)
            ->where('payment_method_id', $paymentMethod->id)
            ->where('currency', $paymentMethod->currency)
            ->first();
        
        return $balance ? $balance->balance : 0;
    }

    /**
     * Desmarcar default para una moneda
     */
    private function unsetDefaultForCurrency(int $exchangeHouseId, string $currency, ?int $excludeId = null): void
    {
        $query = PaymentMethod::where('exchange_house_id', $exchangeHouseId)
            ->where('currency', $currency);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        $query->update(['is_default' => false]);
    }

    /**
     * Crear saldo inicial
     */
    private function createInitialBalance(User $user, PaymentMethod $paymentMethod, float $amount): void
    {
        $operatorId = $user->isOperator() ? $user->id : $user->id;
        
        OperatorCashBalance::create([
            'operator_id' => $operatorId,
            'payment_method_id' => $paymentMethod->id,
            'currency' => $paymentMethod->currency,
            'balance' => $amount,
        ]);
        
        CashMovement::create([
            'operator_id' => $operatorId,
            'payment_method_id' => $paymentMethod->id,
            'order_id' => null,
            'type' => 'deposit',
            'currency' => $paymentMethod->currency,
            'amount' => $amount,
            'balance_before' => 0,
            'balance_after' => $amount,
            'description' => 'Saldo inicial al crear método de pago',
        ]);
    }

    /**
     * Obtener nombre de moneda
     */
    private function getCurrencyName(string $code): string
    {
        $currencies = [
            'USD' => 'Dólar Estadounidense',
            'VES' => 'Bolívar Venezolano',
            'EUR' => 'Euro',
            'COP' => 'Peso Colombiano',
            'ARS' => 'Peso Argentino',
            'BRL' => 'Real Brasileño',
            'CLP' => 'Peso Chileno',
            'MXN' => 'Peso Mexicano',
            'PEN' => 'Sol Peruano',
            'USDT' => 'Tether',
            'BTC' => 'Bitcoin',
            'ETH' => 'Ethereum',
        ];
        
        return $currencies[$code] ?? $code;
    }

    /**
     * Obtener balances del operador agrupados por moneda
     */
    public function getOperatorBalances(User $user)
    {
        $operatorId = $user->id;
        
        return OperatorCashBalance::where('operator_id', $operatorId)
            ->with('paymentMethod')
            ->get()
            ->groupBy('currency');
    }

    /**
     * Obtener movimientos recientes
     */
    public function getRecentMovements(User $user, int $limit = 20)
    {
        return CashMovement::where('operator_id', $user->id)
            ->with(['paymentMethod', 'order'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Obtener estadísticas del día
     */
    public function getTodayStats(User $user)
    {
        return CashMovement::where('operator_id', $user->id)
            ->whereDate('created_at', today())
            ->selectRaw('
                currency,
                SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_in,
                SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_out,
                COUNT(*) as movements_count
            ')
            ->groupBy('currency')
            ->get()
            ->keyBy('currency');
    }

    /**
     * Registrar movimiento manual (depósito/retiro/ajuste)
     */
    public function registerMovement(User $user, array $data): CashMovement
    {
        return DB::transaction(function () use ($user, $data) {
            // Obtener o crear balance
            $balance = OperatorCashBalance::firstOrCreate(
                [
                    'operator_id' => $user->id,
                    'payment_method_id' => $data['payment_method_id'],
                    'currency' => $data['currency'],
                ],
                ['balance' => 0]
            );
            
            $balanceBefore = $balance->balance;
            $amount = $data['amount'];
            $description = $data['description'] ?? 'Movimiento manual';
            
            // Calcular nuevo balance según tipo
            if ($data['type'] === 'withdrawal') {
                if ($balance->balance < $amount) {
                    throw new \Exception('Saldo insuficiente');
                }
                $balance->balance -= $amount;
                $amount = -$amount; // Negativo para retiros
            } else {
                $balance->balance += $amount;
            }
            
            $balance->save();
            
            // Registrar movimiento
            return CashMovement::create([
                'operator_id' => $user->id,
                'payment_method_id' => $data['payment_method_id'],
                'order_id' => null,
                'type' => $data['type'],
                'currency' => $data['currency'],
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $balance->balance,
                'description' => $description,
            ]);
        });
    }

    /**
     * Obtener historial de movimientos con filtros
     */
    public function getMovementsHistory(User $user, array $filters = [])
    {
        $query = CashMovement::where('operator_id', $user->id)
            ->with(['paymentMethod', 'order', 'user']);
        
        // Aplicar filtros
        if (!empty($filters['payment_method'])) {
            $query->where('payment_method_id', $filters['payment_method']);
        }
        
        if (!empty($filters['currency'])) {
            $query->where('currency', $filters['currency']);
        }
        
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }
        
        return $query->orderBy('created_at', 'desc')->paginate(50);
    }

    /**
     * Obtener monedas únicas del operador
     */
    public function getOperatorCurrencies(User $user): array
    {
        return CashMovement::where('operator_id', $user->id)
            ->distinct()
            ->pluck('currency')
            ->toArray();
    }

    /**
     * Obtener métodos de pago activos para el exchange house
     */
    public function getActivePaymentMethods(int $exchangeHouseId)
    {
        return PaymentMethod::where('exchange_house_id', $exchangeHouseId)
            ->where('is_active', true)
            ->select('id', 'name')
            ->get();
    }
}
