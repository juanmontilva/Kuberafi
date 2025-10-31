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

        // Cargar relaciones necesarias
        $exchangeHouse->load([
            'users' => function($query) {
                $query->select('id', 'name', 'email', 'role', 'is_active', 'exchange_house_id')
                    ->orderBy('created_at', 'desc');
            },
            'currencyPairs' => function($query) {
                $query->wherePivot('is_active', true)
                    ->wherePivot('deleted_at', null)
                    ->withPivot(['margin_percent', 'min_amount', 'max_amount', 'is_active']);
            }
        ]);

        // Últimas 10 órdenes
        $recentOrders = $exchangeHouse->orders()
            ->with(['currencyPair', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Estadísticas del mes actual
        $thisMonth = now()->startOfMonth();
        $ordersThisMonth = $exchangeHouse->orders()
            ->where('created_at', '>=', $thisMonth)
            ->where('status', 'completed')
            ->count();
        
        $volumeThisMonth = $exchangeHouse->orders()
            ->where('created_at', '>=', $thisMonth)
            ->where('status', 'completed')
            ->sum('base_amount');

        $platformCommissionsThisMonth = $exchangeHouse->orders()
            ->where('created_at', '>=', $thisMonth)
            ->where('status', 'completed')
            ->sum('platform_commission');

        $exchangeCommissionsThisMonth = $exchangeHouse->orders()
            ->where('created_at', '>=', $thisMonth)
            ->where('status', 'completed')
            ->sum('exchange_commission');

        // Estadísticas de hoy
        $ordersToday = $exchangeHouse->orders()
            ->whereDate('created_at', today())
            ->where('status', 'completed')
            ->count();

        $volumeToday = $exchangeHouse->orders()
            ->whereDate('created_at', today())
            ->where('status', 'completed')
            ->sum('base_amount');

        return Inertia::render('Admin/ShowExchangeHouse', [
            'exchangeHouse' => $exchangeHouse,
            'recentOrders' => $recentOrders,
            'stats' => [
                'orders_this_month' => $ordersThisMonth,
                'volume_this_month' => $volumeThisMonth,
                'platform_commissions_this_month' => $platformCommissionsThisMonth,
                'exchange_commissions_this_month' => $exchangeCommissionsThisMonth,
                'orders_today' => $ordersToday,
                'volume_today' => $volumeToday,
            ]
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
            'zero_commission_promo' => 'boolean',
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
