<?php

namespace App\Http\Controllers\ExchangeHouse;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Models\Customer;
use App\Models\CustomerActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;
        
        $query = Customer::where('exchange_house_id', $exchangeHouseId);
        
        // Búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('email', 'ILIKE', "%{$search}%")
                  ->orWhere('phone', 'ILIKE', "%{$search}%")
                  ->orWhere('identification', 'ILIKE', "%{$search}%");
            });
        }
        
        // Filtro por tier
        if ($request->filled('tier') && $request->tier !== 'all') {
            $query->where('tier', $request->tier);
        }
        
        // Filtro por estado
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true)->where('is_blocked', false);
            } elseif ($request->status === 'blocked') {
                $query->where('is_blocked', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }
        
        $customers = $query->orderBy('total_volume', 'desc')->paginate(20);
        
        // OPTIMIZADO: Una sola query para contar por tier
        $tierStats = Customer::where('exchange_house_id', $exchangeHouseId)
            ->selectRaw('
                COUNT(*) as total,
                COUNT(CASE WHEN tier = \'vip\' THEN 1 END) as vip,
                COUNT(CASE WHEN tier = \'regular\' THEN 1 END) as regular,
                COUNT(CASE WHEN tier = \'new\' THEN 1 END) as new,
                COUNT(CASE WHEN tier = \'inactive\' THEN 1 END) as inactive,
                COALESCE(SUM(total_volume), 0) as total_volume
            ')
            ->first();
        
        $stats = [
            'total' => $tierStats->total,
            'vip' => $tierStats->vip,
            'regular' => $tierStats->regular,
            'new' => $tierStats->new,
            'inactive' => $tierStats->inactive,
            'total_volume' => $tierStats->total_volume,
        ];
        
        return Inertia::render('ExchangeHouse/Customers', [
            'customers' => $customers,
            'stats' => $stats,
            'filters' => $request->only(['search', 'tier', 'status']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCustomerRequest $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        
        $validated = $request->validated();
        
        $customer = Customer::create([
            'exchange_house_id' => $user->exchange_house_id,
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'identification' => $validated['identification'] ?? null,
            'address' => $validated['address'] ?? null,
            'tier' => $validated['tier'] ?? 'new',
            'tags' => $validated['tags'] ?? null,
            'internal_notes' => $validated['internal_notes'] ?? null,
            'kyc_status' => $validated['kyc_status'] ?? 'pending',
            'is_active' => $validated['is_active'] ?? true,
            'is_blocked' => $validated['is_blocked'] ?? false,
            'blocked_reason' => $validated['blocked_reason'] ?? null,
        ]);
        
        // Registrar actividad de creación
        CustomerActivity::create([
            'customer_id' => $customer->id,
            'user_id' => $user->id,
            'type' => 'note',
            'title' => 'Cliente creado',
            'description' => 'Cliente registrado manualmente en el sistema',
        ]);
        
        return redirect()->back()->with('success', 'Cliente creado exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Customer $customer)
    {
        // Verificar que pertenece al exchange house del usuario
        $user = $request->user();
        if ($customer->exchange_house_id !== $user->exchange_house_id) {
            abort(403);
        }
        
        // Cargar relaciones
        $customer->load(['orders' => function($query) {
            $query->latest()->limit(10);
        }]);
        
        // Actividades con usuario que la creó
        $activities = $customer->activities()
            ->with('user:id,name')
            ->latest()
            ->paginate(20);
        
        return Inertia::render('ExchangeHouse/CustomerDetail', [
            'customer' => $customer,
            'activities' => $activities,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreCustomerRequest $request, Customer $customer)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        
        // Verificar que pertenece al exchange house del usuario
        if ($customer->exchange_house_id !== $user->exchange_house_id) {
            abort(403);
        }
        
        // Detectar cambios importantes
        $oldTier = $customer->tier;
        $oldKycStatus = $customer->kyc_status;
        $oldIsBlocked = $customer->is_blocked;
        
        $customer->update($request->validated());
        
        // Registrar cambios importantes como actividades
        if ($oldTier !== $customer->tier) {
            CustomerActivity::create([
                'customer_id' => $customer->id,
                'user_id' => $user->id,
                'type' => 'tier_change',
                'title' => 'Cambio de categoría',
                'description' => "Cambió de {$oldTier} a {$customer->tier}",
            ]);
        }
        
        if ($oldKycStatus !== $customer->kyc_status) {
            CustomerActivity::create([
                'customer_id' => $customer->id,
                'user_id' => $user->id,
                'type' => 'kyc_update',
                'title' => 'Actualización de KYC',
                'description' => "Estado de KYC cambió a: {$customer->kyc_status}",
            ]);
        }
        
        if (!$oldIsBlocked && $customer->is_blocked) {
            CustomerActivity::create([
                'customer_id' => $customer->id,
                'user_id' => $user->id,
                'type' => 'status_change',
                'title' => 'Cliente bloqueado',
                'description' => $customer->blocked_reason,
            ]);
        }
        
        return redirect()->back()->with('success', 'Cliente actualizado exitosamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Customer $customer)
    {
        $user = $request->user();
        
        // Verificar que pertenece al exchange house del usuario
        if ($customer->exchange_house_id !== $user->exchange_house_id) {
            abort(403);
        }
        
        $customer->delete();
        
        return redirect()->route('customers.index')->with('success', 'Cliente eliminado exitosamente');
    }
    
    /**
     * Agregar actividad/nota a un cliente
     */
    public function addActivity(Request $request, Customer $customer)
    {
        $user = $request->user();
        
        // Verificar que pertenece al exchange house del usuario
        if ($customer->exchange_house_id !== $user->exchange_house_id) {
            abort(403);
        }
        
        $validated = $request->validate([
            'type' => 'required|in:note,call,email,meeting,other',
            'title' => 'nullable|string|max:255',
            'description' => 'required|string',
            'requires_followup' => 'nullable|boolean',
            'followup_date' => 'nullable|date',
        ]);
        
        CustomerActivity::create([
            'customer_id' => $customer->id,
            'user_id' => $user->id,
            'type' => $validated['type'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'requires_followup' => $validated['requires_followup'] ?? false,
            'followup_date' => $validated['followup_date'] ?? null,
        ]);
        
        return redirect()->back()->with('success', 'Actividad registrada exitosamente');
    }
}
