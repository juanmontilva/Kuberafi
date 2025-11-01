# Sistema de Métodos de Pago de la Plataforma

## 📋 Resumen

Se ha implementado un sistema completo para que el **administrador** configure los métodos de pago donde los **operadores/casas de cambio** deben enviar sus comisiones a Kuberafi.

## ✅ Funcionalidades Implementadas

### 1. **Gestión de Métodos de Pago (Administrador)**

El administrador puede:

- ✅ Crear métodos de pago (cuentas bancarias, Zelle, criptomonedas, etc.)
- ✅ Configurar detalles completos:
    - Nombre del método
    - Tipo (transferencia bancaria, Zelle, cripto, etc.)
    - Moneda (USD, VES, USDT, etc.)
    - Datos de la cuenta (titular, número, banco, identificación)
    - Routing number y SWIFT (para transferencias internacionales)
    - Instrucciones detalladas para los operadores
- ✅ Marcar métodos como activos/inactivos
- ✅ Establecer un método como principal/recomendado
- ✅ Ordenar los métodos por prioridad
- ✅ Editar y eliminar métodos existentes

**Ruta:** `/admin/platform-payment-methods`

### 2. **Vista de Métodos de Pago (Operadores)**

Los operadores ahora pueden:

- ✅ Ver todos los métodos de pago disponibles al enviar un pago
- ✅ Ver información completa de cada método:
    - Datos de la cuenta
    - Instrucciones paso a paso
    - Información de contacto
- ✅ Seleccionar el método usado para su pago
- ✅ Adjuntar comprobante de pago
- ✅ Enviar referencia de transacción

**Ruta:** `/my-commission-requests`

## 🗄️ Base de Datos

### Nueva Tabla: `platform_payment_methods`

```sql
- id
- name (nombre del método)
- type (bank_transfer, mobile_payment, zelle, crypto, etc.)
- currency (USD, VES, USDT, etc.)
- account_holder (titular)
- account_number (número de cuenta)
- bank_name (banco)
- identification (CI, RIF, teléfono)
- routing_number (para transferencias internacionales)
- swift_code (para SWIFT)
- instructions (instrucciones detalladas)
- is_active (activo/inactivo)
- is_primary (método principal)
- display_order (orden de visualización)
- timestamps
```

## 📁 Archivos Creados/Modificados

### Nuevos Archivos:

1. **Modelo:**
    - `app/Models/PlatformPaymentMethod.php`

2. **Controlador:**
    - `app/Http/Controllers/Admin/PlatformPaymentMethodController.php`

3. **Migración:**
    - `database/migrations/2025_10_28_040000_create_platform_payment_methods_table.php`

4. **Seeder:**
    - `database/seeders/PlatformPaymentMethodSeeder.php`

5. **Vista (Admin):**
    - `resources/js/pages/Admin/PlatformPaymentMethods.tsx`

### Archivos Modificados:

1. **Controlador:**
    - `app/Http/Controllers/CommissionPaymentRequestController.php`
    - Agregado: Envío de métodos de pago a la vista del operador

2. **Vista (Operador):**
    - `resources/js/pages/ExchangeHouse/CommissionPaymentRequests.tsx`
    - Agregado: Visualización de métodos de pago disponibles
    - Mejorado: Formulario de envío de pago con selección de método

3. **Rutas:**
    - `routes/web.php`
    - Agregadas rutas para gestión de métodos de pago

## 🎯 Flujo de Uso

### Para el Administrador:

1. Ir a `/admin/platform-payment-methods`
2. Crear métodos de pago (cuentas donde recibir pagos)
3. Configurar detalles e instrucciones
4. Activar/desactivar según necesidad
5. Los operadores verán estos métodos al pagar

### Para el Operador:

1. Ir a `/my-commission-requests`
2. Ver deuda pendiente con Kuberafi
3. Hacer clic en "Enviar Pago" en una solicitud pendiente
4. Ver métodos de pago disponibles
5. Seleccionar el método usado
6. Ver instrucciones detalladas
7. Ingresar referencia y comprobante
8. Enviar información al administrador

## 🔧 Tipos de Métodos Soportados

- 🏦 **Transferencia Bancaria** (bank_transfer)
- 📱 **Pago Móvil** (mobile_payment)
- 💵 **Zelle** (zelle)
- 💎 **Criptomonedas** (crypto)
- 🌐 **Transferencia Internacional** (wire_transfer)
- 💳 **PayPal** (paypal)
- 💰 **Otro** (other)

## 📊 Datos de Ejemplo

Se incluyen 4 métodos de pago de ejemplo:

1. Cuenta bancaria USD (Bank of America)
2. Zelle empresarial
3. Pago móvil Venezuela
4. USDT (TRC20)

Para cargar los datos de ejemplo:

```bash
php artisan db:seed --class=PlatformPaymentMethodSeeder
```

## 🎨 Características de la Interfaz

### Administrador:

- ✅ Tarjetas visuales para cada método
- ✅ Badges para estado (activo/inactivo, principal)
- ✅ Iconos según tipo de método
- ✅ Formularios modales para crear/editar
- ✅ Toggle rápido para activar/desactivar
- ✅ Vista completa de instrucciones

### Operador:

- ✅ Tarjetas seleccionables de métodos
- ✅ Expansión de detalles al seleccionar
- ✅ Badge "Recomendado" para método principal
- ✅ Instrucciones paso a paso visibles
- ✅ Formulario integrado para enviar pago
- ✅ Validación de campos requeridos

## 🔐 Seguridad

- ✅ Solo administradores pueden gestionar métodos de pago
- ✅ Operadores solo pueden ver métodos activos
- ✅ Validación de permisos en todas las rutas
- ✅ Validación de datos en formularios

## 🚀 Próximos Pasos Sugeridos

1. **Upload de Comprobantes:** Implementar subida directa de archivos
2. **Notificaciones:** Alertar al admin cuando se envía un pago
3. **Historial:** Mostrar qué método se usó en pagos anteriores
4. **Estadísticas:** Reportes de métodos más usados
5. **Multi-moneda:** Filtrar métodos según moneda de la deuda

## 📝 Notas Importantes

- Los métodos inactivos no se muestran a los operadores
- Solo puede haber un método principal por moneda
- El orden de visualización se controla con `display_order`
- Las instrucciones soportan texto multilínea
- Los operadores pueden escribir un método personalizado si no usan los predefinidos

## ✨ Mejoras Implementadas

1. **Experiencia del Operador:**
    - Ya no tiene que adivinar dónde pagar
    - Ve instrucciones claras y detalladas
    - Puede copiar datos de cuenta fácilmente

2. **Control del Administrador:**
    - Gestión centralizada de cuentas
    - Puede actualizar datos sin tocar código
    - Puede desactivar métodos temporalmente

3. **Transparencia:**
    - Toda la información visible
    - Proceso claro y documentado
    - Menos errores en pagos
