<?php

namespace App\Modules\Payments\Controllers;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use App\Modules\Payments\Services\PaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentMethodController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        
        $paymentMethods = $this->paymentService->getPaymentMethodsWithBalances($user);
        $stats = $this->paymentService->getStats($paymentMethods);
        $availableCurrencies = $this->paymentService->getAvailableCurrencies();
        
        return Inertia::render('ExchangeHouse/PaymentMethods', [
            'paymentMethods' => $paymentMethods,
            'availableCurrencies' => $availableCurrencies,
            'stats' => $stats,
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
            'initial_balance' => 'nullable|numeric|min:0',
        ]);
        
        $user = $request->user();
        
        try {
            $this->paymentService->createPaymentMethod($validated, $user);
            
            return redirect()->back()->with('success', 'Método de pago agregado exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        $user = $request->user();
        
        if (!$this->paymentService->verifyOwnership($paymentMethod, $user)) {
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
        
        try {
            $this->paymentService->updatePaymentMethod($paymentMethod, $validated, $user);
            
            return redirect()->back()->with('success', 'Método de pago actualizado');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(Request $request, PaymentMethod $paymentMethod)
    {
        $user = $request->user();
        
        if (!$this->paymentService->verifyOwnership($paymentMethod, $user)) {
            abort(403);
        }
        
        try {
            $this->paymentService->deletePaymentMethod($paymentMethod);
            
            return redirect()->back()->with('success', 'Método de pago eliminado');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function toggle(Request $request, PaymentMethod $paymentMethod)
    {
        $user = $request->user();
        
        if (!$this->paymentService->verifyOwnership($paymentMethod, $user)) {
            abort(403);
        }
        
        try {
            $this->paymentService->toggleActive($paymentMethod);
            
            return redirect()->back()->with('success', 'Estado actualizado');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
