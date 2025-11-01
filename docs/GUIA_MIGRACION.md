# Guía de Migración a Arquitectura Modular

## ✅ Completado (Fase 1)

### Estructura Creada
- [x] `app/Modules/Orders/` - Módulo de órdenes completo
- [x] `app/Modules/Customers/` - Servicio de clientes
- [x] `app/Modules/Payments/` - Servicio de pagos
- [x] `app/Modules/Analytics/` - Servicio de analytics
- [x] `app/Providers/ModuleServiceProvider.php` - Provider registrado

### Servicios Implementados
- [x] `OrderService` - Lógica completa de órdenes
- [x] `CommissionCalculator` - Cálculo de comisiones (3 modelos)
- [x] `PaymentMethodSelector` - Selección de métodos de pago
- [x] `CustomerService` - CRUD de clientes
- [x] `PaymentService` - Gestión de fondos
- [x] `AnalyticsService` - Métricas y reportes

### Controllers Refactorizados
- [x] `OrderController` - Ahora usa servicios, 70% menos código
- [x] Rutas actualizadas en `routes/web.php`

### Documentación
- [x] `docs/ARQUITECTURA_MODULAR.md` - Arquitectura completa
- [x] `README.md` - Actualizado con nueva estructura

## 🔄 Próximos Pasos (Fase 2)

### 1. Refactorizar Controllers Restantes

#### CustomerController
```bash
# Ubicación actual
app/Http/Controllers/ExchangeHouse/CustomerController.php

# Nueva ubicación
app/Modules/Customers/Controllers/CustomerController.php
```

**Tareas:**
- [ ] Mover controller a módulo
- [ ] Inyectar `CustomerService`
- [ ] Extraer lógica a servicio
- [ ] Actualizar rutas

#### PaymentMethodController
```bash
# Ubicación actual
app/Http/Controllers/ExchangeHouse/PaymentMethodController.php

# Nueva ubicación
app/Modules/Payments/Controllers/PaymentMethodController.php
```

**Tareas:**
- [ ] Mover controller a módulo
- [ ] Inyectar `PaymentService`
- [ ] Extraer lógica a servicio
- [ ] Actualizar rutas

#### CashBoxController
```bash
# Ubicación actual
app/Http/Controllers/CashBoxController.php

# Nueva ubicación
app/Modules/Payments/Controllers/CashBoxController.php
```

**Tareas:**
- [ ] Mover controller a módulo
- [ ] Usar `PaymentService`
- [ ] Actualizar rutas

### 2. Crear Módulos Adicionales

#### Módulo Commissions
```bash
app/Modules/Commissions/
├── Controllers/
│   └── CommissionController.php
├── Services/
│   └── CommissionService.php
└── Models/
    ├── Commission.php
    └── CommissionPayment.php
```

**Responsabilidad:** Gestión de comisiones y pagos a casas de cambio

#### Módulo Reports
```bash
app/Modules/Reports/
├── Controllers/
│   └── ReportController.php
├── Services/
│   └── ReportService.php
└── Exports/
    ├── OrdersExport.php
    └── OperationClosureExport.php
```

**Responsabilidad:** Generación y exportación de reportes

#### Módulo Notifications
```bash
app/Modules/Notifications/
├── Controllers/
│   └── NotificationController.php
├── Services/
│   └── NotificationService.php
└── Channels/
    └── TelegramChannel.php
```

**Responsabilidad:** Sistema de notificaciones multi-canal

### 3. Implementar Eventos y Listeners

#### Orders Module
```php
// app/Modules/Orders/Events/OrderCreated.php
class OrderCreated {
    public function __construct(public Order $order) {}
}

// app/Modules/Orders/Listeners/CalculateCommissions.php
class CalculateCommissions {
    public function handle(OrderCreated $event) {
        // Calcular comisiones
    }
}

// app/Modules/Orders/Listeners/UpdateCustomerMetrics.php
class UpdateCustomerMetrics {
    public function handle(OrderCreated $event) {
        // Actualizar métricas del cliente
    }
}
```

**Ventajas:**
- Desacoplamiento total entre módulos
- Fácil agregar nuevas funcionalidades
- Testeable independientemente

### 4. Crear DTOs (Data Transfer Objects)

```php
// app/Modules/Orders/DTOs/CreateOrderDTO.php
class CreateOrderDTO {
    public function __construct(
        public int $currencyPairId,
        public float $baseAmount,
        public ?int $customerId,
        public string $paymentMethodSelectionMode,
        public ?int $paymentMethodInId,
        public ?int $paymentMethodOutId,
        public ?string $notes,
    ) {}
    
    public static function fromRequest(Request $request): self {
        return new self(
            currencyPairId: $request->input('currency_pair_id'),
            baseAmount: $request->input('base_amount'),
            customerId: $request->input('customer_id'),
            paymentMethodSelectionMode: $request->input('payment_method_selection_mode'),
            paymentMethodInId: $request->input('payment_method_in_id'),
            paymentMethodOutId: $request->input('payment_method_out_id'),
            notes: $request->input('notes'),
        );
    }
}
```

**Uso:**
```php
public function store(Request $request) {
    $dto = CreateOrderDTO::fromRequest($request);
    $order = $this->orderService->createOrder($dto, $user);
}
```

### 5. Agregar Tests

#### Test de Servicio
```php
// tests/Unit/Modules/Orders/Services/CommissionCalculatorTest.php
class CommissionCalculatorTest extends TestCase {
    public function test_calculates_percentage_commission() {
        $calculator = new CommissionCalculator();
        
        $result = $calculator->calculate(
            $pivotData,
            100,
            'buy',
            $exchangeHouse
        );
        
        $this->assertEquals(2, $result['commission_amount']);
    }
}
```

#### Test de Integración
```php
// tests/Feature/Modules/Orders/OrderCreationTest.php
class OrderCreationTest extends TestCase {
    public function test_creates_order_successfully() {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)
            ->post('/orders', [
                'currency_pair_id' => 1,
                'base_amount' => 100,
                // ...
            ]);
        
        $response->assertRedirect('/orders');
        $this->assertDatabaseHas('orders', [
            'base_amount' => 100,
        ]);
    }
}
```

## 📋 Checklist de Migración

### Controllers
- [x] OrderController
- [ ] CustomerController
- [ ] PaymentMethodController
- [ ] CashBoxController
- [ ] CommissionPaymentController
- [ ] AnalyticsController
- [ ] DashboardController

### Servicios
- [x] OrderService
- [x] CommissionCalculator
- [x] PaymentMethodSelector
- [x] CustomerService
- [x] PaymentService
- [x] AnalyticsService
- [ ] CommissionService
- [ ] ReportService
- [ ] NotificationService

### Eventos
- [ ] OrderCreated
- [ ] OrderCompleted
- [ ] OrderCancelled
- [ ] CustomerCreated
- [ ] PaymentReceived

### Tests
- [ ] OrderService tests
- [ ] CommissionCalculator tests
- [ ] CustomerService tests
- [ ] PaymentService tests
- [ ] Integration tests

## 🎯 Objetivos de Rendimiento

### Antes de la Refactorización
- Controllers con 200-500 líneas
- Lógica duplicada en múltiples lugares
- Difícil de testear
- Acoplamiento alto

### Después de la Refactorización
- Controllers con 50-100 líneas
- Lógica centralizada en servicios
- 100% testeable
- Bajo acoplamiento

## 🚀 Cómo Continuar

### Opción 1: Migración Gradual (Recomendado)
1. Refactoriza un controller a la vez
2. Mantén ambas versiones funcionando
3. Prueba exhaustivamente
4. Elimina código viejo cuando estés seguro

### Opción 2: Migración Completa
1. Crea todos los módulos de una vez
2. Migra todos los controllers
3. Actualiza todas las rutas
4. Testing masivo

## 📚 Recursos

- [Laravel Service Container](https://laravel.com/docs/container)
- [Event-Driven Architecture](https://laravel.com/docs/events)
- [Repository Pattern](https://designpatternsphp.readthedocs.io/en/latest/More/Repository/README.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

## 💡 Tips

1. **No migres todo de una vez** - Hazlo gradualmente
2. **Escribe tests primero** - Asegura que todo funciona
3. **Mantén compatibilidad** - No rompas funcionalidad existente
4. **Documenta cambios** - Ayuda al equipo a entender
5. **Revisa código viejo** - Aprende de errores pasados

## ⚠️ Advertencias

- No elimines código viejo hasta estar 100% seguro
- Mantén backups antes de cambios grandes
- Prueba en ambiente de desarrollo primero
- Comunica cambios al equipo

## 🎉 Beneficios Esperados

- **-60% líneas de código** en controllers
- **+80% cobertura de tests** (cuando se implementen)
- **-50% tiempo de debugging** (código más claro)
- **+100% reutilización** de lógica de negocio
- **Preparado para microservicios** cuando sea necesario
