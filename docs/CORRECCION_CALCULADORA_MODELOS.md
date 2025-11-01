# Corrección: Calculadora de Órdenes - Modelos de Comisión

## Problema Identificado

Al crear una orden con el modelo **Spread**, la calculadora mostraba:
- **Monto a cambiar: $95.00** (cuando debería ser $100.00)
- Estaba restando el 5% como si fuera modelo **Porcentaje**

## Causa del Problema

La calculadora tenía un cálculo hardcodeado que siempre restaba la comisión del monto:

```typescript
// ❌ INCORRECTO - Siempre restaba la comisión
Monto a cambiar = $100 - ($100 × 5%) = $95
```

Este cálculo solo es correcto para el modelo **Porcentaje Fijo**, pero se aplicaba a todos los modelos.

## Diferencia Entre Modelos

### 📊 Modelo Porcentaje Fijo
```
Cliente entrega: $100
Comisión (5%):   -$5
Monto a cambiar: $95
Cliente recibe:  $95 × 390 = 37,050 VES
Tu ganancia:     $5
```

### 💱 Modelo Spread
```
Cliente entrega: $100
Monto a cambiar: $100 (completo, sin restar nada)
Cliente recibe:  $100 × 298 (tasa venta) = 29,800 VES
Tu costo:        $100 × 290 (tasa compra) = 29,000 VES
Tu ganancia:     800 VES = $2.76
```

### 🔀 Modelo Mixto
```
Cliente entrega: $100
Monto a cambiar: $100 (completo)
Cliente recibe:  $100 × 298 (tasa venta) = 29,800 VES
Tu ganancia spread: 800 VES
Tu ganancia comisión: $100 × 2% = $2
Tu ganancia total: $4.76
```

## Correcciones Aplicadas

### 1. Nueva Función: `calculateAmountToExchange()`

```typescript
const calculateAmountToExchange = () => {
  if (!selectedPair || !data.base_amount) return 0;

  const baseAmount = parseFloat(data.base_amount);
  const commissionModel = selectedPair.pivot?.commission_model || 'percentage';

  switch (commissionModel) {
    case 'percentage': {
      // ✅ En porcentaje, se resta la comisión
      const commissionPercent = parseFloat(data.house_commission_percent || '5');
      const commissionAmount = baseAmount * (commissionPercent / 100);
      return baseAmount - commissionAmount;
    }

    case 'spread':
    case 'mixed': {
      // ✅ En spread y mixto, el monto completo
      return baseAmount;
    }

    default:
      return baseAmount;
  }
};
```

### 2. Nueva Función: `getDisplayRate()`

También corregí la tasa mostrada:

```typescript
const getDisplayRate = () => {
  if (!selectedPair) return '0.0000';

  const commissionModel = selectedPair.pivot?.commission_model || 'percentage';

  switch (commissionModel) {
    case 'percentage': {
      // ✅ En porcentaje, mostrar tasa base
      return parseFloat(selectedPair.current_rate).toFixed(4);
    }

    case 'spread':
    case 'mixed': {
      // ✅ En spread/mixto, mostrar tasa de venta
      const sellRate = parseFloat(
        data.sell_rate || 
        selectedPair.pivot?.sell_rate?.toString() || 
        selectedPair.current_rate
      );
      return sellRate.toFixed(4);
    }

    default:
      return parseFloat(selectedPair.current_rate).toFixed(4);
  }
};
```

### 3. Actualización de la UI

**Antes:**
```typescript
// ❌ Siempre restaba la comisión
<span>
  ${(parseFloat(data.base_amount) - 
     (parseFloat(data.base_amount) * parseFloat(data.house_commission_percent) / 100)
    ).toFixed(2)}
</span>
```

**Ahora:**
```typescript
// ✅ Usa la función correcta según el modelo
<span>${calculateAmountToExchange().toFixed(2)}</span>
```

## Ejemplos de Corrección

### Ejemplo 1: Modelo Spread - USD/VES

**Configuración:**
- Tasa Compra: 290.00 VES
- Tasa Venta: 298.00 VES
- Cliente entrega: $100 USD

**Antes (Incorrecto):**
```
Monto a cambiar: $95.00 ❌
Tasa: 298.0000
Cliente recibe: 28,310.00 VES ❌
```

**Ahora (Correcto):**
```
Monto a cambiar: $100.00 ✅
Tasa: 298.0000
Cliente recibe: 29,800.00 VES ✅
Ganancia por Spread: +800.00 VES
```

### Ejemplo 2: Modelo Porcentaje - BTC/USD

**Configuración:**
- Comisión: 5%
- Cliente entrega: $100 USD

**Antes y Ahora (Correcto):**
```
Monto a cambiar: $95.00 ✅
Tasa: 43250.0000
Cliente recibe: 0.00219653 BTC ✅
Comisión: $5.00
```

### Ejemplo 3: Modelo Mixto - VES/ZEL

**Configuración:**
- Tasa Compra: 290.00
- Tasa Venta: 315.00
- Comisión Extra: 2%
- Cliente entrega: $100 USD

**Antes (Incorrecto):**
```
Monto a cambiar: $95.00 ❌
Cliente recibe: 29,925.00 VES ❌
```

**Ahora (Correcto):**
```
Monto a cambiar: $100.00 ✅
Cliente recibe: 31,500.00 VES ✅
Ganancia por Spread: +2,500.00 VES
Ganancia por Comisión: +2.00 USD
Ganancia Total: +$10.62 ✅
```

## Verificación del Cálculo

### Modelo Spread: USD/VES

```
Cliente entrega: $100 USD
Tasa de Venta (al cliente): 298.00 VES por USD

Cálculo:
1. Monto a cambiar = $100 (completo)
2. Cliente recibe = $100 × 298 = 29,800 VES
3. Tu costo = $100 × 290 = 29,000 VES
4. Tu ganancia = 29,800 - 29,000 = 800 VES

En USD: 800 / 290 = $2.76
```

## Impacto en el Backend

El backend ya estaba preparado para manejar los 3 modelos correctamente en el modelo `ExchangeHouseCurrencyPair`:

```php
public function calculateOrder($baseAmount, $direction = 'buy')
{
    switch ($this->commission_model) {
        case 'percentage':
            return $this->calculateWithPercentage($baseAmount);
            
        case 'spread':
            return $this->calculateWithSpread($baseAmount, $direction);
            
        case 'mixed':
            return $this->calculateWithMixed($baseAmount, $direction);
    }
}
```

El problema era solo en el **frontend** (calculadora visual).

## Archivos Modificados

- ✅ `resources/js/pages/Orders/Create.tsx`
  - Agregada función `calculateAmountToExchange()`
  - Agregada función `getDisplayRate()`
  - Actualizada visualización de "Monto a cambiar"
  - Actualizada visualización de "Tasa"
- ✅ Assets compilados con `npm run build`

## Cómo Probar

### 1. Modelo Spread

1. Ve a **Nueva Orden**
2. Selecciona el par **USD/VES** (modelo Spread)
3. Ingresa **$100** en el monto
4. Verifica:
   - ✅ Monto a cambiar: **$100.00** (no $95.00)
   - ✅ Tasa: **298.0000** (tasa de venta)
   - ✅ Cliente recibe: **29,800.00 VES**
   - ✅ Ganancia por Spread: **+800.00 VES**

### 2. Modelo Porcentaje

1. Selecciona el par **BTC/USD** (modelo Porcentaje, 5%)
2. Ingresa **$100** en el monto
3. Verifica:
   - ✅ Monto a cambiar: **$95.00** (correcto, se resta comisión)
   - ✅ Comisión: **$5.00**

### 3. Modelo Mixto

1. Selecciona el par **VES/ZEL** (modelo Mixto)
2. Ingresa **$100** en el monto
3. Verifica:
   - ✅ Monto a cambiar: **$100.00** (completo)
   - ✅ Ganancia por Spread: **+XXX VES**
   - ✅ Ganancia por Comisión: **+$X.XX**
   - ✅ Ganancia Total: **+$XX.XX**

## Resumen

| Modelo | Monto Cliente | Monto a Cambiar | Ganancia Viene De |
|--------|---------------|-----------------|-------------------|
| **📊 Porcentaje** | $100 | $95 (resta comisión) | Comisión % |
| **💱 Spread** | $100 | $100 (completo) | Diferencia de tasas |
| **🔀 Mixto** | $100 | $100 (completo) | Spread + Comisión % |

## Conclusión

✅ **PROBLEMA RESUELTO**

La calculadora ahora:
1. Muestra el monto correcto a cambiar según el modelo
2. Muestra la tasa correcta (base para porcentaje, venta para spread/mixto)
3. Calcula correctamente el monto que recibe el cliente
4. Muestra la ganancia correcta según el modelo

La corrección está completa y funcionando. Limpia la caché del navegador (Ctrl+Shift+R) y prueba crear una orden con cada modelo.
