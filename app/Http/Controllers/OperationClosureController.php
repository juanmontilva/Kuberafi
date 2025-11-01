<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class OperationClosureController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Solo casas de cambio y operadores pueden acceder
        if (!$user->isExchangeHouse() && !$user->isOperator()) {
            abort(403);
        }
        
        // Fecha por defecto: hoy
        $dateFrom = $request->get('date_from', now()->toDateString());
        $dateTo = $request->get('date_to', now()->toDateString());
        
        $query = Order::withRelations();
        
        // Filtrar según el rol del usuario
        if ($user->isExchangeHouse()) {
            $query->forExchangeHouse($user->exchange_house_id);
        } elseif ($user->isOperator()) {
            $query->where('user_id', $user->id);
        }
        
        // Filtro por rango de fechas
        $query->whereDate('created_at', '>=', $dateFrom)
              ->whereDate('created_at', '<=', $dateTo);
        
        // Filtro por búsqueda
        if ($request->has('search') && $request->get('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Filtro por estado
        if ($request->has('status') && $request->get('status') !== 'all') {
            $query->where('status', $request->get('status'));
        }
        
        $orders = $query->orderBy('created_at', 'desc')->paginate(50)->withQueryString();
        
        // Calcular estadísticas del período
        $statsQuery = Order::query();
        
        if ($user->isExchangeHouse()) {
            $statsQuery->forExchangeHouse($user->exchange_house_id);
        } elseif ($user->isOperator()) {
            $statsQuery->where('user_id', $user->id);
        }
        
        $statsQuery->whereDate('created_at', '>=', $dateFrom)
                   ->whereDate('created_at', '<=', $dateTo);
        
        $stats = [
            'total_orders' => $statsQuery->count(),
            'completed_orders' => (clone $statsQuery)->where('status', 'completed')->count(),
            'pending_orders' => (clone $statsQuery)->where('status', 'pending')->count(),
            'cancelled_orders' => (clone $statsQuery)->where('status', 'cancelled')->count(),
            
            // Volúmenes
            'total_volume' => (clone $statsQuery)->sum('base_amount'),
            'completed_volume' => (clone $statsQuery)->where('status', 'completed')->sum('base_amount'),
            'pending_volume' => (clone $statsQuery)->where('status', 'pending')->sum('base_amount'),
            
            // Comisiones
            'total_house_commission' => (clone $statsQuery)->where('status', 'completed')->sum('house_commission_amount'),
            'total_platform_commission' => (clone $statsQuery)->where('status', 'completed')->sum('platform_commission'),
            'total_exchange_commission' => (clone $statsQuery)->where('status', 'completed')->sum('exchange_commission'),
        ];
        
        // Clientes con deudas pendientes en el período
        $customersWithDebt = Customer::where('exchange_house_id', $user->exchange_house_id)
            ->whereHas('orders', function($q) use ($dateFrom, $dateTo) {
                $q->where('status', 'pending')
                  ->whereDate('created_at', '>=', $dateFrom)
                  ->whereDate('created_at', '<=', $dateTo);
            })
            ->withCount(['orders as pending_orders_count' => function($q) use ($dateFrom, $dateTo) {
                $q->where('status', 'pending')
                  ->whereDate('created_at', '>=', $dateFrom)
                  ->whereDate('created_at', '<=', $dateTo);
            }])
            ->withSum(['orders as pending_amount' => function($q) use ($dateFrom, $dateTo) {
                $q->where('status', 'pending')
                  ->whereDate('created_at', '>=', $dateFrom)
                  ->whereDate('created_at', '<=', $dateTo);
            }], 'base_amount')
            ->having('pending_orders_count', '>', 0)
            ->get();
        
        return Inertia::render('OperationClosure/Index', [
            'orders' => $orders,
            'stats' => $stats,
            'customersWithDebt' => $customersWithDebt,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'search' => $request->get('search'),
                'status' => $request->get('status', 'all'),
            ],
        ]);
    }
    
    public function export(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isExchangeHouse() && !$user->isOperator()) {
            abort(403);
        }
        
        $dateFrom = $request->get('date_from', now()->toDateString());
        $dateTo = $request->get('date_to', now()->toDateString());
        
        $query = Order::withRelations();
        
        if ($user->isExchangeHouse()) {
            $query->forExchangeHouse($user->exchange_house_id);
        } elseif ($user->isOperator()) {
            $query->where('user_id', $user->id);
        }
        
        $query->whereDate('created_at', '>=', $dateFrom)
              ->whereDate('created_at', '<=', $dateTo);
        
        // IMPORTANTE: Solo incluir órdenes completadas en el cierre
        // Las órdenes canceladas no generan comisiones ni ganancias
        $query->where('status', 'completed');
        
        if ($request->has('search') && $request->get('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        $query->orderBy('created_at', 'desc');
        
        $filename = 'cierre_operaciones_' . $dateFrom . '_' . $dateTo . '.xlsx';
        
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\OperationClosureMultiSheetExport($query, $dateFrom, $dateTo),
            $filename
        );
    }
    
    public function exportPendingDebts(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isExchangeHouse() && !$user->isOperator()) {
            abort(403);
        }
        
        $dateFrom = $request->get('date_from', now()->toDateString());
        $dateTo = $request->get('date_to', now()->toDateString());
        
        $customersWithDebt = Customer::where('exchange_house_id', $user->exchange_house_id)
            ->whereHas('orders', function($q) use ($dateFrom, $dateTo) {
                $q->where('status', 'pending')
                  ->whereDate('created_at', '>=', $dateFrom)
                  ->whereDate('created_at', '<=', $dateTo);
            })
            ->with(['orders' => function($q) use ($dateFrom, $dateTo) {
                $q->where('status', 'pending')
                  ->whereDate('created_at', '>=', $dateFrom)
                  ->whereDate('created_at', '<=', $dateTo)
                  ->with('currencyPair');
            }])
            ->get();
        
        $filename = 'deudas_pendientes_' . $dateFrom . '_' . $dateTo . '.xlsx';
        
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\PendingDebtsExport($customersWithDebt, $dateFrom, $dateTo),
            $filename
        );
    }
}
