<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\DB;

class DiagnoseSettings extends Command
{
    protected $signature = 'settings:diagnose';
    protected $description = 'Diagnosticar problemas con las configuraciones del sistema';

    public function handle()
    {
        $this->info('=== DIAGNÓSTICO DE CONFIGURACIONES ===');
        
        // 1. Verificar si la tabla existe
        $this->info('1. Verificando tabla system_settings...');
        try {
            $count = DB::table('system_settings')->count();
            $this->info("✓ Tabla existe con {$count} registros");
        } catch (\Exception $e) {
            $this->error("✗ Error con la tabla: " . $e->getMessage());
            return;
        }

        // 2. Mostrar todos los registros
        $this->info('2. Registros actuales:');
        $settings = DB::table('system_settings')->get();
        foreach ($settings as $setting) {
            $this->line("   {$setting->key} = '{$setting->value}' (tipo: {$setting->type})");
        }

        // 3. Probar el método get
        $this->info('3. Probando SystemSetting::get()...');
        $rate = SystemSetting::get('platform_commission_rate', 'NO_ENCONTRADO');
        $this->info("   platform_commission_rate = {$rate}");

        // 4. Probar el método getPlatformCommissionRate
        $this->info('4. Probando SystemSetting::getPlatformCommissionRate()...');
        $platformRate = SystemSetting::getPlatformCommissionRate();
        $this->info("   getPlatformCommissionRate() = {$platformRate}");

        // 5. Verificar cache
        $this->info('5. Verificando cache...');
        $cached = cache()->get('platform_commission_rate', 'NO_CACHE');
        $this->info("   Cache value = {$cached}");

        // 6. Limpiar cache y probar de nuevo
        $this->info('6. Limpiando cache y probando de nuevo...');
        cache()->forget('platform_commission_rate');
        $platformRateAfterClear = SystemSetting::getPlatformCommissionRate();
        $this->info("   Después de limpiar cache = {$platformRateAfterClear}");

        // 7. Probar actualización directa
        $this->info('7. Probando actualización directa...');
        $testValue = '0.25';
        SystemSetting::set('platform_commission_rate', $testValue, 'number');
        
        $afterUpdate = SystemSetting::get('platform_commission_rate');
        $this->info("   Después de set({$testValue}) = {$afterUpdate}");

        // 8. Verificar en base de datos directamente
        $dbValue = DB::table('system_settings')
            ->where('key', 'platform_commission_rate')
            ->value('value');
        $this->info("   Valor directo en DB = {$dbValue}");

        // 9. Restaurar valor original
        SystemSetting::set('platform_commission_rate', '0.16', 'number');
        $this->info('9. Valor restaurado a 0.16');

        $this->info('=== FIN DEL DIAGNÓSTICO ===');
    }
}