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

            // Cargar relaciones necesarias
            $order->loadMissing(['paymentMethodIn', 'paymentMethodOut', 'currencyPair']);
            
            // Validar que existan los métodos de pago
            if (!$order->paymentMethodIn || !$order->paymentMethodOut) {
                Log::error("Orden #{$order->order_number} no tiene métodos de pago asignados");
                DB::rollBack();
                return;
            }

            $paymentMethodIn = $order->paymentMethodIn;
            $paymentMethodOut = $order->paymentMethodOut;
            
            // LÓGICA CORRECTA:
            // payment_method_in = Cuenta que RECIBE del cliente (el cliente te paga con esto)
            // payment_method_out = Cuenta que ENTREGA al cliente (tú le pagas con esto)
            
            // Ejemplo: Cliente te da 100 USD, tú le entregas 28,310 VES
            // - Tu saldo USD debe AUMENTAR (+100)
            // - Tu saldo VES debe DISMINUIR (-28,310)

            // ENTRADA: El operador RECIBE la moneda base del cliente
            $balanceIn = OperatorCashBalance::firstOrCreate(
                [
                    'operator_id' => $order->user_id,
                    'payment_method_id' => $paymentMethodIn->id,
                    'currency' => $paymentMethodIn->currency,
                ],
                ['balance' => 0]
            );

            $balanceIn->increment(
                $order->base_amount,
                "Orden #{$order->order_number} - Recibido de cliente: {$order->base_amount} {$paymentMethodIn->currency}",
                $order->id,
                'order_in'
            );

            // SALIDA: El operador ENTREGA la moneda cotizada al cliente
            $balanceOut = OperatorCashBalance::firstOrCreate(
                [
                    'operator_id' => $order->user_id,
                    'payment_method_id' => $paymentMethodOut->id,
                    'currency' => $paymentMethodOut->currency,
                ],
                ['balance' => 0]
            );

            // Verificar que hay suficiente saldo
            if ($balanceOut->balance < $order->quote_amount) {
                Log::warning("Operador {$order->user->name} no tiene suficiente saldo en {$paymentMethodOut->currency}. Necesita: {$order->quote_amount}, Tiene: {$balanceOut->balance}");
                // Continuar de todas formas, pero registrar el saldo negativo
            }

            $balanceOut->decrement(
                $order->quote_amount,
                "Orden #{$order->order_number} - Entregado a cliente: {$order->quote_amount} {$paymentMethodOut->currency}",
                $order->id,
                'order_out'
            );

            DB::commit();

            Log::info("Saldos actualizados para orden #{$order->order_number}. Operador: {$order->user->name}. Recibió: {$order->base_amount} {$paymentMethodIn->currency} ({$paymentMethodIn->name}), Entregó: {$order->quote_amount} {$paymentMethodOut->currency} ({$paymentMethodOut->name})");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error actualizando saldos de caja para orden #{$order->order_number}: " . $e->getMessage());
        }
    }
}
