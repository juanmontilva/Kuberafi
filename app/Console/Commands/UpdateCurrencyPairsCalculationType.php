<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CurrencyPair;

class UpdateCurrencyPairsCalculationType extends Command
{
    protected $signature = 'currency-pairs:update-calculation-type';
    protected $description = 'Actualizar el tipo de cálculo de los pares existentes';

    public function handle()
    {
        $this->info('Actualizando tipos de cálculo de pares de divisas...');
        
        $pairs = CurrencyPair::all();
        
        // Monedas que normalmente se dividen (monedas locales a dólares/crypto)
        $divideCurrencies = ['VES', 'ARS', 'COP', 'BRL', 'CLP', 'PEN', 'MXN'];
        
        $updated = 0;
        
        foreach ($pairs as $pair) {
            if (in_array($pair->base_currency, $divideCurrencies)) {
                $pair->update(['calculation_type' => 'divide']);
                $this->line("✓ {$pair->symbol} → DIVIDIR (Cliente da {$pair->base_currency}, recibe {$pair->quote_currency})");
                $updated++;
            } else {
                $pair->update(['calculation_type' => 'multiply']);
                $this->line("✓ {$pair->symbol} → MULTIPLICAR (Cliente da {$pair->base_currency}, recibe {$pair->quote_currency})");
                $updated++;
            }
        }
        
        $this->newLine();
        $this->info("✅ {$updated} pares actualizados exitosamente!");
        
        return Command::SUCCESS;
    }
}
