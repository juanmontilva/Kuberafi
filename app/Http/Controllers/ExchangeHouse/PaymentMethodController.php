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

        return Inertia::render('ExchangeHouse/PaymentMethods', [
            'paymentMethods' => $paymentMethods,
            'stats' => [
                'total' => $paymentMethods->count(),
                'active' => $paymentMethods->where('is_active', true)->count(),
                'by_currency' => $paymentMethods->groupBy('currency')->map->count(),
            ],
        ]);
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
        ]);

        $user = $request->user();
        
        // Si se marca como default, desmarcar otros del mismo currency
        if ($validated['is_default'] ?? false) {
            PaymentMethod::where('exchange_house_id', $user->exchange_house_id)
                ->where('currency', $validated['currency'])
                ->update(['is_default' => false]);
        }

        PaymentMethod::create([
            ...$validated,
            'exchange_house_id' => $user->exchange_house_id,
        ]);

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

        // Verificar que no tenga órdenes asociadas
        if ($paymentMethod->orders()->count() > 0) {
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
