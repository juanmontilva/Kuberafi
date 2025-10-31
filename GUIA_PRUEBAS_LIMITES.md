# 🧪 Guía de Pruebas: Validación de Límites de Pares

## 📍 Acceso a la Gestión de Pares (Super Admin)

### 1. Iniciar sesión como Super Admin
```
URL: http://127.0.0.1:8000/login
Email: admin@kuberafi.com
Password: password
```

### 2. Navegar a Pares de Divisas
```
Ruta directa: http://127.0.0.1:8000/admin/currency-pairs
O desde el menú: Admin → Pares de Divisas
```

## 🎯 Escenarios de Prueba

### Escenario 1: Configurar límites restrictivos desde Super Admin

**Objetivo:** Establecer límites que las casas de cambio deben respetar

**Pasos:**
1. Como Super Admin, edita el par **ZEL/USD** (clic en el ícono de lápiz)
2. Configura:
   - **Monto Mínimo Global:** `50.00`
   - **Monto Máximo Global:** `5000.00`
3. Guarda los cambios
4. Observa el mensaje: "⚠️ Este par está siendo usado por X casa(s) de cambio"

**Resultado esperado:** ✅ Los límites se actualizan correctamente

---

### Escenario 2: Casa de cambio intenta configurar límites válidos

**Objetivo:** Verificar que se aceptan límites dentro del rango

**Pasos:**
1. Cierra sesión del Super Admin
2. Inicia sesión como Casa de Cambio:
   ```
   Email: maria@cambioexpress.com
   Password: password
   ```
3. Ve a: **Mis Pares de Divisas** (`/currency-pairs`)
4. Edita el par **ZEL/USD**
5. Intenta configurar:
   - **Tu Monto Mínimo:** `100.00` (mayor al mínimo de la plataforma: 50)
   - **Tu Monto Máximo:** `3000.00` (menor al máximo de la plataforma: 5000)
6. Guarda los cambios

**Resultado esperado:** ✅ Se guarda correctamente
**Mensaje:** "Configuración actualizada para ZEL/USD"

---

### Escenario 3: Casa de cambio intenta mínimo muy bajo (DEBE FALLAR)

**Objetivo:** Verificar que se rechaza un mínimo menor al permitido

**Pasos:**
1. Como Casa de Cambio (maria@cambioexpress.com)
2. Edita el par **ZEL/USD**
3. Intenta configurar:
   - **Tu Monto Mínimo:** `10.00` (menor al mínimo de la plataforma: 50)
   - **Tu Monto Máximo:** `3000.00`
4. Intenta guardar

**Resultado esperado:** ❌ Error
**Mensaje:** "El monto mínimo no puede ser menor a 50 (límite establecido por la plataforma)"

---

### Escenario 4: Casa de cambio intenta máximo muy alto (DEBE FALLAR)

**Objetivo:** Verificar que se rechaza un máximo mayor al permitido

**Pasos:**
1. Como Casa de Cambio (maria@cambioexpress.com)
2. Edita el par **ZEL/USD**
3. Intenta configurar:
   - **Tu Monto Mínimo:** `100.00`
   - **Tu Monto Máximo:** `10000.00` (mayor al máximo de la plataforma: 5000)
4. Intenta guardar

**Resultado esperado:** ❌ Error
**Mensaje:** "El monto máximo no puede ser mayor a 5000 (límite establecido por la plataforma)"

---

### Escenario 5: Casa de cambio intenta mínimo mayor al máximo (DEBE FALLAR)

**Objetivo:** Verificar validación de coherencia interna

**Pasos:**
1. Como Casa de Cambio (maria@cambioexpress.com)
2. Edita el par **ZEL/USD**
3. Intenta configurar:
   - **Tu Monto Mínimo:** `4000.00`
   - **Tu Monto Máximo:** `3000.00` (menor al mínimo)
4. Intenta guardar

**Resultado esperado:** ❌ Error
**Mensaje:** "El monto mínimo no puede ser mayor al monto máximo"

---

### Escenario 6: Agregar un nuevo par desde Casa de Cambio

**Objetivo:** Verificar validación al agregar pares

**Pasos:**
1. Como Casa de Cambio (maria@cambioexpress.com)
2. Ve a: **Mis Pares de Divisas** (`/currency-pairs`)
3. En "Pares Disponibles", busca un par que no tengas configurado (ej: **EUR/VES**)
4. Haz clic en **Agregar**
5. Observa el mensaje azul que muestra los límites de la plataforma
6. Intenta configurar:
   - **Margen:** `5.0`
   - **Tu Monto Mínimo:** `5.00` (si el mínimo de la plataforma es mayor, debería fallar)
   - **Tu Monto Máximo:** `1000.00`
7. Intenta agregar

**Resultado esperado:** 
- ✅ Si los límites están dentro del rango: Se agrega correctamente
- ❌ Si están fuera del rango: Error con mensaje claro

---

### Escenario 7: Verificar límites en creación de órdenes

**Objetivo:** Confirmar que los límites de la casa se usan en órdenes

**Pasos:**
1. Como Casa de Cambio (maria@cambioexpress.com)
2. Ve a: **Órdenes** → **Nueva Orden** (`/orders/create`)
3. Selecciona el par **ZEL/USD**
4. Observa el mensaje de límites que aparece
5. Verifica que muestre los límites que TÚ configuraste (no los del Super Admin)

**Resultado esperado:** ✅ Muestra tus límites personalizados
**Ejemplo:** "Límites: $100.00 - $3000.00" (tus límites, no los de la plataforma)

---

## 🔍 Verificación en Base de Datos

Si quieres verificar directamente en la base de datos:

```bash
php artisan tinker --execute="
// Ver límites globales del par
\$pair = \App\Models\CurrencyPair::where('symbol', 'ZEL/USD')->first();
echo 'Límites globales (Super Admin):\n';
echo '  Min: ' . \$pair->min_amount . '\n';
echo '  Max: ' . \$pair->max_amount . '\n\n';

// Ver límites de una casa específica
\$house = \App\Models\ExchangeHouse::where('name', 'CambioExpress')->first();
\$pivot = \$house->currencyPairs()->where('currency_pair_id', \$pair->id)->first();
if (\$pivot) {
    echo 'Límites de CambioExpress (Pivot):\n';
    echo '  Min: ' . \$pivot->pivot->min_amount . '\n';
    echo '  Max: ' . \$pivot->pivot->max_amount . '\n';
}
"
```

---

## 📊 Matriz de Pruebas

| Escenario | Límite Plataforma | Límite Casa | Resultado Esperado |
|-----------|-------------------|-------------|-------------------|
| 1 | Min: 50, Max: 5000 | Min: 100, Max: 3000 | ✅ Válido |
| 2 | Min: 50, Max: 5000 | Min: 50, Max: 5000 | ✅ Válido (igual) |
| 3 | Min: 50, Max: 5000 | Min: 10, Max: 3000 | ❌ Mínimo muy bajo |
| 4 | Min: 50, Max: 5000 | Min: 100, Max: 10000 | ❌ Máximo muy alto |
| 5 | Min: 50, Max: 5000 | Min: 4000, Max: 3000 | ❌ Min > Max |
| 6 | Min: 50, Max: 5000 | Min: 1000, Max: 2000 | ✅ Válido (más restrictivo) |

---

## 🎨 Elementos Visuales a Verificar

### En la interfaz del Super Admin:
- ✅ Mensaje amarillo: "⚠️ Este par está siendo usado por X casa(s)"
- ✅ Sección azul: "🔒 Límites de la Plataforma"
- ✅ Textos de ayuda bajo cada campo

### En la interfaz de Casa de Cambio:
- ✅ Sección azul: "📋 Límites de la plataforma para este par"
- ✅ Texto: "Tus límites deben estar dentro de este rango"
- ✅ Textos de ayuda: "Mínimo permitido: $X" y "Máximo permitido: $X"
- ✅ Atributos HTML5 `min` y `max` en los inputs

---

## 🐛 Qué buscar (Posibles Problemas)

1. **Validación solo en frontend:** Intenta enviar el formulario usando herramientas de desarrollador del navegador modificando los valores. La validación del backend debe rechazarlo.

2. **Mensajes de error poco claros:** Los mensajes deben indicar claramente cuál es el límite de la plataforma.

3. **Límites no actualizados:** Después de que el Super Admin cambie los límites, las casas de cambio deben ver los nuevos límites inmediatamente.

4. **Órdenes con límites incorrectos:** Al crear una orden, debe usar los límites de la casa, no los globales.

---

## ✅ Checklist de Validación

- [ ] Super Admin puede editar límites globales
- [ ] Casa de cambio ve los límites de la plataforma antes de configurar
- [ ] Casa de cambio puede configurar límites dentro del rango ✅
- [ ] Casa de cambio NO puede configurar mínimo menor al permitido ❌
- [ ] Casa de cambio NO puede configurar máximo mayor al permitido ❌
- [ ] Casa de cambio NO puede configurar mínimo > máximo ❌
- [ ] Validación funciona tanto en agregar como en editar
- [ ] Validación funciona en backend (no solo frontend)
- [ ] Mensajes de error son claros y específicos
- [ ] Creación de órdenes usa límites de la casa, no globales

---

## 🚀 Comandos Útiles

```bash
# Ver todos los pares y sus límites
php artisan tinker --execute="
\App\Models\CurrencyPair::all()->each(function(\$p) {
    echo \$p->symbol . ' - Min: ' . \$p->min_amount . ' Max: ' . \$p->max_amount . '\n';
});
"

# Resetear límites de un par
php artisan tinker --execute="
\$pair = \App\Models\CurrencyPair::where('symbol', 'ZEL/USD')->first();
\$pair->update(['min_amount' => 1, 'max_amount' => 100000]);
echo 'Límites reseteados\n';
"

# Ver configuración de una casa específica
php artisan tinker --execute="
\$house = \App\Models\ExchangeHouse::where('name', 'CambioExpress')->first();
\$house->currencyPairs->each(function(\$p) {
    echo \$p->symbol . ' - Min: ' . \$p->pivot->min_amount . ' Max: ' . \$p->pivot->max_amount . '\n';
});
"
```
