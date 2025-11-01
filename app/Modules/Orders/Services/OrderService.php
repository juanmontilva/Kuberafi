<?php

namespace App\Modules\Orders\Services;

use App\Models\Order;
use App\Models\Customer;
use App\Models\CustomerActivity;
use App\Models\Commission;
use App\Models\CurrencyPair;
use App\Models\PaymentMethod;
use App\Models\OperatorCashBalance;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        private CommissionCalculator $commissionCalculator,
        private PaymentMethodSelector $paymentMethodSelector
    ) {}

    /**
     * Crear una nueva orden
     */
    public function createOrder(array $data, User $user): Order
    {
        $currencyPair = CurrencyPair::findOrFail($data['currency_pair_id']);
        $exchangeHouse = $user->exchangeHouse;
        
        // Validar configuración del par
        $pivotData = $this->validateCurrencyPairConfiguration($exchangeHouse, $currencyPair, $data['base_amount']);
        
        // Calcular montos y comisiones
        $calculation = $this->commissionCalculator->calculate(
            $pivotData,
            $data['base_amount'],
            'buy',
            $exchangeHouse
        );
        
        // Seleccionar métodos de pago
        $paymentMethods = $this->paymentMethodSelector->select(
            $user,
            $currencyPair,
            $data['payment_method_selection_mode'],
            $data['payment_method_in_id'] ?? null,
            $data['payment_method_out_id'] ?? null
        );
        
        // Validar saldo disponible
        $this->validateBalance($user, $paymentMethods['out'], $calculation['quote_amount']);
        
        // Crear orden en transacción
        return DB::transaction(function () use ($data, $user, $currencyPair, $calculation, $paymentMethods, $exchangeHouse) {
            $order = Order::create([
                'exchange_house_id' => $user->exchange_house_id,
                'currency_pair_id' => $data['currency_pair_id'],
                'user_id' => $user->id,
                'customer_id' => $data['customer_id'] ?? null,
                'payment_method_id' => $paymentMethods['out']->id,
                'payment_method_in_id' => $paymentMethods['in']->id,
                'payment_method_out_id' => $paymentMethods['out']->id,
                'payment_method_selection_mode' => $data['payment_method_selection_mode'],
                'base_amount' => $data['base_amount'],
                'quote_amount' => $calculation['quote_amount'],
                'market_rate' => $currencyPair->current_rate,
                'applied_rate' => $calculation['rate_applied'],
                'commission_model' => $calculation['commission_model'],
                'buy_rate' => $calculation['buy_rate'],
                'sell_rate' => $calculation['sell_rate'],
                'spread_profit' => $calculation['spread_profit'],
                'expected_margin_percent' => $calculation['margin_percent'],
                'actual_margin_percent' => $calculation['margin_percent'],
                'house_commission_percent' => $data['house_commission_percent'] ?? $calculation['commission_percent'],
                'house_commission_amount' => $calculation['commission_amount'],
                'platform_commission' => $calculation['platform_commission'],
                'exchange_commission' => $calculation['exchange_commission'],
                'net_amount' => $calculation['net_amount'],
                'status' => 'pending',
                'notes' => $data['notes'] ?? null,
            ]);
            
            // Registrar actividad del cliente
            if ($order->customer_id) {
                $this->recordCustomerActivity($order, $user, $currencyPair);
            }
            
            // Crear comisiones
            Commission::createFromOrder($order);
            
            return $order;
        });
    }

    /**
     * Completar una orden
     */
    public function completeOrder(Order $order, array $data): Order
    {
        return DB::transaction(function () use ($order, $data) {
            $calculation = $this->commissionCalculator->calculateActual(
                $order,
                $data['actual_rate'],
                $data['actual_quote_amount']
            );
            
            $order->update([
                'quote_amount' => $data['actual_quote_amount'],
                'actual_margin_percent' => $data['actual_margin_percent'],
                'house_commission_amount' => $calculation['house_commission'],
                'platform_commission' => $calculation['platform_commission'],
                'exchange_commission' => $calculation['exchange_commission'],
                'status' => 'completed',
                'completed_at' => now(),
                'notes' => $data['notes'] ?? $order->notes,
            ]);
            
            return $order;
        });
    }

    /**
     * Cancelar una orden
     */
    public function cancelOrder(Order $order, string $reason, User $user): Order
    {
        return DB::transaction(function () use ($order, $reason, $user) {
            // Revertir movimientos de caja
            $this->revertCashMovements($order, $reason);
            
            // Actualizar orden
            $order->update([
                'status' => 'cancelled',
                'cancellation_reason' => $reason,
                'cancelled_by' => $user->id,
                'cancelled_at' => now(),
            ]);
            
            // Eliminar comisiones
            Commission::where('order_id', $order->id)->delete();
            
            return $order;
        });
    }

    /**
     * Validar configuración del par de divisas
     */
    private function validateCurrencyPairConfiguration($exchangeHouse, $currencyPair, $baseAmount)
    {
        $pivotData = $exchangeHouse->currencyPairs()
            ->where('currency_pair_id', $currencyPair->id)
            ->wherePivot('is_active', true)
            ->first();
        
        if (!$pivotData) {
            throw new \Exception("Este par de divisas no está disponible para tu casa de cambio");
        }
        
        $minAmount = $pivotData->pivot->min_amount;
        $maxAmount = $pivotData->pivot->max_amount;
        
        if ($baseAmount < $minAmount) {
            throw new \Exception("El monto mínimo es {$minAmount}");
        }
        
        if ($maxAmount && $baseAmount > $maxAmount) {
            throw new \Exception("El monto máximo es {$maxAmount}");
        }
        
        return $pivotData;
    }

    /**
     * Validar saldo disponible
     */
    private function validateBalance(User $user, PaymentMethod $paymentMethod, float $requiredAmount): void
    {
        $currentBalance = OperatorCashBalance::where('operator_id', $user->id)
            ->where('payment_method_id', $paymentMethod->id)
            ->where('currency', $paymentMethod->currency)
            ->first();
        
        $availableBalance = $currentBalance ? $currentBalance->balance : 0;
        
        if ($availableBalance < $requiredAmount) {
            $deficit = $requiredAmount - $availableBalance;
            throw new \Exception(
                "Saldo insuficiente en {$paymentMethod->currency} ({$paymentMethod->name}). " .
                "Necesitas " . number_format($requiredAmount, 2) . ", " .
                "tienes " . number_format($availableBalance, 2) . ". " .
                "Faltante: " . number_format($deficit, 2)
            );
        }
    }

    /**
     * Registrar actividad del cliente
     */
    private function recordCustomerActivity(Order $order, User $user, CurrencyPair $currencyPair): void
    {
        $customer = Customer::find($order->customer_id);
        if ($customer) {
            $customer->updateMetrics();
            
            CustomerActivity::create([
                'customer_id' => $customer->id,
                'user_id' => $user->id,
                'type' => 'order_created',
                'title' => 'Nueva orden creada',
                'description' => "Orden #{$order->order_number} por {$order->base_amount} {$currencyPair->base_currency}",
            ]);
        }
    }

    /**
     * Revertir movimientos de caja
     */
    private function revertCashMovements(Order $order, string $reason): void
    {
        $cashMovements = \App\Models\CashMovement::where('order_id', $order->id)->get();
        
        if ($cashMovements->isEmpty()) {
            return;
        }
        
        // Obtener balances necesarios
        $balanceKeys = $cashMovements->map(fn($m) => [
            'operator_id' => $m->operator_id,
            'payment_method_id' => $m->payment_method_id,
            'currency' => $m->currency
        ])->unique();
        
        $balances = OperatorCashBalance::where(function($query) use ($balanceKeys) {
            foreach ($balanceKeys as $key) {
                $query->orWhere(function($q) use ($key) {
                    $q->where('operator_id', $key['operator_id'])
                      ->where('payment_method_id', $key['payment_method_id'])
                      ->where('currency', $key['currency']);
                });
            }
        })->get()->keyBy(fn($b) => $b->operator_id . '_' . $b->payment_method_id . '_' . $b->currency);
        
        // Crear reversiones
        $reversions = [];
        foreach ($cashMovements as $movement) {
            $balanceKey = $movement->operator_id . '_' . $movement->payment_method_id . '_' . $movement->currency;
            $balance = $balances->get($balanceKey);
            
            if ($balance) {
                $revertAmount = -$movement->amount;
                
                $reversions[] = [
                    'operator_id' => $movement->operator_id,
                    'payment_method_id' => $movement->payment_method_id,
                    'order_id' => $order->id,
                    'type' => 'adjustment',
                    'currency' => $movement->currency,
                    'amount' => $revertAmount,
                    'balance_before' => $balance->balance,
                    'balance_after' => $balance->balance + $revertAmount,
                    'description' => "Reversión por cancelación de orden #{$order->order_number}: {$reason}",
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                
                $balance->balance += $revertAmount;
            }
        }
        
        if (!empty($reversions)) {
            \App\Models\CashMovement::insert($reversions);
            foreach ($balances as $balance) {
                $balance->save();
            }
        }
    }
}
