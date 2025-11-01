<?php

namespace App\Modules\Customers\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Models\Customer;
use App\Modules\Customers\Services\CustomerService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function __construct(
        private CustomerService $customerService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $filters = $request->only(['search', 'tier', 'status']);
        
        $customers = $this->customerService->getCustomers($user, $filters);
        $this->customerService->transformCustomersData($customers);
        
        $stats = $this->customerService->getStats($user);
        
        return Inertia::render('ExchangeHouse/Customers', [
            'customers' => $customers,
            'stats' => $stats,
            'filters' => $filters,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCustomerRequest $request)
    {
        $user = $request->user();
        
        try {
            $this->customerService->createCustomer($request->validated(), $user);
            
            return redirect()->back()->with('success', 'Cliente creado exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Customer $customer)
    {
        $user = $request->user();
        
        if (!$this->customerService->verifyOwnership($customer, $user)) {
            abort(403);
        }
        
        $this->customerService->getCustomerDetail($customer);
        
        // Cargar órdenes con relaciones
        $orders = $customer->orders()
            ->with([
                'currencyPair:id,symbol,base_currency,quote_currency',
                'user:id,name',
                'paymentMethodIn:id,name,currency',
                'paymentMethodOut:id,name,currency'
            ])
            ->orderByRaw("
                CASE 
                    WHEN status = 'pending' THEN 1
                    WHEN status = 'processing' THEN 2
                    WHEN status = 'completed' THEN 3
                    WHEN status = 'cancelled' THEN 4
                    WHEN status = 'failed' THEN 5
                    ELSE 6
                END
            ")
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();
        
        // Actividades
        $activities = $customer->activities()
            ->with('user:id,name')
            ->latest()
            ->paginate(20);
        
        // Cuentas bancarias
        $bankAccounts = $customer->bankAccounts()->latest()->get();
        
        // Divisas activas
        $currencies = \App\Models\Currency::where('is_active', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'symbol']);
        
        return Inertia::render('ExchangeHouse/CustomerDetail', [
            'customer' => $customer,
            'orders' => $orders,
            'activities' => $activities,
            'bankAccounts' => $bankAccounts,
            'currencies' => $currencies,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreCustomerRequest $request, Customer $customer)
    {
        $user = $request->user();
        
        if (!$this->customerService->verifyOwnership($customer, $user)) {
            abort(403);
        }
        
        try {
            $this->customerService->updateCustomer($customer, $request->validated(), $user);
            
            return redirect()->back()->with('success', 'Cliente actualizado exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Customer $customer)
    {
        $user = $request->user();
        
        if (!$this->customerService->verifyOwnership($customer, $user)) {
            abort(403);
        }
        
        try {
            $this->customerService->deleteCustomer($customer);
            
            return redirect()->route('customers.index')->with('success', 'Cliente eliminado exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
    
    /**
     * Agregar actividad/nota a un cliente
     */
    public function addActivity(Request $request, Customer $customer)
    {
        $user = $request->user();
        
        if (!$this->customerService->verifyOwnership($customer, $user)) {
            abort(403);
        }
        
        $validated = $request->validate([
            'type' => 'required|in:note,call,email,meeting,other',
            'title' => 'nullable|string|max:255',
            'description' => 'required|string',
            'requires_followup' => 'nullable|boolean',
            'followup_date' => 'nullable|date',
        ]);
        
        try {
            $this->customerService->addActivity($customer, $validated, $user);
            
            return redirect()->back()->with('success', 'Actividad registrada exitosamente');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
