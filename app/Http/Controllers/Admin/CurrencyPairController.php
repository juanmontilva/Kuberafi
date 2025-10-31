<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CurrencyPair;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CurrencyPairController extends Controller
{
    public function index()
    {
        $currencyPairs = CurrencyPair::withCount('exchangeHouses')
            ->orderBy('is_active', 'desc')
            ->orderBy('symbol')
            ->get();

        $currencies = \App\Models\Currency::active()
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'symbol']);

        // Agregar nombres de divisas a cada par
        $currencyPairs->each(function ($pair) use ($currencies) {
            $baseCurrency = $currencies->firstWhere('code', $pair->base_currency);
            $quoteCurrency = $currencies->firstWhere('code', $pair->quote_currency);
            
            $pair->base_currency_name = $baseCurrency?->name ?? $pair->base_currency;
            $pair->quote_currency_name = $quoteCurrency?->name ?? $pair->quote_currency;
        });

        return Inertia::render('Admin/CurrencyPairs', [
            'currencyPairs' => $currencyPairs,
            'currencies' => $currencies,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'base_currency' => 'required|string|max:10',
            'quote_currency' => 'required|string|max:10',
            'current_rate' => 'required|numeric|min:0',
            'calculation_type' => 'required|in:multiply,divide',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
        ]);
        
        // Convertir a mayúsculas
        $validated['base_currency'] = strtoupper($validated['base_currency']);
        $validated['quote_currency'] = strtoupper($validated['quote_currency']);

        // Crear el símbolo automáticamente
        $validated['symbol'] = "{$validated['base_currency']}/{$validated['quote_currency']}";
        $validated['is_active'] = true;

        // Verificar si ya existe este par
        $existingPair = CurrencyPair::where('symbol', $validated['symbol'])->first();
        if ($existingPair) {
            return redirect()->back()->withErrors([
                'base_currency' => "El par {$validated['symbol']} ya existe en el sistema"
            ]);
        }

        try {
            $pair = CurrencyPair::create($validated);
            
            \Illuminate\Support\Facades\Log::info('Par de divisas creado', ['pair' => $pair->toArray()]);

            return redirect()->back()->with('success', "Par {$pair->symbol} creado exitosamente");
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error al crear par de divisas', [
                'error' => $e->getMessage(),
                'data' => $validated
            ]);
            return redirect()->back()->withErrors(['error' => 'Error al crear el par: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, CurrencyPair $currencyPair)
    {
        $validated = $request->validate([
            'current_rate' => 'required|numeric|min:0',
            'calculation_type' => 'required|in:multiply,divide',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $currencyPair->update($validated);

        return redirect()->back()->with('success', "Par {$currencyPair->symbol} actualizado");
    }

    public function destroy(CurrencyPair $currencyPair)
    {
        // Verificar si tiene órdenes asociadas - OPTIMIZADO
        if ($currencyPair->orders()->exists()) {
            return redirect()->back()->withErrors([
                'error' => 'No se puede eliminar este par porque tiene órdenes asociadas. Desactívalo en su lugar.'
            ]);
        }

        $symbol = $currencyPair->symbol;
        $currencyPair->delete();

        return redirect()->back()->with('success', "Par {$symbol} eliminado exitosamente");
    }

    public function toggleActive(CurrencyPair $currencyPair)
    {
        $currencyPair->update(['is_active' => !$currencyPair->is_active]);
        
        $status = $currencyPair->is_active ? 'activado' : 'desactivado';
        return redirect()->back()->with('success', "Par {$currencyPair->symbol} {$status}");
    }
}
