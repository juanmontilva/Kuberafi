<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SystemSetting;

class TestWebInterface extends Command
{
    protected $signature = 'settings:test-web';
    protected $description = 'Probar la interfaz web de configuraciones';

    public function handle()
    {
        $this->info('=== PRUEBA DE INTERFAZ WEB ===');
        
        // Simular una actualización como la haría la interfaz web
        $settingsArray = [
            [
                'key' => 'platform_commission_rate',
                'value' => '0.18',
                'type' => 'number'
            ],
            [
                'key' => 'platform_name',
                'value' => 'Kuberafi',
                'type' => 'string'
            ],
            [
                'key' => 'max_daily_orders',
                'value' => '1000',
                'type' => 'number'
            ],
            [
                'key' => 'maintenance_mode',
                'value' => 'false',
                'type' => 'boolean'
            ]
        ];

        $this->info('1. Simulando actualización desde interfaz web...');
        
        $updatedCount = 0;
        foreach ($settingsArray as $settingData) {
            $this->info("   Procesando: {$settingData['key']} = {$settingData['value']}");
            
            $setting = SystemSetting::set(
                $settingData['key'],
                $settingData['value'],
                $settingData['type']
            );
            
            if ($setting) {
                $updatedCount++;
                $savedValue = SystemSetting::get($settingData['key']);
                $this->info("   ✓ Guardado: {$settingData['key']} = {$savedValue}");
            }
        }

        // Limpiar cache
        SystemSetting::clearCache();

        // Verificar resultado final
        $finalRate = SystemSetting::getPlatformCommissionRate();
        $this->info("2. Comisión final: {$finalRate}");

        if ($finalRate == 0.18) {
            $this->info('✅ Interfaz web funcionando correctamente');
        } else {
            $this->error('❌ Problema con la interfaz web');
        }

        $this->info('=== FIN DE PRUEBA ===');
    }
}