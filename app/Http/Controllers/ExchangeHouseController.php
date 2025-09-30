<?php

namespace App\Http\Controllers;

use App\Models\ExchangeHouse;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExchangeHouseController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $exchangeHouses = ExchangeHouse::withCount(['users', 'orders'])
            ->withSum('orders', 'base_amount')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/ExchangeHouses', [
            'exchangeHouses' => $exchangeHouses,
        ]);
    }

    public function create()
    {
        $user = request()->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        return Inertia::render('Admin/CreateExchangeHouse');
    }

    public function store(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'business_name' => 'required|string|max:255',
            'tax_id' => 'required|string|unique:exchange_houses',
            'email' => 'required|email|unique:exchange_houses',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'commission_rate' => 'required|numeric|min:0|max:100',
            'daily_limit' => 'required|numeric|min:0',
            'allowed_currencies' => 'required|array|min:1',
        ]);

        ExchangeHouse::create($validated);

        return redirect()->route('exchange-houses.index')
            ->with('success', 'Casa de cambio creada exitosamente');
    }

    public function show(ExchangeHouse $exchangeHouse)
    {
        $user = request()->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        // OPTIMIZADO: Eager load con limit para evitar cargar todas las órdenes
        $exchangeHouse->load([
            'users',
            'orders' => function($query) {
                $query->with('currencyPair')
                    ->orderBy('created_at', 'desc')
                    ->limit(20); // Solo las 20 más recientes
            }
        ]);
        
        return Inertia::render('Admin/ShowExchangeHouse', [
            'exchangeHouse' => $exchangeHouse,
        ]);
    }

    public function edit(ExchangeHouse $exchangeHouse)
    {
        $user = request()->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        return Inertia::render('Admin/EditExchangeHouse', [
            'exchangeHouse' => $exchangeHouse,
        ]);
    }

    public function update(Request $request, ExchangeHouse $exchangeHouse)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'business_name' => 'required|string|max:255',
            'tax_id' => 'required|string|unique:exchange_houses,tax_id,' . $exchangeHouse->id,
            'email' => 'required|email|unique:exchange_houses,email,' . $exchangeHouse->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'commission_rate' => 'required|numeric|min:0|max:100',
            'daily_limit' => 'required|numeric|min:0',
            'allowed_currencies' => 'required|array|min:1',
            'is_active' => 'boolean',
        ]);

        $exchangeHouse->update($validated);

        return redirect()->route('exchange-houses.index')
            ->with('success', 'Casa de cambio actualizada exitosamente');
    }

    public function destroy(ExchangeHouse $exchangeHouse)
    {
        $user = request()->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $exchangeHouse->delete();

        return redirect()->route('exchange-houses.index')
            ->with('success', 'Casa de cambio eliminada exitosamente');
    }
}
