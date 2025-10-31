<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformPaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlatformPaymentMethodController extends Controller
{
    public function index()
    {
        $paymentMethods = PlatformPaymentMethod::ordered()->get();

        return Inertia::render('Admin/PlatformPaymentMethods', [
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:bank_transfer,mobile_payment,zelle,crypto,wire_transfer,paypal,other',
            'currency' => 'required|string|max:10',
            'account_holder' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'identification' => 'nullable|string|max:255',
            'routing_number' => 'nullable|string|max:255',
            'swift_code' => 'nullable|string|max:255',
            'instructions' => 'required|string',
            'is_active' => 'boolean',
            'is_primary' => 'boolean',
            'display_order' => 'integer|min:0',
        ]);

        // Si se marca como principal, desmarcar otros del mismo currency
        if ($validated['is_primary'] ?? false) {
            PlatformPaymentMethod::where('currency', $validated['currency'])
                ->update(['is_primary' => false]);
        }

        PlatformPaymentMethod::create($validated);

        return redirect()->back()->with('success', 'Método de pago creado exitosamente');
    }

    public function update(Request $request, PlatformPaymentMethod $platformPaymentMethod)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:bank_transfer,mobile_payment,zelle,crypto,wire_transfer,paypal,other',
            'currency' => 'required|string|max:10',
            'account_holder' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'identification' => 'nullable|string|max:255',
            'routing_number' => 'nullable|string|max:255',
            'swift_code' => 'nullable|string|max:255',
            'instructions' => 'required|string',
            'is_active' => 'boolean',
            'is_primary' => 'boolean',
            'display_order' => 'integer|min:0',
        ]);

        // Si se marca como principal, desmarcar otros del mismo currency
        if ($validated['is_primary'] ?? false) {
            PlatformPaymentMethod::where('currency', $validated['currency'])
                ->where('id', '!=', $platformPaymentMethod->id)
                ->update(['is_primary' => false]);
        }

        $platformPaymentMethod->update($validated);

        return redirect()->back()->with('success', 'Método de pago actualizado exitosamente');
    }

    public function destroy(PlatformPaymentMethod $platformPaymentMethod)
    {
        $platformPaymentMethod->delete();

        return redirect()->back()->with('success', 'Método de pago eliminado exitosamente');
    }

    public function toggle(PlatformPaymentMethod $platformPaymentMethod)
    {
        $platformPaymentMethod->update([
            'is_active' => !$platformPaymentMethod->is_active,
        ]);

        return redirect()->back()->with('success', 'Estado actualizado exitosamente');
    }
}
