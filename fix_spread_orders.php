#!/usr/bin/env php
<?php

/**
 * Script para corregir órdenes con modelo Spread que tienen valores incorrectos
 * 
 * Uso: php fix_spread_orders.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Order;

echo "🔧 Corrigiendo órdenes con modelo Spread...\n\n";

// Buscar órdenes con modelo spread que tienen valores incorrectos
// Detectar si exchange_commission no coincide con el cálculo correcto
$orders = Order::where('commission_model', 'spread')
    ->whereNotNull('spread_profit')
    ->whereNotNull('buy_rate')
    ->where('buy_rate', '>', 0)
    ->get()
    ->filter(function($order) {
        // Calcular lo que debería ser
        $expectedCommission = floatval($order->spread_profit) / floatval($order->buy_rate);
        $actualCommission = floatval($order->exchange_commission);
        // Si la diferencia es mayor a 0.01, necesita corrección
        return abs($expectedCommission - $actualCommission) > 0.01;
    });

if ($orders->isEmpty()) {
    echo "✅ No hay órdenes que corregir.\n";
    exit(0);
}

echo "📊 Encontradas {$orders->count()} órdenes para corregir:\n\n";

$corrected = 0;
$errors = 0;

foreach ($orders as $order) {
    try {
        $spreadProfit = floatval($order->spread_profit);
        $buyRate = floatval($order->buy_rate);
        $baseAmount = floatval($order->base_amount);
        
        if ($buyRate <= 0 || $baseAmount <= 0) {
            echo "⚠️  Orden #{$order->order_number}: Valores inválidos (buy_rate: {$buyRate}, base_amount: {$baseAmount})\n";
            $errors++;
            continue;
        }
        
        // Convertir spread de VES a USD
        $spreadProfitInBase = $spreadProfit / $buyRate;
        
        // Calcular margen real
        $realMarginPercent = ($spreadProfitInBase / $baseAmount) * 100;
        
        // Valores antes
        $oldCommission = $order->exchange_commission;
        $oldMargin = $order->actual_margin_percent;
        
        // Actualizar
        $order->update([
            'exchange_commission' => $spreadProfitInBase,
            'actual_margin_percent' => $realMarginPercent,
            'expected_margin_percent' => $realMarginPercent,
        ]);
        
        echo "✅ Orden #{$order->order_number}:\n";
        echo "   Spread: {$spreadProfit} VES\n";
        echo "   Buy Rate: {$buyRate}\n";
        echo "   Ganancia: \${$oldCommission} → \${$spreadProfitInBase}\n";
        echo "   Margen: {$oldMargin}% → {$realMarginPercent}%\n\n";
        
        $corrected++;
        
    } catch (\Exception $e) {
        echo "❌ Error en orden #{$order->order_number}: {$e->getMessage()}\n\n";
        $errors++;
    }
}

echo "\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "📈 Resumen:\n";
echo "   ✅ Órdenes corregidas: {$corrected}\n";
echo "   ❌ Errores: {$errors}\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

exit($errors > 0 ? 1 : 0);
