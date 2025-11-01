<?php

namespace App\Modules\Payments\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Payments\Services\PaymentService;
use App\Exports\CashMovementsExport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class CashBoxController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}

    /**
     * Mostrar el fondo de caja del operador
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isOperator() && !$user->isExchangeHouse()) {
            abort(403);
        }
        
        $exchangeHouseId = $user->exchange_house_id;
        
        $paymentMethods = $this->paymentService->getActivePaymentMethods($exchangeHouseId);
        $balances = $this->paymentService->getOperatorBalances($user);
        $recentMovements = $this->paymentService->getRecentMovements($user, 20);
        $todayStats = $this->paymentService->getTodayStats($user);
        
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
        
        try {
            $this->paymentService->registerMovement($user, $validated);
            
            return redirect()->back()->with('success', 'Movimiento registrado correctamente');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Error al registrar el movimiento: ' . $e->getMessage()]);
        }
    }
    
    /**
     * Ver historial de movimientos
     */
    public function history(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isOperator() && !$user->isExchangeHouse()) {
            abort(403);
        }
        
        $exchangeHouseId = $user->exchange_house_id;
        $filters = $request->only(['payment_method', 'currency', 'type', 'date_from', 'date_to']);
        
        $movements = $this->paymentService->getMovementsHistory($user, $filters);
        $currencies = $this->paymentService->getOperatorCurrencies($user);
        $paymentMethods = $this->paymentService->getActivePaymentMethods($exchangeHouseId);
        
        return Inertia::render('CashBox/History', [
            'movements' => $movements,
            'filters' => $filters,
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
