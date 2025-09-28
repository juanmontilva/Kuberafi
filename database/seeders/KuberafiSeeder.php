<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\ExchangeHouse;
use App\Models\CurrencyPair;
use App\Models\Order;
use App\Models\Commission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class KuberafiSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Crear Super Admin
        $superAdmin = User::create([
            'name' => 'Super Administrador',
            'email' => 'admin@kuberafi.com',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        // Crear Casas de Cambio
        $exchangeHouse1 = ExchangeHouse::create([
            'name' => 'CambioExpress',
            'business_name' => 'CambioExpress C.A.',
            'tax_id' => 'J-12345678-9',
            'email' => 'info@cambioexpress.com',
            'phone' => '+58-212-1234567',
            'address' => 'Av. Francisco de Miranda, Caracas',
            'commission_rate' => 2.5000, // 2.5%
            'is_active' => true,
            'allowed_currencies' => ['USD', 'EUR', 'VES'],
            'daily_limit' => 50000.00,
        ]);

        $exchangeHouse2 = ExchangeHouse::create([
            'name' => 'DivisasVIP',
            'business_name' => 'Divisas VIP S.R.L.',
            'tax_id' => 'J-98765432-1',
            'email' => 'contacto@divisasvip.com',
            'phone' => '+58-212-9876543',
            'address' => 'Centro Comercial Sambil, Caracas',
            'commission_rate' => 3.0000, // 3%
            'is_active' => true,
            'allowed_currencies' => ['USD', 'EUR', 'COP', 'VES'],
            'daily_limit' => 75000.00,
        ]);

        // Crear usuarios para las casas de cambio
        $exchangeUser1 = User::create([
            'name' => 'María González',
            'email' => 'maria@cambioexpress.com',
            'password' => Hash::make('password'),
            'role' => 'exchange_house',
            'exchange_house_id' => $exchangeHouse1->id,
            'is_active' => true,
        ]);

        $exchangeUser2 = User::create([
            'name' => 'Carlos Rodríguez',
            'email' => 'carlos@divisasvip.com',
            'password' => Hash::make('password'),
            'role' => 'exchange_house',
            'exchange_house_id' => $exchangeHouse2->id,
            'is_active' => true,
        ]);

        // Crear pares de divisas
        $usdVes = CurrencyPair::create([
            'base_currency' => 'USD',
            'quote_currency' => 'VES',
            'symbol' => 'USD/VES',
            'current_rate' => 36.50, // 1 USD = 36.50 VES
            'min_amount' => 10.00,
            'max_amount' => 10000.00,
            'is_active' => true,
        ]);

        $eurVes = CurrencyPair::create([
            'base_currency' => 'EUR',
            'quote_currency' => 'VES',
            'symbol' => 'EUR/VES',
            'current_rate' => 39.75, // 1 EUR = 39.75 VES
            'min_amount' => 10.00,
            'max_amount' => 5000.00,
            'is_active' => true,
        ]);

        $copVes = CurrencyPair::create([
            'base_currency' => 'COP',
            'quote_currency' => 'VES',
            'symbol' => 'COP/VES',
            'current_rate' => 0.0092, // 1 COP = 0.0092 VES
            'min_amount' => 100000.00,
            'max_amount' => 50000000.00,
            'is_active' => true,
        ]);

        // Crear órdenes de ejemplo
        $order1 = Order::create([
            'exchange_house_id' => $exchangeHouse1->id,
            'currency_pair_id' => $usdVes->id,
            'user_id' => $exchangeUser1->id,
            'base_amount' => 1000.00, // 1000 USD
            'quote_amount' => 38325.00, // Con margen del 5%
            'market_rate' => 36.50,
            'applied_rate' => 38.325, // Tasa con margen
            'expected_margin_percent' => 5.00,
            'actual_margin_percent' => 3.00, // Margen real obtenido
            'status' => 'completed',
            'completed_at' => now(),
            'notes' => 'Orden completada exitosamente',
        ]);

        $order2 = Order::create([
            'exchange_house_id' => $exchangeHouse2->id,
            'currency_pair_id' => $eurVes->id,
            'user_id' => $exchangeUser2->id,
            'base_amount' => 500.00, // 500 EUR
            'quote_amount' => 20671.25, // Con margen del 4%
            'market_rate' => 39.75,
            'applied_rate' => 41.3425, // Tasa con margen
            'expected_margin_percent' => 4.00,
            'actual_margin_percent' => 4.00, // Margen exacto
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Crear comisiones para las órdenes
        Commission::createFromOrder($order1);
        Commission::createFromOrder($order2);

        $this->command->info('Datos de Kuberafi creados exitosamente!');
        $this->command->info('Super Admin: admin@kuberafi.com / password');
        $this->command->info('Casa de Cambio 1: maria@cambioexpress.com / password');
        $this->command->info('Casa de Cambio 2: carlos@divisasvip.com / password');
    }
}
