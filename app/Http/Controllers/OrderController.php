<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\CurrencyPair;
use App\Models\Commission;
use App\Models\Customer;
use App\Models\CustomerActivity;
use App\Exports\OrdersExport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

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
        if ($request->has('status') && $request->get('status') !== 'all') {
            $query->byStatus($request->get('status'));
        }

        // Filtro por rango de fechas
        if ($request->has('date_from') && $request->get('date_from')) {
            $query->whereDate('created_at', '>=', $request->get('date_from'));
        }

        if ($request->has('date_to') && $request->get('date_to')) {
            $query->whereDate('created_at', '<=', $request->get('date_to'));
        }

        // Filtro por búsqueda (número de orden o cliente)
        if ($request->has('search') && $request->get('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filtro por par de divisas
        if ($request->has('currency_pair') && $request->get('currency_pair') !== 'all') {
            $query->where('currency_pair_id', $request->get('currency_pair'));
        }
        
        $orders = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString();

        // Obtener pares de divisas para el filtro
        $currencyPairs = CurrencyPair::where('is_active', true)->get(['id', 'base_currency', 'quote_currency']);

        // Calcular estadísticas
        $stats = [
            'total' => $query->count(),
            'completed' => (clone $query)->where('status', 'completed')->count(),
            'pending' => (clone $query)->where('status', 'pending')->count(),
            'total_volume' => (clone $query)->where('status', 'completed')->sum('base_amount'),
        ];
        
        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'currencyPairs' => $currencyPairs,
            'filters' => [
                'status' => $request->get('status', 'all'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'search' => $request->get('search'),
                'currency_pair' => $request->get('currency_pair', 'all'),
            ],
            'stats' => $stats,
        ]);
    }

    public function export(Request $request)
    {
        $user = $request->user();
        
        $query = Order::withRelations();
        
        // Aplicar los mismos filtros que en index
        if ($user->isSuperAdmin()) {
            // Super Admin puede exportar todas
        } elseif ($user->isExchangeHouse() || $user->isOperator()) {
            $query->forExchangeHouse($user->exchange_house_id);
            
            if ($user->isOperator()) {
                $query->where('user_id', $user->id);
            }
        }
        
        // Aplicar filtros
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

        $query->orderBy('created_at', 'desc');

        $filename = 'ordenes_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new OrdersExport($query), $filename);
    }

    public function create(Request $request)
    {
        $user = $request->user();
        
        // Solo casas de cambio y operadores pueden crear órdenes
        if (!$user->isExchangeHouse() && !$user->isOperator()) {
            abort(403);
        }
        
        // Obtener solo los pares configurados por la casa de cambio con sus límites personalizados
        $exchangeHouse = $user->exchangeHouse;
        $currencyPairs = $exchangeHouse->currencyPairs()
            ->wherePivot('is_active', true)
            ->get()
            ->map(function ($pair) {
                // Usar los límites del pivot (configurados por la casa de cambio)
                return [
                    'id' => $pair->id,
                    'symbol' => $pair->symbol,
                    'base_currency' => $pair->base_currency,
                    'quote_currency' => $pair->quote_currency,
                    'current_rate' => $pair->current_rate,
                    'calculation_type' => $pair->calculation_type,
                    'min_amount' => $pair->pivot->min_amount, // Límite de la casa de cambio
                    'max_amount' => $pair->pivot->max_amount, // Límite de la casa de cambio
                ];
            });
        
        // Obtener comisión de plataforma (considerar promoción)
        $exchangeHouse = $user->exchangeHouse;
        $platformCommissionRate = $exchangeHouse->zero_commission_promo 
            ? 0 
            : \App\Models\SystemSetting::getPlatformCommissionRate();
        
        // Obtener clientes de la casa de cambio
        $customers = Customer::where('exchange_house_id', $user->exchange_house_id)
            ->where('is_active', true)
            ->where('is_blocked', false)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone']);
        
        // Obtener saldos de métodos de pago del operador
        $operatorBalances = \App\Models\OperatorCashBalance::with('paymentMethod')
            ->where('operator_id', $user->id)
            ->get()
            ->map(function ($balance) {
                return [
                    'payment_method_id' => $balance->payment_method_id,
                    'payment_method_name' => $balance->paymentMethod->name,
                    'currency' => $balance->currency,
                    'balance' => $balance->balance,
                ];
            })
            ->keyBy(function ($item) {
                return $item['payment_method_id'] . '_' . $item['currency'];
            });
        
        // Obtener todos los métodos de pago disponibles agrupados por moneda
        $paymentMethods = \App\Models\PaymentMethod::where('exchange_house_id', $user->exchange_house_id)
            ->where('is_active', true)
            ->get()
            ->groupBy('currency')
            ->map(function ($methods) use ($user) {
                return $methods->map(function ($method) use ($user) {
                    // Obtener saldo actual del operador para este método
                    $balance = \App\Models\OperatorCashBalance::where('operator_id', $user->id)
                        ->where('payment_method_id', $method->id)
                        ->where('currency', $method->currency)
                        ->first();
                    
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
            'house_commission_percent' => 'required|numeric|min:0|max:100',
            'customer_id' => 'nullable|exists:customers,id',
            'notes' => 'nullable|string|max:1000',
            'payment_method_selection_mode' => 'required|in:auto,manual',
            'payment_method_in_id' => 'nullable|exists:payment_methods,id',
            'payment_method_out_id' => 'nullable|exists:payment_methods,id',
        ]);
        
        $currencyPair = CurrencyPair::findOrFail($validated['currency_pair_id']);
        
        // Obtener los límites configurados por la casa de cambio (pivot)
        $exchangeHouse = $user->exchangeHouse;
        $pivotData = $exchangeHouse->currencyPairs()
            ->where('currency_pair_id', $currencyPair->id)
            ->wherePivot('is_active', true)
            ->first();
        
        if (!$pivotData) {
            return back()->withErrors([
                'currency_pair_id' => "Este par de divisas no está disponible para tu casa de cambio"
            ]);
        }
        
        // Validar límites usando los valores del pivot (configurados por la casa de cambio)
        $minAmount = $pivotData->pivot->min_amount;
        $maxAmount = $pivotData->pivot->max_amount;
        
        if ($validated['base_amount'] < $minAmount) {
            return back()->withErrors([
                'base_amount' => "El monto mínimo es {$minAmount}"
            ]);
        }
        
        if ($maxAmount && $validated['base_amount'] > $maxAmount) {
            return back()->withErrors([
                'base_amount' => "El monto máximo es {$maxAmount}"
            ]);
        }
        
        // VALIDAR SALDO SUFICIENTE ANTES DE CREAR LA ORDEN
        $baseAmount = $validated['base_amount'];
        $houseCommissionPercent = $validated['house_commission_percent'];
        $houseCommissionAmount = $baseAmount * ($houseCommissionPercent / 100);
        $netAmount = $baseAmount - $houseCommissionAmount;
        
        // Calcular según el tipo de operación del par
        $quoteAmount = $currencyPair->calculation_type === 'divide'
            ? $netAmount / $currencyPair->current_rate
            : $netAmount * $currencyPair->current_rate;
        
        // Determinar métodos de pago según el modo de selección
        $baseCurrency = $currencyPair->base_currency;
        $quoteCurrency = $currencyPair->quote_currency;
        $selectionMode = $validated['payment_method_selection_mode'];
        
        if ($selectionMode === 'manual') {
            // Modo manual: usar los métodos seleccionados por el usuario
            if (!$validated['payment_method_in_id'] || !$validated['payment_method_out_id']) {
                return back()->withErrors([
                    'payment_method_selection_mode' => "En modo manual debes seleccionar ambos métodos de pago."
                ])->withInput();
            }
            
            $paymentMethodIn = \App\Models\PaymentMethod::find($validated['payment_method_in_id']);
            $paymentMethodOut = \App\Models\PaymentMethod::find($validated['payment_method_out_id']);
            
            // Validar que los métodos pertenecen a la casa de cambio
            if ($paymentMethodIn->exchange_house_id !== $user->exchange_house_id || 
                $paymentMethodOut->exchange_house_id !== $user->exchange_house_id) {
                return back()->withErrors([
                    'payment_method_selection_mode' => "Los métodos de pago seleccionados no pertenecen a tu casa de cambio."
                ])->withInput();
            }
            
            // Validar que las monedas coinciden
            if ($paymentMethodIn->currency !== $baseCurrency || $paymentMethodOut->currency !== $quoteCurrency) {
                return back()->withErrors([
                    'payment_method_selection_mode' => "Los métodos de pago no coinciden con las monedas del par seleccionado."
                ])->withInput();
            }
        } else {
            // Modo automático: seleccionar el método con mayor saldo
            $paymentMethodIn = \App\Models\PaymentMethod::where('exchange_house_id', $user->exchange_house_id)
                ->where('currency', $baseCurrency)
                ->where('is_active', true)
                ->get()
                ->sortByDesc(function ($method) use ($user, $baseCurrency) {
                    $balance = \App\Models\OperatorCashBalance::where('operator_id', $user->id)
                        ->where('payment_method_id', $method->id)
                        ->where('currency', $baseCurrency)
                        ->first();
                    return $balance ? $balance->balance : 0;
                })
                ->first();
            
            $paymentMethodOut = \App\Models\PaymentMethod::where('exchange_house_id', $user->exchange_house_id)
                ->where('currency', $quoteCurrency)
                ->where('is_active', true)
                ->get()
                ->sortByDesc(function ($method) use ($user, $quoteCurrency) {
                    $balance = \App\Models\OperatorCashBalance::where('operator_id', $user->id)
                        ->where('payment_method_id', $method->id)
                        ->where('currency', $quoteCurrency)
                        ->first();
                    return $balance ? $balance->balance : 0;
                })
                ->first();
        }
        
        if (!$paymentMethodIn) {
            return back()->withErrors([
                'currency_pair_id' => "No tienes un método de pago activo para {$baseCurrency}. Configura uno primero."
            ])->withInput();
        }
        
        if (!$paymentMethodOut) {
            return back()->withErrors([
                'currency_pair_id' => "No tienes un método de pago activo para {$quoteCurrency}. Configura uno primero."
            ])->withInput();
        }
        
        // Verificar saldo disponible en el método de salida
        $currentBalance = \App\Models\OperatorCashBalance::where('operator_id', $user->id)
            ->where('payment_method_id', $paymentMethodOut->id)
            ->where('currency', $quoteCurrency)
            ->first();
        
        $availableBalance = $currentBalance ? $currentBalance->balance : 0;
        
        if ($availableBalance < $quoteAmount) {
            $deficit = $quoteAmount - $availableBalance;
            return back()->withErrors([
                'base_amount' => "Saldo insuficiente en {$quoteCurrency} ({$paymentMethodOut->name}). Necesitas " . number_format($quoteAmount, 2) . ", tienes " . number_format($availableBalance, 2) . ". Faltante: " . number_format($deficit, 2) . ". Por favor, agrega fondos en 'Mi Fondo de Caja' antes de crear esta orden."
            ])->withInput();
        }
        
        $order = DB::transaction(function () use ($validated, $currencyPair, $user, $baseAmount, $houseCommissionPercent, $houseCommissionAmount, $netAmount, $quoteAmount, $paymentMethodIn, $paymentMethodOut, $selectionMode) {
            // Comisión de plataforma (considerar promoción)
            $exchangeHouse = $user->exchangeHouse;
            if ($exchangeHouse->zero_commission_promo) {
                $platformCommission = 0;
                $exchangeCommission = $houseCommissionAmount; // La casa se queda con todo
            } else {
                $platformRate = \App\Models\SystemSetting::getPlatformCommissionRate() / 100;
                $platformCommission = $baseAmount * $platformRate;
                $exchangeCommission = $houseCommissionAmount - $platformCommission;
            }
            
            // Crear la orden con los métodos de pago específicos
            $order = Order::create([
                'exchange_house_id' => $user->exchange_house_id,
                'currency_pair_id' => $validated['currency_pair_id'],
                'user_id' => $user->id,
                'customer_id' => $validated['customer_id'] ?? null,
                'payment_method_id' => $paymentMethodOut->id, // Método principal (para compatibilidad)
                'payment_method_in_id' => $paymentMethodIn->id, // Método que recibe
                'payment_method_out_id' => $paymentMethodOut->id, // Método que entrega
                'payment_method_selection_mode' => $selectionMode,
                'base_amount' => $baseAmount,
                'quote_amount' => $quoteAmount,
                'market_rate' => $currencyPair->current_rate,
                'applied_rate' => $currencyPair->current_rate,
                'expected_margin_percent' => $houseCommissionPercent,
                'actual_margin_percent' => $houseCommissionPercent,
                'house_commission_percent' => $houseCommissionPercent,
                'house_commission_amount' => $houseCommissionAmount,
                'platform_commission' => $platformCommission,
                'exchange_commission' => $exchangeCommission,
                'net_amount' => $netAmount,
                'status' => 'pending',
                'notes' => $validated['notes'] ?? null,
            ]);
            
            // Si hay un cliente asociado, actualizar sus métricas y registrar actividad
            if ($order->customer_id) {
                $customer = Customer::find($order->customer_id);
                if ($customer) {
                    $customer->updateMetrics();
                    
                    CustomerActivity::create([
                        'customer_id' => $customer->id,
                        'user_id' => $user->id,
                        'type' => 'order_created',
                        'title' => 'Nueva orden creada',
                        'description' => "Orden #{$order->order_number} por {$baseAmount} {$currencyPair->base_currency}",
                    ]);
                }
            }
            
            return $order;
        });

        // Crear comisiones inmediatamente
        try {
            Commission::createFromOrder($order);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error creating commissions: ' . $e->getMessage());
        }
        
        return redirect()->route('orders.index')
            ->with('success', 'Orden creada exitosamente');
    }

    public function show(Order $order)
    {
        $user = request()->user();
        
        // Verificar permisos
        if ($user->isSuperAdmin() || 
            ($user->exchange_house_id === $order->exchange_house_id)) {
            
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
            'actual_quote_amount' => 'required|numeric|min:0',
            'actual_margin_percent' => 'required|numeric',
            'notes' => 'nullable|string|max:1000',
        ]);
        
        DB::transaction(function () use ($order, $validated) {
            // Calcular la ganancia real basada en el monto entregado
            $expectedQuoteAmount = $order->quote_amount;
            $actualQuoteAmount = $validated['actual_quote_amount'];
            $differenceInQuote = $expectedQuoteAmount - $actualQuoteAmount;
            
            // Convertir diferencia en moneda quote a moneda base usando la tasa aplicada
            $appliedRate = $validated['actual_rate'];
            $differenceInBase = $differenceInQuote / $appliedRate;
            
            // Ganancia adicional + ganancia esperada (ambas en moneda base)
            $expectedCommission = $order->house_commission_amount;
            $realHouseCommission = $expectedCommission + $differenceInBase;
            
            // Calcular comisión de plataforma (considerar promoción)
            $exchangeHouse = $order->exchangeHouse;
            if ($exchangeHouse->zero_commission_promo) {
                $realPlatformCommission = 0;
                $realExchangeCommission = $realHouseCommission; // La casa se queda con todo
            } else {
                // Si la casa ganó $50, la plataforma cobra 0.15% sobre el monto base (no sobre la comisión)
                $platformRate = \App\Models\SystemSetting::getPlatformCommissionRate();
                $realPlatformCommission = ($order->base_amount * $platformRate) / 100;
                $realExchangeCommission = $realHouseCommission - $realPlatformCommission;
            }
            
            // Actualizar orden con datos reales
            $order->update([
                'quote_amount' => $actualQuoteAmount, // Monto real entregado
                'actual_margin_percent' => $validated['actual_margin_percent'],
                'house_commission_amount' => $realHouseCommission,
                'platform_commission' => $realPlatformCommission,
                'exchange_commission' => $realExchangeCommission,
                'status' => 'completed',
                'completed_at' => now(),
                'notes' => $validated['notes'] ?? $order->notes,
            ]);
            
            // Las comisiones ya están calculadas y guardadas en la orden
            // No necesitamos crear registros separados en la tabla commissions
            // ya que toda la información está en el modelo Order
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

    /**
     * Cancelar una orden
     */
    public function cancel(Request $request, Order $order)
    {
        $user = $request->user();
        
        // Verificar permisos
        if (!$user->isSuperAdmin() && $order->exchange_house_id !== $user->exchange_house_id) {
            abort(403);
        }

        // Validar que la orden no esté ya completada o cancelada
        if (in_array($order->status, ['completed', 'cancelled'])) {
            return back()->withErrors([
                'error' => 'No se puede cancelar una orden que ya está ' . ($order->status === 'completed' ? 'completada' : 'cancelada')
            ]);
        }

        $validated = $request->validate([
            'cancellation_reason' => 'required|string|min:10|max:500',
        ]);

        DB::beginTransaction();
        try {
            // Revertir movimientos del fondo de caja si existen
            $cashMovements = \App\Models\CashMovement::where('order_id', $order->id)->get();
            
            foreach ($cashMovements as $movement) {
                // Obtener el balance
                $balance = \App\Models\OperatorCashBalance::where('operator_id', $movement->operator_id)
                    ->where('payment_method_id', $movement->payment_method_id)
                    ->where('currency', $movement->currency)
                    ->first();
                
                if ($balance) {
                    // Revertir el movimiento (invertir el signo)
                    $revertAmount = -$movement->amount;
                    
                    // Crear movimiento de reversión
                    \App\Models\CashMovement::create([
                        'operator_id' => $movement->operator_id,
                        'payment_method_id' => $movement->payment_method_id,
                        'order_id' => $order->id,
                        'type' => 'adjustment',
                        'currency' => $movement->currency,
                        'amount' => $revertAmount,
                        'balance_before' => $balance->balance,
                        'balance_after' => $balance->balance + $revertAmount,
                        'description' => "Reversión por cancelación de orden #{$order->order_number}: {$validated['cancellation_reason']}",
                    ]);
                    
                    // Actualizar el balance
                    $balance->balance += $revertAmount;
                    $balance->save();
                }
            }

            // Actualizar la orden
            $order->update([
                'status' => 'cancelled',
                'cancellation_reason' => $validated['cancellation_reason'],
                'cancelled_by' => $user->id,
                'cancelled_at' => now(),
            ]);

            // Si había comisiones generadas, eliminarlas
            Commission::where('order_id', $order->id)->delete();

            DB::commit();

            return back()->with('success', 'Orden cancelada exitosamente. Los movimientos de caja han sido revertidos y no se cobrará comisión.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al cancelar la orden: ' . $e->getMessage()]);
        }
    }
}
