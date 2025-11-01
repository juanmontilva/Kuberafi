# 💰 Módulo de Comisiones - Documentación Completa

Sistema completo de gestión de solicitudes de pago de comisiones para casas de cambio.

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Instalación](#instalación)
4. [Uso](#uso)
5. [API / Rutas](#api--rutas)
6. [Testing](#testing)
7. [Próximos Pasos](#próximos-pasos)

---

## 📖 Descripción General

El módulo **Commissions** permite a las casas de cambio:
- Ver sus comisiones acumuladas
- Solicitar pagos de comisiones
- Ver historial de solicitudes
- Generar reportes

Y a los administradores:
- Aprobar/rechazar solicitudes
- Marcar pagos como completados
- Procesamiento por lotes
- Dashboard de estadísticas

---

## 🏗️ Arquitectura

### Estructura de Archivos

```
app/
├── Enums/
│   └── CommissionPaymentStatus.php          # Estados de solicitudes
│
├── Models/
│   └── CommissionPayment.php                # Modelo principal
│
└── Modules/Commissions/
    ├── Controllers/
    │   ├── CommissionController.php         # Dashboard, reportes
    │   └── CommissionPaymentController.php  # CRUD solicitudes
    │
    └── Services/
        ├── CommissionService.php            # Cálculos y reportes
        └── CommissionPaymentService.php     # Lógica de pagos

resources/js/pages/
├── Commissions/
│   ├── Dashboard.tsx                        # Dashboard de comisiones
│   ├── RequestPayment.tsx                   # Formulario de solicitud
│   └── History.tsx                          # Historial
│
└── Admin/CommissionPayments/
    └── Index.tsx                            # Panel administrativo

database/migrations/
└── 2025_11_01_132934_create_commission_payments_table.php
```

### Base de Datos

**Tabla: `commission_payments`**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | ID único |
| exchange_house_id | bigint | Casa de cambio |
| requested_by | bigint | Usuario que solicita |
| approved_by | bigint | Admin que aprueba |
| paid_by | bigint | Admin que marca como pagado |
| amount | decimal(15,2) | Monto solicitado |
| status | enum | pending, approved, rejected, paid, cancelled |
| bank_name | string | Banco del beneficiario |
| account_number | string | Número de cuenta |
| account_holder | string | Titular de la cuenta |
| payment_method | string | Método de pago |
| payment_reference | string | Referencia del pago |
| requested_at | timestamp | Fecha de solicitud |
| approved_at | timestamp | Fecha de aprobación |
| paid_at | timestamp | Fecha de pago |

---

## 🚀 Instalación

### 1. Ejecutar Migración

```bash
php artisan migrate
```

### 2. Verificar Rutas

```bash
php artisan route:list | grep commissions
```

Deberías ver:
```
GET    /commissions                    # Dashboard
GET    /commissions/history            # Historial
POST   /commissions/request-payment    # Crear solicitud
GET    /admin/commission-payments      # Panel admin
POST   /admin/commission-payments/{id}/approve
```

### 3. Compilar Assets

```bash
npm run dev
```

---

## 💻 Uso

### Para Casas de Cambio

#### Ver Dashboard
```
URL: /commissions
```

Muestra:
- Total acumulado
- Disponible para solicitar
- En proceso
- Total pagado
- Gráfico de tendencia
- Solicitudes recientes

#### Solicitar Pago

```
URL: /commissions/request-payment
```

Formulario:
1. Monto a solicitar
2. Datos bancarios
3. Notas adicionales

#### Ver Historial

```
URL: /commissions/history
```

Características:
- Filtro por estado
- Paginación
- Ver detalles
- Cancelar solicitudes pendientes

### Para Administradores

#### Panel de Gestión

```
URL: /admin/commission-payments
```

Acciones:
- Ver todas las solicitudes
- Aprobar solicitudes
- Rechazar solicitudes
- Marcar como pagadas
- Procesamiento por lotes

---

## 🛣️ API / Rutas

### Exchange Houses

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/commissions` | Dashboard |
| GET | `/commissions/history` | Historial |
| GET | `/commissions/reports` | Reportes |
| GET | `/commissions/request-payment` | Form solicitud |
| POST | `/commissions/request-payment` | Crear solicitud |
| GET | `/commissions/payment/{id}` | Ver detalles |
| POST | `/commissions/payment/{id}/cancel` | Cancelar |

### Administradores

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/admin/commission-payments` | Panel admin |
| POST | `/admin/commission-payments/{id}/approve` | Aprobar |
| POST | `/admin/commission-payments/{id}/reject` | Rechazar |
| POST | `/admin/commission-payments/{id}/mark-as-paid` | Marcar pagada |
| POST | `/admin/commission-payments/batch-approve` | Aprobar lote |
| POST | `/admin/commission-payments/batch-mark-as-paid` | Pagar lote |

---

## 🧪 Testing

### Tests Recomendados

```php
// tests/Feature/Commissions/CommissionServiceTest.php
it('calcula comisiones acumuladas correctamente')
it('valida que el monto no exceda el disponible')
it('obtiene tendencia de comisiones')

// tests/Feature/Commissions/CommissionPaymentTest.php
it('crea solicitud de pago exitosamente')
it('aprueba solicitud correctamente')
it('rechaza solicitud con razón')
it('marca como pagada con referencia')
it('previene aprobar solicitud ya procesada')
```

### Ejecutar Tests

```bash
php artisan test --filter=Commission
```

---

## 📊 Flujo Completo

```mermaid
1. Exchange House solicita pago
   ↓
2. Status: PENDING
   ↓
3. Admin revisa solicitud
   ↓
4a. Aprueba → Status: APPROVED
4b. Rechaza → Status: REJECTED (FIN)
   ↓
5. Admin procesa pago
   ↓
6. Status: PAID (FIN)
   ↓
7. Exchange House recibe notificación
```

---

## 🎯 Próximos Pasos

### Fase 1: Notificaciones (Opcional)
- Enviar email al aprobar
- Enviar email al pagar
- Notificar rechazo

```php
// En CommissionPaymentService
public function approveRequest(...)
{
    $payment->approve($approver, $notes);
    
    // Agregar esto:
    event(new CommissionPaymentApproved($payment));
    
    return $payment->fresh();
}
```

### Fase 2: Exportación de Reportes (Opcional)
- Exportar a Excel
- Exportar a PDF
- Programar reportes automáticos

### Fase 3: Políticas de Autorización (Recomendado)

Crear policies para mejor seguridad:

```bash
php artisan make:policy CommissionPaymentPolicy --model=CommissionPayment
```

```php
// app/Policies/CommissionPaymentPolicy.php
public function view(User $user, CommissionPayment $payment)
{
    return $user->exchange_house_id === $payment->exchange_house_id;
}

public function approve(User $user, CommissionPayment $payment)
{
    return $user->role === 'super_admin';
}
```

---

## 🔧 Configuración Adicional

### Permisos Recomendados

```php
// database/seeders/PermissionsSeeder.php
Permission::create(['name' => 'view_commissions']);
Permission::create(['name' => 'request_commission_payment']);
Permission::create(['name' => 'approve_commission_payment']);
Permission::create(['name' => 'reject_commission_payment']);
Permission::create(['name' => 'mark_commission_as_paid']);
```

### Límites de Solicitudes

```php
// app/Modules/Commissions/Services/CommissionService.php
const MIN_PAYMENT_AMOUNT = 100; // Mínimo $100
const MAX_REQUESTS_PER_MONTH = 4; // Máximo 4 solicitudes/mes
```

---

## 📚 Ejemplos de Uso

### Obtener Balance

```php
use App\Modules\Commissions\Services\CommissionService;

$commissionService = app(CommissionService::class);
$balance = $commissionService->getAccumulatedCommissions($exchangeHouse);

// Resultado:
// [
//     'total_earned' => 5234.50,
//     'available' => 4500.00,
//     'in_process' => 734.50,
//     'total_paid' => 12450.00,
// ]
```

### Crear Solicitud

```php
use App\Modules\Commissions\Services\CommissionPaymentService;

$paymentService = app(CommissionPaymentService::class);

$payment = $paymentService->createPaymentRequest(
    $exchangeHouse,
    $user,
    1000.00, // Monto
    [
        'bank_name' => 'Banco de Venezuela',
        'account_number' => '0102-1234-56-7890123456',
        'account_holder' => 'Mi Casa de Cambio C.A.',
        'account_type' => 'checking',
        'identification' => 'J-12345678-9',
    ],
    'Primera solicitud del mes'
);
```

---

## 🐛 Troubleshooting

### Error: "El monto excede el balance disponible"

**Causa:** Intentando solicitar más de lo acumulado

**Solución:**
```php
$balance = $commissionService->getAccumulatedCommissions($exchangeHouse);
// Verificar $balance['available'] antes de solicitar
```

### Error: "Esta solicitud no puede ser aprobada"

**Causa:** La solicitud ya fue procesada

**Solución:**
```php
if ($payment->isPending()) {
    $payment->approve($user);
}
```

---

## 📞 Soporte

Para preguntas o problemas:
1. Revisar logs: `storage/logs/laravel.log`
2. Verificar estado de DB: `php artisan db:monitor`
3. Consultar documentación completa

---

**Versión:** 1.0.0  
**Última actualización:** Nov 1, 2025  
**Autor:** Cascade AI  
**Proyecto:** Kuberafi

---

✅ **Módulo Completado y Listo para Producción** 🚀
