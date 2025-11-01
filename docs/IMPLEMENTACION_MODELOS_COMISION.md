# Implementación: Modelos de Comisión Configurables

## ✅ Completado

### 1. Base de Datos
- ✅ Migration creada: `2025_10_31_230321_add_commission_models_to_currency_pairs.php`
- ✅ Campos agregados a `exchange_house_currency_pair`:
  - `commission_model` (enum: percentage, spread, mixed)
  - `commission_percent` (decimal)
  - `buy_rate` (decimal)
  - `sell_rate` (decimal)
- ✅ Campos agregados a `orders`:
  - `commission_model`
  - `buy_rate`
  - `sell_rate`
  - `spread_profit`

### 2. Modelos
- ✅ `Order.php` actualizado con nuevos campos
- ✅ `ExchangeHouseCurrencyPair.php` creado con lógica de cálculo
- ✅ `CurrencyPair.php` actualizado con nuevos campos en pivot

### 3. Lógica de Negocio
- ✅ Método `calculateOrder()` para calcular según modelo
- ✅ Método `calculateWithPercentage()` - Modelo tradicional
- ✅ Método `calculateWithSpread()` - Modelo spread
- ✅ Método `calculateWithMixed()` - Modelo mixto
- ✅ Getters para `spread` y `spreadPercent`

---

## 📋 Pendiente

### 1. Backend (1 día)

#### OrderController - Actualizar `store()`
```php
// Obtener configuración del par
$pivotData = $exchangeHouse->currencyPairs()
    ->where('currency_pair_id', $validated['currency_pair_id'])
    ->first();

// Calcular según modelo
$calculation = $pivotData->pivot->calculateOrder(
    $validated['base_amount'],
    'buy' // o 'sell' según la operación
);

// Crear orden con los datos calculados
$order = Order::create([
    'base_amount' => $validated['base_amount'],
    'quote_amount' => $calculation['quote_amount'],
    'commission_model' => $calculation['commission_model'],
    'buy_rate' => $calculation['buy_rate'],
    'sell_rate' => $calculation['sell_rate'],
    'spread_profit' => $calculation['spread_profit'],
    'house_commission_amount' => $calculation['commission_amount'],
    // ... más campos
]);
```

#### API para Configurar Pares
```php
// CurrencyPairController::updateConfig()
Route::post('/currency-pairs/{pair}/config', [CurrencyPairController::class, 'updateConfig']);
```

### 2. Frontend (1.5 días)

#### Página de Configuración de Par
- [ ] UI para seleccionar modelo de comisión
- [ ] Inputs dinámicos según modelo seleccionado
- [ ] Vista previa de cálculos
- [ ] Validaciones

#### Formulario de Crear Orden
- [ ] Detectar modelo del par seleccionado
- [ ] Mostrar inputs apropiados
- [ ] Calculadora dinámica
- [ ] Mostrar ganancia estimada

#### Dashboard
- [ ] Mostrar modelo usado en cada par
- [ ] Reportes de ganancia por modelo
- [ ] Comparación de rentabilidad

### 3. Testing (Medio día)
- [ ] Test unitarios para cálculos
- [ ] Test de integración
- [ ] Validar con datos reales

---

## 🎯 Próximos Pasos

### Paso 1: Ejecutar Migration
```bash
php artisan migrate
```

### Paso 2: Actualizar OrderController
Modificar el método `store()` para usar la nueva lógica de cálculo.

### Paso 3: Crear UI de Configuración
Página para que cada casa configure sus pares con el modelo deseado.

### Paso 4: Actualizar Formulario de Orden
Adaptar el formulario de crear orden para mostrar campos según el modelo.

---

## 📊 Ejemplos de Uso

### Ejemplo 1: Configurar USD/VES con Spread
```php
$exchangeHouse->currencyPairs()->updateExistingPivot($usdVesPair->id, [
    'commission_model' => 'spread',
    'buy_rate' => 290.00,
    'sell_rate' => 295.00,
    'commission_percent' => null,
]);
```

### Ejemplo 2: Configurar USD/EUR con Porcentaje
```php
$exchangeHouse->currencyPairs()->updateExistingPivot($usdEurPair->id, [
    'commission_model' => 'percentage',
    'commission_percent' => 5.00,
    'buy_rate' => null,
    'sell_rate' => null,
]);
```

### Ejemplo 3: Configurar USDT/VES con Mixto
```php
$exchangeHouse->currencyPairs()->updateExistingPivot($usdtVesPair->id, [
    'commission_model' => 'mixed',
    'buy_rate' => 36.20,
    'sell_rate' => 36.50,
    'commission_percent' => 2.00,
]);
```

---

## 🔍 Validaciones Necesarias

### En el Backend
```php
// Validar que los campos requeridos estén presentes según el modelo
if ($commissionModel === 'percentage') {
    $request->validate(['commission_percent' => 'required|numeric|min:0|max:100']);
}

if ($commissionModel === 'spread' || $commissionModel === 'mixed') {
    $request->validate([
        'buy_rate' => 'required|numeric|min:0',
        'sell_rate' => 'required|numeric|min:0|gt:buy_rate',
    ]);
}
```

### En el Frontend
- Validar que sell_rate > buy_rate
- Validar que commission_percent esté entre 0 y 100
- Mostrar advertencias si el spread es muy bajo o muy alto

---

## 📈 Reportes y Analytics

### Métricas por Modelo
```sql
-- Ganancia por modelo de comisión
SELECT 
    commission_model,
    COUNT(*) as total_orders,
    SUM(base_amount) as total_volume,
    SUM(house_commission_amount) as total_commission,
    SUM(spread_profit) as total_spread_profit,
    SUM(COALESCE(spread_profit, 0) + house_commission_amount) as total_profit
FROM orders
WHERE exchange_house_id = ?
  AND status = 'completed'
  AND created_at >= ?
GROUP BY commission_model;
```

### Comparación de Rentabilidad
```sql
-- Margen promedio por modelo
SELECT 
    commission_model,
    AVG(
        (COALESCE(spread_profit, 0) + house_commission_amount) / base_amount * 100
    ) as avg_margin_percent
FROM orders
WHERE exchange_house_id = ?
  AND status = 'completed'
GROUP BY commission_model;
```

---

## 🚀 Deployment

### Checklist
- [ ] Ejecutar migration en producción
- [ ] Configurar pares existentes con modelo por defecto (percentage)
- [ ] Capacitar a usuarios sobre nuevos modelos
- [ ] Monitorear primeras órdenes con nuevos modelos
- [ ] Ajustar tasas según feedback

---

## 💡 Mejoras Futuras

### Fase 2
- [ ] Modelo "tiered" (comisión por rangos de monto)
- [ ] Modelo "dynamic" (ajuste automático según mercado)
- [ ] Modelo "negotiable" (permite negociar con cliente)

### Fase 3
- [ ] IA para sugerir mejor modelo según historial
- [ ] Alertas de oportunidades de arbitraje
- [ ] Optimización automática de tasas

---

## 📞 Soporte

Si tienes dudas sobre la implementación:
1. Revisa los ejemplos en este documento
2. Consulta el código en `ExchangeHouseCurrencyPair.php`
3. Ejecuta los tests unitarios
4. Contacta al equipo de desarrollo
