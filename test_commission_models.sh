#!/bin/bash

echo "==================================="
echo "Prueba de Modelos de Comisión"
echo "==================================="
echo ""

echo "1. Verificando pares configurados..."
php artisan tinker --execute="
\$pairs = \App\Models\ExchangeHouseCurrencyPair::with('exchangeHouse', 'currencyPair')->get();
echo 'Total de pares configurados: ' . \$pairs->count() . PHP_EOL;
echo '' . PHP_EOL;

foreach (\$pairs as \$pair) {
    echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' . PHP_EOL;
    echo 'Par: ' . \$pair->currencyPair->symbol . PHP_EOL;
    echo 'Casa: ' . \$pair->exchangeHouse->name . PHP_EOL;
    echo 'Modelo: ' . (\$pair->commission_model ?? 'No definido') . PHP_EOL;
    
    if (\$pair->commission_model === 'percentage') {
        echo '  └─ Comisión: ' . (\$pair->commission_percent ?? \$pair->margin_percent) . '%' . PHP_EOL;
    } elseif (\$pair->commission_model === 'spread') {
        echo '  ├─ Tasa Compra: ' . \$pair->buy_rate . PHP_EOL;
        echo '  ├─ Tasa Venta: ' . \$pair->sell_rate . PHP_EOL;
        echo '  └─ Margen: ' . \$pair->margin_percent . '%' . PHP_EOL;
    } elseif (\$pair->commission_model === 'mixed') {
        echo '  ├─ Tasa Compra: ' . \$pair->buy_rate . PHP_EOL;
        echo '  ├─ Tasa Venta: ' . \$pair->sell_rate . PHP_EOL;
        echo '  ├─ Margen Spread: ' . \$pair->margin_percent . '%' . PHP_EOL;
        echo '  └─ Comisión Adicional: ' . \$pair->commission_percent . '%' . PHP_EOL;
    }
    echo '' . PHP_EOL;
}
"

echo ""
echo "==================================="
echo "Prueba completada"
echo "==================================="
