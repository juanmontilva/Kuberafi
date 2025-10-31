# Mejora en la Exportación de Cierre de Operaciones

## Problema Identificado

La exportación a Excel del cierre de operaciones mostraba todas las ganancias mezcladas en una sola columna "Ganancia Neta", lo que hacía confuso identificar las ganancias por tipo de operación o par de divisas.

## Solución Implementada

### 1. Agrupación por Par de Divisas

Las operaciones ahora se exportan **agrupadas por par de divisas** (USD/VES, VES/ZEL, ZEL/USD, etc.), ordenadas automáticamente para facilitar la lectura.

### 2. Subtotales por Par

Después de cada grupo de operaciones del mismo par, se inserta una fila de **SUBTOTAL** que muestra:

- **Monto Base Total**: Suma de todos los montos base del par
- **Monto Quote Total**: Suma de todos los montos quote del par
- **Comisión $ Total**: Suma de comisiones del operador
- **Comisión Plataforma Total**: Suma de comisiones de la plataforma
- **Ganancia Neta Total**: Suma de ganancias netas del par

**Estilo visual de subtotales:**
- Fondo azul medio (#3B82F6)
- Texto blanco en negrita
- Bordes gruesos para destacar

### 3. Totales Generales

Al final del documento se muestra una fila de **TOTALES GENERALES** que suma todas las operaciones (excluyendo los subtotales para evitar duplicación).

**Estilo visual de totales:**
- Fondo azul oscuro (#1E40AF)
- Texto blanco en negrita
- Bordes gruesos

### 4. Estructura del Excel Mejorado

```
┌─────────────────────────────────────────────────────────────────┐
│ ENCABEZADOS (Azul oscuro)                                       │
├─────────────────────────────────────────────────────────────────┤
│ Operaciones USD/VES                                             │
│ - Orden 1                                                       │
│ - Orden 2                                                       │
│ - Orden 3                                                       │
│ SUBTOTAL USD/VES (Azul medio) ← Suma de USD/VES                │
├─────────────────────────────────────────────────────────────────┤
│ Operaciones VES/ZEL                                             │
│ - Orden 4                                                       │
│ - Orden 5                                                       │
│ SUBTOTAL VES/ZEL (Azul medio) ← Suma de VES/ZEL                │
├─────────────────────────────────────────────────────────────────┤
│ Operaciones ZEL/USD                                             │
│ - Orden 6                                                       │
│ SUBTOTAL ZEL/USD (Azul medio) ← Suma de ZEL/USD                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ TOTALES GENERALES (Azul oscuro) ← Suma de todo                 │
└─────────────────────────────────────────────────────────────────┘
```

## Beneficios

✅ **Claridad**: Fácil identificar ganancias por tipo de operación
✅ **Organización**: Operaciones agrupadas por par de divisas
✅ **Análisis rápido**: Subtotales permiten ver rendimiento por par
✅ **Profesional**: Diseño visual limpio y estructurado
✅ **Precisión**: Totales calculados automáticamente con fórmulas Excel

## Columnas del Reporte

1. **N° Orden**: Identificador único
2. **Fecha**: Fecha de la operación
3. **Hora**: Hora de la operación
4. **Cliente**: Nombre del cliente
5. **Par**: Par de divisas (USD/VES, etc.)
6. **Monto Base**: Cantidad en moneda base
7. **Monto Quote**: Cantidad en moneda quote
8. **Tasa**: Tasa de cambio aplicada
9. **Comisión %**: Porcentaje de comisión
10. **Comisión $**: Comisión del operador en dinero
11. **Comisión Plataforma**: Comisión de la plataforma
12. **Ganancia Neta**: Ganancia final
13. **Estado**: Estado de la operación (Completada, etc.)
14. **Operador**: Nombre del operador
15. **Notas**: Observaciones adicionales

## Cómo Usar

1. Ve a **Cierre de Operaciones**
2. Selecciona el rango de fechas
3. Aplica filtros si es necesario
4. Haz clic en **"Exportar Excel"**
5. El archivo descargado tendrá la nueva estructura organizada

## Ejemplo Visual

**Antes:**
```
Todas las operaciones mezcladas
Ganancia: $4,404.99 (¿de qué pares?)
```

**Ahora:**
```
USD/VES
  - Operación 1: $1,249.99
  - Operación 2: $1,575.00
  SUBTOTAL USD/VES: $2,824.99

VES/ZEL
  - Operación 3: $1,575.00
  SUBTOTAL VES/ZEL: $1,575.00

ZEL/USD
  - Operación 4: $5.00
  SUBTOTAL ZEL/USD: $5.00

TOTALES GENERALES: $4,404.99
```

## Archivos Modificados

- `app/Exports/OperationClosureExport.php`: Lógica de exportación mejorada
  - Método `collection()`: Ordena por par de divisas
  - Método `addCurrencyPairSubtotals()`: Agrega subtotales por par
  - Método `registerEvents()`: Aplica formato y estilos
  - Método `addSummaryTable()`: Crea tabla resumen ejecutiva

## Notas Técnicas

- Los subtotales se insertan dinámicamente usando `insertNewRowBefore()`
- Las fórmulas Excel usan `SUMIF()` para evitar contar subtotales en totales
- El formato se aplica después de insertar los datos para mantener consistencia
- Los colores siguen la paleta del sistema (azules profesionales)
- La tabla resumen no incluye totales para evitar sumar monedas diferentes
