<?php

namespace App\Modules\Commissions\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Commissions\Services\CommissionService;
use App\Modules\Commissions\Services\CommissionPaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class CommissionController extends Controller
{
    public function __construct(
        private CommissionService $commissionService,
        private CommissionPaymentService $paymentService
    ) {}

    /**
     * Dashboard de comisiones
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $exchangeHouse = $user->exchangeHouse;

        // Stats generales
        $stats = $this->commissionService->getQuickStats($exchangeHouse);
        
        // Tendencia últimos 6 meses
        $trend = $this->commissionService->getCommissionsTrend($exchangeHouse);
        
        // Historial reciente de solicitudes
        $recentRequests = $this->paymentService->getRequestHistory($exchangeHouse, null, 5);

        return Inertia::render('Commissions/Dashboard', [
            'stats' => $stats,
            'trend' => $trend,
            'recent_requests' => $recentRequests,
        ]);
    }

    /**
     * Historial de solicitudes
     */
    public function history(Request $request)
    {
        $user = $request->user();
        $exchangeHouse = $user->exchangeHouse;
        
        $status = $request->input('status');
        $statusEnum = $status ? \App\Enums\CommissionPaymentStatus::from($status) : null;

        $requests = $this->paymentService->getRequestHistory(
            $exchangeHouse,
            $statusEnum,
            $request->input('per_page', 15)
        );

        return Inertia::render('Commissions/History', [
            'requests' => $requests,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    /**
     * Reportes de comisiones
     */
    public function reports(Request $request)
    {
        $user = $request->user();
        $exchangeHouse = $user->exchangeHouse;

        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))
            : now()->subDays(30);
            
        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))
            : now();

        // Comisiones por período
        $byPeriod = $this->commissionService->getCommissionsByPeriod(
            $exchangeHouse,
            $startDate,
            $endDate
        );

        // Comisiones por tipo
        $byType = $this->commissionService->getCommissionsByOrderType(
            $exchangeHouse,
            $startDate,
            $endDate
        );

        // Comisiones por operador
        $byOperator = $this->commissionService->getCommissionsByOperator(
            $exchangeHouse,
            $startDate,
            $endDate
        );

        return Inertia::render('Commissions/Reports', [
            'by_period' => $byPeriod,
            'by_type' => $byType,
            'by_operator' => $byOperator,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Exportar reporte
     */
    public function export(Request $request)
    {
        $user = $request->user();
        $exchangeHouse = $user->exchangeHouse;
        
        $type = $request->input('type', 'period'); // period, type, operator
        
        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))
            : now()->subDays(30);
            
        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))
            : now();

        // TODO: Implementar exportación a Excel
        // return Excel::download(new CommissionsExport(...), 'commissions.xlsx');
        
        return response()->json([
            'message' => 'Exportación en desarrollo'
        ]);
    }
}
