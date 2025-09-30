# 💳 Sistema de Métodos de Pago - KuberaFi

## 🎯 Problema que Resuelve

Las casas de cambio necesitan registrar **por dónde reciben el dinero**:
- 📱 Pago Móvil (Venezuela)
- 💵 Zelle
- 🏦 Transferencias bancarias
- 💰 Efectivo
- 💎 Criptomonedas (USDT, BTC)
- 🌐 Wire Transfer

**¿Por qué es importante?**
- Control de liquidez
- Trazabilidad completa
- Múltiples fuentes de recepción
- Instrucciones claras para clientes
- Límites por método

---

## ✅ Implementación Completada

### 1. Base de Datos

**Tabla: `payment_methods`**
```sql
CREATE TABLE payment_methods (
    id BIGINT PRIMARY KEY,
    exchange_house_id BIGINT REFERENCES exchange_houses,
    
    -- Información básica
    name VARCHAR(255),              -- "Pago Móvil Personal"
    type ENUM,                       -- mobile_payment, zelle, bank_transfer, crypto, etc.
    currency VARCHAR(10),            -- VES, USD, EUR, USDT, BTC
    
    -- Detalles
    account_holder VARCHAR(255),     -- Juan Pérez
    account_number VARCHAR(255),     -- 0412-1234567 o cuenta bancaria
    bank_name VARCHAR(255),          -- Banco de Venezuela
    identification VARCHAR(255),     -- V-12345678, teléfono
    instructions TEXT,               -- Instrucciones para el cliente
    
    -- Control
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Límites opcionales
    daily_limit DECIMAL(15,2),
    min_amount DECIMAL(15,2),
    max_amount DECIMAL(15,2),
    
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Relación con Orders:**
```sql
ALTER TABLE orders 
ADD COLUMN payment_method_id BIGINT REFERENCES payment_methods;
```

### 2. Backend

**Modelo: `PaymentMethod`**
```php
class PaymentMethod extends Model
{
    // Relaciones
    public function exchangeHouse(): BelongsTo
    public function orders(): HasMany
    
    // Atributos computados
    public function getIconAttribute(): string  // 📱 💵 🏦 etc.
    public function getDisplayNameAttribute(): string  // "Pago Móvil (VES)"
}
```

**Controlador: `PaymentMethodController`**
```php
Routes implementadas:
- GET    /payment-methods           → index()    Lista todos
- POST   /payment-methods           → store()    Crear nuevo
- PUT    /payment-methods/{id}      → update()   Actualizar
- DELETE /payment-methods/{id}      → destroy()  Eliminar
- POST   /payment-methods/{id}/toggle → toggle() Activar/Desactivar
```

### 3. Tipos de Métodos de Pago

```php
'type' => [
    'bank_transfer'   => '🏦 Transferencia Bancaria',
    'mobile_payment'  => '📱 Pago Móvil',
    'zelle'           => '💵 Zelle',
    'crypto'          => '💎 Criptomonedas',
    'cash'            => '💰 Efectivo',
    'wire_transfer'   => '🌐 Wire Transfer',
    'other'           => '💳 Otro',
]
```

---

## 📋 Ejemplos de Uso

### Ejemplo 1: Pago Móvil Venezuela

```json
{
  "name": "Pago Móvil Personal",
  "type": "mobile_payment",
  "currency": "VES",
  "account_holder": "Juan Pérez",
  "account_number": "0412-1234567",
  "bank_name": "Banco de Venezuela",
  "identification": "V-12345678",
  "instructions": "Enviar pago móvil al 0412-1234567. Enviar captura de pantalla del comprobante.",
  "is_active": true,
  "is_default": true,
  "daily_limit": 50000.00,
  "min_amount": 10.00,
  "max_amount": 10000.00
}
```

### Ejemplo 2: Zelle para USD

```json
{
  "name": "Zelle Empresarial",
  "type": "zelle",
  "currency": "USD",
  "account_holder": "CambioExpress LLC",
  "account_number": "cambioexpress@gmail.com",
  "bank_name": "Bank of America",
  "instructions": "Enviar a cambioexpress@gmail.com. Incluir número de orden en el memo.",
  "is_active": true,
  "is_default": true,
  "min_amount": 50.00,
  "max_amount": 5000.00
}
```

### Ejemplo 3: Crypto (USDT)

```json
{
  "name": "USDT TRC20",
  "type": "crypto",
  "currency": "USDT",
  "account_holder": "CambioExpress Wallet",
  "account_number": "TNaRAoLUyYEV3Gnm5mTBk....",
  "bank_name": "Tron Network",
  "instructions": "Enviar USDT por red TRC20 a la dirección proporcionada. Enviar hash de transacción.",
  "is_active": true,
  "min_amount": 50.00
}
```

### Ejemplo 4: Transferencia Bancaria

```json
{
  "name": "Cuenta Corriente USD",
  "type": "bank_transfer",
  "currency": "USD",
  "account_holder": "CambioExpress C.A.",
  "account_number": "0102-0123-45-1234567890",
  "bank_name": "Banco de Venezuela",
  "identification": "J-12345678-9",
  "instructions": "Transferir a cuenta corriente. Enviar comprobante de transferencia.",
  "is_active": true,
  "daily_limit": 100000.00
}
```

---

## 🎨 Frontend (Pendiente)

### Interfaz `ExchangeHouse/PaymentMethods.tsx`

**Estructura propuesta:**

```tsx
<PaymentMethods>
  {/* Header */}
  <Header>
    <h1>Mis Métodos de Pago</h1>
    <Button onClick={openModal}>+ Agregar Método</Button>
  </Header>

  {/* Stats Cards */}
  <StatsGrid>
    <StatCard title="Total Métodos" value="8" />
    <StatCard title="Activos" value="6" />
    <StatCard title="Por Moneda" breakdown={{VES: 3, USD: 3, USDT: 2}} />
  </StatsGrid>

  {/* Lista de métodos por moneda */}
  <CurrencyTabs>
    <Tab value="VES">
      <PaymentMethodCard method={pagoMovil} />
      <PaymentMethodCard method={bancaVES} />
    </Tab>
    
    <Tab value="USD">
      <PaymentMethodCard method={zelle} />
      <PaymentMethodCard method={bancaUSD} />
    </Tab>
    
    <Tab value="USDT">
      <PaymentMethodCard method={usdtTRC20} />
    </Tab>
  </CurrencyTabs>

  {/* Modal Crear/Editar */}
  <PaymentMethodModal />
</PaymentMethods>
```

**PaymentMethodCard:**
```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <span className="text-2xl">{method.icon}</span>
        <h3>{method.name}</h3>
        <Badge>{method.currency}</Badge>
        {method.is_default && <Badge variant="success">Predeterminado</Badge>}
      </div>
      <Switch checked={method.is_active} onToggle={toggle} />
    </div>
  </CardHeader>
  
  <CardContent>
    <dl>
      <dt>Titular:</dt>
      <dd>{method.account_holder}</dd>
      
      <dt>Cuenta/ID:</dt>
      <dd>{method.account_number}</dd>
      
      <dt>Banco/Servicio:</dt>
      <dd>{method.bank_name}</dd>
      
      {method.daily_limit && (
        <>
          <dt>Límite diario:</dt>
          <dd>${method.daily_limit}</dd>
        </>
      )}
    </dl>
    
    {method.instructions && (
      <Alert>
        <AlertDescription>{method.instructions}</AlertDescription>
      </Alert>
    )}
  </CardContent>
  
  <CardFooter>
    <Button onClick={edit}>Editar</Button>
    <Button variant="destructive" onClick={destroy}>Eliminar</Button>
  </CardFooter>
</Card>
```

---

## 🔄 Integración con Órdenes

### Al Crear Orden

**Formulario actualizado:**
```tsx
<form>
  <Select name="currency_pair_id">...</Select>
  <Input name="base_amount">...</Input>
  
  {/* NUEVO: Selector de método de pago */}
  <Select name="payment_method_id">
    <option value="">Selecciona método de pago</option>
    {paymentMethods.map(method => (
      <option key={method.id} value={method.id}>
        {method.icon} {method.display_name}
        {method.is_default && " (Predeterminado)"}
      </option>
    ))}
  </Select>
  
  {/* Mostrar instrucciones del método seleccionado */}
  {selectedMethod?.instructions && (
    <Alert>
      <AlertTitle>Instrucciones de Pago</AlertTitle>
      <AlertDescription>{selectedMethod.instructions}</AlertDescription>
    </Alert>
  )}
  
  <Input name="house_commission_percent">...</Input>
  <Textarea name="notes">...</Textarea>
  
  <Button type="submit">Crear Orden</Button>
</form>
```

### En el Detalle de Orden

```tsx
<OrderDetails>
  <h2>Orden #{order.order_number}</h2>
  
  <dl>
    <dt>Par:</dt>
    <dd>{order.currency_pair.symbol}</dd>
    
    <dt>Monto:</dt>
    <dd>${order.base_amount}</dd>
    
    {/* NUEVO: Método de pago */}
    <dt>Método de Pago:</dt>
    <dd>
      <Badge>
        {order.payment_method.icon} {order.payment_method.name}
      </Badge>
    </dd>
    
    {/* Detalles del método */}
    {order.payment_method && (
      <Card>
        <CardHeader>
          <CardTitle>Detalles de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Enviar a:</strong> {order.payment_method.account_holder}</p>
          <p><strong>Cuenta:</strong> {order.payment_method.account_number}</p>
          <p><strong>Banco:</strong> {order.payment_method.bank_name}</p>
          
          {order.payment_method.instructions && (
            <Alert>
              <AlertDescription>{order.payment_method.instructions}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )}
  </dl>
</OrderDetails>
```

---

## 📊 Estadísticas y Análisis

### Dashboard de Métodos de Pago

```tsx
<MetricsGrid>
  <MetricCard 
    title="Método Más Usado"
    value="Pago Móvil"
    subtitle="45% de las órdenes"
  />
  
  <MetricCard 
    title="Mayor Volumen"
    value="Zelle"
    subtitle="$125,000 este mes"
  />
  
  <MetricCard 
    title="Métodos Activos"
    value="6/8"
    subtitle="2 inactivos"
  />
</MetricsGrid>

<Chart title="Volumen por Método de Pago" data={...} />
<Table title="Órdenes por Método" data={...} />
```

---

## 🔐 Seguridad y Validaciones

### Backend
- ✅ Verificación de propiedad (solo su casa de cambio)
- ✅ No eliminar si tiene órdenes asociadas
- ✅ Solo un método default por moneda
- ✅ Validación de límites (min, max, daily)

### Frontend
- ⏳ Validar formato de cuenta según tipo
- ⏳ Mostrar solo métodos activos en selector
- ⏳ Validar monto contra límites del método
- ⏳ Confirmar antes de eliminar

---

## 🎯 Próximas Mejoras

1. **Verificación Automática**
   - Webhooks de bancos
   - API de Zelle
   - Confirmación de blockchain para crypto

2. **Múltiples Titulares**
   - Varios números de pago móvil
   - Varias cuentas bancarias
   - Rotación automática

3. **Reportes**
   - Volumen por método
   - Método más rentable
   - Análisis de uso

4. **Límites Inteligentes**
   - Límites dinámicos
   - Alertas de proximidad a límite
   - Reseteo automático diario

---

## ✅ Estado Actual

**Backend:** ✅ Completado
- Migraciones ejecutadas
- Modelo con relaciones
- Controlador CRUD completo
- Rutas configuradas

**Frontend:** 🔄 Pendiente
- Componente React
- Formularios de gestión
- Integración en crear orden
- Vista de detalles

---

## 🚀 Para Empezar

### Como Casa de Cambio:

**1. Agregar Pago Móvil:**
```
1. Ir a "Métodos de Pago"
2. Click "Agregar Método"
3. Tipo: Pago Móvil
4. Moneda: VES
5. Nombre: "Pago Móvil Personal"
6. Teléfono: 0412-1234567
7. Banco: Banco de Venezuela
8. CI: V-12345678
9. Marcar como predeterminado
10. Guardar
```

**2. Agregar Zelle:**
```
1. Agregar Método
2. Tipo: Zelle
3. Moneda: USD
4. Nombre: "Zelle Empresarial"
5. Email: tu@empresa.com
6. Banco: Bank of America
7. Instrucciones: "Incluir número de orden"
8. Guardar
```

**3. Usar en Orden:**
```
1. Crear nueva orden
2. Seleccionar par USD/VES
3. Seleccionar "Zelle Empresarial" como método
4. Ver instrucciones de pago
5. Crear orden
```

---

## 💡 Conclusión

El sistema de métodos de pago permite a las casas de cambio:
- ✅ Gestionar múltiples fuentes de recepción
- ✅ Dar instrucciones claras a clientes
- ✅ Controlar límites por método
- ✅ Trazabilidad completa
- ✅ Flexibilidad total

**Resultado:** Control financiero completo y mejor experiencia para los clientes.

---

**Desarrollado con 💳 para gestión financiera profesional**
