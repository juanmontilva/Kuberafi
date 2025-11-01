<?php

namespace App\Http\Controllers\ExchangeHouse;

use App\Http\Controllers\Controller;
use App\Models\CurrencyPair;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CurrencyPairConfigController extends Controller
{
    /**
     * Mostrar pares de divisas configurables
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isExchangeHouse() && !$user->isOperator()) {
            abort(403);
        }
        
        $exchangeHouse = $user->exchangeHouse;
        
        // Obtener pares configurados por la casa
        $configuredPairs = $exchangeHouse->currencyPairs()
            ->get()
            ->map(function ($pair) {
                return [
                    'id' => $pair->id,
                    'symbol' => $pair->symbol,
                    'base_currency' => $pair->base_currency,
                    'quote_currency' => $pair->quote_currency,
                    'current_rate' => $pair->current_rate,
                    'calculation_type' => $pair->calculation_type,
                    'is_active' => $pair->is_active,
                    'pivot' => [
                        'commission_model' => $pair->pivot->commission_model ?? 'percentage',
                        'commission_percent' => $pair->pivot->commission_percent,
                        'buy_rate' => $pair->pivot->buy_rate,
                        'sell_rate' => $pair->pivot->sell_rate,
                        'margin_percent' => $pair->pivot->margin_percent,
                        'min_amount' => $pair->pivot->min_amount,
                        'max_amount' => $pair->pivot->max_amount,
                        'is_active' => $pair->pivot->is_active,
                    ],
                ];
            });
        
        // Obtener pares disponibles que no están configurados
        $availablePairs = CurrencyPair::where('is_active', true)
            ->whereNotIn('id', $configuredPairs->pluck('id'))
            ->get()
            ->map(function ($pair) {
                return [
                    'id' => $pair->id,
                    'symbol' => $pair->symbol,
                    'base_currency' => $pair->base_currency,
                    'quote_currency' => $pair->quote_currency,
                    'current_rate' => $pair->current_rate,
                    'calculation_type' => $pair->calculation_type,
                ];
            });
        
        return Inertia::render('ExchangeHouse/CurrencyPairConfig', [
            'configuredPairs' => $configuredPairs,
            'availablePairs' => $availablePairs,
        ]);
    }
    
    /**
     * Actualizar configuración de un par
     */
    public function update(Request $request, CurrencyPair $currencyPair)
    {
        $user = $request->user();
        
        if (!$user->isExchangeHouse() && !$user->isOperator()) {
            abort(403);
        }
        
        $validated = $request->validate([
            'commission_model' => 'required|in:percentage,spread,mixed',
            'commission_percent' => 'nullable|numeric|min:0|max:100',
            'buy_rate' => 'nullable|numeric|min:0',
            'sell_rate' => 'nullable|numeric|min:0',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);
        
        // Validaciones según el modelo
        if ($validated['commission_model'] === 'percentage') {
            $request->validate([
                'commission_percent' => 'required|numeric|min:0|max:100',
            ]);
        }
        
        if ($validated['commission_model'] === 'spread' || $validated['commission_model'] === 'mixed') {
            $request->validate([
                'buy_rate' => 'required|numeric|min:0',
                'commission_percent' => 'required|numeric|min:0|max:100',
            ]);
        }
        
        if ($validated['commission_model'] === 'mixed') {
            $request->validate([
                'commission_percent' => 'required|numeric|min:0|max:100',
            ]);
        }
        
        $exchangeHouse = $user->exchangeHouse;
        
        // Calcular sell_rate si es modelo spread o mixed
        $sellRate = null;
        if (($validated['commission_model'] === 'spread' || $validated['commission_model'] === 'mixed') 
            && $validated['buy_rate'] && $validated['commission_percent']) {
            $sellRate = $validated['buy_rate'] * (1 + $validated['commission_percent'] / 100);
        }
        
        // Verificar si el par ya está asociado
        $exists = $exchangeHouse->currencyPairs()->where('currency_pair_id', $currencyPair->id)->exists();
        
        if ($exists) {
            // Actualizar configuración existente
            $exchangeHouse->currencyPairs()->updateExistingPivot($currencyPair->id, [
                'commission_model' => $validated['commission_model'],
                'commission_percent' => $validated['commission_percent'],
                'buy_rate' => $validated['buy_rate'],
                'sell_rate' => $sellRate,
                'min_amount' => $validated['min_amount'],
                'max_amount' => $validated['max_amount'],
                'is_active' => $validated['is_active'] ?? true,
            ]);
        } else {
            // Crear nueva asociación
            $exchangeHouse->currencyPairs()->attach($currencyPair->id, [
                'commission_model' => $validated['commission_model'],
                'commission_percent' => $validated['commission_percent'],
                'buy_rate' => $validated['buy_rate'],
                'sell_rate' => $sellRate,
                'min_amount' => $validated['min_amount'],
                'max_amount' => $validated['max_amount'],
                'is_active' => $validated['is_active'] ?? true,
            ]);
        }
        
        return back()->with('success', 'Configuración del par actualizada exitosamente');
    }
    
    /**
     * Activar/Desactivar un par
     */
    public function toggle(Request $request, CurrencyPair $currencyPair)
    {
        $user = $request->user();
        
        if (!$user->isExchangeHouse() && !$user->isOperator()) {
            abort(403);
        }
        
        $exchangeHouse = $user->exchangeHouse;
        
        $pivot = $exchangeHouse->currencyPairs()
            ->where('currency_pair_id', $currencyPair->id)
            ->first();
        
        if (!$pivot) {
            return back()->withErrors(['error' => 'Este par no está configurado']);
        }
        
        $exchangeHouse->currencyPairs()->updateExistingPivot($currencyPair->id, [
            'is_active' => !$pivot->pivot->is_active,
        ]);
        
        $status = !$pivot->pivot->is_active ? 'activado' : 'desactivado';
        
        return back()->with('success', "Par {$status} exitosamente");
    }
}
