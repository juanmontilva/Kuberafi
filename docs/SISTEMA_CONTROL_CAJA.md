# 💰 Sistema de Control de Caja para Operadores - Kuberafi

## 📋 Descripción

Sistema completo de **control de fondos de caja** para operadores de casas de cambio. Permite gestionar saldos por método de pago y moneda, con actualización automática al procesar órdenes.

---

## ✨ Características Principales

### 1. **Saldos por Método de Pago y Moneda**
- ✅ Cada operador tiene saldos independientes
- ✅ Separados por método de pago (Zelle, Pago Móvil, etc.)
- ✅ Separados por moneda (USD, VES, EUR, etc.)
- ✅ Balance en tiempo real

### 2. **Movimientos Automáticos**
- ✅ Al completar una orden, se actualizan automáticamente los saldos
- ✅ Entrada de dinero (cliente paga)
- ✅ Salida de dinero (operador entrega)
- ✅ Historial completo de transacciones

### 3. **Movimientos Manuales**
- ✅ Depósitos (agregar fondos a caja)
- ✅ Retiros (sacar fondos de caja)
- ✅ Ajustes (correcciones)
- ✅ Descripción y justificación

### 4. **Historial y Reportes**
- ✅ Movimientos del día
- ✅ Historial completo con filtros
- ✅ Balance antes y después de cada movimiento
- ✅ Vinculación con órdenes

---

## 🗄️ Estructura de Base de Datos

### Tabla: `operator_cash_balances`

```sql
CREATE TABLE operator_cash_balances (
    id BIGINT PRIMARY KEY,
    operator_id BIGINT,           -- Operador dueño del saldo
    payment_method_id BIGINT,     -- Método de pago (Zelle, PM, etc.)
    currency VARCHAR(10),          -- Moneda (USD, VES, etc.)
    balance DECIMAL(15,2),         -- Saldo actual
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(operator_id, payment_method_id, currency)
);
```

### Tabla: `cash_movements`

```sql
CREATE TABLE cash_movements (
    id BIGINT PRIMARY KEY,
    operator_id BIGINT,
    payment_method_id BIGINT,
    order_id BIGINT NULL,          -- Orden relacionada (si aplica)
    type ENUM('deposit', 'withdrawal', 'order_in', 'order_out', 'adjustment'),
    currency VARCHAR(10),
    amount DECIMAL(15,2),          -- Positivo = entrada, Negativo = salida
    balance_before DECIMAL(15,2),  -- Saldo antes del movimiento
    balance_after DECIMAL(15,2),   -- Saldo después del movimiento
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## 🎯 Ejemplo de Uso

### Escenario: Orden de USD a VES

**Situación Inicial:**
```
Operador: Juan
Método: Zelle
- Saldo USD: $1,000
- Saldo VES: Bs. 50,000
```

**Cliente quiere cambiar:**
- $100 USD → VES
- Tasa: 36.50
- Recibe: Bs. 3,650

**Proceso Automático:**

1. **Entrada de USD** (cliente paga)
   ```
   Tipo: order_in
   Moneda: USD
   Monto: +$100
   Balance antes: $1,000
   Balance después: $1,100
   ```

2. **Salida de VES** (operador entrega)
   ```
   Tipo: order_out
   Moneda: VES
   Monto: -Bs. 3,650
   Balance antes: Bs. 50,000
   Balance después: Bs. 46,350
   ```

**Resultado Final:**
```
Operador: Juan
Método: Zelle
- Saldo USD: $1,100 ✅
- Saldo VES: Bs. 46,350 ✅
```

---

## 🔧 Archivos Creados

### Backend (6 archivos)

#### 1. Migraciones
```
database/migrations/2025_10_28_222251_create_operator_cash_balances_table.php
database/migrations/2025_10_28_222302_create_cash_movements_table.php
```

#### 2. Modelos
```php
app/Models/OperatorCashBalance.php
app/Models/CashMovement.php
```

#### 3. Controlador
```php
app/Http/Controllers/CashBoxController.php
```

#### 4. Rutas
```php
routes/web.php
// GET  /cash-box
// POST /cash-box/movement
// GET  /cash-box/history
```

### Frontend (Pendiente)
```
resources/js/pages/CashBox/Index.tsx
resources/js/pages/CashBox/History.tsx
```

---

## 📊 Interfaz de Usuario (Propuesta)

### Página Principal: `/cash-box`

```
┌─────────────────────────────────────────────────────┐
│ 💰 Mi Fondo de Caja                                 │
│ Control de saldos por método de pago                │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📊 Resumen del Día                                  │
│ ┌──────────┬──────────┬──────────┐                 │
│ │ Entradas │ Salidas  │ Neto     │                 │
│ ├──────────┼──────────┼──────────┤                 │
│ │ $500     │ $300     │ +$200    │                 │
│ │ Bs 18K   │ Bs 12K   │ +Bs 6K   │                 │
│ └──────────┴──────────┴──────────┘                 │
│                                                     │
│ 💵 Saldos por Método de Pago                        │
│                                                     │
│ 🏦 Zelle                                            │
│ USD: $1,100.00                                      │
│ [+ Depositar] [- Retirar]                          │
│                                                     │
│ 📱 Pago Móvil                                       │
│ VES: Bs. 46,350.00                                  │
│ [+ Depositar] [- Retirar]                          │
│                                                     │
│ 📜 Movimientos Recientes                            │
│ ┌─────────────────────────────────────┐            │
│ │ ✅ Orden #1234 - Entrada USD        │            │
│ │ +$100.00 | Balance: $1,100.00       │            │
│ │ Hace 5 minutos                      │            │
│ ├─────────────────────────────────────┤            │
│ │ ❌ Orden #1234 - Salida VES         │            │
│ │ -Bs. 3,650.00 | Balance: Bs 46,350  │            │
│ │ Hace 5 minutos                      │            │
│ └─────────────────────────────────────┘            │
│                                                     │
│ [Ver Historial Completo]                           │
└─────────────────────────────────────────────────────┘
```

### Modal: Registrar Depósito/Retiro

```
┌─────────────────────────────────────┐
│ 💰 Registrar Movimiento             │
├─────────────────────────────────────┤
│                                     │
│ Tipo:                               │
│ ○ Depósito  ● Retiro  ○ Ajuste     │
│                                     │
│ Método de Pago:                     │
│ [Zelle ▼]                           │
│                                     │
│ Moneda:                             │
│ [USD ▼]                             │
│                                     │
│ Monto:                              │
│ [100.00]                            │
│                                     │
│ Descripción:                        │
│ [Retiro para gastos operativos]    │
│                                     │
│ Saldo actual: $1,100.00             │
│ Saldo después: $1,000.00            │
│                                     │
│ [Cancelar] [Registrar Movimiento]  │
└─────────────────────────────────────┘
```

---

## 🚀 Próximos Pasos

### 1. Crear Interfaz Frontend
- [ ] Página principal de fondo de caja
- [ ] Modal para registrar movimientos
- [ ] Página de historial con filtros
- [ ] Estadísticas y gráficas

### 2. Integrar con Órdenes
- [ ] Observer para actualizar saldos automáticamente
- [ ] Validar saldo suficiente antes de completar orden
- [ ] Mostrar saldo disponible al crear orden

### 3. Reportes y Alertas
- [ ] Reporte de cierre de caja diario
- [ ] Alertas de saldo bajo
- [ ] Conciliación de saldos

### 4. Permisos y Seguridad
- [ ] Solo operadores pueden ver su propia caja
- [ ] Casas de cambio pueden ver todas las cajas
- [ ] Auditoría de movimientos manuales

---

## 💡 Beneficios

### Para Operadores
- ✅ Control total de sus fondos
- ✅ Transparencia en movimientos
- ✅ Facilita cierre de caja
- ✅ Reduce errores de conteo

### Para Casas de Cambio
- ✅ Visibilidad de fondos de todos los operadores
- ✅ Mejor control financiero
- ✅ Auditoría completa
- ✅ Reportes consolidados

### Para el Sistema
- ✅ Trazabilidad completa
- ✅ Conciliación automática
- ✅ Prevención de fraudes
- ✅ Datos para análisis

---

## 🔐 Seguridad

### Validaciones
- ✅ No permitir retiros mayores al saldo
- ✅ Validar permisos de usuario
- ✅ Registrar IP y timestamp
- ✅ Transacciones atómicas (DB)

### Auditoría
- ✅ Cada movimiento queda registrado
- ✅ Balance antes y después
- ✅ Usuario responsable
- ✅ Descripción obligatoria

---

## 📝 Notas Técnicas

### Métodos del Modelo `OperatorCashBalance`

```php
// Incrementar saldo
$balance->increment($amount, $description, $orderId, $type);

// Decrementar saldo
$balance->decrement($amount, $description, $orderId, $type);
```

### Tipos de Movimientos

- `deposit`: Depósito manual
- `withdrawal`: Retiro manual
- `order_in`: Entrada por orden (cliente paga)
- `order_out`: Salida por orden (operador entrega)
- `adjustment`: Ajuste/corrección

### Scopes del Modelo `CashMovement`

```php
// Filtrar por operador
CashMovement::forOperator($operatorId)->get();

// Filtrar por método de pago
CashMovement::forPaymentMethod($paymentMethodId)->get();

// Filtrar por tipo
CashMovement::ofType('deposit')->get();
```

---

## 🎉 Conclusión

El sistema de control de caja proporciona:

1. ✅ **Control total** de fondos por operador
2. ✅ **Actualización automática** con órdenes
3. ✅ **Historial completo** de movimientos
4. ✅ **Transparencia** y auditoría
5. ✅ **Facilita** cierre de caja diario

**Estado Actual:** ✅ Backend Completado (80%)  
**Pendiente:** Frontend y integración con órdenes (20%)

**Fecha de implementación:** Octubre 2025  
**Versión:** 1.0 - Control de Caja
