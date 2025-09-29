# 📊 Gestión de Pares de Divisas - KuberaFi

## 🎯 Descripción General

Sistema completo de gestión de pares de divisas que permite control centralizado por el Super Administrador y configuración personalizada por cada Casa de Cambio.

## 🏗️ Arquitectura

### **Modelo Híbrido:**

1. **Super Admin (Control Centralizado):**
   - Crea y administra pares de divisas base
   - Define tasas de mercado actualizadas
   - Establece límites mínimos y máximos globales
   - Activa/desactiva pares en la plataforma
   - Ve cuántas casas usan cada par

2. **Casas de Cambio (Configuración Flexible):**
   - Seleccionan pares disponibles
   - Configuran su **margen de ganancia** por par
   - Establecen límites personalizados (override)
   - Activan/desactivan pares propios
   - Ven ganancias proyectadas en tiempo real

## 💰 Cálculo de Comisiones

### Fórmula de Tasa Efectiva:
```
Tasa Efectiva = Tasa Base × (1 + Margen Casa de Cambio %)
```

### Ejemplo Práctico:
- **Tasa Base USD/VES:** 36.50
- **Margen Casa de Cambio:** 2.5%
- **Tasa Efectiva:** 36.50 × 1.025 = **37.4125**
- **Ganancia por $1000 USD:** $25.00

### Comisión de Plataforma:
La comisión del super admin se aplica **sobre el monto total** de la operación, independiente del margen de la casa de cambio.

## 📂 Estructura de Base de Datos

### Tabla: `currency_pairs`
```sql
- id
- base_currency (VARCHAR 3)
- quote_currency (VARCHAR 3)  
- symbol (UNIQUE) ej: USD/VES
- current_rate (DECIMAL 15,6)
- min_amount (DECIMAL 15,2)
- max_amount (DECIMAL 15,2)
- is_active (BOOLEAN)
- timestamps
```

### Tabla Pivot: `exchange_house_currency_pair`
```sql
- id
- exchange_house_id (FK)
- currency_pair_id (FK)
- margin_percent (DECIMAL 8,4) -- Margen de ganancia
- min_amount (DECIMAL 15,2) -- Override opcional
- max_amount (DECIMAL 15,2) -- Override opcional
- is_active (BOOLEAN) -- Control por casa
- timestamps
- UNIQUE(exchange_house_id, currency_pair_id)
```

## 🛣️ Rutas

### Super Admin:
```php
GET    /admin/currency-pairs              // Listar todos los pares
POST   /admin/currency-pairs              // Crear nuevo par
PUT    /admin/currency-pairs/{id}         // Actualizar par
DELETE /admin/currency-pairs/{id}         // Eliminar par
POST   /admin/currency-pairs/{id}/toggle  // Activar/Desactivar
```

### Casa de Cambio:
```php
GET    /currency-pairs                    // Ver mis pares y disponibles
POST   /currency-pairs/{id}/attach        // Agregar par con configuración
PUT    /currency-pairs/{id}               // Actualizar mi configuración
POST   /currency-pairs/{id}/toggle        // Activar/Desactivar mi par
DELETE /currency-pairs/{id}               // Eliminar mi configuración
```

## 🎨 Componentes React

### `/pages/Admin/CurrencyPairs.tsx`
**Funcionalidades:**
- Formulario de creación de pares
- Lista con estadísticas (total, activos, casas configuradas)
- Edición de tasas y límites
- Toggle de activación
- Validación: no eliminar si hay casas usando el par

### `/pages/ExchangeHouse/CurrencyPairs.tsx`
**Funcionalidades:**
- Pares activos con configuración personalizada
- Pares disponibles para agregar
- Calculadora de ganancias en tiempo real
- Cards informativos sobre márgenes
- Validación: no eliminar si hay órdenes asociadas

## 🔐 Seguridad y Validaciones

### Backend:
- ✅ Validación de códigos de moneda (3 caracteres)
- ✅ No eliminar pares con órdenes existentes
- ✅ Isolation: casas solo ven sus propios pares
- ✅ Validación de márgenes (0-100%)
- ✅ Verificación de duplicados

### Frontend:
- ✅ Confirmación antes de eliminar
- ✅ Deshabilitar botones durante guardado
- ✅ Feedback visual con notificaciones
- ✅ Preview de tasas efectivas
- ✅ Calculadora de ganancias

## 📊 Beneficios del Sistema

### Para Super Admin:
1. **Control Total:** Define qué pares existen en la plataforma
2. **Trazabilidad:** Ve cuántas casas usan cada par
3. **Flexibilidad:** Puede desactivar pares sin eliminarlos
4. **Reportes:** Base para análisis de pares más usados

### Para Casas de Cambio:
1. **Autonomía:** Define sus propios márgenes de ganancia
2. **Transparencia:** Ve ganancias proyectadas antes de confirmar
3. **Personalización:** Puede establecer límites diferentes
4. **Control:** Activa/desactiva pares según demanda

## 🚀 Casos de Uso

### Caso 1: Crear Nuevo Par (Super Admin)
1. Navegar a "Pares de Divisas"
2. Click en "Crear Par"
3. Ingresar monedas base y cotizada
4. Definir tasa actual del mercado
5. Establecer límites opcionales
6. Guardar

### Caso 2: Configurar Par (Casa de Cambio)
1. Navegar a "Pares"
2. Ver pares disponibles
3. Click en "Agregar" en el par deseado
4. Definir margen de ganancia (ej: 2.5%)
5. Ajustar límites si es necesario
6. Ver preview de ganancia
7. Confirmar

### Caso 3: Actualizar Tasa (Super Admin)
1. Buscar el par en la lista
2. Click en editar
3. Actualizar `current_rate`
4. Guardar
5. Todas las casas verán la nueva tasa automáticamente

## 🔄 Integración con Órdenes

Al crear una orden:
```php
$pair = $exchangeHouse->activeCurrencyPairs()
    ->where('currency_pair_id', $request->pair_id)
    ->first();

$effectiveRate = $pair->current_rate * (1 + $pair->pivot->margin_percent / 100);
```

## 📈 Métricas Sugeridas

- Pares más usados por volumen
- Margen promedio por par
- Casas con mejor performance por par
- Tendencias de tasas históricas
- Comparativa de márgenes entre casas

## 🎯 Próximas Mejoras

1. **Actualización automática de tasas** via API externa
2. **Histórico de tasas** para análisis
3. **Alertas** cuando una tasa cambia significativamente
4. **Límites dinámicos** basados en liquidez
5. **Recomendaciones** de márgenes competitivos

## 📚 Referencias

- Migraciones: `database/migrations/2025_09_29_211800_create_exchange_house_currency_pair_table.php`
- Modelos: `app/Models/CurrencyPair.php`, `app/Models/ExchangeHouse.php`
- Controladores: `app/Http/Controllers/Admin/CurrencyPairController.php`
- Seeder: `database/seeders/CurrencyPairSeeder.php`

---

**Desarrollado para KuberaFi** - Sistema de gestión financiera de primera clase 🚀
