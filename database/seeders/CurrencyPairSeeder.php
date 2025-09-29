<?php

namespace Database\Seeders;

use App\Models\CurrencyPair;
use App\Models\ExchangeHouse;
use Illuminate\Database\Seeder;

class CurrencyPairSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Crear pares adicionales de divisas
        $pairs = [
            [
                'base_currency' => 'BTC',
                'quote_currency' => 'USD',
                'symbol' => 'BTC/USD',
                'current_rate' => 43250.00,
                'min_amount' => 0.001,
                'max_amount' => 10.00,
                'is_active' => true,
            ],
            [
                'base_currency' => 'ETH',
                'quote_currency' => 'USD',
                'symbol' => 'ETH/USD',
                'current_rate' => 2280.50,
                'min_amount' => 0.01,
                'max_amount' => 100.00,
                'is_active' => true,
            ],
            [
                'base_currency' => 'BRL',
                'quote_currency' => 'USD',
                'symbol' => 'BRL/USD',
                'current_rate' => 0.20,
                'min_amount' => 100.00,
                'max_amount' => 50000.00,
                'is_active' => true,
            ],
            [
                'base_currency' => 'ARS',
                'quote_currency' => 'USD',
                'symbol' => 'ARS/USD',
                'current_rate' => 0.0012,
                'min_amount' => 10000.00,
                'max_amount' => 10000000.00,
                'is_active' => false, // Inactivo para demostrar funcionalidad
            ],
        ];

        foreach ($pairs as $pairData) {
            CurrencyPair::firstOrCreate(
                ['symbol' => $pairData['symbol']],
                $pairData
            );
        }

        // Configurar pares para casas de cambio existentes
        $exchangeHouses = ExchangeHouse::all();
        
        if ($exchangeHouses->count() > 0) {
            // Primera casa de cambio - configurar USD/VES y EUR/VES
            $firstHouse = $exchangeHouses->first();
            $usdVes = CurrencyPair::where('symbol', 'USD/VES')->first();
            $eurVes = CurrencyPair::where('symbol', 'EUR/VES')->first();
            
            if ($usdVes && !$firstHouse->currencyPairs()->where('currency_pair_id', $usdVes->id)->exists()) {
                $firstHouse->currencyPairs()->attach($usdVes->id, [
                    'margin_percent' => 2.50, // 2.5% de margen
                    'min_amount' => 10.00,
                    'max_amount' => 5000.00,
                    'is_active' => true,
                ]);
            }
            
            if ($eurVes && !$firstHouse->currencyPairs()->where('currency_pair_id', $eurVes->id)->exists()) {
                $firstHouse->currencyPairs()->attach($eurVes->id, [
                    'margin_percent' => 3.00, // 3% de margen
                    'min_amount' => 10.00,
                    'max_amount' => 3000.00,
                    'is_active' => true,
                ]);
            }

            // Segunda casa de cambio si existe
            if ($exchangeHouses->count() > 1) {
                $secondHouse = $exchangeHouses->skip(1)->first();
                $btc = CurrencyPair::where('symbol', 'BTC/USD')->first();
                
                if ($usdVes && !$secondHouse->currencyPairs()->where('currency_pair_id', $usdVes->id)->exists()) {
                    $secondHouse->currencyPairs()->attach($usdVes->id, [
                        'margin_percent' => 1.80, // 1.8% de margen
                        'min_amount' => 20.00,
                        'max_amount' => 10000.00,
                        'is_active' => true,
                    ]);
                }
                
                if ($btc && !$secondHouse->currencyPairs()->where('currency_pair_id', $btc->id)->exists()) {
                    $secondHouse->currencyPairs()->attach($btc->id, [
                        'margin_percent' => 2.00, // 2% de margen
                        'min_amount' => 0.001,
                        'max_amount' => 5.00,
                        'is_active' => true,
                    ]);
                }
            }
        }

        $this->command->info('Pares de divisas y configuraciones creadas exitosamente!');
    }
}
