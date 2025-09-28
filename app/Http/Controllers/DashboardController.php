<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\ExchangeHouse;
use App\Models\Commission;
use App\Models\CurrencyPair;
use App\Models\User;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
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
        
        // Estadísticas generales
        $totalExchangeHouses = ExchangeHouse::where('is_active', true)->count();
        $totalUsers = User::where('is_active', true)->count();
        $totalOrdersToday = Order::whereDate('created_at', $today)->count();
        $totalOrdersYesterday = Order::whereDate('created_at', $yesterday)->count();
        $totalVolumeToday = Order::whereDate('created_at', $today)->sum('base_amount');
        $totalVolumeYesterday = Order::whereDate('created_at', $yesterday)->sum('base_amount');
        $totalVolumeMonth = Order::where('created_at', '>=', $thisMonth)->sum('base_amount');
        $totalVolumeLastMonth = Order::whereBetween('created_at', [$lastMonth, $thisMonth])->sum('base_amount');
        
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

        // Datos para gráficos - últimos 7 días
        $last7Days = collect(range(6, 0))->map(function ($daysAgo) {
            $date = Carbon::now()->subDays($daysAgo);
            return [
                'date' => $date->format('Y-m-d'),
                'day' => $date->format('D'),
                'orders' => Order::whereDate('created_at', $date)->count(),
                'volume' => Order::whereDate('created_at', $date)->sum('base_amount'),
                'commissions' => Commission::where('type', 'platform')->whereDate('created_at', $date)->sum('amount'),
            ];
        });

        // Datos mensuales del año actual
        $monthlyData = collect(range(1, 12))->map(function ($month) use ($thisYear) {
            $startOfMonth = Carbon::create($thisYear->year, $month, 1)->startOfMonth();
            $endOfMonth = Carbon::create($thisYear->year, $month, 1)->endOfMonth();
            
            return [
                'month' => $month,
                'name' => $startOfMonth->format('M'),
                'orders' => Order::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
                'volume' => Order::whereBetween('created_at', [$startOfMonth, $endOfMonth])->sum('base_amount'),
                'commissions' => Commission::where('type', 'platform')
                    ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                    ->sum('amount'),
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

        // Órdenes recientes
        $recentOrders = Order::with(['exchangeHouse', 'currencyPair', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        // Top casas de cambio por volumen
        $topExchangeHouses = ExchangeHouse::withSum(['orders' => function($query) use ($thisMonth) {
                $query->where('created_at', '>=', $thisMonth);
            }], 'base_amount')
            ->withCount(['orders' => function($query) use ($thisMonth) {
                $query->where('created_at', '>=', $thisMonth);
            }])
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

        return Inertia::render('Dashboard/SuperAdmin', [
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
        
        // Estadísticas de la casa de cambio
        $ordersToday = $exchangeHouse->orders()->whereDate('created_at', $today)->count();
        $volumeToday = $exchangeHouse->orders()->whereDate('created_at', $today)->sum('base_amount');
        $commissionsMonth = $exchangeHouse->commissions()
            ->where('type', 'exchange_house')
            ->where('created_at', '>=', $thisMonth)
            ->sum('amount');

        // Órdenes recientes de la casa de cambio
        $recentOrders = $exchangeHouse->orders()
            ->with(['currencyPair', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Pares de divisas disponibles
        $currencyPairs = CurrencyPair::where('is_active', true)->get();

        return Inertia::render('Dashboard/ExchangeHouse', [
            'exchangeHouse' => $exchangeHouse,
            'stats' => [
                'ordersToday' => $ordersToday,
                'volumeToday' => number_format($volumeToday, 2),
                'commissionsMonth' => number_format($commissionsMonth, 2),
                'dailyLimitUsed' => number_format(($volumeToday / $exchangeHouse->daily_limit) * 100, 1),
            ],
            'recentOrders' => $recentOrders,
            'currencyPairs' => $currencyPairs,
        ]);
    }

    private function operatorDashboard($user)
    {
        $today = Carbon::today();
        
        // Órdenes del operador
        $myOrdersToday = $user->orders()->whereDate('created_at', $today)->count();
        $myVolumeToday = $user->orders()->whereDate('created_at', $today)->sum('base_amount');
        
        $recentOrders = $user->orders()
            ->with(['exchangeHouse', 'currencyPair'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Dashboard/Operator', [
            'stats' => [
                'myOrdersToday' => $myOrdersToday,
                'myVolumeToday' => number_format($myVolumeToday, 2),
            ],
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
            ->paginate(20);

        $totalCommissions = Commission::where('type', 'platform')->sum('amount');
        $monthlyCommissions = Commission::where('type', 'platform')
            ->whereMonth('created_at', now()->month)
            ->sum('amount');

        return Inertia::render('Admin/Commissions', [
            'commissions' => $commissions,
            'stats' => [
                'totalCommissions' => number_format($totalCommissions, 2),
                'monthlyCommissions' => number_format($monthlyCommissions, 2),
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
