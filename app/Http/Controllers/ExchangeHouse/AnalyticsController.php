<?php

namespace App\Http\Controllers\ExchangeHouse;

use App\Http\Controllers\Controller;
use App\Models\CurrencyPairRateHistory;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Evolución de tasas de cambio por par (últimos 30 días)
     */
    public function currencyPairTrends(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;
        $days = $request->input('days', 30);

        // Obtener historial de tasas agrupado por día y par
        $trends = CurrencyPairRateHistory::forExchangeHouse($exchangeHouseId)
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

        return response()->json($trends);
    }

    /**
     * Heatmap de operaciones por hora y día de la semana
     */
    public function activityHeatmap(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;
        $days = $request->input('days', 30);

        // Agrupar operaciones por día de semana y hora
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

        return response()->json($heatmap);
    }

    /**
     * Análisis de márgenes por par de divisa
     */
    public function marginAnalysis(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;

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

        return response()->json($marginData);
    }

    /**
     * Proyección de liquidez (basado en tendencia de los últimos 7 días)
     */
    public function liquidityForecast(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $exchangeHouse = $user->exchangeHouse;

        // Calcular volumen promedio diario de los últimos 7 días
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

        // Volumen actual usado hoy
        $todayVolume = Order::where('exchange_house_id', $exchangeHouse->id)
            ->whereDate('created_at', Carbon::today())
            ->sum('base_amount');

        $dailyLimit = (float) $exchangeHouse->daily_limit;
        $remainingToday = $dailyLimit - $todayVolume;
        $projectedDaysRemaining = $avgDailyVolume > 0 ? $remainingToday / $avgDailyVolume : 999;

        return response()->json([
            'dailyLimit' => $dailyLimit,
            'todayVolume' => (float) $todayVolume,
            'remainingToday' => (float) $remainingToday,
            'avgDailyVolume' => (float) $avgDailyVolume,
            'projectedDaysRemaining' => round($projectedDaysRemaining, 1),
            'utilizationPercent' => round(($todayVolume / $dailyLimit) * 100, 1),
            'trendStatus' => $avgDailyVolume > $dailyLimit * 0.8 ? 'high' : ($avgDailyVolume > $dailyLimit * 0.5 ? 'medium' : 'low'),
        ]);
    }

    /**
     * Comparación de períodos (mes actual vs mes anterior)
     */
    public function periodComparison(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;

        $currentMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->startOfMonth();

        // Obtener métricas de ambos períodos en una sola query
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

        return response()->json([
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
        ]);
    }

    /**
     * Análisis por método de pago
     */
    public function paymentMethodAnalysis(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;

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

        return response()->json($paymentStats);
    }

    /**
     * Análisis de velocidad de procesamiento
     */
    public function processingSpeed(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;

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

        // Distribución por rangos de tiempo
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

        return response()->json([
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
        ]);
    }

    /**
     * Top clientes con análisis de comportamiento
     */
    public function topCustomersAnalysis(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;

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

        return response()->json($topCustomers);
    }

    private function getDayName(int $dayOfWeek): string
    {
        $days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return $days[($dayOfWeek - 1) % 7];
    }

    private function calculateFrequency(int $operations): string
    {
        if ($operations >= 20) return 'Muy Alta';
        if ($operations >= 10) return 'Alta';
        if ($operations >= 5) return 'Media';
        return 'Baja';
    }
}
