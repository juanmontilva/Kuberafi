<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SystemSettingsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $settings = SystemSetting::orderBy('key')->get()->groupBy(function ($setting) {
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

        Log::info('Actualizando configuraciones:', $validated['settings']);

        $updatedCount = 0;
        foreach ($validated['settings'] as $settingData) {
            Log::info("Procesando: {$settingData['key']} = {$settingData['value']} (tipo: {$settingData['type']})");

            $setting = SystemSetting::set(
                $settingData['key'],
                $settingData['value'],
                $settingData['type']
            );

            if ($setting) {
                $updatedCount++;

                // Verificar que se guardó correctamente
                $savedValue = SystemSetting::get($settingData['key']);
                Log::info("Configuración guardada: {$settingData['key']} = {$savedValue}");

                // Si es la comisión de la plataforma, verificar el método específico
                if ($settingData['key'] === 'platform_commission_rate') {
                    cache()->forget('platform_commission_rate');
                    $platformRate = SystemSetting::getPlatformCommissionRate();
                    Log::info("Platform commission rate después de actualizar: {$platformRate}");
                }
            }
        }

        // Limpiar todo el cache relacionado con configuraciones
        SystemSetting::clearCache();

        Log::info("Total configuraciones actualizadas: {$updatedCount}");

        return back()->with('success', "Se actualizaron {$updatedCount} configuraciones exitosamente");
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

        // Convertir el valor según el tipo
        $value = $validated['value'];
        if ($setting->type === 'number') {
            $value = (string) floatval($value);
        } elseif ($setting->type === 'boolean') {
            // Aceptar correctamente 'false'/'true' como cadenas
            $bool = is_bool($value) ? $value : filter_var($value, FILTER_VALIDATE_BOOLEAN);
            $value = $bool ? 'true' : 'false';
        }

        $setting->update([
            'value' => $value,
        ]);

        // Si es la comisión de la plataforma, limpiar cache completamente
        if ($key === 'platform_commission_rate') {
            SystemSetting::clearCache();
        }

        return back()->with('success', 'Configuración actualizada exitosamente');
    }

    public function quickUpdate(Request $request)
    {
        $user = $request->user();

        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'key' => 'required|string',
            'value' => 'required',
            'type' => 'required|string|in:string,number,boolean,json',
        ]);

        Log::info("Quick update: {$validated['key']} = {$validated['value']} (tipo: {$validated['type']})");

        // Actualizar directamente
        $setting = SystemSetting::set(
            $validated['key'],
            $validated['value'],
            $validated['type']
        );

        // Verificar que se guardó
        $savedValue = SystemSetting::get($validated['key']);
        Log::info("Valor guardado: {$savedValue}");

        // Limpiar cache completamente
        SystemSetting::clearCache();

        // Verificar el valor después de limpiar cache
        if ($validated['key'] === 'platform_commission_rate') {
            $finalValue = SystemSetting::getPlatformCommissionRate();
            Log::info("Valor final después de limpiar cache: {$finalValue}");

            return response()->json([
                'success' => true,
                'message' => 'Comisión de plataforma actualizada exitosamente',
                'saved_value' => $finalValue,
                'key' => $validated['key']
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Configuración actualizada exitosamente',
            'saved_value' => $savedValue,
            'key' => $validated['key']
        ]);
    }
}
