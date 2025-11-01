<?php

namespace App\Modules\Orders\Services;

use App\Models\User;
use App\Models\CurrencyPair;
use App\Models\PaymentMethod;

class PaymentMethodSelector
{
    /**
     * Seleccionar métodos de pago para una orden
     */
    public function select(
        User $user,
        CurrencyPair $currencyPair,
        string $mode,
        ?int $paymentMethodInId = null,
        ?int $paymentMethodOutId = null
    ): array {
        if ($mode === 'manual') {
            return $this->selectManual($user, $currencyPair, $paymentMethodInId, $paymentMethodOutId);
        }
        
        return $this->selectAutomatic($user, $currencyPair);
    }

    /**
     * Selección manual de métodos de pago
     */
    private function selectManual(
        User $user,
        CurrencyPair $currencyPair,
        ?int $paymentMethodInId,
        ?int $paymentMethodOutId
    ): array {
        if (!$paymentMethodInId || !$paymentMethodOutId) {
            throw new \Exception("En modo manual debes seleccionar ambos métodos de pago.");
        }
        
        $paymentMethodIn = PaymentMethod::find($paymentMethodInId);
        $paymentMethodOut = PaymentMethod::find($paymentMethodOutId);
        
        // Validar pertenencia
        if ($paymentMethodIn->exchange_house_id !== $user->exchange_house_id || 
            $paymentMethodOut->exchange_house_id !== $user->exchange_house_id) {
            throw new \Exception("Los métodos de pago seleccionados no pertenecen a tu casa de cambio.");
        }
        
        // Validar monedas
        if ($paymentMethodIn->currency !== $currencyPair->base_currency || 
            $paymentMethodOut->currency !== $currencyPair->quote_currency) {
            throw new \Exception("Los métodos de pago no coinciden con las monedas del par seleccionado.");
        }
        
        return [
            'in' => $paymentMethodIn,
            'out' => $paymentMethodOut,
        ];
    }

    /**
     * Selección automática de métodos de pago (por mayor balance)
     */
    private function selectAutomatic(User $user, CurrencyPair $currencyPair): array
    {
        $baseCurrency = $currencyPair->base_currency;
        $quoteCurrency = $currencyPair->quote_currency;
        
        $paymentMethodIn = PaymentMethod::select('payment_methods.*', 'operator_cash_balances.balance')
            ->leftJoin('operator_cash_balances', function($join) use ($user, $baseCurrency) {
                $join->on('payment_methods.id', '=', 'operator_cash_balances.payment_method_id')
                     ->where('operator_cash_balances.operator_id', '=', $user->id)
                     ->where('operator_cash_balances.currency', '=', $baseCurrency);
            })
            ->where('payment_methods.exchange_house_id', $user->exchange_house_id)
            ->where('payment_methods.currency', $baseCurrency)
            ->where('payment_methods.is_active', true)
            ->orderByDesc('operator_cash_balances.balance')
            ->first();
        
        $paymentMethodOut = PaymentMethod::select('payment_methods.*', 'operator_cash_balances.balance')
            ->leftJoin('operator_cash_balances', function($join) use ($user, $quoteCurrency) {
                $join->on('payment_methods.id', '=', 'operator_cash_balances.payment_method_id')
                     ->where('operator_cash_balances.operator_id', '=', $user->id)
                     ->where('operator_cash_balances.currency', '=', $quoteCurrency);
            })
            ->where('payment_methods.exchange_house_id', $user->exchange_house_id)
            ->where('payment_methods.currency', $quoteCurrency)
            ->where('payment_methods.is_active', true)
            ->orderByDesc('operator_cash_balances.balance')
            ->first();
        
        if (!$paymentMethodIn) {
            throw new \Exception("No tienes un método de pago activo para {$baseCurrency}. Configura uno primero.");
        }
        
        if (!$paymentMethodOut) {
            throw new \Exception("No tienes un método de pago activo para {$quoteCurrency}. Configura uno primero.");
        }
        
        return [
            'in' => $paymentMethodIn,
            'out' => $paymentMethodOut,
        ];
    }
}
