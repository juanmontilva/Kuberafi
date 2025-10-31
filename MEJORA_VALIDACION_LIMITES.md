# Mejora de Seguridad: Validación de Límites de Pares de Divisas

## 🔒 Problema de Seguridad Identificado

Anteriormente, las casas de cambio podían configurar **cualquier límite** para sus pares de divisas, sin restricciones. Esto significaba que podían establecer límites fuera del rango permitido por el Super Admin, creando un riesgo de seguridad y control.

### Ejemplo del problema:
- **Super Admin configura:** Min: $1.00 | Max: $100,000.00
- **Casa de cambio podía configurar:** Min: $0.01 | Max: $1,000,000.00 ❌
- **Problema:** La casa de cambio podía operar fuera de los límites de la plataforma

## 🎯 Objetivo

Garantizar que las casas de cambio solo puedan configurar límites **dentro del rango** establecido por el Super Admin, manteniendo el control de la plataforma sobre los límites operacionales.

## ✅ Solución Implementada

### 1. Validación en el Backend (Método `attach`)

Se agregó validación en el controlador `ExchangeHouse/CurrencyPairController` para verificar que los límites estén dentro del rango permitido:

```php
// Validar que los límites de la casa no excedan los límites globales del super admin
$minAmount = $validated['min_amount'] ?? $currencyPair->min_amount;
$maxAmount = $validated['max_amount'] ?? $currencyPair->max_amount;

// ✅ El mínimo de la casa NO puede ser menor al mínimo de la plataforma
if ($minAmount < $currencyPair->min_amount) {
    return redirect()->back()->withErrors([
        'min_amount' => "El monto mínimo no puede ser menor a {$currencyPair->min_amount} (límite establecido por la plataforma)"
    ]);
}

// ✅ El máximo de la casa NO puede ser mayor al máximo de la plataforma
if ($currencyPair->max_amount && $maxAmount > $currencyPair->max_amount) {
    return redirect()->back()->withErrors([
        'max_amount' => "El monto máximo no puede ser mayor a {$currencyPair->max_amount} (límite establecido por la plataforma)"
    ]);
}

// ✅ El mínimo no puede ser mayor al máximo
if ($minAmount > $maxAmount) {
    return redirect()->back()->withErrors([
        'min_amount' => "El monto mínimo no puede ser mayor al monto máximo"
    ]);
}
```

### 2. Validación en el Backend (Método `update`)

Se agregó la misma validación al método de actualización:

```php
// Validar que los límites de la casa no excedan los límites globales del super admin
if ($validated['min_amount'] && $validated['min_amount'] < $currencyPair->min_amount) {
    return redirect()->back()->withErrors([
        'min_amount' => "El monto mínimo no puede ser menor a {$currencyPair->min_amount} (límite establecido por la plataforma)"
    ]);
}

if ($validated['max_amount'] && $currencyPair->max_amount && $validated['max_amount'] > $currencyPair->max_amount) {
    return redirect()->back()->withErrors([
        'max_amount' => "El monto máximo no puede ser mayor a {$currencyPair->max_amount} (límite establecido por la plataforma)"
    ]);
}

if ($validated['min_amount'] && $validated['max_amount'] && $validated['min_amount'] > $validated['max_amount']) {
    return redirect()->back()->withErrors([
        'min_amount' => "El monto mínimo no puede ser mayor al monto máximo"
    ]);
}
```

### 3. Mejoras en el Frontend

Se actualizó la interfaz para mostrar claramente los límites de la plataforma:

**Formulario de Agregar Par:**
```tsx
<div className="p-3 bg-blue-950/50 border border-blue-800 rounded-lg">
  <p className="text-xs text-blue-300 mb-2">
    📋 Límites de la plataforma para este par:
  </p>
  <p className="text-sm text-blue-100">
    Mínimo: <span className="font-semibold">${selectedPair.min_amount}</span> | 
    Máximo: <span className="font-semibold">${selectedPair.max_amount || '∞'}</span>
  </p>
  <p className="text-xs text-blue-300 mt-1">
    Tus límites deben estar dentro de este rango
  </p>
</div>

<Input
  type="number"
  min={selectedPair.min_amount}
  max={selectedPair.max_amount || undefined}
  // ...
/>
<p className="text-xs text-muted-foreground mt-1">
  Mínimo permitido: ${selectedPair.min_amount}
</p>
```

## 📊 Reglas de Validación

### Límite Mínimo de la Casa de Cambio:
- ✅ **Puede ser igual o mayor** al límite mínimo de la plataforma
- ❌ **NO puede ser menor** al límite mínimo de la plataforma

**Ejemplos:**
- Plataforma: Min $1 → Casa puede configurar: $1, $10, $100 ✅
- Plataforma: Min $1 → Casa NO puede configurar: $0.50 ❌

### Límite Máximo de la Casa de Cambio:
- ✅ **Puede ser igual o menor** al límite máximo de la plataforma
- ❌ **NO puede ser mayor** al límite máximo de la plataforma

**Ejemplos:**
- Plataforma: Max $100,000 → Casa puede configurar: $100,000, $50,000, $10,000 ✅
- Plataforma: Max $100,000 → Casa NO puede configurar: $200,000 ❌

### Coherencia Interna:
- ✅ El mínimo debe ser menor o igual al máximo
- ❌ El mínimo NO puede ser mayor al máximo

## 🧪 Casos de Prueba

### Caso 1: Límites dentro del rango (✅ Válido)
```
Plataforma: Min: $1 | Max: $100,000
Casa configura: Min: $100 | Max: $10,000
Resultado: ✅ Aceptado
```

### Caso 2: Mínimo menor al permitido (❌ Inválido)
```
Plataforma: Min: $1 | Max: $100,000
Casa intenta: Min: $0.50 | Max: $10,000
Resultado: ❌ Error - "El monto mínimo no puede ser menor a $1"
```

### Caso 3: Máximo mayor al permitido (❌ Inválido)
```
Plataforma: Min: $1 | Max: $100,000
Casa intenta: Min: $100 | Max: $200,000
Resultado: ❌ Error - "El monto máximo no puede ser mayor a $100,000"
```

### Caso 4: Mínimo mayor al máximo (❌ Inválido)
```
Casa intenta: Min: $10,000 | Max: $1,000
Resultado: ❌ Error - "El monto mínimo no puede ser mayor al monto máximo"
```

### Caso 5: Límites más restrictivos (✅ Válido)
```
Plataforma: Min: $1 | Max: $100,000
Casa configura: Min: $1,000 | Max: $5,000
Resultado: ✅ Aceptado - La casa puede ser más restrictiva
```

## 📝 Archivos Modificados

1. `app/Http/Controllers/ExchangeHouse/CurrencyPairController.php`
   - Método `attach()` - Validación al agregar pares
   - Método `update()` - Validación al actualizar pares

2. `resources/js/pages/ExchangeHouse/CurrencyPairs.tsx`
   - Formulario de agregar par - Muestra límites de la plataforma
   - Formulario de editar par - Muestra límites de la plataforma
   - Inputs con atributos `min` y `max` para validación HTML5

## 🚀 Beneficios

### Seguridad:
- ✅ Control total del Super Admin sobre los límites operacionales
- ✅ Previene que casas de cambio operen fuera de los límites permitidos
- ✅ Validación tanto en frontend como backend (doble capa)

### Experiencia de Usuario:
- ✅ Mensajes de error claros y específicos
- ✅ Interfaz muestra los límites permitidos antes de configurar
- ✅ Validación HTML5 previene errores antes de enviar el formulario

### Flexibilidad:
- ✅ Las casas de cambio pueden ser más restrictivas que la plataforma
- ✅ Cada casa mantiene autonomía dentro de los límites permitidos
- ✅ El Super Admin puede ajustar límites globales cuando sea necesario

## 🎯 Respuesta a la Pregunta

**Pregunta:** "¿Significa que cualquier casa de cambio independientemente puede agregar los límites que quiera?"

**Respuesta:** **NO**. Con esta mejora:

1. Las casas de cambio **solo pueden configurar límites dentro del rango** establecido por el Super Admin
2. Pueden ser **más restrictivas** (ej: si la plataforma permite $1-$100k, pueden configurar $100-$10k)
3. **NO pueden ser menos restrictivas** (ej: si la plataforma permite $1-$100k, NO pueden configurar $0.01-$1M)
4. El Super Admin mantiene el **control total** sobre los límites máximos de la plataforma

## 📈 Impacto

- **Seguridad:** Significativamente mejorada ✅
- **Control de plataforma:** Garantizado ✅
- **Autonomía de casas de cambio:** Mantenida dentro de límites seguros ✅
- **Experiencia de usuario:** Mejorada con feedback claro ✅
- **Integridad de datos:** Garantizada con validación en múltiples capas ✅
