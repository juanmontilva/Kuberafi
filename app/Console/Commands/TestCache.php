<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SystemSetting;

class TestCache extends Command
{
    protected $signature = 'cache:test-settings';
    protected $description = 'Probar el cache de configuraciones';

    public function handle()
    {
        $this->info('=== PRUEBA DE CACHE ===');
        
        // 1. Valor actual
        $current = SystemSetting::getPlatformCommissionRate();
        $this->info("1. Valor actual desde getPlatformCommissionRate(): {$current}");
        
        // 2. Valor directo de DB
        $direct = SystemSetting::get('platform_commission_rate');
        $this->info("2. Valor directo desde DB: {$direct}");
        
        // 3. Cambiar valor directamente en DB
        $newValue = '0.99';
        $this->info("3. Cambiando valor en DB a: {$newValue}");
        \DB::table('system_settings')
            ->where('key', 'platform_commission_rate')
            ->update(['value' => $newValue]);
        
        // 4. Verificar que cambió en DB
        $afterChange = SystemSetting::get('platform_commission_rate');
        $this->info("4. Valor en DB después del cambio: {$afterChange}");
        
        // 5. Verificar cache (debería seguir siendo el valor anterior)
        $cached = SystemSetting::getPlatformCommissionRate();
        $this->info("5. Valor desde cache (debería ser diferente): {$cached}");
        
        // 6. Limpiar cache
        $this->info("6. Limpiando cache...");
        SystemSetting::clearCache();
        
        // 7. Verificar después de limpiar cache
        $afterClear = SystemSetting::getPlatformCommissionRate();
        $this->info("7. Valor después de limpiar cache: {$afterClear}");
        
        // 8. Restaurar valor original
        SystemSetting::set('platform_commission_rate', '0.14', 'number');
        SystemSetting::clearCache();
        $restored = SystemSetting::getPlatformCommissionRate();
        $this->info("8. Valor restaurado: {$restored}");
        
        $this->info('=== FIN DE PRUEBA ===');
    }
}