<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SystemSetting;

class SyncSystemSettings extends Command
{
    protected $signature = 'settings:sync';
    protected $description = 'Sincronizar configuraciones del sistema';

    public function handle()
    {
        $this->info('Sincronizando configuraciones del sistema...');

        // Limpiar cache
        cache()->forget('platform_commission_rate');
        cache()->forget('maintenance_mode');

        // Verificar configuraciones críticas
        $platformRate = SystemSetting::getPlatformCommissionRate();
        $this->info("Tasa de comisión de la plataforma: {$platformRate}%");

        $maintenanceMode = SystemSetting::isMaintenanceMode();
        $this->info("Modo mantenimiento: " . ($maintenanceMode ? 'Activado' : 'Desactivado'));

        // Mostrar todas las configuraciones
        $settings = SystemSetting::all();
        $this->table(
            ['Clave', 'Valor', 'Tipo', 'Descripción'],
            $settings->map(function ($setting) {
                return [
                    $setting->key,
                    $setting->value,
                    $setting->type,
                    $setting->description
                ];
            })
        );

        $this->info('Sincronización completada.');
    }
}