<?php

namespace Database\Seeders;

use App\Models\PlatformPaymentMethod;
use Illuminate\Database\Seeder;

class PlatformPaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $methods = [
            [
                'name' => 'Cuenta Principal USD',
                'type' => 'bank_transfer',
                'currency' => 'USD',
                'account_holder' => 'Kuberafi LLC',
                'account_number' => '1234567890',
                'bank_name' => 'Bank of America',
                'identification' => 'EIN: 12-3456789',
                'routing_number' => '026009593',
                'instructions' => "Por favor realiza la transferencia a esta cuenta y envía el comprobante.\n\nImportante:\n- Incluye tu nombre de casa de cambio en la referencia\n- Guarda el comprobante de pago\n- El pago puede tardar 1-3 días hábiles en procesarse",
                'is_active' => true,
                'is_primary' => true,
                'display_order' => 1,
            ],
            [
                'name' => 'Zelle Empresarial',
                'type' => 'zelle',
                'currency' => 'USD',
                'account_holder' => 'Kuberafi LLC',
                'identification' => 'payments@kuberafi.com',
                'instructions' => "Envía el pago por Zelle a: payments@kuberafi.com\n\nEn el mensaje incluye:\n- Nombre de tu casa de cambio\n- Período de pago\n\nEl pago es instantáneo.",
                'is_active' => true,
                'is_primary' => false,
                'display_order' => 2,
            ],
            [
                'name' => 'Pago Móvil Venezuela',
                'type' => 'mobile_payment',
                'currency' => 'VES',
                'account_holder' => 'Kuberafi Venezuela',
                'bank_name' => 'Banco Mercantil',
                'identification' => '0414-1234567',
                'instructions' => "Realiza el pago móvil a:\n- Banco: Mercantil\n- Teléfono: 0414-1234567\n- CI: V-12345678\n\nEnvía captura del comprobante.",
                'is_active' => true,
                'is_primary' => false,
                'display_order' => 3,
            ],
            [
                'name' => 'USDT (TRC20)',
                'type' => 'crypto',
                'currency' => 'USDT',
                'account_holder' => 'Kuberafi Wallet',
                'account_number' => 'TXxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'instructions' => "Envía USDT a la siguiente dirección (TRC20):\nTXxxxxxxxxxxxxxxxxxxxxxxxxxxx\n\nIMPORTANTE:\n- Solo red TRC20 (Tron)\n- Envía el hash de la transacción como comprobante\n- Confirmación en 1-5 minutos",
                'is_active' => true,
                'is_primary' => false,
                'display_order' => 4,
            ],
        ];

        foreach ($methods as $method) {
            PlatformPaymentMethod::create($method);
        }
    }
}
