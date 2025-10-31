<?php

namespace App\Http\Controllers;

use App\Models\OperatorCashBalance;
use App\Models\CashMovement;
use App\Models\PaymentMethod;
use App\Exports\CashMovementsExport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class CashBoxController extends Controller
{
    /**
     * Mostrar el fondo de caja del operador
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Solo operadores y casas de cambio pueden acceder
        if (!$user->isOperator() && !$user->isExchangeHouse()) {
            abort(403);
        }
        
        // Si es casa de cambio, actuar como operador (para casas que trabajan solas)
        // Si es operador, usar su ID
        $operatorId = $user->id;
        $exchangeHouseId = $user->isOperator() ? $user->exchange_house_id : $user->exchange_house_id;
        
        // Obtener métodos de pago de la casa de cambio
        $paymentMethods = PaymentMethod::where('exchange_house_id', $exchangeHouseId)
            ->where('is_active', true)
            ->get();
        
        // Obtener balances del operador/casa de cambio
        $balances = OperatorCashBalance::where('operator_id', $operatorId)
            ->with('paymentMethod')
            ->get()
            ->groupBy('currency');
        
        // Movimientos recientes
        $recentMovements = CashMovement::where('operator_id', $operatorId)
            ->with(['paymentMethod', 'order'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();
        
        // Estadísticas del día
        $todayStats = CashMovement::where('operator_id', $operatorId)
            ->whereDate('created_at', today())
            ->selectRaw('
                currency,
                SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_in,
                SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_out,
                COUNT(*) as movements_count
            ')
            ->groupBy('currency')
            ->get()
            ->keyBy('currency');
        
        return Inertia::render('CashBox/Index', [
            'paymentMethods' => $paymentMethods,
            'balances' => $balances,
            'recentMovements' => $recentMovements,
            'todayStats' => $todayStats,
        ]);
    }
    
    /**
     * Registrar un depósito o retiro manual
     */
    public function registerMovement(Request $request)
    {
        $user = $request->user();
        
        // Permitir tanto a operadores como a casas de cambio
        if (!$user->isOperator() && !$user->isExchangeHouse()) {
            abort(403, 'No tienes permiso para registrar movimientos');
        }
        
        $validated = $request->validate([
            'payment_method_id' => 'required|exists:payment_methods,id',
            'type' => 'required|in:deposit,withdrawal,adjustment',
            'currency' => 'required|string|max:10',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:500',
        ]);
        
        DB::beginTransaction();
        try {
            // Obtener o crear el balance
            $balance = OperatorCashBalance::firstOrCreate(
                [
                    'operator_id' => $user->id,
                    'payment_method_id' => $validated['payment_method_id'],
                    'currency' => $validated['currency'],
                ],
                ['balance' => 0]
            );
            
            // Registrar el movimiento
            if ($validated['type'] === 'withdrawal') {
                // Verificar que hay suficiente saldo
                if ($balance->balance < $validated['amount']) {
                    return back()->withErrors(['amount' => 'Saldo insuficiente']);
                }
                $balance->decrement(
                    $validated['amount'],
                    $validated['description'] ?? 'Retiro manual',
                    null,
                    $validated['type']
                );
            } else {
                $balance->increment(
                    $validated['amount'],
                    $validated['description'] ?? 'Depósito manual',
                    null,
                    $validated['type']
                );
            }
            
            DB::commit();
            
            return redirect()->back()->with('success', 'Movimiento registrado correctamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al registrar el movimiento: ' . $e->getMessage()]);
        }
    }
    
    /**
     * Ver historial de movimientos
     */
    public function history(Request $request)
    {
        $user = $request->user();
        
        // Permitir tanto a operadores como a casas de cambio
        if (!$user->isOperator() && !$user->isExchangeHouse()) {
            abort(403);
        }
        
        $exchangeHouseId = $user->isOperator() ? $user->exchange_house_id : $user->exchange_house_id;
        
        $query = CashMovement::where('operator_id', $user->id)
            ->with(['paymentMethod', 'order', 'user']);
        
        // Filtros
        if ($request->filled('payment_method')) {
            $query->where('payment_method_id', $request->payment_method);
        }
        
        if ($request->filled('currency')) {
            $query->where('currency', $request->currency);
        }
        
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        
        $movements = $query->orderBy('created_at', 'desc')
            ->paginate(50);
        
        // Obtener monedas únicas
        $currencies = CashMovement::where('operator_id', $user->id)
            ->distinct()
            ->pluck('currency')
            ->toArray();
        
        // Obtener métodos de pago
        $paymentMethods = PaymentMethod::where('exchange_house_id', $exchangeHouseId)
            ->where('is_active', true)
            ->select('id', 'name')
            ->get();
        
        return Inertia::render('CashBox/History', [
            'movements' => $movements,
            'filters' => $request->only(['payment_method', 'currency', 'type', 'date_from', 'date_to']),
            'currencies' => $currencies,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    /**
     * Exportar historial de movimientos a Excel
     */
    public function export(Request $request)
    {
        $user = $request->user();
        
        // Permitir tanto a operadores como a casas de cambio
        if (!$user->isOperator() && !$user->isExchangeHouse()) {
            abort(403);
        }
        
        $filters = $request->only(['payment_method', 'currency', 'type', 'date_from', 'date_to']);
        
        $fileName = 'historial_movimientos_' . date('Y-m-d_His') . '.xlsx';
        
        return Excel::download(
            new CashMovementsExport($user->id, $filters),
            $fileName
        );
    }
}
