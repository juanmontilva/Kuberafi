<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\CurrencyPair;
use App\Models\Commission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Order::withRelations();
        
        // Filtrar según el rol del usuario
        if ($user->isSuperAdmin()) {
            // Super Admin puede ver todas las órdenes
            // No aplicar filtros adicionales
        } elseif ($user->isExchangeHouse() || $user->isOperator()) {
            $query->forExchangeHouse($user->exchange_house_id);
            
            if ($user->isOperator()) {
                $query->where('user_id', $user->id);
            }
        }
        
        // Aplicar filtros de request si existen
        if ($request->has('status')) {
            $query->byStatus($request->get('status'));
        }
        
        $orders = $query->orderBy('created_at', 'desc')->paginate(20);
        
        return Inertia::render('Orders/Index', [
            'orders' => $orders,
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();
        
        // Solo casas de cambio y operadores pueden crear órdenes
        if (!$user->isExchangeHouse() && !$user->isOperator()) {
            abort(403);
        }
        
        $currencyPairs = CurrencyPair::where('is_active', true)->get();
        $platformCommissionRate = \App\Models\SystemSetting::getPlatformCommissionRate();
        
        return Inertia::render('Orders/Create', [
            'currencyPairs' => $currencyPairs,
            'platformCommissionRate' => $platformCommissionRate,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isExchangeHouse() && !$user->isOperator()) {
            abort(403);
        }
        
        $validated = $request->validate([
            'currency_pair_id' => 'required|exists:currency_pairs,id',
            'base_amount' => 'required|numeric|min:0.01',
            'house_commission_percent' => 'required|numeric|min:0|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);
        
        $currencyPair = CurrencyPair::findOrFail($validated['currency_pair_id']);
        
        // Validar límites
        if ($validated['base_amount'] < $currencyPair->min_amount) {
            return back()->withErrors([
                'base_amount' => "El monto mínimo es {$currencyPair->min_amount}"
            ]);
        }
        
        if ($currencyPair->max_amount && $validated['base_amount'] > $currencyPair->max_amount) {
            return back()->withErrors([
                'base_amount' => "El monto máximo es {$currencyPair->max_amount}"
            ]);
        }
        
        $order = DB::transaction(function () use ($validated, $currencyPair, $user) {
            // Calcular comisiones
            $baseAmount = $validated['base_amount'];
            $houseCommissionPercent = $validated['house_commission_percent'];
            $houseCommissionAmount = $baseAmount * ($houseCommissionPercent / 100);
            
            // Comisión de plataforma
            $platformRate = \App\Models\SystemSetting::getPlatformCommissionRate() / 100;
            $platformCommission = $baseAmount * $platformRate;
            
            // Ganancia neta de la casa
            $exchangeCommission = $houseCommissionAmount - $platformCommission;
            
            // Monto neto que recibe el cliente
            $netAmount = $baseAmount - $houseCommissionAmount;
            
            // Calcular quote amount (bolívares que recibe)
            $quoteAmount = $netAmount * $currencyPair->current_rate;
            
            // Crear la orden
            return Order::create([
                'exchange_house_id' => $user->exchange_house_id,
                'currency_pair_id' => $validated['currency_pair_id'],
                'user_id' => $user->id,
                'base_amount' => $baseAmount,
                'quote_amount' => $quoteAmount,
                'market_rate' => $currencyPair->current_rate,
                'applied_rate' => $currencyPair->current_rate,
                'house_commission_percent' => $houseCommissionPercent,
                'house_commission_amount' => $houseCommissionAmount,
                'platform_commission' => $platformCommission,
                'exchange_commission' => $exchangeCommission,
                'net_amount' => $netAmount,
                'status' => 'pending',
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        // Procesar comisiones de forma asíncrona para mejor performance
        \App\Jobs\ProcessOrderCommissions::dispatch($order->id);
        
        return redirect()->route('orders.index')
            ->with('success', 'Orden creada exitosamente');
    }

    public function show(Order $order)
    {
        $user = request()->user();
        
        // Verificar permisos
        if ($user->isSuperAdmin() || 
            ($user->exchange_house_id === $order->exchange_house_id)) {
            
            $order->load(['exchangeHouse', 'currencyPair', 'user', 'commissions']);
            
            return Inertia::render('Orders/Show', [
                'order' => $order,
            ]);
        }
        
        abort(403);
    }

    public function update(Request $request, Order $order)
    {
        $user = $request->user();
        
        // Solo el super admin o la casa de cambio propietaria puede actualizar
        if (!$user->isSuperAdmin() && $user->exchange_house_id !== $order->exchange_house_id) {
            abort(403);
        }
        
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled,failed',
            'actual_margin_percent' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);
        
        $order->update($validated);
        
        if ($validated['status'] === 'completed') {
            $order->update(['completed_at' => now()]);
        }
        
        return back()->with('success', 'Orden actualizada exitosamente');
    }

    public function complete(Request $request, Order $order)
    {
        $user = $request->user();
        
        // Solo la casa de cambio propietaria puede completar
        if (!$user->isSuperAdmin() && $user->exchange_house_id !== $order->exchange_house_id) {
            abort(403);
        }
        
        $validated = $request->validate([
            'actual_rate' => 'required|numeric|min:0',
            'actual_margin_percent' => 'required|numeric',
            'notes' => 'nullable|string|max:1000',
        ]);
        
        DB::transaction(function () use ($order, $validated) {
            // Actualizar orden con datos reales
            $order->update([
                'actual_margin_percent' => $validated['actual_margin_percent'],
                'status' => 'completed',
                'completed_at' => now(),
                'notes' => $validated['notes'] ?? $order->notes,
            ]);
            
            // Calcular comisiones finales si no se hicieron antes
            if (!$order->commissions()->exists()) {
                Commission::createFromOrder($order);
            }
        });
        
        return redirect()->back()
            ->with('success', 'Orden completada exitosamente. Margen real: ' . $validated['actual_margin_percent'] . '%');
    }

    public function destroy(Order $order)
    {
        $user = request()->user();
        
        // Solo super admin puede eliminar órdenes
        if (!$user->isSuperAdmin()) {
            abort(403);
        }
        
        $order->delete();
        
        return redirect()->route('orders.index')
            ->with('success', 'Orden eliminada exitosamente');
    }
}
