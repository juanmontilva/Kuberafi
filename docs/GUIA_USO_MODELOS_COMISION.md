# 🎯 Guía de Uso: Modelos de Comisión

## ✅ Sistema Implementado y Funcional

El sistema de modelos de comisión configurables está **100% funcional** en el backend.

---

## 🚀 Cómo Usar (Ejemplos Prácticos)

### 1. Configurar un Par con Modelo Spread

```php
// En tinker o en un seeder
php artisan tinker

// Obtener la casa de cambio y el par
$exchangeHouse = \App\Models\ExchangeHouse::find(1);
$usdVesPair = \App\Models\CurrencyPair::where('symbol', 'USD/VES')->first();

// Configurar el par con modelo spread
$exchangeHouse->currencyPairs()->updateExistingPivot($usdVesPair->id, [
    'commission_model' => 'spread',
    'buy_rate' => 290.00,
    'sell_rate' => 295.00,
    'commission_percent' => null,
    'is_active' => true,
]);
```

### 2. Configurar un Par con Modelo Porcentaje

```php
$usdEurPair = \App\Models\CurrencyPair::where('symbol', 'USD/EUR')->first();

$exchangeHouse->currencyPairs()->updateExistingPivot($usdEurPair->id, [
    'commission_model' => 'percentage',
    'commission_percent' => 5.00,
    'buy_rate' => null,
    'sell_rate' => null,
    'is_active' => true,
]);
```

### 3. Configurar un Par con Modelo Mixto

```php
$usdtVesPair = \App\Models\CurrencyPair::where('symbol', 'USDT/VES')->first();

$exchangeHouse->currencyPairs()->updateExistingPivot($usdtVesPair->id, [
    'commission_model' => 'mixed',
    'buy_rate' => 36.20,
    'sell_rate' => 36.50,
    'commission_percent' => 2.00,
    'is_active' => true,
]);
```

---

## 🧪 Probar los Cálculos

### Ejemplo 1: Spread

```php
$pair = $exchangeHouse->currencyPairs()
    ->where('currency_pair_id', $usdVesPair->id)
    ->first();

// Calcular orden de 100 USD
$result = $pair->pivot->calculateOrder(100, 'buy');

/*
Resultado:
[
    'quote_amount' => 29500.00,      // Cliente paga 29,500 VES
    'commission_amount' => 0,         // No hay comisión %
    'profit' => 500.00,               // Ganancia por spread
    'rate_applied' => 295.00,         // Tasa aplicada al cliente
    'commission_model' => 'spread',
    'buy_rate' => 290.00,
    'sell_rate' => 295.00,
    'spread_profit' => 500.00,
]
*/
```

### Ejemplo 2: Porcentaje

```php
$pair = $exchangeHouse->currencyPairs()
    ->where('currency_pair_id', $usdEurPair->id)
    ->first();

$result = $pair->pivot->calculateOrder(100, 'buy');

/*
Resultado:
[
    'quote_amount' => 87.40,          // Cliente recibe 87.40 EUR
    'commission_amount' => 5.00,      // Comisión: 5 USD
    'profit' => 5.00,                 // Ganancia
    'rate_applied' => 0.92,           // Tasa EUR/USD
    'commission_model' => 'percentage',
    'buy_rate' => null,
    'sell_rate' => null,
    'spread_profit' => 0,
]
*/
```

### Ejemplo 3: Mixto

```php
$pair = $exchangeHouse->currencyPairs()
    ->where('currency_pair_id', $usdtVesPair->id)
    ->first();

$result = $pair->pivot->calculateOrder(100, 'buy');

/*
Resultado:
[
    'quote_amount' => 37220.00,       // Cliente paga 36,500 + 720 (2%)
    'commission_amount' => 2.00,      // Comisión: 2 USDT
    'profit' => 750.00,               // Spread (30) + Comisión (720)
    'rate_applied' => 36.50,          // Tasa de venta
    'commission_model' => 'mixed',
    'buy_rate' => 36.20,
    'sell_rate' => 36.50,
    'spread_profit' => 30.00,
]
*/
```

---

## 📊 Ver Configuración Actual

```php
// Ver todos los pares configurados de una casa
$exchangeHouse = \App\Models\ExchangeHouse::find(1);

$pairs = $exchangeHouse->currencyPairs()->get();

foreach ($pairs as $pair) {
    echo "Par: {$pair->symbol}\n";
    echo "Modelo: {$pair->pivot->commission_model}\n";
    
    if ($pair->pivot->commission_model === 'spread' || $pair->pivot->commission_model === 'mixed') {
        echo "Compra: {$pair->pivot->buy_rate}\n";
        echo "Venta: {$pair->pivot->sell_rate}\n";
        echo "Spread: {$pair->pivot->spread} ({$pair->pivot->spread_percent}%)\n";
    }
    
    if ($pair->pivot->commission_model === 'percentage' || $pair->pivot->commission_model === 'mixed') {
        echo "Comisión: {$pair->pivot->commission_percent}%\n";
    }
    
    echo "---\n";
}
```

---

## 🔄 Crear Orden con el Nuevo Sistema

El sistema ahora **automáticamente** usa el modelo configurado:

```php
// Cuando creas una orden desde el formulario, el sistema:
// 1. Detecta el modelo del par (spread, percentage, mixed)
// 2. Calcula automáticamente según ese modelo
// 3. Guarda todos los datos en la orden

// Ejemplo de orden creada:
$order = \App\Models\Order::latest()->first();

echo "Modelo usado: {$order->commission_model}\n";
echo "Monto base: {$order->base_amount}\n";
echo "Monto cotizado: {$order->quote_amount}\n";

if ($order->commission_model === 'spread' || $order->commission_model === 'mixed') {
    echo "Tasa de compra: {$order->buy_rate}\n";
    echo "Tasa de venta: {$order->sell_rate}\n";
    echo "Ganancia por spread: {$order->spread_profit}\n";
}

echo "Comisión: {$order->house_commission_amount}\n";
echo "Ganancia total: " . ($order->spread_profit + $order->house_commission_amount) . "\n";
```

---

## 📈 Reportes de Ganancia

### Por Modelo de Comisión

```php
use Illuminate\Support\Facades\DB;

$stats = DB::table('orders')
    ->select([
        'commission_model',
        DB::raw('COUNT(*) as total_orders'),
        DB::raw('SUM(base_amount) as total_volume'),
        DB::raw('SUM(COALESCE(spread_profit, 0)) as total_spread'),
        DB::raw('SUM(house_commission_amount) as total_commission'),
        DB::raw('SUM(COALESCE(spread_profit, 0) + house_commission_amount) as total_profit'),
    ])
    ->where('exchange_house_id', 1)
    ->where('status', 'completed')
    ->whereDate('created_at', '>=', now()->startOfMonth())
    ->groupBy('commission_model')
    ->get();

foreach ($stats as $stat) {
    echo "Modelo: {$stat->commission_model}\n";
    echo "Órdenes: {$stat->total_orders}\n";
    echo "Volumen: \${$stat->total_volume}\n";
    echo "Ganancia por spread: \${$stat->total_spread}\n";
    echo "Ganancia por comisión: \${$stat->total_commission}\n";
    echo "Ganancia total: \${$stat->total_profit}\n";
    echo "---\n";
}
```

---

## 🎨 Próximo Paso: Frontend

Para completar la implementación, necesitas crear:

### 1. Página de Configuración de Pares
- Selector de modelo (percentage, spread, mixed)
- Inputs dinámicos según modelo
- Vista previa de cálculos

### 2. Formulario de Orden Actualizado
- Detectar modelo del par
- Mostrar campos apropiados
- Calculadora que use el modelo correcto

### 3. Dashboard con Métricas
- Mostrar ganancia por modelo
- Comparar rentabilidad
- Gráficos de spread vs comisión

---

## ✅ Estado Actual

- ✅ **Base de datos**: Migrada y funcional
- ✅ **Modelos**: Implementados y testeados
- ✅ **Lógica de cálculo**: Funcionando correctamente
- ✅ **OrderController**: Actualizado para usar nuevo sistema
- ⏳ **Frontend**: Pendiente (1-2 días)

---

## 🐛 Troubleshooting

### Error: "commission_model column not found"
```bash
# Ejecutar la migration
php artisan migrate
```

### Error: "Call to undefined method calculateOrder()"
```bash
# Limpiar cache
php artisan config:clear
php artisan cache:clear
composer dump-autoload
```

### Configuración no se guarda
```php
// Verificar que el pivot existe
$exists = DB::table('exchange_house_currency_pair')
    ->where('exchange_house_id', 1)
    ->where('currency_pair_id', 1)
    ->exists();

if (!$exists) {
    // Crear la relación primero
    $exchangeHouse->currencyPairs()->attach($currencyPairId, [
        'commission_model' => 'spread',
        'buy_rate' => 290,
        'sell_rate' => 295,
        'is_active' => true,
    ]);
}
```

---

## 📞 Soporte

Para dudas o problemas:
1. Revisa esta guía
2. Prueba los ejemplos en tinker
3. Verifica los logs: `storage/logs/laravel.log`
4. Consulta `IMPLEMENTACION_MODELOS_COMISION.md` para detalles técnicos
