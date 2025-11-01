# 🎯 Cómo Funciona el Sistema de Pagos - Guía Visual

## 📍 Ubicación de las Opciones en el Menú

### Para el ADMINISTRADOR:
```
Menú Lateral:
├── Dashboard
├── Todas las Órdenes
├── Pares de Divisas
├── Gestión de Pagos
├── Comisiones Plataforma
├── 💳 Métodos de Pago Kuberafi  ← AQUÍ CONFIGURAS DÓNDE DEBEN PAGAR
├── Casas de Cambio
├── Gestión de Usuarios
├── Reportes Avanzados
├── Soporte
└── Configuraciones
```

### Para el OPERADOR:
```
Menú Lateral:
├── Dashboard
├── Mis Órdenes
├── Nueva Orden
├── 💰 Pagos a Kuberafi  ← AQUÍ VE DÓNDE PAGAR Y ENVÍA COMPROBANTE
└── Soporte
```

## 🔄 Flujo Completo Paso a Paso

### PASO 1: Administrador Configura Métodos de Pago

**Ruta:** `/admin/platform-payment-methods`

**Qué hace el admin:**
1. Clic en "Nuevo Método"
2. Completa el formulario:

```
┌─────────────────────────────────────────┐
│  Crear Método de Pago                   │
├─────────────────────────────────────────┤
│  Nombre: Banco de Venezuela USD         │
│  Tipo: Transferencia Bancaria           │
│  Moneda: USD                             │
│  Titular: Kuberafi C.A.                  │
│  Cuenta: 0102-1234-5678-9012            │
│  Banco: Banco de Venezuela               │
│  RIF: J-12345678-9                       │
│                                          │
│  Instrucciones:                          │
│  ┌────────────────────────────────────┐ │
│  │ Realiza la transferencia a:        │ │
│  │ Banco: Banco de Venezuela          │ │
│  │ Cuenta: 0102-1234-5678-9012       │ │
│  │ Titular: Kuberafi C.A.             │ │
│  │ RIF: J-12345678-9                  │ │
│  │                                     │ │
│  │ Importante:                         │ │
│  │ - Incluye tu nombre en referencia  │ │
│  │ - Guarda el comprobante            │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ☑ Activo                                │
│  ☑ Método Principal                      │
│                                          │
│  [Cancelar]  [Crear Método]             │
└─────────────────────────────────────────┘
```

3. Guarda el método
4. Ahora los operadores verán esta información

**Ejemplo de métodos configurados:**
```
┌──────────────────────────────────────────────────────┐
│ 🏦 Banco de Venezuela USD                            │
│ Transferencia Bancaria • USD • [Principal]           │
│ Cuenta: 0102-1234-5678-9012                         │
│ Titular: Kuberafi C.A.                               │
│ [Activo] [Editar] [Eliminar]                        │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ 💵 Zelle Empresarial                                 │
│ Zelle • USD                                          │
│ Email: payments@kuberafi.com                         │
│ [Activo] [Editar] [Eliminar]                        │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ 💎 USDT (TRC20)                                      │
│ Criptomoneda • USDT                                  │
│ Wallet: TXxxxxxxxxxxxxxxxxxxxxxxxxxxx                │
│ [Activo] [Editar] [Eliminar]                        │
└──────────────────────────────────────────────────────┘
```

---

### PASO 2: Operador Ve Su Deuda

**Ruta:** `/my-commission-requests`

**Qué ve el operador:**
```
┌──────────────────────────────────────────────────────┐
│  ⚠️ Deuda Total Pendiente a Kuberafi                 │
│                                                       │
│  $6.00                                                │
│  4 órdenes totales                                    │
│                                                       │
│  Del mes actual: $4.53 (3 órdenes)                   │
│  Período: 30/9/2025 - 30/10/2025                     │
│                                                       │
│  [Pendiente de Pago]                                  │
└──────────────────────────────────────────────────────┘
```

---

### PASO 3: Operador Envía Pago

**El operador hace clic en "Enviar Pago"**

**Se abre un modal con los métodos disponibles:**

```
┌─────────────────────────────────────────────────────────┐
│  Enviar Información de Pago a Kuberafi                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Métodos de Pago Disponibles:                           │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🏦 Banco de Venezuela USD  [Recomendado] [USD]    │ │
│  │ Transferencia Bancaria                             │ │
│  │                                                     │ │
│  │ ▼ Detalles (al hacer clic se expande):            │ │
│  │   Titular: Kuberafi C.A.                           │ │
│  │   Banco: Banco de Venezuela                        │ │
│  │   Cuenta: 0102-1234-5678-9012                     │ │
│  │   RIF: J-12345678-9                                │ │
│  │                                                     │ │
│  │   Instrucciones:                                    │ │
│  │   Realiza la transferencia a esta cuenta...        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 💵 Zelle Empresarial  [USD]                        │ │
│  │ Zelle                                               │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 💎 USDT (TRC20)  [USDT]                            │ │
│  │ Criptomoneda                                        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  Información de tu Pago:                                │
│                                                          │
│  Método Usado: [Banco de Venezuela USD]                │
│  Referencia: [_________________]  ← Número de transf.  │
│  Comprobante: [_________________] ← URL de imagen      │
│  Notas: [_____________________]                         │
│                                                          │
│  [Cancelar]  [Enviar Información]                       │
└─────────────────────────────────────────────────────────┘
```

**El operador:**
1. Ve todos los métodos que configuraste
2. Selecciona el que usó (ej: Banco de Venezuela)
3. Ve las instrucciones completas
4. Realiza el pago en su banco
5. Ingresa la referencia de la transacción
6. Sube el comprobante (puede usar Imgur u otro servicio)
7. Envía la información

---

### PASO 4: Administrador Recibe el Comprobante

**Ruta:** `/admin/commission-requests`

**Qué ve el admin:**
```
┌──────────────────────────────────────────────────────┐
│  Solicitudes de Pago de Comisiones                    │
├──────────────────────────────────────────────────────┤
│                                                       │
│  [Info Enviada] CambioExpress                        │
│  $6.00 • 4 órdenes                                    │
│  30/9/2025 - 30/10/2025                              │
│                                                       │
│  Método: Banco de Venezuela USD                       │
│  Referencia: 123456789                                │
│  Comprobante: [Ver imagen]                            │
│  Notas: Pago realizado el 28/10/2025                 │
│                                                       │
│  [Confirmar Pago]  [Rechazar]                        │
└──────────────────────────────────────────────────────┘
```

**El admin:**
1. Ve la solicitud con estado "Info Enviada"
2. Revisa el método usado
3. Verifica la referencia
4. Ve el comprobante
5. Confirma el pago o lo rechaza

---

## 🎯 Resumen Visual del Flujo

```
ADMIN                          OPERADOR
  │                               │
  │ 1. Configura métodos          │
  │    de pago                    │
  │    (bancos, wallets)          │
  │                               │
  ├──────────────────────────────>│
  │                               │ 2. Ve deuda de $6
  │                               │
  │                               │ 3. Clic "Enviar Pago"
  │                               │
  │                               │ 4. Ve métodos disponibles
  │                               │    (los que configuraste)
  │                               │
  │                               │ 5. Selecciona método
  │                               │
  │                               │ 6. Ve instrucciones
  │                               │
  │                               │ 7. Realiza el pago
  │                               │
  │                               │ 8. Adjunta comprobante
  │                               │
  │<──────────────────────────────│ 9. Envía información
  │                               │
  │ 10. Recibe comprobante        │
  │                               │
  │ 11. Verifica pago             │
  │                               │
  │ 12. Confirma                  │
  │                               │
  ├──────────────────────────────>│ 13. Pago confirmado ✅
  │                               │
```

## 📱 Acceso Rápido

### Como Administrador:
1. Login en Kuberafi
2. Menú lateral → "Métodos de Pago Kuberafi"
3. Crear/editar métodos de pago
4. Los operadores verán estos métodos automáticamente

### Como Operador:
1. Login en Kuberafi
2. Menú lateral → "Pagos a Kuberafi"
3. Ver deuda pendiente
4. Clic "Enviar Pago"
5. Seleccionar método y enviar comprobante

## ✅ Ventajas del Sistema

1. **Para el Admin:**
   - ✅ Configura una vez, funciona siempre
   - ✅ Actualiza datos sin tocar código
   - ✅ Recibe comprobantes organizados
   - ✅ Confirma pagos fácilmente

2. **Para el Operador:**
   - ✅ Ve exactamente dónde pagar
   - ✅ Instrucciones claras
   - ✅ Proceso guiado
   - ✅ Seguimiento de estado

## 🚀 Próximos Pasos

1. **Configura tus métodos de pago:**
   - Ve a `/admin/platform-payment-methods`
   - Agrega tus cuentas bancarias
   - Agrega wallets de cripto
   - Escribe instrucciones claras

2. **Prueba como operador:**
   - Login con cuenta de operador
   - Ve a "Pagos a Kuberafi"
   - Verifica que veas los métodos
   - Prueba el flujo completo

3. **Ajusta según necesidad:**
   - Activa/desactiva métodos
   - Actualiza instrucciones
   - Agrega nuevos métodos

---

**¡El sistema está listo y funcionando!** 🎉

Los operadores ahora pueden ver exactamente dónde deben pagar y tú recibirás los comprobantes de forma organizada.
