<?php

namespace App\Modules\Analytics\Services;

use App\Models\Order;
use App\Models\ExchangeHouse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsService
{
    /**
     * Obtener métricas del dashboard
     */
    public function getDashboardMetrics(ExchangeHouse $exchangeHouse, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        $startDate = $startDate ?? now()->startOfMonth();
        $endDate = $endDate ?? now()->endOfMonth();
        
        $query = Order::where('exchange_house_id', $exchangeHouse->id)
            ->whereBetween('created_at', [$startDate, $endDate]);
        
        return [
            'total_orders' => $query->count(),
            'completed_orders' => (clone $query)->where('status', 'completed')->count(),
            'pending_orders' => (clone $query)->where('status', 'pending')->count(),
            'cancelled_orders' => (clone $query)->where('status', 'cancelled')->count(),
            'total_volume' => (clone $query)->where('status', 'completed')->sum('base_amount'),
            'total_revenue' => (clone $query)->where('status', 'completed')->sum('exchange_commission'),
            'average_order_value' => (clone $query)->where('status', 'completed')->avg('base_amount'),
            'average_margin' => (clone $query)->where('status', 'completed')->avg('actual_margin_percent'),
        ];
    }

    /**
     * Obtener órdenes por día
     */
    public function getOrdersByDay(ExchangeHouse $exchangeHouse, Carbon $startDate, Carbon $endDate): array
    {
        return Order::where('exchange_house_id', $exchangeHouse->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(base_amount) as volume'),
                DB::raw('SUM(exchange_commission) as revenue')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    /**
     * Obtener top pares de divisas
     */
    public function getTopCurrencyPairs(ExchangeHouse $exchangeHouse, int $limit = 5): array
    {
        return Order::where('exchange_house_id', $exchangeHouse->id)
            ->where('status', 'completed')
            ->select(
                'currency_pair_id',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(base_amount) as volume'),
                DB::raw('SUM(exchange_commission) as revenue')
            )
            ->with('currencyPair:id,symbol,base_currency,quote_currency')
            ->groupBy('currency_pair_id')
            ->orderByDesc('volume')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Obtener top clientes
     */
    public function getTopCustomers(ExchangeHouse $exchangeHouse, int $limit = 10): array
    {
        return Order::where('exchange_house_id', $exchangeHouse->id)
            ->where('status', 'completed')
            ->whereNotNull('customer_id')
            ->select(
                'customer_id',
                DB::raw('COUNT(*) as orders_count'),
                DB::raw('SUM(base_amount) as total_volume'),
                DB::raw('SUM(exchange_commission) as total_revenue')
            )
            ->with('customer:id,name,email,tier')
            ->groupBy('customer_id')
            ->orderByDesc('total_volume')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Obtener distribución por modelo de comisión
     */
    public function getCommissionModelDistribution(ExchangeHouse $exchangeHouse): array
    {
        return Order::where('exchange_house_id', $exchangeHouse->id)
            ->where('status', 'completed')
            ->select(
                'commission_model',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(base_amount) as volume'),
                DB::raw('SUM(exchange_commission) as revenue')
            )
            ->groupBy('commission_model')
            ->get()
            ->toArray();
    }

    /**
     * Evolución de tasas de cambio por par
     */
    public function getCurrencyPairTrends(int $exchangeHouseId, int $days = 30): array
    {
        $trends = \App\Models\CurrencyPairRateHistory::forExchangeHouse($exchangeHouseId)
            ->where('valid_from', '>=', Carbon::now()->subDays($days))
            ->with('currencyPair:id,symbol')
            ->orderBy('valid_from')
            ->get()
            ->groupBy(fn($item) => $item->currencyPair->symbol)
            ->map(function ($items) {
                return $items->map(fn($item) => [
                    'date' => $item->valid_from->format('Y-m-d'),
                    'rate' => (float) $item->effective_rate,
                    'margin' => (float) $item->margin_percent,
                ]);
            });

        return $trends->toArray();
    }

    /**
     * Heatmap de operaciones por hora y día
     */
    public function getActivityHeatmap(int $exchangeHouseId, int $days = 30): array
    {
        $heatmap = Order::where('exchange_house_id', $exchangeHouseId)
            ->where('created_at', '>=', Carbon::now()->subDays($days))
            ->selectRaw('
                DAYOFWEEK(created_at) as day_of_week,
                HOUR(created_at) as hour,
                COUNT(*) as operations,
                SUM(base_amount) as volume
            ')
            ->groupBy('day_of_week', 'hour')
            ->get()
            ->map(fn($item) => [
                'day' => $this->getDayName($item->day_of_week),
                'hour' => sprintf('%02d:00', $item->hour),
                'operations' => (int) $item->operations,
                'volume' => (float) $item->volume,
            ]);

        return $heatmap->toArray();
    }

    /**
     * Análisis de márgenes por par
     */
    public function getMarginAnalysis(int $exchangeHouseId): array
    {
        $marginData = Order::where('orders.exchange_house_id', $exchangeHouseId)
            ->where('orders.created_at', '>=', Carbon::now()->startOfMonth())
            ->where('orders.status', 'completed')
            ->join('currency_pairs', 'orders.currency_pair_id', '=', 'currency_pairs.id')
            ->selectRaw('
                currency_pairs.symbol,
                AVG(orders.actual_margin_percent) as avg_margin,
                MIN(orders.actual_margin_percent) as min_margin,
                MAX(orders.actual_margin_percent) as max_margin,
                COUNT(*) as operations,
                SUM(orders.base_amount) as total_volume
            ')
            ->groupBy('currency_pairs.id', 'currency_pairs.symbol')
            ->get()
            ->map(fn($item) => [
                'pair' => $item->symbol,
                'avgMargin' => round((float) $item->avg_margin, 2),
                'minMargin' => round((float) $item->min_margin, 2),
                'maxMargin' => round((float) $item->max_margin, 2),
                'operations' => (int) $item->operations,
                'volume' => (float) $item->total_volume,
            ]);

        return $marginData->toArray();
    }

    /**
     * Proyección de liquidez
     */
    public function getLiquidityForecast(ExchangeHouse $exchangeHouse): array
    {
        // Volumen promedio diario últimos 7 días
        $avgDailyVolume = Order::where('exchange_house_id', $exchangeHouse->id)
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->selectRaw('AVG(daily_volume) as avg')
            ->from(DB::raw('(
                SELECT DATE(created_at) as date, SUM(base_amount) as daily_volume
                FROM orders
                WHERE exchange_house_id = ?
                AND created_at >= ?
                GROUP BY DATE(created_at)
            ) as daily_totals'))
            ->setBindings([$exchangeHouse->id, Carbon::now()->subDays(7)])
            ->value('avg') ?? 0;

        $todayVolume = Order::where('exchange_house_id', $exchangeHouse->id)
            ->whereDate('created_at', Carbon::today())
            ->sum('base_amount');

        $dailyLimit = (float) $exchangeHouse->daily_limit;
        $remainingToday = $dailyLimit - $todayVolume;
        $projectedDaysRemaining = $avgDailyVolume > 0 ? $remainingToday / $avgDailyVolume : 999;

        return [
            'dailyLimit' => $dailyLimit,
            'todayVolume' => (float) $todayVolume,
            'remainingToday' => (float) $remainingToday,
            'avgDailyVolume' => (float) $avgDailyVolume,
            'projectedDaysRemaining' => round($projectedDaysRemaining, 1),
            'utilizationPercent' => round(($todayVolume / $dailyLimit) * 100, 1),
            'trendStatus' => $avgDailyVolume > $dailyLimit * 0.8 ? 'high' : ($avgDailyVolume > $dailyLimit * 0.5 ? 'medium' : 'low'),
        ];
    }

    /**
     * Comparación de períodos
     */
    public function getPeriodComparison(int $exchangeHouseId): array
    {
        $currentMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->startOfMonth();

        $comparison = Order::where('exchange_house_id', $exchangeHouseId)
            ->selectRaw('
                COUNT(CASE WHEN created_at >= ? THEN 1 END) as current_orders,
                COUNT(CASE WHEN created_at >= ? AND created_at < ? THEN 1 END) as last_orders,
                COALESCE(SUM(CASE WHEN created_at >= ? THEN base_amount END), 0) as current_volume,
                COALESCE(SUM(CASE WHEN created_at >= ? AND created_at < ? THEN base_amount END), 0) as last_volume,
                COALESCE(SUM(CASE WHEN created_at >= ? THEN exchange_commission END), 0) as current_profit,
                COALESCE(SUM(CASE WHEN created_at >= ? AND created_at < ? THEN exchange_commission END), 0) as last_profit
            ', [
                $currentMonth, $lastMonth, $lastMonthEnd,
                $currentMonth, $lastMonth, $lastMonthEnd,
                $currentMonth, $lastMonth, $lastMonthEnd
            ])
            ->first();

        return [
            'current' => [
                'orders' => (int) $comparison->current_orders,
                'volume' => (float) $comparison->current_volume,
                'profit' => (float) $comparison->current_profit,
            ],
            'previous' => [
                'orders' => (int) $comparison->last_orders,
                'volume' => (float) $comparison->last_volume,
                'profit' => (float) $comparison->last_profit,
            ],
            'growth' => [
                'orders' => $comparison->last_orders > 0 
                    ? round((($comparison->current_orders - $comparison->last_orders) / $comparison->last_orders) * 100, 1)
                    : 0,
                'volume' => $comparison->last_volume > 0 
                    ? round((($comparison->current_volume - $comparison->last_volume) / $comparison->last_volume) * 100, 1)
                    : 0,
                'profit' => $comparison->last_profit > 0 
                    ? round((($comparison->current_profit - $comparison->last_profit) / $comparison->last_profit) * 100, 1)
                    : 0,
            ],
        ];
    }

    /**
     * Análisis por método de pago
     */
    public function getPaymentMethodAnalysis(int $exchangeHouseId): array
    {
        $paymentStats = Order::where('orders.exchange_house_id', $exchangeHouseId)
            ->where('orders.created_at', '>=', Carbon::now()->startOfMonth())
            ->where('orders.status', 'completed')
            ->join('payment_methods', 'orders.payment_method_id', '=', 'payment_methods.id')
            ->selectRaw('
                payment_methods.name,
                payment_methods.type,
                COUNT(*) as operations,
                SUM(orders.base_amount) as volume,
                AVG(orders.base_amount) as avg_ticket,
                SUM(orders.exchange_commission) as profit
            ')
            ->groupBy('payment_methods.id', 'payment_methods.name', 'payment_methods.type')
            ->orderByDesc('volume')
            ->get()
            ->map(fn($item) => [
                'name' => $item->name,
                'type' => $item->type,
                'operations' => (int) $item->operations,
                'volume' => (float) $item->volume,
                'avgTicket' => round((float) $item->avg_ticket, 2),
                'profit' => (float) $item->profit,
            ]);

        return $paymentStats->toArray();
    }

    /**
     * Análisis de velocidad de procesamiento
     */
    public function getProcessingSpeed(int $exchangeHouseId): array
    {
        $speedStats = Order::where('orders.exchange_house_id', $exchangeHouseId)
            ->where('orders.status', 'completed')
            ->where('orders.created_at', '>=', Carbon::now()->subDays(30))
            ->whereNotNull('orders.completed_at')
            ->selectRaw('
                AVG(TIMESTAMPDIFF(MINUTE, orders.created_at, orders.completed_at)) as avg_minutes,
                MIN(TIMESTAMPDIFF(MINUTE, orders.created_at, orders.completed_at)) as min_minutes,
                MAX(TIMESTAMPDIFF(MINUTE, orders.created_at, orders.completed_at)) as max_minutes,
                COUNT(*) as total_completed
            ')
            ->first();

        $distribution = Order::where('orders.exchange_house_id', $exchangeHouseId)
            ->where('orders.status', 'completed')
            ->where('orders.created_at', '>=', Carbon::now()->subDays(30))
            ->whereNotNull('orders.completed_at')
            ->selectRaw('
                COUNT(CASE WHEN TIMESTAMPDIFF(MINUTE, orders.created_at, orders.completed_at) <= 5 THEN 1 END) as under_5min,
                COUNT(CASE WHEN TIMESTAMPDIFF(MINUTE, orders.created_at, orders.completed_at) BETWEEN 6 AND 15 THEN 1 END) as between_5_15min,
                COUNT(CASE WHEN TIMESTAMPDIFF(MINUTE, orders.created_at, orders.completed_at) BETWEEN 16 AND 30 THEN 1 END) as between_15_30min,
                COUNT(CASE WHEN TIMESTAMPDIFF(MINUTE, orders.created_at, orders.completed_at) > 30 THEN 1 END) as over_30min
            ')
            ->first();

        return [
            'averageMinutes' => round((float) ($speedStats->avg_minutes ?? 0), 1),
            'minMinutes' => (int) ($speedStats->min_minutes ?? 0),
            'maxMinutes' => (int) ($speedStats->max_minutes ?? 0),
            'totalCompleted' => (int) ($speedStats->total_completed ?? 0),
            'distribution' => [
                'under5min' => (int) ($distribution->under_5min ?? 0),
                'between5and15min' => (int) ($distribution->between_5_15min ?? 0),
                'between15and30min' => (int) ($distribution->between_15_30min ?? 0),
                'over30min' => (int) ($distribution->over_30min ?? 0),
            ],
        ];
    }

    /**
     * Top clientes con análisis detallado
     */
    public function getTopCustomersAnalysis(int $exchangeHouseId): array
    {
        $topCustomers = Order::where('orders.exchange_house_id', $exchangeHouseId)
            ->where('orders.created_at', '>=', Carbon::now()->startOfMonth())
            ->where('orders.status', 'completed')
            ->join('customers', 'orders.customer_id', '=', 'customers.id')
            ->selectRaw('
                customers.id,
                customers.name,
                customers.tier,
                COUNT(orders.id) as operations,
                SUM(orders.base_amount) as volume,
                AVG(orders.base_amount) as avg_ticket,
                SUM(orders.exchange_commission) as profit,
                MAX(orders.created_at) as last_operation
            ')
            ->groupBy('customers.id', 'customers.name', 'customers.tier')
            ->orderByDesc('volume')
            ->limit(10)
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'tier' => $item->tier,
                'operations' => (int) $item->operations,
                'volume' => (float) $item->volume,
                'avgTicket' => round((float) $item->avg_ticket, 2),
                'profit' => (float) $item->profit,
                'lastOperation' => Carbon::parse($item->last_operation)->diffForHumans(),
                'frequency' => $this->calculateFrequency((int) $item->operations),
            ]);

        return $topCustomers->toArray();
    }

    /**
     * Obtener nombre del día
     */
    private function getDayName(int $dayOfWeek): string
    {
        $days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return $days[($dayOfWeek - 1) % 7];
    }

    /**
     * Calcular frecuencia
     */
    private function calculateFrequency(int $operations): string
    {
        if ($operations >= 20) return 'Muy Alta';
        if ($operations >= 10) return 'Alta';
        if ($operations >= 5) return 'Media';
        return 'Baja';
    }
}
