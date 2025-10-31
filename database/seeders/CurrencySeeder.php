<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Currency;

class CurrencySeeder extends Seeder
{
    public function run(): void
    {
        $currencies = [
            // Fiat Currencies
            ['code' => 'USD', 'name' => 'Dólar Estadounidense', 'symbol' => '$', 'decimals' => 2],
            ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€', 'decimals' => 2],
            ['code' => 'VES', 'name' => 'Bolívar Venezolano', 'symbol' => 'Bs.', 'decimals' => 2],
            ['code' => 'COP', 'name' => 'Peso Colombiano', 'symbol' => '$', 'decimals' => 2],
            ['code' => 'ARS', 'name' => 'Peso Argentino', 'symbol' => '$', 'decimals' => 2],
            ['code' => 'BRL', 'name' => 'Real Brasileño', 'symbol' => 'R$', 'decimals' => 2],
            ['code' => 'CLP', 'name' => 'Peso Chileno', 'symbol' => '$', 'decimals' => 0],
            ['code' => 'PEN', 'name' => 'Sol Peruano', 'symbol' => 'S/', 'decimals' => 2],
            ['code' => 'MXN', 'name' => 'Peso Mexicano', 'symbol' => '$', 'decimals' => 2],
            
            // Digital Payment Methods
            ['code' => 'ZELLE', 'name' => 'Zelle', 'symbol' => 'Z$', 'decimals' => 2],
            ['code' => 'PAYPAL', 'name' => 'PayPal', 'symbol' => 'PP$', 'decimals' => 2],
            ['code' => 'WISE', 'name' => 'Wise', 'symbol' => 'W$', 'decimals' => 2],
            ['code' => 'SKRILL', 'name' => 'Skrill', 'symbol' => 'SK$', 'decimals' => 2],
            ['code' => 'NETELLER', 'name' => 'Neteller', 'symbol' => 'NT$', 'decimals' => 2],
            
            // Cryptocurrencies
            ['code' => 'BTC', 'name' => 'Bitcoin', 'symbol' => '₿', 'decimals' => 8],
            ['code' => 'ETH', 'name' => 'Ethereum', 'symbol' => 'Ξ', 'decimals' => 8],
            ['code' => 'USDT', 'name' => 'Tether', 'symbol' => '₮', 'decimals' => 6],
            ['code' => 'USDC', 'name' => 'USD Coin', 'symbol' => 'USDC', 'decimals' => 6],
            ['code' => 'BNB', 'name' => 'Binance Coin', 'symbol' => 'BNB', 'decimals' => 8],
        ];

        foreach ($currencies as $currency) {
            Currency::updateOrCreate(
                ['code' => $currency['code']],
                $currency
            );
        }
    }
}
