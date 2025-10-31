<?php

namespace App\Http\Controllers\ExchangeHouse;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerBankAccount;
use Illuminate\Http\Request;

class CustomerBankAccountController extends Controller
{
    public function store(Request $request, Customer $customer)
    {
        // Verificar que pertenece al exchange house del usuario
        if ($customer->exchange_house_id !== $request->user()->exchange_house_id) {
            abort(403);
        }
        
        $validated = $request->validate([
            'account_name' => 'required|string|max:255',
            'bank_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:255',
            'account_type' => 'nullable|string|max:255',
            'currency' => 'required|string|max:10',
            'notes' => 'nullable|string',
        ]);
        
        $customer->bankAccounts()->create($validated);
        
        return back()->with('success', 'Cuenta bancaria agregada exitosamente');
    }
    
    public function update(Request $request, Customer $customer, CustomerBankAccount $bankAccount)
    {
        // Verificar que pertenece al exchange house del usuario
        if ($customer->exchange_house_id !== $request->user()->exchange_house_id) {
            abort(403);
        }
        
        // Verificar que la cuenta pertenece al cliente
        if ($bankAccount->customer_id !== $customer->id) {
            abort(403);
        }
        
        $validated = $request->validate([
            'account_name' => 'required|string|max:255',
            'bank_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:255',
            'account_type' => 'nullable|string|max:255',
            'currency' => 'required|string|max:10',
            'notes' => 'nullable|string',
        ]);
        
        $bankAccount->update($validated);
        
        return back()->with('success', 'Cuenta bancaria actualizada exitosamente');
    }
    
    public function destroy(Request $request, Customer $customer, CustomerBankAccount $bankAccount)
    {
        // Verificar que pertenece al exchange house del usuario
        if ($customer->exchange_house_id !== $request->user()->exchange_house_id) {
            abort(403);
        }
        
        // Verificar que la cuenta pertenece al cliente
        if ($bankAccount->customer_id !== $customer->id) {
            abort(403);
        }
        
        $bankAccount->delete();
        
        return back()->with('success', 'Cuenta bancaria eliminada exitosamente');
    }
}
