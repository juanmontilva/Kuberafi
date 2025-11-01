# 🚀 Guía Rápida: Generar Solicitud de Pago

## 📍 Problema Resuelto

Ahora el administrador puede **generar solicitudes de pago** para que los operadores vean dónde deben pagar.

## 🎯 Pasos para el Administrador

### 1. Acceder a Solicitudes de Pago

**Menú Lateral → "Solicitudes de Pago"**

O directamente: `/admin/commission-requests`

### 2. Generar una Solicitud

1. **Clic en "Generar Solicitud"**

2. **Completar el formulario:**

    ```
    ┌─────────────────────────────────────┐
    │  Generar Solicitud de Pago          │
    ├─────────────────────────────────────┤
    │  Casa de Cambio: [CambioExpress ▼] │
    │  Fecha Inicio:   [2025-10-01]       │
    │  Fecha Fin:      [2025-10-31]       │
    │                                      │
    │  [Cancelar]  [Generar Solicitud]    │
    └─────────────────────────────────────┘
    ```

3. **Clic en "Generar Solicitud"**

4. **El sistema automáticamente:**
    - Calcula las comisiones del período
    - Cuenta las órdenes
    - Crea la solicitud con estado "Pendiente"

### 3. El Operador Verá la Solicitud

Cuando el operador vaya a **"Pagos a Kuberafi"**, verá:

```
┌──────────────────────────────────────────────────────┐
│  ⚠️ Deuda Total Pendiente a Kuberafi                 │
│  $6.00                                                │
│  4 órdenes totales                                    │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Historial de Pagos                                   │
│                                                       │
│  [Pendiente] 01/10/2025 - 31/10/2025                 │
│  $6.00 • 4 órdenes                                    │
│  [Enviar Pago]  ← El operador hace clic aquí        │
└──────────────────────────────────────────────────────┘
```

### 4. Operador Envía el Pago

El operador:

1. Clic en "Enviar Pago"
2. Ve los métodos de pago que configuraste
3. Selecciona el método usado
4. Adjunta comprobante
5. Envía información

### 5. Tú Recibes y Confirmas

En **"Solicitudes de Pago"** verás:

```
┌──────────────────────────────────────────────────────┐
│  [Info Enviada] CambioExpress                        │
│  $6.00 • 4 órdenes                                    │
│  01/10/2025 - 31/10/2025                             │
│                                                       │
│  Método: Banco de Venezuela USD                       │
│  Referencia: 123456789                                │
│  Comprobante: [Ver imagen]                            │
│                                                       │
│  [Confirmar Pago]  [Rechazar]                        │
└──────────────────────────────────────────────────────┘
```

## 🔄 Flujo Completo

```
ADMIN                          OPERADOR
  │                               │
  │ 1. Genera solicitud           │
  │    para CambioExpress         │
  │    (01/10 - 31/10)            │
  │                               │
  ├──────────────────────────────>│
  │                               │ 2. Ve solicitud pendiente
  │                               │    en "Pagos a Kuberafi"
  │                               │
  │                               │ 3. Clic "Enviar Pago"
  │                               │
  │                               │ 4. Ve métodos de pago
  │                               │
  │                               │ 5. Selecciona método
  │                               │
  │                               │ 6. Adjunta comprobante
  │                               │
  │<──────────────────────────────│ 7. Envía información
  │                               │
  │ 8. Recibe comprobante         │
  │                               │
  │ 9. Verifica pago              │
  │                               │
  │ 10. Confirma                  │
  │                               │
  ├──────────────────────────────>│ 11. Pago confirmado ✅
  │                               │
```

## 📊 Estadísticas en el Panel

Verás en tiempo real:

- **Pendientes:** Solicitudes sin pagar
- **Info Enviada:** Esperando tu confirmación
- **Pagados:** Confirmados
- **Monto Pendiente:** Total por confirmar

## 🎯 Acciones Disponibles

### Para Solicitudes con "Info Enviada":

1. **Confirmar Pago:**
    - Clic en "Confirmar"
    - Agregar notas (opcional)
    - Confirmar
    - Estado cambia a "Pagado" ✅

2. **Rechazar Pago:**
    - Clic en "Rechazar"
    - Escribir motivo del rechazo
    - Rechazar
    - El operador puede reenviar

## 💡 Consejos

1. **Genera solicitudes al final del mes** para cobrar las comisiones del período

2. **Revisa los comprobantes** antes de confirmar

3. **Usa el filtro** para ver solo las que necesitan atención:
    - "Info Enviada" → Requieren tu confirmación

4. **Configura métodos de pago primero** en "Métodos de Pago Kuberafi"

## ✅ Checklist

- [ ] Configurar métodos de pago en "Métodos de Pago Kuberafi"
- [ ] Generar solicitud de pago para una casa de cambio
- [ ] Verificar que el operador vea la solicitud
- [ ] Esperar a que el operador envíe el pago
- [ ] Confirmar el pago cuando lo recibas

---

**¡Ahora el sistema está completo!** 🎉

El operador verá las solicitudes que generes y podrá enviar los comprobantes de pago.
