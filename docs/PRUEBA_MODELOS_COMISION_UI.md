# 🧪 Guía de Prueba: Modelos de Comisión (UI)

## ✅ Pre-requisitos

1. Estar logueado como **Casa de Cambio** u **Operador**
2. Tener al menos un par de divisas creado por el administrador
3. Base de datos con las migraciones aplicadas

## 📋 Pasos de Prueba

### 1. Acceder a la Configuración

#### Opción A: Desde el Menú
1. Abrir el menú lateral
2. Click en **Configuración**
3. Click en **Modelos de Comisión**
4. ✅ Deberías ver la página de configuración

#### Opción B: Desde Pares de Divisas
1. Ir a **Configuración → Pares de Divisas**
2. Click en el botón verde **"Modelos de Comisión"** (arriba a la derecha)
3. ✅ Deberías ver la página de configuración

#### Opción C: URL Directa
1. Navegar a `/currency-pairs-config`
2. ✅ Deberías ver la página de configuración

---

## 🧪 Pruebas por Modelo

### Prueba 1: Modelo Porcentaje Fijo

#### Configurar
1. En "Pares Disponibles", click en **"Configurar"** en un par (ej: USD/VES)
2. Seleccionar **📊 Porcentaje Fijo**
3. Ingresar comisión: `5` (5%)
4. Ingresar monto mínimo: `10`
5. Ingresar monto máximo: `10000`
6. ✅ Ver vista previa: "Ganancia estimada: 5.00 VES" (para 100 unidades)
7. Click en **"Guardar Configuración"**

#### Verificar
1. ✅ El par aparece en "Mis Pares Configurados"
2. ✅ Muestra: "📊 Porcentaje: 5%"
3. ✅ Estado: "Activo"
4. ✅ Límites: "10 - 10000"

#### Editar
1. Click en **"Editar"**
2. Cambiar comisión a `7.5`
3. ✅ Vista previa actualiza a: "7.50 VES"
4. Click en **"Guardar Configuración"**
5. ✅ Se actualiza correctamente

---

### Prueba 2: Modelo Spread (Compra/Venta)

#### Configurar
1. Click en **"Configurar"** en otro par (ej: USD/EUR)
2. Seleccionar **💱 Spread (Compra/Venta)**
3. Ingresar tasa de compra: `290`
4. Ingresar tasa de venta: `295`
5. ✅ Ver cálculo automático: "Spread: 5.00 puntos (1.72%)"
6. Ingresar monto mínimo: `50`
7. Ingresar monto máximo: `5000`
8. ✅ Ver vista previa: "Ganancia estimada: 500.00 EUR"
9. Click en **"Guardar Configuración"**

#### Verificar
1. ✅ El par aparece en "Mis Pares Configurados"
2. ✅ Muestra: "💱 Spread: Compra: 290 | Venta: 295 (1.72%)"
3. ✅ Estado: "Activo"

#### Validación de Error
1. Click en **"Editar"**
2. Cambiar tasa de venta a `280` (menor que compra)
3. Click en **"Guardar Configuración"**
4. ✅ Debe mostrar error: "La tasa de venta debe ser mayor que la tasa de compra"

---

### Prueba 3: Modelo Mixto

#### Configurar
1. Click en **"Configurar"** en otro par (ej: USDT/VES)
2. Seleccionar **🔀 Mixto (Spread + Porcentaje)**
3. Ingresar tasa de compra: `36.20`
4. Ingresar tasa de venta: `36.50`
5. ✅ Ver spread: "0.30 puntos"
6. Ingresar comisión adicional: `2` (2%)
7. Ingresar monto mínimo: `10`
8. Ingresar monto máximo: `50000`
9. ✅ Ver vista previa: "Ganancia estimada: 103.00 VES"
   - Spread: 100 × 0.30 = 30 VES
   - Comisión: 100 × 2% × 36.50 = 73 VES
   - Total: 103 VES
10. Click en **"Guardar Configuración"**

#### Verificar
1. ✅ El par aparece en "Mis Pares Configurados"
2. ✅ Muestra: "🔀 Mixto: Spread: 36.20/36.50 + 2%"
3. ✅ Estado: "Activo"

---

## 🔄 Pruebas de Funcionalidad

### Prueba 4: Activar/Desactivar Par

1. En un par configurado, click en el botón **⚡ (Power)**
2. ✅ El estado cambia a "Inactivo"
3. ✅ El badge cambia de verde a gris
4. Click nuevamente en **⚡**
5. ✅ El estado vuelve a "Activo"
6. ✅ La configuración se mantiene intacta

### Prueba 5: Cambiar de Modelo

1. Editar un par con modelo "Porcentaje"
2. Cambiar a modelo "Spread"
3. Ingresar tasas de compra y venta
4. ✅ Los campos de porcentaje desaparecen
5. ✅ Aparecen campos de spread
6. Guardar
7. ✅ El par ahora muestra el nuevo modelo

### Prueba 6: Vista Previa en Tiempo Real

1. Editar cualquier par
2. Cambiar valores de comisión o tasas
3. ✅ La vista previa se actualiza automáticamente
4. ✅ Los cálculos son correctos

---

## 🎯 Pruebas de Validación

### Validación 1: Campos Requeridos

#### Modelo Porcentaje
1. Seleccionar modelo Porcentaje
2. Dejar campo de comisión vacío
3. Click en "Guardar"
4. ✅ Debe mostrar error de validación

#### Modelo Spread
1. Seleccionar modelo Spread
2. Dejar tasa de compra vacía
3. Click en "Guardar"
4. ✅ Debe mostrar error de validación

#### Modelo Mixto
1. Seleccionar modelo Mixto
2. Dejar comisión adicional vacía
3. Click en "Guardar"
4. ✅ Debe mostrar error de validación

### Validación 2: Rangos de Valores

1. Intentar ingresar comisión de `150%`
2. ✅ Debe rechazar o mostrar error (máximo 100%)
3. Intentar ingresar tasa negativa
4. ✅ Debe rechazar (mínimo 0)

---

## 📊 Prueba de Integración con Órdenes

### Crear Orden con Modelo Configurado

1. Ir a **Órdenes → Crear Orden**
2. Seleccionar un par configurado con modelo Spread
3. Ingresar monto: `100`
4. ✅ Verificar que use las tasas configuradas
5. Crear la orden
6. ✅ La orden debe guardarse con el modelo correcto

### Verificar en Base de Datos (Opcional)

```sql
-- Ver configuración del par
SELECT 
    cp.symbol,
    ehcp.commission_model,
    ehcp.commission_percent,
    ehcp.buy_rate,
    ehcp.sell_rate
FROM exchange_house_currency_pair ehcp
JOIN currency_pairs cp ON cp.id = ehcp.currency_pair_id
WHERE ehcp.exchange_house_id = [TU_ID];

-- Ver orden creada
SELECT 
    order_number,
    commission_model,
    buy_rate,
    sell_rate,
    house_commission_amount,
    spread_profit
FROM orders
ORDER BY created_at DESC
LIMIT 1;
```

---

## ✅ Checklist de Pruebas

### Navegación
- [ ] Acceso desde menú lateral
- [ ] Acceso desde botón en Pares de Divisas
- [ ] Acceso por URL directa

### Modelo Porcentaje
- [ ] Configurar nuevo par
- [ ] Editar configuración
- [ ] Vista previa correcta
- [ ] Validación de campos

### Modelo Spread
- [ ] Configurar nuevo par
- [ ] Cálculo de spread automático
- [ ] Validación: venta > compra
- [ ] Vista previa correcta

### Modelo Mixto
- [ ] Configurar nuevo par
- [ ] Ambos campos visibles
- [ ] Cálculo combinado correcto
- [ ] Vista previa correcta

### Funcionalidades
- [ ] Activar/Desactivar par
- [ ] Cambiar entre modelos
- [ ] Actualizar límites
- [ ] Cancelar edición

### Integración
- [ ] Crear orden con modelo configurado
- [ ] Verificar cálculos en orden
- [ ] Datos guardados correctamente

---

## 🐛 Problemas Comunes

### No veo el menú "Modelos de Comisión"
**Solución**: Refrescar la página o limpiar caché del navegador

### Error al guardar configuración
**Solución**: Verificar que todos los campos requeridos estén llenos según el modelo

### Vista previa muestra 0
**Solución**: Asegurarse de que los valores ingresados sean válidos y mayores a 0

### No aparecen pares disponibles
**Solución**: El administrador debe crear pares de divisas primero en el panel admin

---

## 🎉 Resultado Esperado

Al completar todas las pruebas:

1. ✅ Puedes configurar pares con cualquiera de los 3 modelos
2. ✅ Los cálculos son correctos y se muestran en tiempo real
3. ✅ Las validaciones funcionan correctamente
4. ✅ Puedes activar/desactivar pares sin perder configuración
5. ✅ Las órdenes usan el modelo configurado
6. ✅ La interfaz es intuitiva y fácil de usar

**¡El sistema está listo para producción!** 🚀
