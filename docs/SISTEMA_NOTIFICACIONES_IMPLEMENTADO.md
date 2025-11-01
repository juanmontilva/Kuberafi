# 🔔 SISTEMA DE NOTIFICACIONES - KUBERAFI

## ✅ ESTADO: BACKEND COMPLETADO

---

## 🎯 CARACTERÍSTICAS IMPLEMENTADAS

### 1. ✅ Notificaciones al Crear Ticket

**Flujo:**
```
Usuario crea ticket
    ↓
Sistema crea 2 notificaciones:
    1. Para el usuario: "Ticket creado, pronto serás contactado"
    2. Para todos los admins: "Nuevo ticket de [Usuario]"
```

**Mensaje al Usuario:**
> "Tu ticket #TKT-00001 ha sido creado. Pronto serás contactado por soporte."

**Mensaje a Admins:**
> "Juan Pérez ha creado un ticket: Problema con comisiones"

---

### 2. ✅ Notificaciones al Responder

**Flujo:**
```
Admin responde ticket
    ↓
Usuario recibe notificación:
    "Admin ha respondido tu ticket #TKT-00001"
    
Usuario responde
    ↓
Admin recibe notificación:
    "Juan Pérez ha respondido el ticket #TKT-00001"
```

---

### 3. ✅ Prevención de Duplicados

**Sistema Inteligente:**
- Verifica si el usuario tiene tickets abiertos similares
- Busca por asunto similar en las últimas 24 horas
- Si encuentra uno, redirige al ticket existente
- Mensaje: "Ya tienes un ticket similar abierto"

**Beneficios:**
- No se crean tickets duplicados
- Usuario continúa conversación en el mismo ticket
- Admin no recibe múltiples tickets del mismo problema

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### Tabla: `notifications`

```sql
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    
    -- Tipo
    type ENUM(
        'ticket_created',
        'ticket_responded',
        'ticket_status_changed',
        'ticket_assigned',
        'commission_payment_generated',
        'commission_payment_confirmed',
        'order_completed'
    ),
    
    -- Contenido
    title VARCHAR(255),
    message TEXT,
    link VARCHAR(255),  -- URL para ir al hacer click
    
    -- Relacionado
    related_type VARCHAR(255),  -- SupportTicket, Order, etc.
    related_id BIGINT,
    
    -- Estado
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## 🔧 API ENDPOINTS

### Obtener Notificaciones
```php
GET /notifications
Response: {
    notifications: [...],
    unread_count: 5
}
```

### Contador de No Leídas
```php
GET /notifications/unread-count
Response: {
    count: 5
}
```

### Marcar como Leída
```php
POST /notifications/{id}/read
Response: {
    success: true
}
```

### Marcar Todas como Leídas
```php
POST /notifications/read-all
Response: {
    success: true
}
```

---

## 💻 CÓDIGO IMPLEMENTADO

### Modelo: Notification.php

**Métodos Principales:**
```php
// Crear notificación de ticket creado
Notification::ticketCreated($ticket);

// Crear notificación de respuesta
Notification::ticketResponded($ticket, $responder);

// Notificar a todos los admins
Notification::notifyAdminsNewTicket($ticket);

// Marcar como leída
$notification->markAsRead();
```

**Scopes:**
```php
// Obtener no leídas
Notification::unread()->get();

// Obtener de un usuario
Notification::forUser($userId)->get();
```

---

### Controlador: SupportTicketController.php

**Al Crear Ticket:**
```php
// Prevenir duplicados
$recentTicket = SupportTicket::where('created_by_user_id', $user->id)
    ->where('subject', 'like', '%' . $request->subject . '%')
    ->whereIn('status', ['open', 'in_progress'])
    ->where('created_at', '>=', now()->subHours(24))
    ->first();

if ($recentTicket) {
    return redirect()->route('tickets.show', $recentTicket)
        ->with('info', 'Ya tienes un ticket similar abierto.');
}

// Crear ticket
$ticket = SupportTicket::create([...]);

// Notificar
Notification::ticketCreated($ticket);
Notification::notifyAdminsNewTicket($ticket);
```

**Al Responder:**
```php
$message = TicketMessage::create([...]);

// Notificar al otro usuario
Notification::ticketResponded($ticket, $user);
```

---

## 🎨 INTERFAZ (PENDIENTE)

### Campana de Notificaciones en el Nav

**Ubicación:** Header superior derecho

**Diseño:**
```
┌─────────────────────────────────────────────┐
│  [🔔 5]  ← Badge con contador               │
│                                              │
│  Al hacer click:                            │
│  ┌──────────────────────────────────────┐  │
│  │ Notificaciones                       │  │
│  ├──────────────────────────────────────┤  │
│  │ 🎫 Nuevo Ticket de Juan Pérez        │  │
│  │    Hace 5 minutos                    │  │
│  ├──────────────────────────────────────┤  │
│  │ 💬 Admin respondió tu ticket         │  │
│  │    Hace 10 minutos                   │  │
│  ├──────────────────────────────────────┤  │
│  │ ✅ Ticket #TKT-00001 resuelto        │  │
│  │    Hace 1 hora                       │  │
│  ├──────────────────────────────────────┤  │
│  │ [Marcar todas como leídas]           │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Características:**
- Badge rojo con número de no leídas
- Dropdown con últimas 10 notificaciones
- Click en notificación → va al link
- Botón "Marcar todas como leídas"
- Auto-actualización cada 30 segundos

---

## 🔄 FLUJOS COMPLETOS

### Flujo 1: Usuario Crea Ticket

```
1. Usuario: Click en "Nuevo Ticket"
2. Usuario: Llena formulario
3. Sistema: Verifica duplicados
   ├─ Si existe similar → Redirige al existente
   └─ Si no existe → Continúa
4. Sistema: Crea ticket
5. Sistema: Crea notificación para usuario
   "Ticket creado, pronto serás contactado"
6. Sistema: Crea notificaciones para admins
   "Nuevo ticket de [Usuario]"
7. Usuario: Ve su ticket
8. Admin: Ve campana con badge [1]
9. Admin: Click en campana
10. Admin: Ve "Nuevo ticket de Juan Pérez"
11. Admin: Click en notificación
12. Admin: Va al ticket
```

---

### Flujo 2: Admin Responde

```
1. Admin: Responde ticket
2. Sistema: Crea notificación para usuario
   "Admin ha respondido tu ticket"
3. Usuario: Ve campana con badge [1]
4. Usuario: Click en campana
5. Usuario: Ve "Admin respondió tu ticket"
6. Usuario: Click en notificación
7. Usuario: Va al ticket y lee respuesta
8. Sistema: Marca notificación como leída
9. Usuario: Badge desaparece
```

---

### Flujo 3: Prevención de Duplicados

```
1. Usuario: Crea ticket "Problema con comisiones"
2. Sistema: Ticket creado #TKT-00001
3. Usuario: Intenta crear otro "Problema comisiones"
4. Sistema: Detecta ticket similar abierto
5. Sistema: Redirige a #TKT-00001
6. Usuario: Ve mensaje "Ya tienes un ticket similar"
7. Usuario: Continúa conversación en el mismo ticket
```

---

## 📊 TIPOS DE NOTIFICACIONES

### Implementadas:
- ✅ `ticket_created` - Ticket creado
- ✅ `ticket_responded` - Nueva respuesta en ticket

### Futuras:
- ⏳ `ticket_status_changed` - Estado cambiado
- ⏳ `ticket_assigned` - Ticket asignado
- ⏳ `commission_payment_generated` - Solicitud de pago generada
- ⏳ `commission_payment_confirmed` - Pago confirmado
- ⏳ `order_completed` - Orden completada

---

## 🎯 PRÓXIMOS PASOS

### Fase 1: Frontend (Urgente)
1. Crear componente de campana de notificaciones
2. Agregar al header/nav
3. Implementar dropdown con lista
4. Auto-actualización con polling o WebSocket

### Fase 2: Mejoras
1. Notificaciones por email
2. Notificaciones push (PWA)
3. Sonido al recibir notificación
4. Configuración de preferencias

### Fase 3: Expansión
1. Notificaciones para comisiones
2. Notificaciones para órdenes
3. Notificaciones para pagos
4. Notificaciones personalizables

---

## 💡 EJEMPLO DE USO

### Crear Notificación Manualmente

```php
use App\Models\Notification;

// Notificación simple
Notification::create([
    'user_id' => 1,
    'type' => 'ticket_created',
    'title' => 'Ticket Creado',
    'message' => 'Tu ticket ha sido creado exitosamente',
    'link' => '/tickets/1',
]);

// Usando métodos helper
$ticket = SupportTicket::find(1);
Notification::ticketCreated($ticket);
Notification::notifyAdminsNewTicket($ticket);
```

### Obtener Notificaciones

```php
// Todas las notificaciones del usuario
$notifications = Notification::forUser($userId)->get();

// Solo no leídas
$unread = Notification::forUser($userId)->unread()->get();

// Contador
$count = Notification::forUser($userId)->unread()->count();
```

### Marcar como Leída

```php
$notification = Notification::find(1);
$notification->markAsRead();

// O marcar todas
Notification::forUser($userId)
    ->unread()
    ->update(['is_read' => true, 'read_at' => now()]);
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Migración de base de datos
- [x] Modelo Notification
- [x] Controlador NotificationController
- [x] Rutas API
- [x] Integración en SupportTicketController
- [x] Prevención de duplicados
- [x] Notificaciones al crear ticket
- [x] Notificaciones al responder
- [ ] Componente React de campana (pendiente)
- [ ] Integración en nav (pendiente)
- [ ] Auto-actualización (pendiente)
- [ ] Notificaciones por email (pendiente)

---

## 🎉 BENEFICIOS

### Para Usuarios:
✅ Saben que su ticket fue recibido
✅ Reciben notificación cuando admin responde
✅ No crean tickets duplicados
✅ Mejor experiencia de usuario

### Para Admins:
✅ Notificación inmediata de nuevos tickets
✅ Saben cuándo usuarios responden
✅ No reciben tickets duplicados
✅ Mejor organización

### Para la Plataforma:
✅ Menos tickets duplicados
✅ Mejor comunicación
✅ Mayor satisfacción
✅ Sistema profesional

---

**Generado:** 27 de Octubre, 2025  
**Plataforma:** Kuberafi v1.0  
**Sistema por:** Kiro AI Assistant  
**Estado:** ✅ BACKEND 100% - Frontend pendiente
