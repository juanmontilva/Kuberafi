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

        return redirect()->back()->with('success', "Par {$currencyPair->symbol} agregado exitosamente");
    }

    public function update(Request $request, CurrencyPair $currencyPair)
    {
        $validated = $request->validate([
            'margin_percent' => 'required|numeric|min:0|max:100',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
        ]);

        $exchangeHouse = request()->user()->exchangeHouse;

        $exchangeHouse->currencyPairs()->updateExistingPivot($currencyPair->id, $validated);

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
