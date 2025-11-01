# Arquitectura Modular - Kuberafi

## Estructura del Proyecto

El proyecto ha sido refactorizado hacia un **monolito modular** para mejorar la mantenibilidad, escalabilidad y preparación para una posible migración a microservicios en el futuro.

## Módulos

### 1. Orders (Órdenes)
**Responsabilidad:** Gestión completa del ciclo de vida de órdenes de cambio.

```
app/Modules/Orders/
├── Controllers/
│   └── OrderController.php          # Controller refactorizado (limpio)
├── Services/
│   ├── OrderService.php             # Lógica de negocio de órdenes
│   ├── CommissionCalculator.php     # Cálculo de comisiones
│   └── PaymentMethodSelector.php    # Selección de métodos de pago
└── Models/
    └── Order.php                     # (en app/Models por ahora)
```

**Servicios:**
- `OrderService`: Crear, completar, cancelar órdenes
- `CommissionCalculator`: Calcular comisiones según modelo (percentage, spread, mixed)
- `PaymentMethodSelector`: Selección automática/manual de métodos de pago

### 2. Customers (Clientes/CRM)
**Responsabilidad:** Gestión de clientes y sus actividades.

```
app/Modules/Customers/
├── Services/
│   └── CustomerService.php          # CRUD de clientes, bloqueo, métricas
└── Models/
    ├── Customer.php
    ├── CustomerActivity.php
    └── CustomerBankAccount.php
```

**Servicios:**
- `CustomerService`: Crear, actualizar, bloquear/desbloquear clientes

### 3. Payments (Pagos)
**Responsabilidad:** Gestión de métodos de pago y fondos.

```
app/Modules/Payments/
├── Services/
│   └── PaymentService.php           # Gestión de métodos de pago y balances
└── Models/
    ├── PaymentMethod.php
    ├── OperatorCashBalance.php
    └── CashMovement.php
```

**Servicios:**
- `PaymentService`: Crear métodos de pago, agregar/retirar fondos, consultar balances

### 4. Analytics (Analítica)
**Responsabilidad:** Métricas, reportes y análisis de datos.

```
app/Modules/Analytics/
├── Services/
│   └── AnalyticsService.php         # Métricas del dashboard, reportes
└── Controllers/
    └── AnalyticsController.php      # (existente en ExchangeHouse/)
```

**Servicios:**
- `AnalyticsService`: Dashboard metrics, órdenes por día, top clientes, distribución de comisiones

## Principios de Diseño

### 1. Separación de Responsabilidades
- **Controllers**: Solo manejan HTTP (request/response)
- **Services**: Contienen toda la lógica de negocio
- **Models**: Solo relaciones y scopes básicos

### 2. Inyección de Dependencias
Todos los servicios se registran en `ModuleServiceProvider` como singletons:

```php
$this->app->singleton(OrderService::class);
$this->app->singleton(CommissionCalculator::class);
```

### 3. Transacciones de Base de Datos
Toda operación crítica usa `DB::transaction()` en los servicios.

### 4. Manejo de Errores
Los servicios lanzan excepciones, los controllers las capturan y retornan respuestas apropiadas.

## Ventajas de esta Arquitectura

### ✅ Mantenibilidad
- Código organizado por contexto de negocio
- Fácil encontrar y modificar funcionalidad
- Reducción de código duplicado

### ✅ Testabilidad
- Servicios independientes fáciles de testear
- Mock de dependencias simple
- Tests unitarios por módulo

### ✅ Escalabilidad
- Cada módulo puede crecer independientemente
- Preparado para extraer a microservicios
- Fácil agregar nuevos módulos

### ✅ Reutilización
- Servicios reutilizables en diferentes contextos
- Lógica centralizada
- DRY (Don't Repeat Yourself)

## Migración Gradual

### Fase 1 ✅ (Completada)
- [x] Crear estructura de módulos
- [x] Extraer lógica de Orders a servicios
- [x] Refactorizar OrderController
- [x] Crear servicios para Customers, Payments, Analytics
- [x] Registrar servicios en ModuleServiceProvider

### Fase 2 (Próximos pasos)
- [ ] Mover modelos a sus respectivos módulos
- [ ] Crear eventos y listeners por módulo
- [ ] Implementar DTOs (Data Transfer Objects)
- [ ] Agregar tests unitarios para servicios

### Fase 3 (Futuro)
- [ ] Separación de schemas en BD (schema per module)
- [ ] APIs internas entre módulos
- [ ] Event-driven architecture
- [ ] Preparación para microservicios

## Cómo Usar los Servicios

### Ejemplo: Crear una orden

**Antes (Controller gordo):**
```php
public function store(Request $request) {
    // 200 líneas de lógica aquí
}
```

**Ahora (Controller limpio):**
```php
public function store(Request $request) {
    $validated = $request->validate([...]);
    
    try {
        $order = $this->orderService->createOrder($validated, $user);
        return redirect()->route('orders.index')->with('success', 'Orden creada');
    } catch (\Exception $e) {
        return back()->withErrors(['error' => $e->getMessage()]);
    }
}
```

### Ejemplo: Calcular comisiones

**Antes (en Model):**
```php
$order->calculateCommissions(); // 150 líneas en el modelo
```

**Ahora (Service dedicado):**
```php
$calculation = $this->commissionCalculator->calculate(
    $pivotData,
    $baseAmount,
    'buy',
    $exchangeHouse
);
```

## Monitoreo y Observabilidad

Con esta arquitectura modular, es más fácil implementar:

- **Logs estructurados** por módulo
- **Métricas** por servicio
- **Tracing** de requests entre servicios
- **Health checks** por módulo

## Próximos Módulos a Crear

1. **Commissions** - Gestión de comisiones y pagos
2. **Reports** - Generación de reportes
3. **Notifications** - Sistema de notificaciones
4. **Audit** - Auditoría y logs
5. **Settings** - Configuración del sistema

## Recursos

- [Laravel Service Container](https://laravel.com/docs/container)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Modular Monolith](https://www.kamilgrzybek.com/design/modular-monolith-primer/)
