<?php

namespace App\Http\Controllers\ExchangeHouse;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentMethodController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $exchangeHouse = $user->exchangeHouse;

        $paymentMethods = $exchangeHouse->paymentMethods()
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Obtener saldos de caja para cada método de pago
        $paymentMethodsWithBalances = $paymentMethods->map(function ($method) use ($user) {
            // Si es operador, obtener su saldo
            if ($user->isOperator()) {
                $balance = \App\Models\OperatorCashBalance::where('operator_id', $user->id)
                    ->where('payment_method_id', $method->id)
                    ->where('currency', $method->currency)
                    ->first();
                
                $method->current_balance = $balance ? $balance->balance : 0;
            } else {
                // Si es casa de cambio, sumar saldos de todos los operadores
                $totalBalance = \App\Models\OperatorCashBalance::where('payment_method_id', $method->id)
                    ->where('currency', $method->currency)
                    ->sum('balance');
                
                $method->current_balance = $totalBalance;
            }
            
            return $method;
        });

        // Obtener monedas disponibles desde los pares de divisas activos de la casa de cambio
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
        
        // Eliminar duplicados y ordenar
        $availableCurrencies = $availableCurrencies->unique('code')->sortBy('code')->values();

        return Inertia::render('ExchangeHouse/PaymentMethods', [
            'paymentMethods' => $paymentMethodsWithBalances,
            'availableCurrencies' => $availableCurrencies,
            'stats' => [
                'total' => $paymentMethods->count(),
                'active' => $paymentMethods->where('is_active', true)->count(),
                'by_currency' => $paymentMethods->groupBy('currency')->map->count(),
            ],
        ]);
    }

    private function getCurrencyName($code)
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:bank_transfer,mobile_payment,zelle,crypto,cash,wire_transfer,other',
            'currency' => 'required|string|max:10',
            'account_holder' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'identification' => 'nullable|string|max:255',
            'instructions' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'daily_limit' => 'nullable|numeric|min:0',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
            'initial_balance' => 'nullable|numeric|min:0',
        ]);

        $user = $request->user();
        
        // Si se marca como default, desmarcar otros del mismo currency
        if ($validated['is_default'] ?? false) {
            PaymentMethod::where('exchange_house_id', $user->exchange_house_id)
                ->where('currency', $validated['currency'])
                ->update(['is_default' => false]);
        }

        $initialBalance = $validated['initial_balance'] ?? null;
        unset($validated['initial_balance']);

        // Debug: Log para verificar
        \Illuminate\Support\Facades\Log::info('Creando método de pago', [
            'user_id' => $user->id,
            'user_role' => $user->role,
            'initial_balance' => $initialBalance,
            'currency' => $validated['currency'],
        ]);

        $paymentMethod = PaymentMethod::create([
            ...$validated,
            'exchange_house_id' => $user->exchange_house_id,
        ]);

        // Si hay saldo inicial, crear el balance para el usuario actual
        if ($initialBalance !== null && $initialBalance > 0) {
            // Determinar el operador_id correcto
            $operatorId = $user->isOperator() ? $user->id : $user->id;
            
            \App\Models\OperatorCashBalance::create([
                'operator_id' => $operatorId,
                'payment_method_id' => $paymentMethod->id,
                'currency' => $paymentMethod->currency,
                'balance' => $initialBalance,
            ]);

            // Registrar el movimiento inicial
            \App\Models\CashMovement::create([
                'operator_id' => $operatorId,
                'payment_method_id' => $paymentMethod->id,
                'order_id' => null,
                'type' => 'deposit',
                'currency' => $paymentMethod->currency,
                'amount' => $initialBalance,
                'balance_before' => 0,
                'balance_after' => $initialBalance,
                'description' => 'Saldo inicial al crear método de pago',
            ]);
        }

        return redirect()->back()->with('success', 'Método de pago agregado exitosamente');
    }

    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        // Verificar que pertenece a la casa de cambio
        if ($paymentMethod->exchange_house_id !== $request->user()->exchange_house_id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:bank_transfer,mobile_payment,zelle,crypto,cash,wire_transfer,other',
            'currency' => 'required|string|max:10',
            'account_holder' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'identification' => 'nullable|string|max:255',
            'instructions' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'daily_limit' => 'nullable|numeric|min:0',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
        ]);

        // Si se marca como default, desmarcar otros del mismo currency
        if ($validated['is_default'] ?? false) {
            PaymentMethod::where('exchange_house_id', $request->user()->exchange_house_id)
                ->where('currency', $validated['currency'])
                ->where('id', '!=', $paymentMethod->id)
                ->update(['is_default' => false]);
        }

        $paymentMethod->update($validated);

        return redirect()->back()->with('success', 'Método de pago actualizado');
    }

    public function destroy(Request $request, PaymentMethod $paymentMethod)
    {
        // Verificar que pertenece a la casa de cambio
        if ($paymentMethod->exchange_house_id !== $request->user()->exchange_house_id) {
            abort(403);
        }

        // Verificar que no tenga órdenes asociadas - OPTIMIZADO
        if ($paymentMethod->orders()->exists()) {
            return redirect()->back()->with('error', 'No se puede eliminar un método de pago con órdenes asociadas');
        }

        $paymentMethod->delete();

        return redirect()->back()->with('success', 'Método de pago eliminado');
    }

    public function toggle(Request $request, PaymentMethod $paymentMethod)
    {
        // Verificar que pertenece a la casa de cambio
        if ($paymentMethod->exchange_house_id !== $request->user()->exchange_house_id) {
            abort(403);
        }

        $paymentMethod->update([
            'is_active' => !$paymentMethod->is_active
        ]);

        return redirect()->back()->with('success', 'Estado actualizado');
    }
}
