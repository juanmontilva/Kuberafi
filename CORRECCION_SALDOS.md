# Corrección de Lógica de Saldos en Órdenes

## Problema Identificado

La lógica de control de saldos estaba invertida tanto en el backend como en el frontend.

### Ejemplo del problema:
- Cliente entrega: **100 USD**
- Casa de cambio entrega: **28,310 VES**

**Comportamiento incorrecto anterior:**
- Saldo USD: Se restaba (-100) ❌
- Saldo VES: Se sumaba (+28,310) ❌

**Comportamiento correcto ahora:**
- Saldo USD: Se suma (+100) ✅ (porque RECIBES del cliente)
- Saldo VES: Se resta (-28,310) ✅ (porque ENTREGAS al cliente)

---

## Cambios Realizados

### 1. Backend: `app/Observers/OrderObserver.php`

**Cambios principales:**
- Ahora usa los métodos de pago específicos guardados en la orden (`payment_method_in_id` y `payment_method_out_id`)
- Corregida la lógica:
  - `payment_method_in` = Cuenta que RECIBE del cliente → **SUMA** al saldo
  - `payment_method_out` = Cuenta que ENTREGA al cliente → **RESTA** del saldo

**Código anterior:**
```php
// Buscaba métodos de pago genéricos por moneda
$paymentMethodIn = PaymentMethod::where('currency', $baseCurrency)->first();
$paymentMethodOut = PaymentMethod::where('currency', $quoteCurrency)->first();

// Lógica confusa sobre qué entra y qué sale
```

**Código nuevo:**
```php
// Usa los métodos específicos de la orden
$paymentMethodIn = $order->paymentMethodIn;
$paymentMethodOut = $order->paymentMethodOut;

// ENTRADA: El operador RECIBE del cliente
$balanceIn->increment($order->base_amount, "Recibido de cliente...");

// SALIDA: El operador ENTREGA al cliente
$balanceOut->decrement($order->quote_amount, "Entregado a cliente...");
```

---

### 2. Frontend: `resources/js/pages/Orders/Create.tsx`

**Cambios en el componente "Control de Saldo":**

**Para Base Currency (USD):**
- Antes: "Entregas al cliente: -100" ❌
- Ahora: "Recibes del cliente: +100" ✅
- Cálculo: `saldoInicial + baseAmount` (suma)

**Para Quote Currency (VES):**
- Antes: "Recibes del cliente: +28,310" ❌
- Ahora: "Entregas al cliente: -28,310" ✅
- Cálculo: `saldoInicial - quoteAmount` (resta)

---

## Flujo Correcto de una Orden

### Ejemplo: USD/VES con tasa 298.10

1. **Cliente entrega:** 100 USD
2. **Casa de cambio calcula:**
   - Comisión: 5% = $5
   - Monto a cambiar: $95
   - Cliente recibe: 95 × 298.10 = 28,310 VES

3. **Movimientos de saldo del operador:**
   - ✅ Saldo USD: 600 → 700 (+100 recibido)
   - ✅ Saldo VES: 21,690 → -6,620 (-28,310 entregado)

4. **Registro en base de datos:**
   - `CashMovement` tipo `order_in`: +100 USD
   - `CashMovement` tipo `order_out`: -28,310 VES

---

## Validaciones que Permanecen

La validación de saldo suficiente **sigue siendo correcta** en `OrderController::store()`:

```php
// Verifica que el operador tenga suficiente saldo en la moneda que va a ENTREGAR
if ($availableBalance < $quoteAmount) {
    return back()->withErrors([
        'base_amount' => "Saldo insuficiente en {$quoteCurrency}..."
    ]);
}
```

Esto previene que se creen órdenes sin fondos suficientes para entregar al cliente.

---

## Testing Recomendado

1. **Crear una orden nueva** con modo manual
2. **Verificar en "Control de Saldo"** que:
   - Base currency (USD) muestre: "Recibes del cliente: +X"
   - Quote currency (VES) muestre: "Entregas al cliente: -Y"
3. **Completar la orden**
4. **Verificar en "Mi Fondo de Caja"** que:
   - Saldo USD aumentó
   - Saldo VES disminuyó
5. **Revisar historial de movimientos** para confirmar los registros

---

## Archivos Modificados

- ✅ `app/Observers/OrderObserver.php`
- ✅ `resources/js/pages/Orders/Create.tsx`

---

## Notas Adicionales

- Los movimientos de caja se registran **solo cuando la orden se completa** (status = 'completed')
- Al cancelar una orden, los movimientos se revierten automáticamente
- El sistema soporta tanto modo automático como manual de selección de métodos de pago
