<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SystemSetting;

class SystemSettingsSeeder extends Seeder
{
    public function run()
    {
        $settings = [
            [
                'key' => 'platform_commission_rate',
                'value' => '0.15',
                'type' => 'number',
                'description' => 'Tasa de comisión de la plataforma (%)',
            ],
            [
                'key' => 'platform_name',
                'value' => 'Kuberafi',
                'type' => 'string',
                'description' => 'Nombre de la plataforma',
            ],
            [
                'key' => 'max_daily_orders',
                'value' => '1000',
                'type' => 'number',
                'description' => 'Máximo de órdenes por día por casa de cambio',
            ],
            [
                'key' => 'maintenance_mode',
                'value' => 'false',
                'type' => 'boolean',
                'description' => 'Modo de mantenimiento',
            ],
            [
                'key' => 'platform_currency',
                'value' => 'USD',
                'type' => 'string',
                'description' => 'Moneda base de la plataforma',
            ],
            [
                'key' => 'min_order_amount',
                'value' => '10',
                'type' => 'number',
                'description' => 'Monto mínimo por orden',
            ],
            [
                'key' => 'max_order_amount',
                'value' => '50000',
                'type' => 'number',
                'description' => 'Monto máximo por orden',
            ],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}