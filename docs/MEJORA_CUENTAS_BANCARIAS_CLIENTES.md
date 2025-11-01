# Mejora: Cuentas Bancarias de Clientes

## Problema Identificado

Los operadores necesitaban llenar formularios repetitivos cada vez que realizaban operaciones con los mismos clientes. No había forma de guardar las cuentas bancarias frecuentes de los clientes.

## Solución Implementada

### Sistema de Cuentas Bancarias

Se agregó una sección de "Cuentas Bancarias" en el perfil del cliente donde se pueden:

1. **Agregar cuentas bancarias** con información completa
2. **Editar cuentas existentes** cuando cambien datos
3. **Eliminar cuentas** que ya no se usen
4. **Ver todas las cuentas** del cliente en un solo lugar

### Información que se Guarda

Para cada cuenta bancaria se almacena:

- **Nombre de la Cuenta**: Identificador personalizado (ej: "Cuenta Principal", "Cuenta Nómina")
- **Banco**: Nombre de la institución bancaria
- **Número de Cuenta**: Número completo de la cuenta
- **Tipo de Cuenta**: Ahorro, Corriente, etc. (opcional)
- **Moneda**: USD, VES, EUR, COP, ARS, etc.
- **Notas**: Información adicional relevante

### Ubicación

La sección de cuentas bancarias se encuentra en:
- **CRM → Clientes → [Seleccionar Cliente] → Pestaña "Información"**

Aparece después de "Datos de Contacto" y "Notas Internas".

## Beneficios

✅ **Ahorro de tiempo**: No más formularios repetitivos
✅ **Menos errores**: Datos guardados correctamente desde el inicio
✅ **Organización**: Todas las cuentas del cliente en un solo lugar
✅ **Flexibilidad**: Múltiples cuentas por cliente
✅ **Trazabilidad**: Historial de cuentas utilizadas

## Estructura de Datos

### Tabla: `customer_bank_accounts`

```sql
- id: bigint (PK)
- customer_id: bigint (FK → customers)
- account_name: string
- bank_name: string
- account_number: string
- account_type: string (nullable)
- currency: string (default: 'USD')
- notes: text (nullable)
- created_at: timestamp
- updated_at: timestamp
```

## Archivos Creados/Modificados

### Backend

**Nuevos:**
- `database/migrations/2025_10_30_204916_create_customer_bank_accounts_table.php`
- `app/Models/CustomerBankAccount.php`
- `app/Http/Controllers/ExchangeHouse/CustomerBankAccountController.php`

**Modificados:**
- `app/Models/Customer.php`: Agregada relación `bankAccounts()`
- `app/Http/Controllers/ExchangeHouse/CustomerController.php`: Método `show()` carga cuentas bancarias
- `routes/web.php`: Agregadas rutas para CRUD de cuentas bancarias

### Frontend

**Modificados:**
- `resources/js/pages/ExchangeHouse/CustomerDetail.tsx`: 
  - Agregada interfaz `BankAccount`
  - Agregados formularios y handlers para gestionar cuentas
  - Agregada sección visual de cuentas bancarias

## Rutas API

```php
POST   /customers/{customer}/bank-accounts           // Crear cuenta
PUT    /customers/{customer}/bank-accounts/{account} // Actualizar cuenta
DELETE /customers/{customer}/bank-accounts/{account} // Eliminar cuenta
```

## Ejemplo de Uso

1. Ir al perfil del cliente
2. En la pestaña "Información", buscar "Cuentas Bancarias"
3. Hacer clic en "Agregar Cuenta"
4. Llenar el formulario:
   - Nombre: "Cuenta Principal"
   - Banco: "Banco de Venezuela"
   - Número: "0102-1234-5678-9012"
   - Tipo: "Ahorro"
   - Moneda: "VES"
   - Notas: "Cuenta para recibir bolívares"
5. Guardar

La cuenta queda registrada y disponible para futuras operaciones.

## Seguridad

- Solo usuarios del mismo exchange house pueden ver/editar cuentas
- Validación de pertenencia en cada operación
- Eliminación en cascada si se elimina el cliente
- Confirmación antes de eliminar cuentas

## Próximas Mejoras Sugeridas

- Integración con formulario de creación de órdenes (autocompletar datos bancarios)
- Marcar cuenta como "predeterminada"
- Validación de formato de número de cuenta por banco
- Historial de uso de cada cuenta
