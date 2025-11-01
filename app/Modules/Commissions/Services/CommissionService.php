<?php

namespace App\Modules\Commissions\Services;

use App\Models\ExchangeHouse;
use App\Models\Order;
use App\Models\CommissionPayment;
use App\Enums\CommissionPaymentStatus;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CommissionService
{
    /**
     * Obtener balance total de comisiones acumuladas
     */
    public function getAccumulatedCommissions(ExchangeHouse $exchangeHouse): array
    {
        // Total de comisiones de órdenes completadas
        $totalEarned = Order::where('exchange_house_id', $exchangeHouse->id)
            ->where('status', 'completed')
            ->sum('exchange_commission');

        // Total ya solicitado (pending + approved + paid)
        $totalRequested = CommissionPayment::where('exchange_house_id', $exchangeHouse->id)
            ->whereIn('status', [
                CommissionPaymentStatus::PENDING,
                CommissionPaymentStatus::APPROVED,
                CommissionPaymentStatus::PAID,
            ])
            ->sum('total_commissions');

        // Disponible para solicitar
        $available = $totalEarned - $totalRequested;

        // Total en proceso (pending + approved)
        $inProcess = CommissionPayment::where('exchange_house_id', $exchangeHouse->id)
            ->whereIn('status', [
                CommissionPaymentStatus::PENDING,
                CommissionPaymentStatus::APPROVED,
            ])
            ->sum('total_commissions');

        // Total pagado
        $totalPaid = CommissionPayment::where('exchange_house_id', $exchangeHouse->id)
            ->where('status', CommissionPaymentStatus::PAID)
            ->sum('total_commissions');

        return [
            'total_earned' => round($totalEarned, 2),
            'total_requested' => round($totalRequested, 2),
            'available' => round($available, 2),
            'in_process' => round($inProcess, 2),
            'total_paid' => round($totalPaid, 2),
        ];
    }

    /**
     * Obtener comisiones por período
     */
    public function getCommissionsByPeriod(ExchangeHouse $exchangeHouse, Carbon $startDate, Carbon $endDate): array
    {
        $orders = Order::where('exchange_house_id', $exchangeHouse->id)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$startDate, $endDate])
            ->selectRaw('
                DATE(completed_at) as date,
                COUNT(*) as total_orders,
                SUM(base_amount) as total_volume,
                SUM(exchange_commission) as total_commission
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $orders->map(function($item) {
            return [
                'date' => $item->date,
                'total_orders' => $item->total_orders,
                'total_volume' => round($item->total_volume, 2),
                'total_commission' => round($item->total_commission, 2),
            ];
        })->toArray();
    }

    /**
     * Obtener comisiones por tipo de orden
     */
    public function getCommissionsByOrderType(ExchangeHouse $exchangeHouse, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $query = Order::where('exchange_house_id', $exchangeHouse->id)
            ->where('status', 'completed');

        if ($startDate && $endDate) {
            $query->whereBetween('completed_at', [$startDate, $endDate]);
        }

        return $query->selectRaw('
                commission_model,
                COUNT(*) as total_orders,
                SUM(base_amount) as total_volume,
                SUM(exchange_commission) as total_commission
            ')
            ->groupBy('commission_model')
            ->get()
            ->map(function($item) {
                return [
                    'commission_model' => $item->commission_model,
                    'total_orders' => $item->total_orders,
                    'total_volume' => round($item->total_volume, 2),
                    'total_commission' => round($item->total_commission, 2),
                ];
            })
            ->toArray();
    }

    /**
     * Obtener comisiones por operador
     */
    public function getCommissionsByOperator(ExchangeHouse $exchangeHouse, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $query = Order::where('exchange_house_id', $exchangeHouse->id)
            ->where('status', 'completed')
            ->with('user:id,name');

        if ($startDate && $endDate) {
            $query->whereBetween('completed_at', [$startDate, $endDate]);
        }

        return $query->selectRaw('
                user_id,
                COUNT(*) as total_orders,
                SUM(base_amount) as total_volume,
                SUM(exchange_commission) as total_commission
            ')
            ->groupBy('user_id')
            ->get()
            ->map(function($item) {
                return [
                    'operator_name' => $item->user->name ?? 'Desconocido',
                    'total_orders' => $item->total_orders,
                    'total_volume' => round($item->total_volume, 2),
                    'total_commission' => round($item->total_commission, 2),
                ];
            })
            ->toArray();
    }

    /**
     * Obtener tendencia de comisiones (últimos 6 meses)
     */
    public function getCommissionsTrend(ExchangeHouse $exchangeHouse, int $months = 6): array
    {
        $startDate = now()->subMonths($months)->startOfMonth();

        $data = Order::where('exchange_house_id', $exchangeHouse->id)
            ->where('status', 'completed')
            ->where('completed_at', '>=', $startDate)
            ->selectRaw("
                DATE_FORMAT(completed_at, '%Y-%m') as month,
                COUNT(*) as total_orders,
                SUM(base_amount) as total_volume,
                SUM(exchange_commission) as total_commission
            ")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return $data->map(function($item) {
            return [
                'month' => $item->month,
                'total_orders' => $item->total_orders,
                'total_volume' => round($item->total_volume, 2),
                'total_commission' => round($item->total_commission, 2),
            ];
        })->toArray();
    }

    /**
     * Validar si se puede solicitar un monto
     */
    public function canRequestAmount(ExchangeHouse $exchangeHouse, float $amount): bool
    {
        $balance = $this->getAccumulatedCommissions($exchangeHouse);
        return $amount > 0 && $amount <= $balance['available'];
    }

    /**
     * Obtener estadísticas rápidas
     */
    public function getQuickStats(ExchangeHouse $exchangeHouse): array
    {
        $balance = $this->getAccumulatedCommissions($exchangeHouse);
        
        // Última solicitud
        $lastRequest = CommissionPayment::where('exchange_house_id', $exchangeHouse->id)
            ->orderBy('requested_at', 'desc')
            ->first();

        // Promedio de días para aprobación
        $avgApprovalDays = CommissionPayment::where('exchange_house_id', $exchangeHouse->id)
            ->whereNotNull('approved_at')
            ->selectRaw('AVG(DATEDIFF(approved_at, requested_at)) as avg_days')
            ->value('avg_days');

        return [
            'balance' => $balance,
            'last_request' => $lastRequest ? [
                'amount' => $lastRequest->amount,
                'status' => $lastRequest->status_label,
                'requested_at' => $lastRequest->requested_at->format('Y-m-d'),
            ] : null,
            'avg_approval_days' => round($avgApprovalDays ?? 0, 1),
        ];
    }
}
