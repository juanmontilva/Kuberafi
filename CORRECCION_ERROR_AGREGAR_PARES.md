# Corrección: Error al Agregar Pares a Casa de Cambio

## 🐛 Problema Identificado

Al agregar un par de divisas desde "Pares Disponibles" en la vista de Casa de Cambio, se presentaba un error 500. Sin embargo, después de refrescar la página, el par aparecía correctamente agregado en "Mis Pares Configurados".

### Síntomas
- Error 500 al hacer clic en "Agregar" en un par disponible
- El par se agregaba correctamente a la base de datos
- Después de refrescar, el par aparecía en la lista de pares configurados
- La interfaz no mostraba feedback del error al usuario

## 🔍 Causa Raíz

El error ocurría en el método `saveRateChange()` del modelo `CurrencyPair` (línea 75), que se ejecuta después de agregar un par para crear el registro inicial en el historial de tasas.

**Problema:** Desajuste entre la estructura de la tabla `currency_pair_rate_history` y los campos que el modelo intentaba insertar.

### Columnas en la migración original:
- `rate`, `previous_rate`, `changed_by_type`, `changed_by_user_id`, `valid_until`, `is_current`

### Columnas que el modelo intentaba usar:
- `rate`, `margin_percent`, `effective_rate`, `min_amount`, `max_amount`, `changed_by`, `change_reason`, `notes`, `valid_from`, `valid_until`, `is_current`

## ✅ Solución Aplicada

### 1. Actualización de la Migración
Se actualizó la migración `2025_10_28_232513_create_currency_pair_rate_history_table.php` para incluir todas las columnas necesarias:

```php
Schema::create('currency_pair_rate_history', function (Blueprint $table) {
    $table->id();
    $table->foreignId('currency_pair_id')->constrained('currency_pairs')->onDelete('cascade');
    $table->foreignId('exchange_house_id')->nullable()->constrained('exchange_houses')->onDelete('cascade');
    $table->decimal('rate', 20, 8);
    $table->decimal('margin_percent', 8, 4)->default(0);
    $table->decimal('effective_rate', 20, 8);
    $table->decimal('min_amount', 20, 2)->nullable();
    $table->decimal('max_amount', 20, 2)->nullable();
    $table->foreignId('changed_by')->nullable()->constrained('users')->onDelete('set null');
    $table->string('change_reason')->nullable(); // 'initial', 'manual', 'automatic'
    $table->text('notes')->nullable();
    $table->timestamp('valid_from')->nullable();
    $table->timestamp('valid_until')->nullable();
    $table->boolean('is_current')->default(false);
    $table->timestamps();
    
    // Índices para mejorar rendimiento
    $table->index(['currency_pair_id', 'exchange_house_id', 'is_current'], 'cprh_pair_house_current_idx');
    $table->index(['currency_pair_id', 'created_at'], 'cprh_pair_created_idx');
});
```

### 2. Corrección del Seeder
Se agregó el campo `house_commission_percent` a las órdenes en `KuberafiSeeder.php`, que era requerido por el método `calculateCommissions()`:

```php
$order1 = Order::create([
    // ... otros campos
    'house_commission_percent' => 5.00, // ✅ Campo agregado
    // ... otros campos
]);
```

### 3. Corrección de Importación en Frontend
Se corrigió una importación rota en `resources/js/pages/settings/appearance.tsx`:

```typescript
// Antes (causaba error de build):
import { edit as editAppearance } from '@/routes/appearance';

// Después:
// import { edit as editAppearance } from '@/routes/appearance';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];
```

## 🧪 Verificación

Se creó un script de prueba (`test_attach_pair.sh`) que verifica:
1. ✅ Agregar un par a una casa de cambio
2. ✅ Crear el registro en el historial de tasas
3. ✅ Verificar que los datos se guardaron correctamente

### Resultado de la prueba:
```
✅ Usuario: maria@cambioexpress.com
✅ Casa de cambio: CambioExpress
✅ Par disponible: BTC/USD
✅ Par agregado exitosamente!
✅ Historial de tasas creado!
✅ Registro en historial verificado:
   - Tasa base: 43250.00000000
   - Margen: 5.0000%
   - Tasa efectiva: 45412.50000000
```

## 📝 Archivos Modificados

1. `database/migrations/2025_10_28_232513_create_currency_pair_rate_history_table.php`
2. `database/seeders/KuberafiSeeder.php`
3. `resources/js/pages/settings/appearance.tsx`

## 🚀 Pasos para Aplicar

```bash
# 1. Recrear la base de datos con la migración corregida
php artisan migrate:fresh

# 2. Ejecutar los seeders
php artisan db:seed --class=SystemSettingsSeeder
php artisan db:seed --class=CurrencyPairSeeder
php artisan db:seed --class=KuberafiSeeder

# 3. Compilar assets del frontend
npm run build

# 4. (Opcional) Ejecutar el script de prueba
chmod +x test_attach_pair.sh
./test_attach_pair.sh
```

## ✨ Resultado

Ahora al agregar un par desde "Pares Disponibles":
- ✅ No se genera error 500
- ✅ El par se agrega correctamente
- ✅ Se crea el registro en el historial de tasas
- ✅ La interfaz muestra el mensaje de éxito
- ✅ El par aparece inmediatamente en "Mis Pares Configurados"
- ✅ No es necesario refrescar la página

## 📊 Impacto

- **Funcionalidad:** Completamente restaurada
- **Experiencia de usuario:** Mejorada significativamente
- **Integridad de datos:** Mantenida (los datos se guardaban correctamente antes)
- **Historial de tasas:** Ahora funciona correctamente desde el inicio
