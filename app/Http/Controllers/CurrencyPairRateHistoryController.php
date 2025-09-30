<?php

namespace App\Http\Controllers;

use App\Models\CurrencyPair;
use App\Models\CurrencyPairRateHistory;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CurrencyPairRateHistoryController extends Controller
{
    /**
     * Obtener historial de tasas para un par de divisas
     */
    public function index(Request $request, $currencyPairId)
    {
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;

        if (!$exchangeHouseId) {
            return response()->json(['error' => 'No tienes una casa de cambio asignada'], 403);
        }

        $currencyPair = CurrencyPair::findOrFail($currencyPairId);

        // Parámetros de filtro
        $period = $request->get('period', '30'); // últimos 30 días por defecto
        $from = $request->get('from');
        $to = $request->get('to');

        $query = CurrencyPairRateHistory::forPair($currencyPairId)
            ->forExchangeHouse($exchangeHouseId)
            ->with('changedBy:id,name')
            ->orderBy('valid_from', 'desc');

        // Filtrar por período o rango de fechas
        if ($from && $to) {
            $query->whereBetween('valid_from', [$from, $to]);
        } else {
            $days = intval($period);
            $query->where('valid_from', '>=', Carbon::now()->subDays($days));
        }

        $history = $query->paginate(50);

        // Calcular estadísticas
        $stats = [
            'current_rate' => $history->first()?->rate,
            'highest_rate' => $history->max('rate'),
            'lowest_rate' => $history->min('rate'),
            'average_rate' => $history->avg('rate'),
            'total_changes' => $history->total(),
        ];

        return response()->json([
            'history' => $history,
            'stats' => $stats,
            'currency_pair' => [
                'symbol' => $currencyPair->symbol,
                'base_currency' => $currencyPair->base_currency,
                'quote_currency' => $currencyPair->quote_currency,
            ],
        ]);
    }

    /**
     * Obtener datos para la gráfica de evolución de tasas
     */
    public function chartData(Request $request, $currencyPairId)
    {
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;

        if (!$exchangeHouseId) {
            return response()->json(['error' => 'No tienes una casa de cambio asignada'], 403);
        }

        $period = $request->get('period', '30'); // últimos 30 días
        $days = intval($period);

        $history = CurrencyPairRateHistory::forPair($currencyPairId)
            ->forExchangeHouse($exchangeHouseId)
            ->where('valid_from', '>=', Carbon::now()->subDays($days))
            ->orderBy('valid_from', 'asc')
            ->get(['valid_from', 'rate', 'effective_rate', 'margin_percent']);

        // Formatear datos para la gráfica
        $chartData = $history->map(function ($item) {
            return [
                'date' => $item->valid_from->format('Y-m-d H:i'),
                'dateShort' => $item->valid_from->format('d/m'),
                'rate' => (float) $item->rate,
                'effectiveRate' => (float) $item->effective_rate,
                'margin' => (float) $item->margin_percent,
            ];
        });

        return response()->json([
            'data' => $chartData,
            'period' => $days,
        ]);
    }

    /**
     * Obtener comparación de tasas entre diferentes períodos
     */
    public function comparison(Request $request, $currencyPairId)
    {
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;

        if (!$exchangeHouseId) {
            return response()->json(['error' => 'No tienes una casa de cambio asignada'], 403);
        }

        // Tasa actual
        $current = CurrencyPairRateHistory::forPair($currencyPairId)
            ->forExchangeHouse($exchangeHouseId)
            ->current()
            ->first();

        if (!$current) {
            return response()->json([
                'current' => null,
                'yesterday' => null,
                'lastWeek' => null,
                'lastMonth' => null,
            ]);
        }

        // Tasa de ayer
        $yesterday = CurrencyPairRateHistory::forPair($currencyPairId)
            ->forExchangeHouse($exchangeHouseId)
            ->where('valid_from', '>=', Carbon::yesterday()->startOfDay())
            ->where('valid_from', '<', Carbon::yesterday()->endOfDay())
            ->orderBy('valid_from', 'desc')
            ->first();

        // Tasa de hace una semana
        $lastWeek = CurrencyPairRateHistory::forPair($currencyPairId)
            ->forExchangeHouse($exchangeHouseId)
            ->where('valid_from', '>=', Carbon::now()->subWeek()->startOfDay())
            ->where('valid_from', '<', Carbon::now()->subWeek()->endOfDay())
            ->orderBy('valid_from', 'desc')
            ->first();

        // Tasa de hace un mes
        $lastMonth = CurrencyPairRateHistory::forPair($currencyPairId)
            ->forExchangeHouse($exchangeHouseId)
            ->where('valid_from', '>=', Carbon::now()->subMonth()->startOfDay())
            ->where('valid_from', '<', Carbon::now()->subMonth()->endOfDay())
            ->orderBy('valid_from', 'desc')
            ->first();

        // Calcular cambios porcentuales
        $calculateChange = function($old, $new) {
            if (!$old || $old->rate == 0) return null;
            return (($new->rate - $old->rate) / $old->rate) * 100;
        };

        return response()->json([
            'current' => [
                'rate' => $current->rate,
                'effective_rate' => $current->effective_rate,
                'valid_from' => $current->valid_from,
            ],
            'comparisons' => [
                'yesterday' => [
                    'rate' => $yesterday?->rate,
                    'change_percent' => $calculateChange($yesterday, $current),
                ],
                'last_week' => [
                    'rate' => $lastWeek?->rate,
                    'change_percent' => $calculateChange($lastWeek, $current),
                ],
                'last_month' => [
                    'rate' => $lastMonth?->rate,
                    'change_percent' => $calculateChange($lastMonth, $current),
                ],
            ],
        ]);
    }
}
