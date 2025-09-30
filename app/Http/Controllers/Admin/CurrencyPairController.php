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

        return Inertia::render('Admin/CurrencyPairs', [
            'currencyPairs' => $currencyPairs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'base_currency' => 'required|string|size:3|uppercase',
            'quote_currency' => 'required|string|size:3|uppercase',
            'current_rate' => 'required|numeric|min:0',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
        ]);

        // Crear el símbolo automáticamente
        $validated['symbol'] = "{$validated['base_currency']}/{$validated['quote_currency']}";
        $validated['is_active'] = true;

        try {
            $pair = CurrencyPair::create($validated);

            return redirect()->back()->with('success', "Par {$pair->symbol} creado exitosamente");
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error al crear el par: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, CurrencyPair $currencyPair)
    {
        $validated = $request->validate([
            'current_rate' => 'required|numeric|min:0',
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
