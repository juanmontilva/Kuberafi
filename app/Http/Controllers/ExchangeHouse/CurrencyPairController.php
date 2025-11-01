<?php

namespace App\Http\Controllers\ExchangeHouse;

use App\Http\Controllers\Controller;
use App\Models\CurrencyPair;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CurrencyPairController extends Controller
{
    public function index()
    {
        $exchangeHouse = request()->user()->exchangeHouse;

        // Pares que la casa tiene configurados (excluyendo soft deleted)
        $activePairs = $exchangeHouse->currencyPairs()
            ->wherePivotNull('deleted_at')
            ->withPivot(['margin_percent', 'min_amount', 'max_amount', 'is_active'])
            ->get();

        // Pares disponibles que no ha configurado o que fueron eliminados (soft deleted)
        $configuredPairIds = \App\Models\ExchangeHouseCurrencyPair::where('exchange_house_id', $exchangeHouse->id)
            ->whereNull('deleted_at')
            ->pluck('currency_pair_id');

        $availablePairs = CurrencyPair::where('is_active', true)
            ->whereNotIn('id', $configuredPairIds)
            ->get();

        // Obtener comisión de plataforma (considerar promoción)
        $platformCommissionRate = $exchangeHouse->zero_commission_promo 
            ? 0 
            : SystemSetting::getPlatformCommissionRate();

        return Inertia::render('ExchangeHouse/CurrencyPairs', [
            'activePairs' => $activePairs,
            'availablePairs' => $availablePairs,
            'exchangeHouse' => $exchangeHouse,
            'platformCommissionRate' => $platformCommissionRate,
        ]);
    }

    public function attach(Request $request, CurrencyPair $currencyPair)
    {
        $validated = $request->validate([
            'margin_percent' => 'nullable|numeric|min:0|max:100',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
            'commission_model' => 'required|in:percentage,spread,mixed',
            'commission_percent' => 'nullable|numeric|min:0|max:100',
            'buy_rate' => 'nullable|numeric|min:0',
        ]);

        // Validaciones según el modelo
        if ($validated['commission_model'] === 'percentage') {
            $request->validate([
                'commission_percent' => 'required|numeric|min:0|max:100',
            ]);
        }

        if ($validated['commission_model'] === 'spread') {
            $request->validate([
                'buy_rate' => 'required|numeric|min:0',
                'margin_percent' => 'required|numeric|min:0|max:100',
            ]);
        }

        if ($validated['commission_model'] === 'mixed') {
            $request->validate([
                'buy_rate' => 'required|numeric|min:0',
                'margin_percent' => 'required|numeric|min:0|max:100',
                'commission_percent' => 'required|numeric|min:0|max:100',
            ]);
        }

        $exchangeHouse = request()->user()->exchangeHouse;
        $user = request()->user();

        // Verificar que el par no esté ya asignado
        if ($exchangeHouse->currencyPairs()->where('currency_pair_id', $currencyPair->id)->exists()) {
            return redirect()->back()->withErrors(['error' => 'Este par ya está configurado']);
        }

        // Validar que los límites de la casa no excedan los límites globales del super admin
        $minAmount = $validated['min_amount'] ?? $currencyPair->min_amount;
        $maxAmount = $validated['max_amount'] ?? $currencyPair->max_amount;

        if ($minAmount < $currencyPair->min_amount) {
            return redirect()->back()->withErrors([
                'min_amount' => "El monto mínimo no puede ser menor a {$currencyPair->min_amount} (límite establecido por la plataforma)"
            ]);
        }

        if ($currencyPair->max_amount && $maxAmount > $currencyPair->max_amount) {
            return redirect()->back()->withErrors([
                'max_amount' => "El monto máximo no puede ser mayor a {$currencyPair->max_amount} (límite establecido por la plataforma)"
            ]);
        }

        if ($minAmount > $maxAmount) {
            return redirect()->back()->withErrors([
                'min_amount' => "El monto mínimo no puede ser mayor al monto máximo"
            ]);
        }

        // La tasa de venta es la tasa base del par
        $sellRate = $currencyPair->current_rate;

        // Preparar datos según el modelo de comisión
        $pivotData = [
            'margin_percent' => $validated['margin_percent'],
            'min_amount' => $minAmount,
            'max_amount' => $maxAmount,
            'is_active' => true,
            'commission_model' => $validated['commission_model'],
            'sell_rate' => $sellRate,
        ];

        // Agregar campos específicos según el modelo
        if ($validated['commission_model'] === 'percentage') {
            $pivotData['commission_percent'] = $validated['commission_percent'];
            $pivotData['buy_rate'] = null;
        } elseif ($validated['commission_model'] === 'spread') {
            $pivotData['commission_percent'] = null;
            $pivotData['buy_rate'] = $validated['buy_rate'];
        } else { // mixed
            $pivotData['commission_percent'] = $validated['commission_percent'];
            $pivotData['buy_rate'] = $validated['buy_rate'];
        }

        $exchangeHouse->currencyPairs()->attach($currencyPair->id, $pivotData);

        // Guardar en el historial la tasa inicial
        $currencyPair->saveRateChange(
            exchangeHouseId: $exchangeHouse->id,
            newRate: $currencyPair->current_rate,
            marginPercent: $validated['margin_percent'],
            userId: $user->id,
            reason: 'initial',
            notes: 'Configuración inicial del par'
        );

        return redirect()->back()->with('success', "Par {$currencyPair->symbol} agregado exitosamente");
    }

    public function update(Request $request, CurrencyPair $currencyPair)
    {
        $validated = $request->validate([
            'current_rate' => 'required|numeric|min:0',
            'margin_percent' => 'nullable|numeric|min:0|max:100',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
            'commission_model' => 'required|in:percentage,spread,mixed',
            'commission_percent' => 'nullable|numeric|min:0|max:100',
            'buy_rate' => 'nullable|numeric|min:0',
        ]);

        // Validaciones según el modelo
        if ($validated['commission_model'] === 'percentage') {
            $request->validate([
                'commission_percent' => 'required|numeric|min:0|max:100',
            ]);
        }

        if ($validated['commission_model'] === 'spread') {
            $request->validate([
                'buy_rate' => 'required|numeric|min:0',
                'margin_percent' => 'required|numeric|min:0|max:100',
            ]);
        }

        if ($validated['commission_model'] === 'mixed') {
            $request->validate([
                'buy_rate' => 'required|numeric|min:0',
                'margin_percent' => 'required|numeric|min:0|max:100',
                'commission_percent' => 'required|numeric|min:0|max:100',
            ]);
        }

        $exchangeHouse = request()->user()->exchangeHouse;
        $user = request()->user();

        // Validar que los límites de la casa no excedan los límites globales del super admin
        if ($validated['min_amount'] && $validated['min_amount'] < $currencyPair->min_amount) {
            return redirect()->back()->withErrors([
                'min_amount' => "El monto mínimo no puede ser menor a {$currencyPair->min_amount} (límite establecido por la plataforma)"
            ]);
        }

        if ($validated['max_amount'] && $currencyPair->max_amount && $validated['max_amount'] > $currencyPair->max_amount) {
            return redirect()->back()->withErrors([
                'max_amount' => "El monto máximo no puede ser mayor a {$currencyPair->max_amount} (límite establecido por la plataforma)"
            ]);
        }

        if ($validated['min_amount'] && $validated['max_amount'] && $validated['min_amount'] > $validated['max_amount']) {
            return redirect()->back()->withErrors([
                'min_amount' => "El monto mínimo no puede ser mayor al monto máximo"
            ]);
        }

        // Obtener configuración actual antes de actualizar
        $currentPivot = $exchangeHouse->currencyPairs()
            ->where('currency_pair_id', $currencyPair->id)
            ->first();

        // Variables para determinar qué cambió
        $rateChanged = $currencyPair->current_rate != $validated['current_rate'];
        $marginChanged = $currentPivot && $currentPivot->pivot->margin_percent != $validated['margin_percent'];

        // Si cambió la tasa o el margen, guardar en el historial
        if ($rateChanged || $marginChanged) {
            $notes = [];
            if ($rateChanged) {
                $notes[] = sprintf(
                    'Tasa base actualizada: %s → %s',
                    number_format((float) $currencyPair->current_rate, 4),
                    number_format((float) $validated['current_rate'], 4)
                );
            }
            if ($marginChanged) {
                $notes[] = sprintf(
                    'Margen actualizado: %s%% → %s%%',
                    $currentPivot->pivot->margin_percent,
                    $validated['margin_percent']
                );
            }

            $currencyPair->saveRateChange(
                exchangeHouseId: $exchangeHouse->id,
                newRate: $validated['current_rate'],
                marginPercent: $validated['margin_percent'],
                userId: $user->id,
                reason: 'manual',
                notes: implode('. ', $notes)
            );
        }

        // Actualizar la tasa base del par (global)
        $currencyPair->update([
            'current_rate' => $validated['current_rate'],
        ]);

        // Calcular sell_rate (es la tasa base del par)
        $sellRate = $validated['current_rate'];

        // Preparar datos según el modelo de comisión
        $pivotData = [
            'margin_percent' => $validated['margin_percent'],
            'min_amount' => $validated['min_amount'],
            'max_amount' => $validated['max_amount'],
            'commission_model' => $validated['commission_model'],
            'sell_rate' => $sellRate,
        ];

        // Agregar campos específicos según el modelo
        if ($validated['commission_model'] === 'percentage') {
            $pivotData['commission_percent'] = $validated['commission_percent'];
            $pivotData['buy_rate'] = null;
        } elseif ($validated['commission_model'] === 'spread') {
            $pivotData['commission_percent'] = null;
            $pivotData['buy_rate'] = $validated['buy_rate'];
        } else { // mixed
            $pivotData['commission_percent'] = $validated['commission_percent'];
            $pivotData['buy_rate'] = $validated['buy_rate'];
        }

        // Actualizar configuración específica de la casa de cambio
        $exchangeHouse->currencyPairs()->updateExistingPivot($currencyPair->id, $pivotData);

        return redirect()->back()->with('success', "Configuración actualizada para {$currencyPair->symbol}");
    }

    public function toggleActive(CurrencyPair $currencyPair)
    {
        $exchangeHouse = request()->user()->exchangeHouse;
        
        $pivot = $exchangeHouse->currencyPairs()->where('currency_pair_id', $currencyPair->id)->first();
        
        if (!$pivot) {
            return redirect()->back()->withErrors(['error' => 'Par no encontrado']);
        }

        $newStatus = !$pivot->pivot->is_active;
        $exchangeHouse->currencyPairs()->updateExistingPivot($currencyPair->id, [
            'is_active' => $newStatus
        ]);

        $status = $newStatus ? 'activado' : 'desactivado';
        return redirect()->back()->with('success', "Par {$currencyPair->symbol} {$status}");
    }

    public function detach(CurrencyPair $currencyPair)
    {
        $exchangeHouse = request()->user()->exchangeHouse;

        // Verificar si hay órdenes con este par
        if ($exchangeHouse->orders()->where('currency_pair_id', $currencyPair->id)->exists()) {
            return redirect()->back()->withErrors([
                'error' => 'No puedes eliminar este par porque tienes órdenes asociadas. Los datos se mantendrán para el historial.'
            ]);
        }

        // Usar soft delete en lugar de detach
        \App\Models\ExchangeHouseCurrencyPair::where('exchange_house_id', $exchangeHouse->id)
            ->where('currency_pair_id', $currencyPair->id)
            ->delete();

        return redirect()->back()->with('success', "Par {$currencyPair->symbol} eliminado. Los datos históricos se mantienen.");
    }
}
