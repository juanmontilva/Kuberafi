<?php

namespace App\Http\Controllers;

use App\Models\PerformanceGoal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PerformanceGoalController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Solo casas de cambio pueden configurar metas
        if (!$user->isExchangeHouse()) {
            abort(403, 'Solo las casas de cambio pueden configurar metas');
        }
        
        $goals = PerformanceGoal::where('exchange_house_id', $user->id)
            ->get()
            ->keyBy('period');
        
        // Períodos disponibles
        $periods = ['today', 'week', 'month', 'quarter', 'year'];
        
        // Crear estructura con valores por defecto
        $goalsData = [];
        foreach ($periods as $period) {
            $goalsData[$period] = $goals->get($period) ?? [
                'period' => $period,
                'orders_goal' => $this->getDefaultGoal($period, 'orders'),
                'volume_goal' => $this->getDefaultGoal($period, 'volume'),
                'commission_goal' => $this->getDefaultGoal($period, 'commission'),
            ];
        }
        
        return Inertia::render('Performance/Goals', [
            'goals' => $goalsData,
        ]);
    }
    
    public function update(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isExchangeHouse()) {
            abort(403, 'Solo las casas de cambio pueden configurar metas');
        }
        
        $validated = $request->validate([
            'period' => 'required|in:today,week,month,quarter,year',
            'orders_goal' => 'required|integer|min:0',
            'volume_goal' => 'required|numeric|min:0',
            'commission_goal' => 'required|numeric|min:0',
        ]);
        
        PerformanceGoal::updateOrCreate(
            [
                'exchange_house_id' => $user->id,
                'period' => $validated['period'],
            ],
            [
                'orders_goal' => $validated['orders_goal'],
                'volume_goal' => $validated['volume_goal'],
                'commission_goal' => $validated['commission_goal'],
            ]
        );
        
        return redirect()->back()->with('success', 'Metas actualizadas correctamente');
    }
    
    private function getDefaultGoal($period, $type)
    {
        $defaults = [
            'today' => ['orders' => 10, 'volume' => 5000, 'commission' => 250],
            'week' => ['orders' => 50, 'volume' => 25000, 'commission' => 1250],
            'month' => ['orders' => 200, 'volume' => 100000, 'commission' => 5000],
            'quarter' => ['orders' => 600, 'volume' => 300000, 'commission' => 15000],
            'year' => ['orders' => 2400, 'volume' => 1200000, 'commission' => 60000],
        ];
        
        return $defaults[$period][$type] ?? 0;
    }
}
