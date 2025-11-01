# 📖 Guía de Uso: Sistema de Métodos de Pago

## Para el Administrador

### 1️⃣ Configurar Métodos de Pago

1. **Acceder al panel:**
   - Ir a `/admin/platform-payment-methods`
   - O desde el menú de administración

2. **Crear un nuevo método:**
   - Clic en "Nuevo Método"
   - Completar el formulario:
     - **Nombre:** Ej: "Cuenta Principal USD"
     - **Tipo:** Seleccionar (Transferencia, Zelle, Cripto, etc.)
     - **Moneda:** USD, VES, USDT, etc.
     - **Datos de cuenta:** Titular, número, banco, etc.
     - **Instrucciones:** Texto detallado para los operadores
   - Marcar como "Activo" y opcionalmente como "Principal"
   - Guardar

3. **Gestionar métodos existentes:**
   - Ver todos los métodos en tarjetas
   - Editar: Clic en el ícono de lápiz
   - Activar/Desactivar: Clic en el ícono de ojo
   - Eliminar: Clic en el ícono de basura

### 2️⃣ Revisar Pagos de Operadores

1. **Ver solicitudes:**
   - Ir a `/admin/commission-requests`
   - Ver solicitudes con estado "Info Enviada"

2. **Verificar pago:**
   - Ver método usado por el operador
   - Ver referencia de transacción
   - Ver comprobante (si lo adjuntó)
   - Confirmar o rechazar el pago

## Para el Operador/Casa de Cambio

### 1️⃣ Ver Deuda Pendiente

1. **Acceder a pagos:**
   - Ir a `/my-commission-requests`
   - Ver tarjeta roja con deuda total

2. **Información visible:**
   - Monto total adeudado
   - Cantidad de órdenes
   - Deuda del mes actual
   - Período de comisiones

### 2️⃣ Enviar Información de Pago

1. **Seleccionar solicitud:**
   - En "Historial de Pagos"
   - Clic en "Enviar Pago" en solicitud pendiente

2. **Ver métodos disponibles:**
   - Se muestran todos los métodos activos
   - Cada método muestra:
     - Nombre y tipo
     - Moneda
     - Badge "Recomendado" si es principal
   
3. **Seleccionar método:**
   - Clic en la tarjeta del método usado
   - Se expanden los detalles:
     - Datos de la cuenta
     - Instrucciones paso a paso
     - Información de contacto

4. **Completar información:**
   - **Método Usado:** Se llena automáticamente al seleccionar
   - **Referencia:** Número de transacción
   - **Comprobante:** URL de imagen o base64
   - **Notas:** Información adicional (opcional)

5. **Enviar:**
   - Clic en "Enviar Información"
   - Esperar confirmación del administrador

### 3️⃣ Seguimiento

1. **Estados de solicitud:**
   - 🟡 **Pendiente:** Aún no has enviado el pago
   - 🔵 **Info Enviada:** Esperando confirmación del admin
   - 🟢 **Pagado:** Confirmado por el administrador
   - 🔴 **Rechazado:** Debes reenviar con correcciones

2. **Si es rechazado:**
   - Ver motivo de rechazo
   - Clic en "Reenviar"
   - Corregir información
   - Enviar nuevamente

## 💡 Consejos

### Para Administradores:

- ✅ Mantén al menos un método activo por moneda
- ✅ Marca como "Principal" el método más conveniente
- ✅ Escribe instrucciones claras y detalladas
- ✅ Incluye todos los datos necesarios (cuenta, titular, etc.)
- ✅ Actualiza los métodos si cambian las cuentas
- ✅ Desactiva métodos temporalmente si hay problemas

### Para Operadores:

- ✅ Lee las instrucciones completas antes de pagar
- ✅ Usa el método recomendado cuando sea posible
- ✅ Guarda el comprobante de pago
- ✅ Incluye la referencia correcta
- ✅ Sube el comprobante a un servicio como Imgur
- ✅ Agrega notas si hay algo especial en el pago

## 🎯 Ejemplos de Uso

### Ejemplo 1: Pago por Zelle

1. Operador ve deuda de $500
2. Clic en "Enviar Pago"
3. Selecciona "Zelle Empresarial"
4. Ve instrucciones: "Enviar a payments@kuberafi.com"
5. Realiza el pago por Zelle
6. Ingresa referencia: "ZEL123456789"
7. Pega URL del comprobante
8. Envía información
9. Admin confirma en 24-48 horas

### Ejemplo 2: Transferencia Bancaria

1. Operador ve deuda de $1,200
2. Clic en "Enviar Pago"
3. Selecciona "Cuenta Principal USD"
4. Ve datos completos:
   - Banco: Bank of America
   - Cuenta: 1234567890
   - Routing: 026009593
   - Titular: Kuberafi LLC
5. Realiza transferencia bancaria
6. Ingresa referencia: "WIRE987654321"
7. Sube comprobante
8. Envía información
9. Admin confirma cuando se acredita (1-3 días)

### Ejemplo 3: Criptomoneda

1. Operador ve deuda de $800
2. Clic en "Enviar Pago"
3. Selecciona "USDT (TRC20)"
4. Ve dirección de wallet
5. Envía 800 USDT por red TRC20
6. Ingresa hash de transacción como referencia
7. Pega enlace de explorador de blockchain
8. Envía información
9. Admin confirma en minutos

## ❓ Preguntas Frecuentes

**P: ¿Puedo usar un método que no está en la lista?**
R: Sí, puedes escribir manualmente el método usado en el campo "Método Usado".

**P: ¿Qué pasa si no tengo el comprobante?**
R: El comprobante es opcional, pero muy recomendado para agilizar la confirmación.

**P: ¿Cuánto tarda en confirmarse un pago?**
R: Depende del método:
- Zelle/Cripto: Minutos a horas
- Transferencia bancaria: 1-3 días hábiles
- Pago móvil: Horas

**P: ¿Puedo editar la información después de enviarla?**
R: No directamente, pero si es rechazada puedes reenviar con correcciones.

**P: ¿Qué pasa si el método que uso está inactivo?**
R: Los métodos inactivos no se muestran, pero puedes escribir el nombre manualmente.

## 🆘 Soporte

Si tienes problemas:
1. Verifica que estés usando el método correcto
2. Revisa que la referencia sea correcta
3. Asegúrate de que el comprobante sea visible
4. Contacta al administrador si persiste el problema
