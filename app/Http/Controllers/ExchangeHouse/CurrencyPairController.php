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

        // Pares que la casa tiene configurados
        $activePairs = $exchangeHouse->currencyPairs()
            ->withPivot(['margin_percent', 'min_amount', 'max_amount', 'is_active'])
            ->get();

        // Pares disponibles que no ha configurado
        $availablePairs = CurrencyPair::where('is_active', true)
            ->whereNotIn('id', $activePairs->pluck('id'))
            ->get();

        // Obtener comisión de plataforma
        $platformCommissionRate = SystemSetting::getPlatformCommissionRate();

        return Inertia::render('ExchangeHouse/CurrencyPairs', [
            'activePairs' => $activePairs,
            'availablePairs' => $availablePairs,
            'exchangeHouse' => $exchangeHouse->load('commissions'),
            'platformCommissionRate' => $platformCommissionRate,
        ]);
    }

    public function attach(Request $request, CurrencyPair $currencyPair)
    {
        $validated = $request->validate([
            'margin_percent' => 'required|numeric|min:0|max:100',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
        ]);

        $exchangeHouse = request()->user()->exchangeHouse;
        $user = request()->user();

        // Verificar que el par no esté ya asignado
        if ($exchangeHouse->currencyPairs()->where('currency_pair_id', $currencyPair->id)->exists()) {
            return redirect()->back()->withErrors(['error' => 'Este par ya está configurado']);
        }

        $exchangeHouse->currencyPairs()->attach($currencyPair->id, [
            'margin_percent' => $validated['margin_percent'],
            'min_amount' => $validated['min_amount'] ?? $currencyPair->min_amount,
            'max_amount' => $validated['max_amount'] ?? $currencyPair->max_amount,
            'is_active' => true,
        ]);

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
            'margin_percent' => 'required|numeric|min:0|max:100',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
        ]);

        $exchangeHouse = request()->user()->exchangeHouse;
        $user = request()->user();

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

        // Actualizar configuración específica de la casa de cambio
        $exchangeHouse->currencyPairs()->updateExistingPivot($currencyPair->id, [
            'margin_percent' => $validated['margin_percent'],
            'min_amount' => $validated['min_amount'],
            'max_amount' => $validated['max_amount'],
        ]);

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
        $ordersCount = $exchangeHouse->orders()
            ->where('currency_pair_id', $currencyPair->id)
            ->count();

        if ($ordersCount > 0) {
            return redirect()->back()->withErrors([
                'error' => 'No puedes eliminar este par porque tienes órdenes asociadas. Desactívalo en su lugar.'
            ]);
        }

        $exchangeHouse->currencyPairs()->detach($currencyPair->id);

        return redirect()->back()->with('success', "Par {$currencyPair->symbol} eliminado");
    }
}
