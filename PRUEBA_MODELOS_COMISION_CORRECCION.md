# Corrección: Modelos de Comisión - Guardar y Mostrar

## Problema Identificado

Cuando editabas un par de divisas, el modelo de comisión seleccionado no se guardaba ni se mostraba correctamente en la lista de pares configurados.

## Causas del Problema

### 1. Campos Faltantes en el Modelo ExchangeHouse
El método `currencyPairs()` no incluía los nuevos campos del pivot en `withPivot()`:
- `commission_model`
- `commission_percent`
- `buy_rate`
- `sell_rate`

### 2. Interfaz TypeScript Incompleta
La interfaz `CurrencyPair` en el componente React no incluía los campos del modelo de comisión en el objeto `pivot`.

## Correcciones Aplicadas

### 1. Actualización del Modelo ExchangeHouse
**Archivo:** `app/Models/ExchangeHouse.php`

```php
public function currencyPairs(): BelongsToMany
{
    return $this->belongsToMany(CurrencyPair::class, 'exchange_house_currency_pair')
        ->using(ExchangeHouseCurrencyPair::class)
        ->withPivot([
            'margin_percent',
            'min_amount',
            'max_amount',
            'is_active',
            'deleted_at',
            'commission_model',      // ✅ AGREGADO
            'commission_percent',    // ✅ AGREGADO
            'buy_rate',             // ✅ AGREGADO
            'sell_rate'             // ✅ AGREGADO
        ])
        ->withTimestamps();
}
```

### 2. Actualización de la Interfaz TypeScript
**Archivo:** `resources/js/pages/ExchangeHouse/CurrencyPairs.tsx`

```typescript
interface CurrencyPair {
  id: number;
  base_currency: string;
  quote_currency: string;
  symbol: string;
  current_rate: string;
  min_amount: string;
  max_amount: string;
  is_active: boolean;
  pivot?: {
    margin_percent: string;
    min_amount: string;
    max_amount: string;
    is_active: boolean;
    commission_model?: 'percentage' | 'spread' | 'mixed';  // ✅ AGREGADO
    commission_percent?: number;                            // ✅ AGREGADO
    buy_rate?: number;                                      // ✅ AGREGADO
    sell_rate?: number;                                     // ✅ AGREGADO
  };
}
```

### 3. Función Helper para Mostrar el Modelo
Se agregó una función para mostrar el modelo de comisión con iconos y colores:

```typescript
const getCommissionModelLabel = (model?: string) => {
  switch (model) {
    case 'percentage':
      return { label: 'Porcentaje Fijo', icon: '📊', color: 'text-blue-500' };
    case 'spread':
      return { label: 'Spread', icon: '💱', color: 'text-green-500' };
    case 'mixed':
      return { label: 'Mixto', icon: '🔀', color: 'text-purple-500' };
    default:
      return { label: 'Porcentaje Fijo', icon: '📊', color: 'text-blue-500' };
  }
};
```

### 4. Visualización en la Lista de Pares
Se actualizó la sección de pares activos para mostrar el modelo de comisión:

```tsx
<div className="flex items-center justify-between gap-4 text-xs text-muted-foreground mt-3 pt-3 border-t border-gray-800">
  <div className="flex items-center gap-4">
    <span>Min: ${pair.pivot?.min_amount || pair.min_amount}</span>
    <span>Max: ${pair.pivot?.max_amount || pair.max_amount}</span>
  </div>
  <div className="flex items-center gap-1.5">
    <span className={getCommissionModelLabel(pair.pivot?.commission_model).color}>
      {getCommissionModelLabel(pair.pivot?.commission_model).icon}
    </span>
    <span className="font-medium">
      {getCommissionModelLabel(pair.pivot?.commission_model).label}
    </span>
  </div>
</div>
```

## Cómo Probar

### 1. Editar un Par Existente
1. Ve a **Mis Pares de Divisas**
2. Haz clic en el botón de editar (✏️) de cualquier par
3. Selecciona un modelo de comisión diferente:
   - **Porcentaje Fijo**: Solo necesitas ingresar el % de comisión
   - **Spread**: Necesitas ingresar tu tasa de compra (costo)
   - **Mixto**: Necesitas ambos valores
4. Haz clic en **Actualizar**
5. Verifica que en la lista de pares aparezca el modelo seleccionado con su icono

### 2. Verificar que se Guardó Correctamente
Puedes verificar en la base de datos:

```bash
php artisan tinker --execute="
\$pair = \App\Models\ExchangeHouseCurrencyPair::with('exchangeHouse', 'currencyPair')->first();
echo 'Par: ' . \$pair->currencyPair->symbol . PHP_EOL;
echo 'Modelo: ' . \$pair->commission_model . PHP_EOL;
echo 'Comisión %: ' . \$pair->commission_percent . PHP_EOL;
echo 'Buy Rate: ' . \$pair->buy_rate . PHP_EOL;
echo 'Sell Rate: ' . \$pair->sell_rate . PHP_EOL;
"
```

### 3. Verificar la Visualización
En la lista de pares configurados, deberías ver:
- 📊 **Porcentaje Fijo** (azul) - para modelo percentage
- 💱 **Spread** (verde) - para modelo spread
- 🔀 **Mixto** (morado) - para modelo mixed

## Ejemplo de Uso

### Modelo Porcentaje Fijo
```
Tasa Base: 390.00
Comisión: 5%
→ Cliente paga 5% sobre el monto
```

### Modelo Spread
```
Tasa de Compra (tu costo): 390.00
Tasa de Venta (al cliente): 395.00
→ Ganancia: 5.00 por unidad (1.28%)
```

### Modelo Mixto
```
Tasa de Compra: 390.00
Tasa de Venta: 395.00
Comisión Adicional: 2%
→ Ganancia por spread + 2% adicional
```

## Archivos Modificados

1. ✅ `app/Models/ExchangeHouse.php` - Agregados campos al withPivot
2. ✅ `resources/js/pages/ExchangeHouse/CurrencyPairs.tsx` - Interfaz y visualización
3. ✅ Assets compilados con `npm run build`

## Estado

✅ **CORREGIDO** - Los modelos de comisión ahora se guardan y muestran correctamente.

## Próximos Pasos

Si aún tienes problemas:
1. Limpia la caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)
2. Verifica que estés usando la última versión compilada
3. Revisa la consola del navegador por errores JavaScript


## Verificación de la Corrección

### Prueba en Base de Datos
Se ejecutó el script de prueba y se confirmó que los datos se están guardando correctamente:

```bash
./test_commission_models.sh
```

**Resultados:**
- ✅ 7 pares configurados encontrados
- ✅ Modelo "percentage" guardando correctamente
- ✅ Modelo "spread" guardando buy_rate, sell_rate y margin_percent
- ✅ Todos los campos del pivot están disponibles

### Ejemplo de Datos Guardados

**Par USD/VES con modelo Spread:**
```
Modelo: spread
├─ Tasa Compra: 290.000000
├─ Tasa Venta: 298.000000
└─ Margen: 2.76%
```

**Par BTC/USD con modelo Percentage:**
```
Modelo: percentage
└─ Comisión: 5.00%
```

## Instrucciones para el Usuario

### Para Probar la Corrección:

1. **Limpia la caché del navegador:**
   - Chrome/Edge: `Ctrl+Shift+R` (Windows) o `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+F5` (Windows) o `Cmd+Shift+R` (Mac)

2. **Recarga la página de Pares de Divisas:**
   - Ve a: `/currency-pairs`
   - Deberías ver el modelo de comisión en cada par configurado

3. **Edita un par:**
   - Haz clic en el botón de editar (✏️)
   - Cambia el modelo de comisión
   - Guarda los cambios
   - Verifica que el modelo se muestre correctamente en la lista

4. **Verifica la visualización:**
   - En la lista de pares, busca en la parte inferior de cada tarjeta
   - Deberías ver el icono y nombre del modelo:
     - 📊 Porcentaje Fijo (azul)
     - 💱 Spread (verde)
     - 🔀 Mixto (morado)

### Si Aún No Funciona:

1. Verifica que los assets estén compilados:
   ```bash
   npm run build
   ```

2. Limpia la caché de Laravel:
   ```bash
   php artisan cache:clear
   php artisan view:clear
   ```

3. Verifica en la consola del navegador (F12) si hay errores JavaScript

4. Ejecuta el script de prueba para verificar la base de datos:
   ```bash
   ./test_commission_models.sh
   ```

## Resumen de Cambios

| Archivo | Cambio | Estado |
|---------|--------|--------|
| `app/Models/ExchangeHouse.php` | Agregados campos al withPivot | ✅ |
| `resources/js/pages/ExchangeHouse/CurrencyPairs.tsx` | Interfaz TypeScript actualizada | ✅ |
| `resources/js/pages/ExchangeHouse/CurrencyPairs.tsx` | Función helper para mostrar modelo | ✅ |
| `resources/js/pages/ExchangeHouse/CurrencyPairs.tsx` | Visualización en lista de pares | ✅ |
| Assets compilados | `npm run build` | ✅ |

## Conclusión

✅ **PROBLEMA RESUELTO**

Los modelos de comisión ahora:
1. Se guardan correctamente en la base de datos
2. Se cargan correctamente desde el backend
3. Se muestran en la interfaz con iconos y colores
4. Se pueden editar y actualizar sin problemas

La corrección está completa y funcionando.
