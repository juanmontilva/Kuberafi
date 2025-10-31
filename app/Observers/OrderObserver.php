<?php

namespace App\Observers;

use App\Models\Order;
use App\Models\OperatorCashBalance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderObserver
{
    /**
     * Handle the Order "updated" event.
     * Se ejecuta cuando una orden cambia de estado
     */
    public function updated(Order $order): void
    {
        // Solo procesar si la orden acaba de completarse
        if ($order->isDirty('status') && $order->status === 'completed') {
            $this->updateCashBalances($order);
        }
    }

    /**
     * Actualizar los saldos de caja del operador
     */
    private function updateCashBalances(Order $order): void
    {
        try {
            DB::beginTransaction();

            // Obtener el par de divisas
            $currencyPair = $order->currencyPair;
            
            // Determinar qué moneda entra y cuál sale
            $baseCurrency = $currencyPair->base_currency; // USD
            $quoteCurrency = $currencyPair->quote_currency; // VES
            
            // Buscar método de pago para la moneda base (la que recibe)
            $paymentMethodIn = \App\Models\PaymentMethod::where('exchange_house_id', $order->exchange_house_id)
                ->where('currency', $baseCurrency)
                ->where('is_active', true)
                ->first();
            
            if (!$paymentMethodIn) {
                Log::warning("No hay método de pago activo para {$baseCurrency} en casa de cambio {$order->exchange_house_id}");
                DB::rollBack();
                return;
            }

            // Buscar método de pago para la moneda cotizada (la que entrega)
            $paymentMethodOut = \App\Models\PaymentMethod::where('exchange_house_id', $order->exchange_house_id)
                ->where('currency', $quoteCurrency)
                ->where('is_active', true)
                ->first();
            
            if (!$paymentMethodOut) {
                Log::warning("No hay método de pago activo para {$quoteCurrency} en casa de cambio {$order->exchange_house_id}");
                DB::rollBack();
                return;
            }

            // ENTRADA: El operador recibe la moneda base (USD)
            $balanceIn = OperatorCashBalance::firstOrCreate(
                [
                    'operator_id' => $order->user_id,
                    'payment_method_id' => $paymentMethodIn->id,
                    'currency' => $baseCurrency,
                ],
                ['balance' => 0]
            );

            $balanceIn->increment(
                $order->base_amount,
                "Orden #{$order->order_number} - Cliente pagó {$baseCurrency}",
                $order->id,
                'order_in'
            );

            // SALIDA: El operador entrega la moneda cotizada (VES)
            $balanceOut = OperatorCashBalance::firstOrCreate(
                [
                    'operator_id' => $order->user_id,
                    'payment_method_id' => $paymentMethodOut->id,
                    'currency' => $quoteCurrency,
                ],
                ['balance' => 0]
            );

            // Verificar que hay suficiente saldo
            if ($balanceOut->balance < $order->quote_amount) {
                Log::warning("Operador {$order->user->name} no tiene suficiente saldo en {$quoteCurrency}. Necesita: {$order->quote_amount}, Tiene: {$balanceOut->balance}");
                // Continuar de todas formas, pero registrar el saldo negativo
            }

            $balanceOut->decrement(
                $order->quote_amount,
                "Orden #{$order->order_number} - Entregado {$quoteCurrency} a cliente",
                $order->id,
                'order_out'
            );

            DB::commit();

            Log::info("Saldos actualizados para orden #{$order->order_number}. Operador: {$order->user->name}. Método IN: {$paymentMethodIn->name}, Método OUT: {$paymentMethodOut->name}");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error actualizando saldos de caja para orden #{$order->order_number}: " . $e->getMessage());
        }
    }
}
