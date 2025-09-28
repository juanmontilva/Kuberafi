<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemSettingsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $settings = SystemSetting::orderBy('key')->get()->groupBy(function($setting) {
            // Agrupar por categoría basada en el prefijo de la clave
            $parts = explode('_', $setting->key);
            return ucfirst($parts[0]);
        });

        return Inertia::render('Admin/SystemSettings', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required',
            'settings.*.type' => 'required|string|in:string,number,boolean,json',
        ]);

        foreach ($validated['settings'] as $settingData) {
            SystemSetting::set(
                $settingData['key'],
                $settingData['value'],
                $settingData['type']
            );
        }

        return back()->with('success', 'Configuraciones actualizadas exitosamente');
    }

    public function updateSingle(Request $request, $key)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $setting = SystemSetting::where('key', $key)->firstOrFail();

        $validated = $request->validate([
            'value' => 'required',
        ]);

        $setting->update([
            'value' => $validated['value'],
        ]);

        return back()->with('success', 'Configuración actualizada exitosamente');
    }
}
