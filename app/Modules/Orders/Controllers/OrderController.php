<?php

namespace App\Modules\Orders\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\CurrencyPair;
use App\Models\Customer;
use App\Exports\OrdersExport;
use App\Modules\Orders\Services\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class OrderController extends Controller
{
    public function __construct(
        private OrderService $orderService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Order::withRelations();
        
        // Filtrar según rol
        if ($user->isSuperAdmin()) {
            // Ver todas
        } elseif ($user->isExchangeHouse() || $user->isOperator()) {
            $query->forExchangeHouse($user->exchange_house_id);
            
            if ($user->isOperator()) {
                $query->where('user_id', $user->id);
            }
        }
        
        // Aplicar filtros
        $this->applyFilters($query, $request);
        
        $orders = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString();
        $currencyPairs = CurrencyPair::where('is_active', true)->get(['id', 'base_currency', 'quote_currency']);
        
        $stats = [
            'total' => $query->count(),
            'completed' => (clone $query)->where('status', 'completed')->count(),
            'pending' => (clone $query)->where('status', 'pending')->count(),
            'total_volume' => (clone $query)->where('status', 'completed')->sum('base_amount'),
        ];
        
        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'currencyPairs' => $currencyPairs,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'search', 'currency_pair']),
            'stats' => $stats,
        ]);
    }

    public function export(Request $request)
    {
        $user = $request->user();
        $query = Order::withRelations();
        
        if ($user->isSuperAdmin()) {
            // Exportar todas
        } elseif ($user->isExchangeHouse() || $user->isOperator()) {
            $query->forExchangeHouse($user->exchange_house_id);
            
            if ($user->isOperator()) {
                $query->where('user_id', $user->id);
            }
        }
        
        $this->applyFilters($query, $request);
        $query->orderBy('created_at', 'desc');
        
        $filename = 'ordenes_' . now()->format('Y-m-d_His') . '.xlsx';
        return Excel::download(new OrdersExport($query), $filename);
    }

    public function create(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isExchangeHouse() && !$user->isOperator()) {
            abort(403);
        }
        
        $exchangeHouse = $user->exchangeHouse;
        
        // Obtener pares configurados
        $currencyPairs = $exchangeHouse->currencyPairs()
            ->wherePivot('is_active', true)
            ->get()
            ->map(function ($pair) {
                return [
                    'id' => $pair->id,
                    'symbol' => $pair->symbol,
                    'base_currency' => $pair->base_currency,
                    'quote_currency' => $pair->quote_currency,
                    'current_rate' => $pair->current_rate,
                    'calculation_type' => $pair->calculation_type,
                    'min_amount' => $pair->pivot->min_amount,
                    'max_amount' => $pair->pivot->max_amount,
                    'pivot' => [
                        'commission_model' => $pair->pivot->commission_model ?? 'percentage',
                        'commission_percent' => $pair->pivot->commission_percent,
                        'buy_rate' => $pair->pivot->buy_rate,
                        'sell_rate' => $pair->pivot->sell_rate,
                        'margin_percent' => $pair->pivot->margin_percent,
                    ],
                ];
            });
        
        $platformCommissionRate = $exchangeHouse->zero_commission_promo 
            ? 0 
            : \App\Models\SystemSetting::getPlatformCommissionRate();
        
        $customers = Customer::where('exchange_house_id', $user->exchange_house_id)
            ->where('is_active', true)
            ->where('is_blocked', false)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone']);
        
        // Cargar balances y métodos de pago
        $operatorBalances = \App\Models\OperatorCashBalance::with('paymentMethod:id,name')
            ->where('operator_id', $user->id)
            ->get()
            ->keyBy(fn($b) => $b->payment_method_id . '_' . $b->currency);
        
        $paymentMethods = \App\Models\PaymentMethod::where('exchange_house_id', $user->exchange_house_id)
            ->where('is_active', true)
            ->get()
            ->groupBy('currency')
            ->map(function ($methods) use ($operatorBalances) {
                return $methods->map(function ($method) use ($operatorBalances) {
                    $balanceKey = $method->id . '_' . $method->currency;
                    $balance = $operatorBalances->get($balanceKey);
                    
                    return [
                        'id' => $method->id,
                        'name' => $method->name,
                        'currency' => $method->currency,
                        'balance' => $balance ? $balance->balance : 0,
                        'account_info' => $method->account_number ?? $method->account_holder,
                    ];
                })->values();
            });
        
        return Inertia::render('Orders/Create', [
            'currencyPairs' => $currencyPairs,
            'platformCommissionRate' => $platformCommissionRate,
            'customers' => $customers,
            'operatorBalances' => $operatorBalances,
            'paymentMethods' => $paymentMethods,
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
            'house_commission_percent' => 'nullable|numeric|min:0|max:100',
            'buy_rate' => 'nullable|numeric|min:0',
            'sell_rate' => 'nullable|numeric|min:0',
            'customer_id' => 'nullable|exists:customers,id',
            'notes' => 'nullable|string|max:1000',
            'payment_method_selection_mode' => 'required|in:auto,manual',
            'payment_method_in_id' => 'nullable|exists:payment_methods,id',
            'payment_method_out_id' => 'nullable|exists:payment_methods,id',
        ]);
        
        try {
            $order = $this->orderService->createOrder($validated, $user);
            
            return redirect()->route('orders.index')
                ->with('success', 'Orden creada exitosamente');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()])->withInput();
        }
    }

    public function show(Order $order)
    {
        $user = request()->user();
        
        if ($user->isSuperAdmin() || ($user->exchange_house_id === $order->exchange_house_id)) {
            $order->load(['exchangeHouse', 'currencyPair', 'user', 'customer', 'cancelledBy']);
            
            return Inertia::render('Orders/ShowImproved', [
                'order' => $order,
            ]);
        }
        
        abort(403);
    }

    public function update(Request $request, Order $order)
    {
        $user = $request->user();
        
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
        
        if (!$user->isSuperAdmin() && $user->exchange_house_id !== $order->exchange_house_id) {
            abort(403);
        }
        
        $validated = $request->validate([
            'actual_rate' => 'required|numeric|min:0',
            'actual_quote_amount' => 'required|numeric|min:0',
            'actual_margin_percent' => 'required|numeric',
            'notes' => 'nullable|string|max:1000',
        ]);
        
        try {
            $order = $this->orderService->completeOrder($order, $validated);
            
            return redirect()->back()
                ->with('success', 'Orden completada exitosamente. Margen real: ' . $validated['actual_margin_percent'] . '%');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(Order $order)
    {
        $user = request()->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }
        
        $order->delete();
        
        return redirect()->route('orders.index')
            ->with('success', 'Orden eliminada exitosamente');
    }

    public function cancel(Request $request, Order $order)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin() && $order->exchange_house_id !== $user->exchange_house_id) {
            abort(403);
        }

        if (in_array($order->status, ['completed', 'cancelled'])) {
            return back()->withErrors([
                'error' => 'No se puede cancelar una orden que ya está ' . ($order->status === 'completed' ? 'completada' : 'cancelada')
            ]);
        }

        $validated = $request->validate([
            'cancellation_reason' => 'required|string|min:10|max:500',
        ]);

        try {
            $this->orderService->cancelOrder($order, $validated['cancellation_reason'], $user);
            
            return back()->with('success', 'Orden cancelada exitosamente. Los movimientos de caja han sido revertidos.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error al cancelar la orden: ' . $e->getMessage()]);
        }
    }

    /**
     * Aplicar filtros a la query
     */
    private function applyFilters($query, Request $request): void
    {
        if ($request->has('status') && $request->get('status') !== 'all') {
            $query->byStatus($request->get('status'));
        }

        if ($request->has('date_from') && $request->get('date_from')) {
            $query->whereDate('created_at', '>=', $request->get('date_from'));
        }

        if ($request->has('date_to') && $request->get('date_to')) {
            $query->whereDate('created_at', '<=', $request->get('date_to'));
        }

        if ($request->has('search') && $request->get('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('currency_pair') && $request->get('currency_pair') !== 'all') {
            $query->where('currency_pair_id', $request->get('currency_pair'));
        }
    }
}
