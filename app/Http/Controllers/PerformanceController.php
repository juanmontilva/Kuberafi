<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PerformanceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Solo casas de cambio y operadores pueden acceder
        if (!$user->isExchangeHouse() && !$user->isOperator()) {
            abort(403);
        }
        
        // Período seleccionado (por defecto: mes actual)
        $period = $request->get('period', 'month');
        $dateFrom = $this->getDateFrom($period);
        $dateTo = now();
        
        // Período anterior para comparación
        $previousDateFrom = $this->getPreviousDateFrom($period);
        $previousDateTo = $dateFrom->copy()->subSecond();
        
        // Estadísticas del período actual
        $currentStats = $this->getStats($user, $dateFrom, $dateTo);
        
        // Estadísticas del período anterior
        $previousStats = $this->getStats($user, $previousDateFrom, $previousDateTo);
        
        // Calcular cambios porcentuales
        $changes = $this->calculateChanges($currentStats, $previousStats);
        
        // Ranking entre operadores (si es operador)
        $ranking = null;
        if ($user->isOperator()) {
            $ranking = $this->getOperatorRanking($user, $dateFrom, $dateTo);
        }
        
        // Evolución diaria del período
        $dailyEvolution = $this->getDailyEvolution($user, $dateFrom, $dateTo);
        
        // Top clientes del operador
        $topCustomers = $this->getTopCustomers($user, $dateFrom, $dateTo);
        
        // Distribución por estado
        $statusDistribution = $this->getStatusDistribution($user, $dateFrom, $dateTo);
        
        // Metas (puedes configurar esto según tus necesidades)
        $goals = $this->getGoals($user, $period);
        
        return Inertia::render('Performance/Index', [
            'currentStats' => $currentStats,
            'previousStats' => $previousStats,
            'changes' => $changes,
            'ranking' => $ranking,
            'dailyEvolution' => $dailyEvolution,
            'topCustomers' => $topCustomers,
            'statusDistribution' => $statusDistribution,
            'goals' => $goals,
            'period' => $period,
        ]);
    }
    
    private function getDateFrom($period)
    {
        switch ($period) {
            case 'today':
                return now()->startOfDay();
            case 'week':
                return now()->startOfWeek();
            case 'month':
                return now()->startOfMonth();
            case 'quarter':
                return now()->startOfQuarter();
            case 'year':
                return now()->startOfYear();
            default:
                return now()->startOfMonth();
        }
    }
    
    private function getPreviousDateFrom($period)
    {
        switch ($period) {
            case 'today':
                return now()->subDay()->startOfDay();
            case 'week':
                return now()->subWeek()->startOfWeek();
            case 'month':
                return now()->subMonth()->startOfMonth();
            case 'quarter':
                return now()->subQuarter()->startOfQuarter();
            case 'year':
                return now()->subYear()->startOfYear();
            default:
                return now()->subMonth()->startOfMonth();
        }
    }
    
    private function getStats($user, $dateFrom, $dateTo)
    {
        $query = Order::where('user_id', $user->id)
            ->whereBetween('created_at', [$dateFrom, $dateTo]);
        
        $completedQuery = (clone $query)->where('status', 'completed');
        
        return [
            'total_orders' => $query->count(),
            'completed_orders' => $completedQuery->count(),
            'pending_orders' => (clone $query)->where('status', 'pending')->count(),
            'cancelled_orders' => (clone $query)->where('status', 'cancelled')->count(),
            
            'total_volume' => $query->sum('base_amount'),
            'completed_volume' => $completedQuery->sum('base_amount'),
            
            'total_commission' => $completedQuery->sum('exchange_commission'),
            'avg_commission_per_order' => $completedQuery->avg('exchange_commission') ?? 0,
            
            'avg_order_value' => $completedQuery->avg('base_amount') ?? 0,
            'conversion_rate' => $query->count() > 0 
                ? ($completedQuery->count() / $query->count()) * 100 
                : 0,
            
            'unique_customers' => $query->distinct('customer_id')->whereNotNull('customer_id')->count(),
        ];
    }
    
    private function calculateChanges($current, $previous)
    {
        $changes = [];
        
        foreach ($current as $key => $value) {
            if (isset($previous[$key]) && $previous[$key] > 0) {
                $change = (($value - $previous[$key]) / $previous[$key]) * 100;
                $changes[$key] = round($change, 2);
            } else {
                $changes[$key] = $value > 0 ? 100 : 0;
            }
        }
        
        return $changes;
    }
    
    private function getOperatorRanking($user, $dateFrom, $dateTo)
    {
        // Obtener todos los operadores de la misma casa de cambio
        $operators = DB::table('users')
            ->where('exchange_house_id', $user->exchange_house_id)
            ->where('role', 'operator')
            ->get();
        
        $rankings = [];
        
        foreach ($operators as $operator) {
            $stats = Order::where('user_id', $operator->id)
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->where('status', 'completed')
                ->selectRaw('
                    COUNT(*) as total_orders,
                    SUM(base_amount) as total_volume,
                    SUM(exchange_commission) as total_commission
                ')
                ->first();
            
            $rankings[] = [
                'user_id' => $operator->id,
                'name' => $operator->name,
                'total_orders' => $stats->total_orders ?? 0,
                'total_volume' => $stats->total_volume ?? 0,
                'total_commission' => $stats->total_commission ?? 0,
            ];
        }
        
        // Ordenar por volumen
        usort($rankings, function($a, $b) {
            return $b['total_volume'] <=> $a['total_volume'];
        });
        
        // Encontrar posición del usuario actual
        $position = 0;
        foreach ($rankings as $index => $rank) {
            if ($rank['user_id'] === $user->id) {
                $position = $index + 1;
                break;
            }
        }
        
        return [
            'position' => $position,
            'total_operators' => count($rankings),
            'rankings' => array_slice($rankings, 0, 5), // Top 5
        ];
    }
    
    private function getDailyEvolution($user, $dateFrom, $dateTo)
    {
        $evolution = Order::where('user_id', $user->id)
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->where('status', 'completed')
            ->selectRaw('
                DATE(created_at) as date,
                COUNT(*) as orders,
                SUM(base_amount) as volume,
                SUM(exchange_commission) as commission
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        
        return $evolution;
    }
    
    private function getTopCustomers($user, $dateFrom, $dateTo)
    {
        return Customer::whereHas('orders', function($q) use ($user, $dateFrom, $dateTo) {
                $q->where('user_id', $user->id)
                  ->whereBetween('created_at', [$dateFrom, $dateTo]);
            })
            ->withCount(['orders as orders_count' => function($q) use ($user, $dateFrom, $dateTo) {
                $q->where('user_id', $user->id)
                  ->whereBetween('created_at', [$dateFrom, $dateTo]);
            }])
            ->withSum(['orders as total_volume' => function($q) use ($user, $dateFrom, $dateTo) {
                $q->where('user_id', $user->id)
                  ->whereBetween('created_at', [$dateFrom, $dateTo]);
            }], 'base_amount')
            ->orderBy('total_volume', 'desc')
            ->limit(5)
            ->get();
    }
    
    private function getStatusDistribution($user, $dateFrom, $dateTo)
    {
        return Order::where('user_id', $user->id)
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw('
                status,
                COUNT(*) as count,
                SUM(base_amount) as volume
            ')
            ->groupBy('status')
            ->get();
    }
    
    private function getGoals($user, $period)
    {
        // Obtener el exchange_house_id del usuario
        $exchangeHouseId = $user->isOperator() 
            ? $user->exchange_house_id 
            : $user->id;
        
        // Buscar metas configuradas en BD
        $goal = \App\Models\PerformanceGoal::where('exchange_house_id', $exchangeHouseId)
            ->where('period', $period)
            ->first();
        
        if ($goal) {
            return [
                'orders' => $goal->orders_goal,
                'volume' => $goal->volume_goal,
                'commission' => $goal->commission_goal,
            ];
        }
        
        // Metas por defecto si no están configuradas
        $defaultGoals = [
            'today' => [
                'orders' => 10,
                'volume' => 5000,
                'commission' => 250,
            ],
            'week' => [
                'orders' => 50,
                'volume' => 25000,
                'commission' => 1250,
            ],
            'month' => [
                'orders' => 200,
                'volume' => 100000,
                'commission' => 5000,
            ],
            'quarter' => [
                'orders' => 600,
                'volume' => 300000,
                'commission' => 15000,
            ],
            'year' => [
                'orders' => 2400,
                'volume' => 1200000,
                'commission' => 60000,
            ],
        ];
        
        return $defaultGoals[$period] ?? $defaultGoals['month'];
    }
}
