<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\ExchangeHouse;
use App\Models\Commission;
use App\Models\CurrencyPair;
use App\Models\User;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->isSuperAdmin()) {
            return $this->superAdminDashboard();
        } elseif ($user->isExchangeHouse()) {
            return $this->exchangeHouseDashboard($user);
        }
        
        return $this->operatorDashboard($user);
    }

    private function superAdminDashboard()
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        $thisYear = Carbon::now()->startOfYear();
        
        // Cache key único por día con namespace
        $cacheKey = 'kuberafi:dashboard:super_admin:stats:' . $today->format('Y-m-d');
        $cacheTtl = config('performance.cache.dashboard_ttl', 300);
        
        // Usar cache para estadísticas básicas
        $basicStats = Cache::remember($cacheKey, $cacheTtl, function () use ($today, $yesterday, $thisMonth, $lastMonth) {
            return [
                'totalExchangeHouses' => ExchangeHouse::where('is_active', true)->count(),
                'totalUsers' => User::where('is_active', true)->count(),
                'totalOrdersToday' => Order::whereDate('created_at', $today)->count(),
                'totalOrdersYesterday' => Order::whereDate('created_at', $yesterday)->count(),
                'totalVolumeToday' => Order::whereDate('created_at', $today)->sum('base_amount'),
                'totalVolumeYesterday' => Order::whereDate('created_at', $yesterday)->sum('base_amount'),
                'totalVolumeMonth' => Order::where('created_at', '>=', $thisMonth)->sum('base_amount'),
                'totalVolumeLastMonth' => Order::whereBetween('created_at', [$lastMonth, $thisMonth])->sum('base_amount'),
            ];
        });
        
        extract($basicStats);
        
        // Comisiones de la plataforma
        $platformCommissionsToday = Commission::where('type', 'platform')
            ->whereDate('created_at', $today)
            ->sum('amount');
            
        $platformCommissionsYesterday = Commission::where('type', 'platform')
            ->whereDate('created_at', $yesterday)
            ->sum('amount');
            
        $platformCommissionsMonth = Commission::where('type', 'platform')
            ->where('created_at', '>=', $thisMonth)
            ->sum('amount');

        $platformCommissionsLastMonth = Commission::where('type', 'platform')
            ->whereBetween('created_at', [$lastMonth, $thisMonth])
            ->sum('amount');

        // Datos para gráficos - últimos 7 días (OPTIMIZADO)
        // Obtener datos de órdenes agrupados
        $ordersStats = Order::where('created_at', '>=', Carbon::now()->subDays(6)->startOfDay())
            ->selectRaw('DATE(created_at) as date, COUNT(*) as orders, SUM(base_amount) as volume')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        // Obtener comisiones agrupadas
        $commissionsStats = Commission::where('type', 'platform')
            ->where('created_at', '>=', Carbon::now()->subDays(6)->startOfDay())
            ->selectRaw('DATE(created_at) as date, SUM(amount) as commissions')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        // Mapear todos los días
        $last7Days = collect(range(6, 0))->map(function ($daysAgo) use ($ordersStats, $commissionsStats) {
            $date = Carbon::now()->subDays($daysAgo);
            $dateKey = $date->format('Y-m-d');
            
            $orderData = $ordersStats->get($dateKey);
            $commissionData = $commissionsStats->get($dateKey);
            
            return [
                'date' => $dateKey,
                'day' => $date->format('D'),
                'orders' => $orderData ? (int) $orderData->orders : 0,
                'volume' => $orderData ? (float) $orderData->volume : 0,
                'commissions' => $commissionData ? (float) $commissionData->commissions : 0,
            ];
        });

        // Datos mensuales del año actual - OPTIMIZADO (2 queries en lugar de 36)
        $monthlyStats = Order::selectRaw('MONTH(created_at) as month, COUNT(*) as orders, SUM(base_amount) as volume')
            ->whereYear('created_at', $thisYear->year)
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $monthlyCommissions = Commission::where('type', 'platform')
            ->selectRaw('MONTH(created_at) as month, SUM(amount) as commissions')
            ->whereYear('created_at', $thisYear->year)
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $monthlyData = collect(range(1, 12))->map(function ($month) use ($monthlyStats, $monthlyCommissions) {
            $stats = $monthlyStats->get($month);
            $commission = $monthlyCommissions->get($month);
            
            return [
                'month' => $month,
                'name' => Carbon::create(null, $month, 1)->format('M'),
                'orders' => $stats ? (int) $stats->orders : 0,
                'volume' => $stats ? (float) $stats->volume : 0,
                'commissions' => $commission ? (float) $commission->commissions : 0,
            ];
        });

        // Distribución por pares de divisas
        $currencyPairStats = Order::join('currency_pairs', 'orders.currency_pair_id', '=', 'currency_pairs.id')
            ->selectRaw('currency_pairs.symbol, COUNT(*) as count, SUM(orders.base_amount) as volume')
            ->where('orders.created_at', '>=', $thisMonth)
            ->groupBy('currency_pairs.symbol')
            ->orderBy('volume', 'desc')
            ->get();

        // Estados de órdenes
        $orderStatusStats = Order::selectRaw('status, COUNT(*) as count')
            ->where('created_at', '>=', $thisMonth)
            ->groupBy('status')
            ->get();

        // Órdenes recientes - usar scope optimizado
        $recentOrders = Order::withRelations()
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        // Top casas de cambio por volumen - Optimizado con una sola consulta
        $topExchangeHouses = ExchangeHouse::withSum(['orders' => function($query) use ($thisMonth) {
                $query->where('created_at', '>=', $thisMonth);
            }], 'base_amount')
            ->withCount(['orders' => function($query) use ($thisMonth) {
                $query->where('created_at', '>=', $thisMonth);
            }])
            ->having('orders_sum_base_amount', '>', 0) // Solo casas con órdenes
            ->orderBy('orders_sum_base_amount', 'desc')
            ->limit(5)
            ->get();

        // Calcular porcentajes de crecimiento
        $ordersGrowth = $totalOrdersYesterday > 0 
            ? (($totalOrdersToday - $totalOrdersYesterday) / $totalOrdersYesterday) * 100 
            : 0;
            
        $volumeGrowth = $totalVolumeYesterday > 0 
            ? (($totalVolumeToday - $totalVolumeYesterday) / $totalVolumeYesterday) * 100 
            : 0;
            
        $commissionsGrowth = $platformCommissionsYesterday > 0 
            ? (($platformCommissionsToday - $platformCommissionsYesterday) / $platformCommissionsYesterday) * 100 
            : 0;

        $monthlyVolumeGrowth = $totalVolumeLastMonth > 0 
            ? (($totalVolumeMonth - $totalVolumeLastMonth) / $totalVolumeLastMonth) * 100 
            : 0;

        return Inertia::render('Dashboard/SuperAdminImproved', [
            'stats' => [
                'totalExchangeHouses' => $totalExchangeHouses,
                'totalUsers' => $totalUsers,
                'totalOrdersToday' => $totalOrdersToday,
                'totalVolumeToday' => number_format($totalVolumeToday, 2),
                'totalVolumeMonth' => number_format($totalVolumeMonth, 2),
                'platformCommissionsToday' => number_format($platformCommissionsToday, 2),
                'platformCommissionsMonth' => number_format($platformCommissionsMonth, 2),
                'ordersGrowth' => round($ordersGrowth, 1),
                'volumeGrowth' => round($volumeGrowth, 1),
                'commissionsGrowth' => round($commissionsGrowth, 1),
                'monthlyVolumeGrowth' => round($monthlyVolumeGrowth, 1),
                'platformCommissionRate' => SystemSetting::getPlatformCommissionRate(),
            ],
            'chartData' => [
                'last7Days' => $last7Days,
                'monthlyData' => $monthlyData,
                'currencyPairs' => $currencyPairStats,
                'orderStatus' => $orderStatusStats,
            ],
            'recentOrders' => $recentOrders,
            'topExchangeHouses' => $topExchangeHouses,
        ]);
    }

    private function exchangeHouseDashboard($user)
    {
        $exchangeHouse = $user->exchangeHouse;
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $last24h = Carbon::now()->subHours(24);
        
        // Métricas estilo Binance - Últimas 24h (OPTIMIZADO)
        $stats24h = $exchangeHouse->orders()
            ->where('created_at', '>=', $last24h)
            ->selectRaw('
                COUNT(*) as orders_count,
                COALESCE(SUM(base_amount), 0) as volume,
                COALESCE(SUM(exchange_commission), 0) as profit,
                COALESCE(SUM(platform_commission), 0) as platform_fee
            ')
            ->first();

        $orders24h = $stats24h->orders_count;
        $volume24h = $stats24h->volume;
        $profit24h = $stats24h->profit;
        $platformFee24h = $stats24h->platform_fee;
        
        // Métricas del mes (OPTIMIZADO)
        $statsMonth = $exchangeHouse->orders()
            ->where('created_at', '>=', $thisMonth)
            ->selectRaw('
                COUNT(*) as orders_count,
                COALESCE(SUM(base_amount), 0) as volume,
                COALESCE(SUM(exchange_commission), 0) as profit,
                COALESCE(SUM(platform_commission), 0) as platform_fee
            ')
            ->first();

        $ordersMonth = $statsMonth->orders_count;
        $volumeMonth = $statsMonth->volume;
        $profitMonth = $statsMonth->profit;
        $platformFeeMonth = $statsMonth->platform_fee;
        
        // Métricas de hoy
        $ordersToday = $exchangeHouse->orders()->whereDate('created_at', $today)->count();
        $volumeToday = $exchangeHouse->orders()->whereDate('created_at', $today)->sum('base_amount');
        
        // Top pares de divisas (OPTIMIZADO - JOIN en lugar de eager loading con groupBy)
        $topPairs = $exchangeHouse->orders()
            ->join('currency_pairs', 'orders.currency_pair_id', '=', 'currency_pairs.id')
            ->where('orders.status', 'completed')
            ->selectRaw('currency_pairs.id, currency_pairs.symbol, currency_pairs.base_currency, currency_pairs.quote_currency, 
                         COUNT(*) as total_orders, SUM(orders.base_amount) as total_volume, SUM(orders.exchange_commission) as total_profit')
            ->groupBy('currency_pairs.id', 'currency_pairs.symbol', 'currency_pairs.base_currency', 'currency_pairs.quote_currency')
            ->orderByDesc('total_profit')
            ->limit(5)
            ->get();
        
        // Gráfica de ganancias (últimos 7 días)
        $profitChart = $exchangeHouse->orders()
            ->where('status', 'completed')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, SUM(exchange_commission) as profit, SUM(base_amount) as volume, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Órdenes recientes
        $recentOrders = $exchangeHouse->orders()
            ->with(['currencyPair', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Pares de divisas disponibles
        $currencyPairs = CurrencyPair::where('is_active', true)->get();

        // ===== NUEVAS MÉTRICAS PARA GRÁFICAS =====
        
        // Datos de volumen últimos 7 días (OPTIMIZADO)
        // Una sola query agrupada por fecha
        $volumeStats = $exchangeHouse->orders()
            ->where('created_at', '>=', Carbon::now()->subDays(6)->startOfDay())
            ->selectRaw('DATE(created_at) as date, SUM(base_amount) as volume, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Mapear todos los días (incluyendo días sin datos)
        $volumeData = collect(range(6, 0))->map(function ($daysAgo) use ($volumeStats) {
            $date = Carbon::now()->subDays($daysAgo);
            $dateKey = $date->format('Y-m-d');
            $stats = $volumeStats->get($dateKey);
            
            return [
                'date' => $date->format('D'),
                'volume' => $stats ? (float) $stats->volume : 0,
                'orders' => $stats ? (int) $stats->orders : 0,
            ];
        });

        // Distribución de uso por pares (% de operaciones) - TOP 6
        $pairUsageData = $exchangeHouse->orders()
            ->where('orders.created_at', '>=', $thisMonth)
            ->where('orders.status', 'completed')
            ->join('currency_pairs', 'orders.currency_pair_id', '=', 'currency_pairs.id')
            ->selectRaw('currency_pairs.symbol as name, COUNT(*) as value')
            ->groupBy('currency_pairs.symbol')
            ->orderByDesc('value')
            ->limit(6)
            ->get()
            ->map(function ($item, $index) {
                $colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
                return [
                    'name' => $item->name,
                    'value' => (int) $item->value,
                    'color' => $colors[$index % count($colors)],
                ];
            });

        // Comisiones por par de divisas - TOP 8
        $commissionsData = $exchangeHouse->orders()
            ->where('orders.created_at', '>=', $thisMonth)
            ->where('orders.status', 'completed')
            ->join('currency_pairs', 'orders.currency_pair_id', '=', 'currency_pairs.id')
            ->selectRaw('currency_pairs.symbol as pair, SUM(orders.exchange_commission) as comisiones, COUNT(*) as operaciones')
            ->groupBy('currency_pairs.symbol')
            ->orderByDesc('comisiones')
            ->limit(8)
            ->get();

        // Distribución horaria de operaciones (últimos 30 días)
        $hourlyData = $exchangeHouse->orders()
            ->where('orders.created_at', '>=', Carbon::now()->subDays(30))
            ->selectRaw('HOUR(orders.created_at) as hour, COUNT(*) as operaciones')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->map(fn($item) => [
                'hora' => sprintf('%02d:00', $item->hour),
                'operaciones' => (int) $item->operaciones,
            ]);

        // Comparación de tasas vs mercado (ejemplo con datos reales)
        $rateComparisonData = CurrencyPair::where('is_active', true)
            ->limit(5)
            ->get()
            ->map(fn($pair) => [
                'pair' => $pair->symbol,
                'current' => (float) $pair->current_rate,
                'market' => (float) ($pair->market_rate ?? $pair->current_rate * 0.98), // Placeholder si no hay market_rate
            ]);

        // Top 5 clientes del mes (usar customer_id si existe, sino user_id)
        $topClientsData = $exchangeHouse->orders()
            ->where('orders.created_at', '>=', $thisMonth)
            ->where('orders.status', 'completed')
            ->leftJoin('customers', 'orders.customer_id', '=', 'customers.id')
            ->leftJoin('users', 'orders.user_id', '=', 'users.id')
            ->selectRaw('
                COALESCE(customers.name, users.name) as name, 
                SUM(orders.base_amount) as volumen, 
                COUNT(*) as operaciones, 
                SUM(orders.exchange_commission) as comision
            ')
            ->groupBy(DB::raw('COALESCE(customers.id, users.id)'), DB::raw('COALESCE(customers.name, users.name)'))
            ->orderByDesc('volumen')
            ->limit(5)
            ->get()
            ->map(fn($client) => [
                'name' => $client->name ?? 'Usuario',
                'volumen' => (float) $client->volumen,
                'operaciones' => (int) $client->operaciones,
                'comision' => (float) $client->comision,
            ]);

        // Calcular cambios vs ayer para stats - OPTIMIZADO (1 query en lugar de 3)
        $yesterday = Carbon::yesterday();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->startOfMonth();
        
        $comparisons = $exchangeHouse->orders()
            ->selectRaw('
                COUNT(CASE WHEN DATE(created_at) = ? THEN 1 END) as orders_yesterday,
                COALESCE(SUM(CASE WHEN DATE(created_at) = ? THEN base_amount END), 0) as volume_yesterday,
                COALESCE(SUM(CASE WHEN created_at >= ? AND created_at < ? THEN exchange_commission END), 0) as commissions_last_month
            ', [$yesterday->format('Y-m-d'), $yesterday->format('Y-m-d'), $lastMonth, $lastMonthEnd])
            ->first();
        
        $ordersYesterday = $comparisons->orders_yesterday;
        $volumeYesterday = $comparisons->volume_yesterday;
        $commissionsLastMonth = $comparisons->commissions_last_month;

        // ===== DEUDA A KUBERAFI =====
        // Total de comisiones de plataforma pendientes de pago
        $totalOwedToKuberafi = Commission::where('exchange_house_id', $exchangeHouse->id)
            ->where('type', 'platform')
            ->where('status', 'pending')
            ->sum('amount');
            
        $totalOwedThisMonth = Commission::where('exchange_house_id', $exchangeHouse->id)
            ->where('type', 'platform')
            ->where('status', 'pending')
            ->where('created_at', '>=', $thisMonth)
            ->sum('amount');

        return Inertia::render('Dashboard/ExchangeHouseSimple', [
            'exchangeHouse' => $exchangeHouse,
            'stats' => [
                // 24 horas
                'volume24h' => number_format($volume24h, 2),
                'profit24h' => number_format($profit24h, 2),
                'orders24h' => $orders24h,
                'platformFee24h' => number_format($platformFee24h, 2),
                
                // Mes actual
                'volumeMonth' => number_format($volumeMonth, 2),
                'profitMonth' => number_format($profitMonth, 2),
                'ordersMonth' => $ordersMonth,
                'platformFeeMonth' => number_format($platformFeeMonth, 2),
                'commissionsMonth' => number_format($profitMonth, 2),
                
                // Hoy
                'ordersToday' => $ordersToday,
                'volumeToday' => number_format($volumeToday, 2),
                'dailyLimitUsed' => number_format(($volumeToday / $exchangeHouse->daily_limit) * 100, 1),
                
                // Comparaciones (para % de cambio)
                'volumeYesterday' => number_format($volumeYesterday, 2),
                'ordersYesterday' => $ordersYesterday,
                'commissionsLastMonth' => number_format($commissionsLastMonth, 2),
                
                // Promedios
                'avgCommissionPercent' => $ordersMonth > 0 ? number_format($profitMonth / $ordersMonth, 2) : '0.00',
                'avgProfitPerOrder' => $ordersMonth > 0 ? number_format($profitMonth / $ordersMonth, 2) : '0.00',
                
                // Deuda a Kuberafi
                'owedToKuberafi' => number_format($totalOwedToKuberafi, 2),
                'owedThisMonth' => number_format($totalOwedThisMonth, 2),
            ],
            'topPairs' => $topPairs,
            'profitChart' => $profitChart,
            'recentOrders' => $recentOrders,
            'currencyPairs' => $currencyPairs,
            
            // ===== NUEVOS DATOS PARA GRÁFICAS =====
            'volumeData' => $volumeData,
            'pairUsageData' => $pairUsageData,
            'commissionsData' => $commissionsData,
            'hourlyData' => $hourlyData,
            'rateComparisonData' => $rateComparisonData,
            'topClientsData' => $topClientsData,
        ]);
    }

    private function operatorDashboard($user)
    {
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();
        $last24h = Carbon::now()->subHours(24);
        
        // Estadísticas del día (OPTIMIZADO)
        $statsToday = $user->orders()
            ->whereDate('created_at', $today)
            ->selectRaw('
                COUNT(*) as orders_count,
                COALESCE(SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END), 0) as completed_count,
                COALESCE(SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END), 0) as pending_count,
                COALESCE(SUM(base_amount), 0) as volume,
                COALESCE(SUM(exchange_commission), 0) as commission
            ')
            ->first();
        
        // Estadísticas de la semana
        $statsWeek = $user->orders()
            ->where('created_at', '>=', $thisWeek)
            ->selectRaw('
                COUNT(*) as orders_count,
                COALESCE(SUM(base_amount), 0) as volume,
                COALESCE(SUM(exchange_commission), 0) as commission
            ')
            ->first();
        
        // Estadísticas del mes
        $statsMonth = $user->orders()
            ->where('created_at', '>=', $thisMonth)
            ->selectRaw('
                COUNT(*) as orders_count,
                COALESCE(SUM(base_amount), 0) as volume,
                COALESCE(SUM(exchange_commission), 0) as commission
            ')
            ->first();
        
        // Evolución últimos 7 días
        $dailyEvolution = $user->orders()
            ->where('created_at', '>=', Carbon::now()->subDays(6)->startOfDay())
            ->selectRaw('
                DATE(created_at) as date,
                COUNT(*) as orders,
                SUM(base_amount) as volume,
                SUM(exchange_commission) as commission
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');
        
        // Mapear todos los días
        $chartData = collect(range(6, 0))->map(function ($daysAgo) use ($dailyEvolution) {
            $date = Carbon::now()->subDays($daysAgo);
            $dateKey = $date->format('Y-m-d');
            $stats = $dailyEvolution->get($dateKey);
            
            return [
                'date' => $date->format('D d'),
                'orders' => $stats ? (int) $stats->orders : 0,
                'volume' => $stats ? (float) $stats->volume : 0,
                'commission' => $stats ? (float) $stats->commission : 0,
            ];
        });
        
        // Top pares de divisas del operador
        $topPairs = $user->orders()
            ->join('currency_pairs', 'orders.currency_pair_id', '=', 'currency_pairs.id')
            ->where('orders.created_at', '>=', $thisMonth)
            ->where('orders.status', 'completed')
            ->selectRaw('
                currency_pairs.symbol,
                COUNT(*) as total_orders,
                SUM(orders.base_amount) as total_volume,
                SUM(orders.exchange_commission) as total_commission
            ')
            ->groupBy('currency_pairs.symbol')
            ->orderByDesc('total_volume')
            ->limit(5)
            ->get();
        
        // Distribución por estado
        $statusDistribution = $user->orders()
            ->where('created_at', '>=', $thisMonth)
            ->selectRaw('
                status,
                COUNT(*) as count,
                SUM(base_amount) as volume
            ')
            ->groupBy('status')
            ->get();
        
        // Órdenes recientes
        $recentOrders = $user->orders()
            ->with(['exchangeHouse', 'currencyPair', 'customer'])
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();
        
        // Clientes atendidos este mes
        $uniqueCustomers = $user->orders()
            ->where('created_at', '>=', $thisMonth)
            ->whereNotNull('customer_id')
            ->distinct('customer_id')
            ->count();
        
        // Tasa de conversión
        $totalOrders = $statsMonth->orders_count;
        $completedOrders = $user->orders()
            ->where('created_at', '>=', $thisMonth)
            ->where('status', 'completed')
            ->count();
        $conversionRate = $totalOrders > 0 ? ($completedOrders / $totalOrders) * 100 : 0;

        return Inertia::render('Dashboard/Operator', [
            'stats' => [
                'today' => [
                    'orders' => $statsToday->orders_count,
                    'completed' => $statsToday->completed_count,
                    'pending' => $statsToday->pending_count,
                    'volume' => $statsToday->volume,
                    'commission' => $statsToday->commission,
                ],
                'week' => [
                    'orders' => $statsWeek->orders_count,
                    'volume' => $statsWeek->volume,
                    'commission' => $statsWeek->commission,
                ],
                'month' => [
                    'orders' => $statsMonth->orders_count,
                    'volume' => $statsMonth->volume,
                    'commission' => $statsMonth->commission,
                ],
                'uniqueCustomers' => $uniqueCustomers,
                'conversionRate' => round($conversionRate, 2),
            ],
            'chartData' => $chartData,
            'topPairs' => $topPairs,
            'statusDistribution' => $statusDistribution,
            'recentOrders' => $recentOrders,
        ]);
    }

    public function commissions(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $commissions = Commission::with(['order.exchangeHouse', 'order.currencyPair'])
            ->where('type', 'platform')
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function ($commission) {
                // Agregar información de promoción
                $commission->has_promo = $commission->order->exchangeHouse->zero_commission_promo ?? false;
                return $commission;
            });

        $totalCommissions = Commission::where('type', 'platform')->sum('amount');
        $monthlyCommissions = Commission::where('type', 'platform')
            ->whereMonth('created_at', now()->month)
            ->sum('amount');

        return Inertia::render('Admin/Commissions', [
            'commissions' => $commissions,
            'stats' => [
                'totalCommissions' => number_format($totalCommissions, 2),
                'monthlyCommissions' => number_format($monthlyCommissions, 2),
                'platformCommissionRate' => SystemSetting::getPlatformCommissionRate(),
            ],
        ]);
    }

    public function myCommissions(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isExchangeHouse() && !$user->isOperator()) {
            abort(403);
        }

        $commissions = Commission::with(['order.currencyPair'])
            ->where('exchange_house_id', $user->exchange_house_id)
            ->where('type', 'exchange_house')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $totalCommissions = Commission::where('exchange_house_id', $user->exchange_house_id)
            ->where('type', 'exchange_house')
            ->sum('amount');
            
        $monthlyCommissions = Commission::where('exchange_house_id', $user->exchange_house_id)
            ->where('type', 'exchange_house')
            ->whereMonth('created_at', now()->month)
            ->sum('amount');

        return Inertia::render('ExchangeHouse/Commissions', [
            'commissions' => $commissions,
            'stats' => [
                'totalCommissions' => number_format($totalCommissions, 2),
                'monthlyCommissions' => number_format($monthlyCommissions, 2),
            ],
        ]);
    }

    public function users(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $users = User::with('exchangeHouse')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Users', [
            'users' => $users,
        ]);
    }

    public function reports(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        // Estadísticas para reportes
        $totalOrders = Order::count();
        $totalVolume = Order::sum('base_amount');
        $totalCommissions = Commission::where('type', 'platform')->sum('amount');
        
        $monthlyData = Order::selectRaw('MONTH(created_at) as month, COUNT(*) as orders, SUM(base_amount) as volume')
            ->whereYear('created_at', now()->year)
            ->groupBy('month')
            ->get();

        return Inertia::render('Admin/Reports', [
            'stats' => [
                'totalOrders' => $totalOrders,
                'totalVolume' => number_format($totalVolume, 2),
                'totalCommissions' => number_format($totalCommissions, 2),
                'platformCommissionRate' => SystemSetting::getPlatformCommissionRate(),
            ],
            'monthlyData' => $monthlyData,
        ]);
    }
}
