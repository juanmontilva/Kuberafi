<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SystemSetting;

class TestSettingUpdate extends Command
{
    protected $signature = 'settings:test-update {value=0.16}';
    protected $description = 'Probar actualización de la comisión de la plataforma';

    public function handle()
    {
        $newValue = $this->argument('value');
        
        $this->info("=== PRUEBA DE ACTUALIZACIÓN ===");
        
        // Valor actual
        $currentValue = SystemSetting::get('platform_commission_rate');
        $this->info("Valor actual: {$currentValue}");
        
        // Actualizar
        $this->info("Actualizando a: {$newValue}");
        SystemSetting::set('platform_commission_rate', $newValue, 'number');
        
        // Limpiar cache
        cache()->forget('platform_commission_rate');
        cache()->flush();
        
        // Verificar
        $newValueFromDB = SystemSetting::get('platform_commission_rate');
        $this->info("Nuevo valor desde DB: {$newValueFromDB}");
        
        $platformRate = SystemSetting::getPlatformCommissionRate();
        $this->info("Valor desde getPlatformCommissionRate(): {$platformRate}");
        
        if ((float)$newValueFromDB === (float)$newValue) {
            $this->info("✅ Actualización exitosa!");
        } else {
            $this->error("❌ Error en la actualización");
        }
    }
}