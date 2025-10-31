<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CurrencyController extends Controller
{
    public function index()
    {
        $currencies = Currency::orderBy('is_active', 'desc')
            ->orderBy('code')
            ->get();

        return Inertia::render('Admin/Currencies', [
            'currencies' => $currencies,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:10|uppercase|unique:currencies,code',
            'name' => 'required|string|max:255',
            'symbol' => 'required|string|max:10',
            'decimals' => 'required|integer|min:0|max:18',
        ]);

        $validated['is_active'] = true;

        Currency::create($validated);

        return redirect()->back()->with('success', "Divisa {$validated['code']} creada exitosamente");
    }

    public function update(Request $request, Currency $currency)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'symbol' => 'required|string|max:10',
            'decimals' => 'required|integer|min:0|max:18',
            'is_active' => 'boolean',
        ]);

        $currency->update($validated);

        return redirect()->back()->with('success', "Divisa {$currency->code} actualizada");
    }

    public function destroy(Currency $currency)
    {
        // Verificar si está siendo usada en pares
        $pairsCount = \App\Models\CurrencyPair::where('base_currency', $currency->code)
            ->orWhere('quote_currency', $currency->code)
            ->count();

        if ($pairsCount > 0) {
            return redirect()->back()->withErrors([
                'error' => "No se puede eliminar {$currency->code} porque está siendo usada en {$pairsCount} par(es) de divisas. Desactívala en su lugar."
            ]);
        }

        $code = $currency->code;
        $currency->delete();

        return redirect()->back()->with('success', "Divisa {$code} eliminada exitosamente");
    }

    public function toggleActive(Currency $currency)
    {
        $currency->update(['is_active' => !$currency->is_active]);
        
        $status = $currency->is_active ? 'activada' : 'desactivada';
        return redirect()->back()->with('success', "Divisa {$currency->code} {$status}");
    }
}
