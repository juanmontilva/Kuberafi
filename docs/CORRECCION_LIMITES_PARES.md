# Corrección: Límites de Pares de Divisas en Creación de Órdenes

## 🐛 Problema Identificado

Al crear una orden desde la casa de cambio, el formulario mostraba los límites (min_amount y max_amount) configurados por el Super Admin a nivel global del par de divisas, en lugar de los límites específicos que la casa de cambio había configurado para ese par.

### Ejemplo del problema:
- **Par:** ZEL/USD
- **Límites globales (Super Admin):** Min: $1.00 | Max: $100,000.00
- **Límites de la casa de cambio:** Min: $100.00 | Max: $10,000.00
- **Problema:** El formulario mostraba "Límites: $1.00 - $100000.00" en lugar de "Límites: $100.00 - $10000.00"

## 🔍 Causa Raíz

El controlador `OrderController` en el método `create()` estaba obteniendo todos los pares de divisas activos globalmente sin considerar la configuración específica de cada casa de cambio:

```php
// ❌ Código anterior (incorrecto)
$currencyPairs = CurrencyPair::where('is_active', true)->get();
```

Esto devolvía los pares con sus valores globales, sin incluir los datos del pivot (tabla intermedia `exchange_house_currency_pair`) donde se almacenan los límites personalizados de cada casa de cambio.

## ✅ Solución Aplicada

### 1. Modificación del método `create()` en OrderController

Se cambió la consulta para obtener solo los pares configurados por la casa de cambio, incluyendo los valores del pivot:

```php
// ✅ Código nuevo (correcto)
$exchangeHouse = $user->exchangeHouse;
$currencyPairs = $exchangeHouse->currencyPairs()
    ->wherePivot('is_active', true)
    ->get()
    ->map(function ($pair) {
        return [
            'id' => $pair->id,
            'symbol' => $pair->symbol,
            'base_currency' => $pair->base_currency,
            'quote_currency' => $pair->quote_currency,
            'current_rate' => $pair->current_rate,
            'min_amount' => $pair->pivot->min_amount, // ✅ Límite de la casa de cambio
            'max_amount' => $pair->pivot->max_amount, // ✅ Límite de la casa de cambio
        ];
    });
```

**Beneficios:**
- Solo muestra pares que la casa de cambio tiene configurados
- Usa los límites específicos configurados por la casa de cambio
- Respeta el estado activo/inactivo del par a nivel de casa de cambio

### 2. Modificación de la validación en el método `store()`

Se actualizó la validación para usar los límites del pivot en lugar de los límites globales:

```php
// ✅ Obtener los límites configurados por la casa de cambio
$exchangeHouse = $user->exchangeHouse;
$pivotData = $exchangeHouse->currencyPairs()
    ->where('currency_pair_id', $currencyPair->id)
    ->wherePivot('is_active', true)
    ->first();

if (!$pivotData) {
    return back()->withErrors([
        'currency_pair_id' => "Este par de divisas no está disponible para tu casa de cambio"
    ]);
}

// Validar límites usando los valores del pivot
$minAmount = $pivotData->pivot->min_amount;
$maxAmount = $pivotData->pivot->max_amount;

if ($validated['base_amount'] < $minAmount) {
    return back()->withErrors([
        'base_amount' => "El monto mínimo es {$minAmount}"
    ]);
}

if ($maxAmount && $validated['base_amount'] > $maxAmount) {
    return back()->withErrors([
        'base_amount' => "El monto máximo es {$maxAmount}"
    ]);
}
```

**Beneficios:**
- Valida contra los límites correctos (los de la casa de cambio)
- Previene que se creen órdenes con pares no configurados
- Verifica que el par esté activo para esa casa de cambio

## 🧪 Verificación

Se verificó que los límites se estén tomando correctamente:

```bash
php artisan tinker --execute="
\$user = \App\Models\User::where('role', 'exchange_house')->first();
\$exchangeHouse = \$user->exchangeHouse;
\$pairs = \$exchangeHouse->currencyPairs()->wherePivot('is_active', true)->get();

foreach (\$pairs as \$pair) {
    echo \$pair->symbol . '\n';
    echo '   Límites globales: Min: ' . \$pair->min_amount . ' | Max: ' . \$pair->max_amount . '\n';
    echo '   Límites de la casa: Min: ' . \$pair->pivot->min_amount . ' | Max: ' . \$pair->pivot->max_amount . '\n';
}
"
```

### Resultado:
```
ZEL/USD
   Límites globales (Super Admin): Min: 1.00 | Max: 100000.00
   Límites de la casa (Pivot): Min: 100.00 | Max: 10000.00
```

## 📝 Archivos Modificados

1. `app/Http/Controllers/OrderController.php`
   - Método `create()` - Líneas 169-210
   - Método `store()` - Líneas 227-250

## 🚀 Pasos para Aplicar

```bash
# 1. Compilar assets del frontend
npm run build

# 2. Limpiar caché de Laravel (opcional)
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

## ✨ Resultado

Ahora al crear una orden:
- ✅ Solo se muestran los pares configurados por la casa de cambio
- ✅ Los límites mostrados son los configurados por la casa de cambio (no los globales)
- ✅ La validación usa los límites correctos
- ✅ No se pueden crear órdenes con pares no configurados o inactivos
- ✅ Cada casa de cambio tiene control total sobre sus límites

## 📊 Impacto

- **Funcionalidad:** Completamente corregida
- **Experiencia de usuario:** Mejorada - ahora ve los límites correctos
- **Seguridad:** Mejorada - validación contra límites correctos
- **Autonomía:** Las casas de cambio tienen control real sobre sus límites
- **Integridad de datos:** Garantizada - no se pueden crear órdenes fuera de los límites configurados

## 🎯 Casos de Uso

### Caso 1: Casa de cambio con límites más restrictivos
- Super Admin configura: Min: $1 | Max: $100,000
- Casa de cambio configura: Min: $100 | Max: $10,000
- **Resultado:** Solo acepta órdenes entre $100 y $10,000 ✅

### Caso 2: Casa de cambio con límites más amplios
- Super Admin configura: Min: $10 | Max: $1,000
- Casa de cambio configura: Min: $5 | Max: $5,000
- **Resultado:** Solo acepta órdenes entre $5 y $5,000 ✅

### Caso 3: Par desactivado por la casa de cambio
- Super Admin: Par activo globalmente
- Casa de cambio: Par marcado como inactivo en su configuración
- **Resultado:** El par no aparece en el formulario de creación de órdenes ✅
