<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class SystemSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
    ];

    protected $casts = [
        'value' => 'string',
    ];

    /**
     * Obtener el valor de una configuración
     */
    public static function get($key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        
        if (!$setting) {
            return $default;
        }

        return self::castValue($setting->value, $setting->type);
    }

    /**
     * Establecer el valor de una configuración
     */
    public static function set($key, $value, $type = 'string', $description = null)
    {
        // Convertir el valor según el tipo antes de guardarlo
        if ($type === 'number') {
            $value = (string) floatval($value);
        } elseif ($type === 'boolean') {
            // IMPORTANTE: tratar correctamente cadenas 'false'/'true'
            $bool = is_bool($value) ? $value : filter_var($value, FILTER_VALIDATE_BOOLEAN);
            $value = $bool ? 'true' : 'false';
        } elseif ($type === 'json') {
            $value = is_string($value) ? $value : json_encode($value);
        }

        $existingSetting = self::where('key', $key)->first();
        
        if ($existingSetting) {
            // Actualizar solo los campos necesarios
            $existingSetting->update([
                'value' => $value,
                'type' => $type,
                'description' => $description ?? $existingSetting->description,
            ]);
            $setting = $existingSetting;
        } else {
            // Crear nuevo
            $setting = self::create([
                'key' => $key,
                'value' => $value,
                'type' => $type,
                'description' => $description,
            ]);
        }

        // Limpiar cache si es una configuración importante
        if (in_array($key, ['platform_commission_rate', 'maintenance_mode'])) {
            cache()->forget($key);
            cache()->forget('platform_commission_rate_v2');
            // También limpiar cualquier cache relacionado
            if ($key === 'platform_commission_rate') {
                cache()->forget('platform_commission_rate');
                cache()->forget('platform_commission_rate_v2');
            }
        }

        return $setting;
    }

    /**
     * Convertir el valor según su tipo
     */
    private static function castValue($value, $type)
    {
        switch ($type) {
            case 'boolean':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'number':
                return is_numeric($value) ? (float) $value : $value;
            case 'json':
                return json_decode($value, true);
            default:
                return $value;
        }
    }

    /**
     * Obtener la tasa de comisión de la plataforma
     */
    public static function getPlatformCommissionRate()
    {
        // Por ahora sin cache para evitar problemas
        $value = (float) self::get('platform_commission_rate', 0.15);
        Log::info("Obteniendo platform_commission_rate: {$value}");
        return $value;
    }

    /**
     * Limpiar todo el cache de configuraciones
     */
    public static function clearCache()
    {
        cache()->forget('platform_commission_rate');
        cache()->forget('platform_commission_rate_v2');
        cache()->forget('maintenance_mode');
        
        // Limpiar cache completo solo si es seguro
        try {
            cache()->flush();
        } catch (\Exception $e) {
            Log::warning('No se pudo limpiar cache completo: ' . $e->getMessage());
        }
        
        Log::info('Cache de configuraciones limpiado completamente');
    }

    /**
     * Verificar si el sistema está en modo mantenimiento
     */
    public static function isMaintenanceMode()
    {
        return cache()->remember('maintenance_mode', 3600, function () {
            return self::get('maintenance_mode', false);
        });
    }
}
