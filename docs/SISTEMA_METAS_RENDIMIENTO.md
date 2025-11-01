# 🎯 Sistema de Metas de Rendimiento - Kuberafi

## 📋 Descripción

Sistema que permite a las **casas de cambio** configurar metas personalizadas de rendimiento para sus operadores. Las metas se pueden establecer por diferentes períodos (diarias, semanales, mensuales, trimestrales y anuales).

---

## ✨ Características

### 1. **Configuración Flexible**
- ✅ Metas por período: Hoy, Semana, Mes, Trimestre, Año
- ✅ Tres métricas principales:
  - Órdenes Completadas
  - Volumen Operado ($)
  - Comisiones Ganadas ($)

### 2. **Interfaz Intuitiva**
- ✅ Pestañas para cada período
- ✅ Formularios simples y claros
- ✅ Responsive (móvil y desktop)
- ✅ Consejos y guías integradas

### 3. **Visualización en Rendimiento**
- ✅ Barras de progreso hacia las metas
- ✅ Porcentaje de cumplimiento
- ✅ Comparación actual vs meta

---

## 🗄️ Estructura de Base de Datos

### Tabla: `performance_goals`

```sql
CREATE TABLE performance_goals (
    id BIGINT PRIMARY KEY,
    exchange_house_id BIGINT,  -- Casa de cambio propietaria
    period ENUM('today', 'week', 'month', 'quarter', 'year'),
    orders_goal INT DEFAULT 0,
    volume_goal DECIMAL(15,2) DEFAULT 0,
    commission_goal DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(exchange_house_id, period)
);
```

### Relaciones
- `exchange_house_id` → `users.id` (Casa de Cambio)
- Una meta por período por casa de cambio

---

## 🚀 Uso

### Para Casas de Cambio

#### 1. Acceder a Configuración
```
Sidebar → Configurar Metas
```

#### 2. Seleccionar Período
- Diarias
- Semanales
- Mensuales (recomendado)
- Trimestrales
- Anuales

#### 3. Establecer Metas
```
Órdenes Completadas: 200
Volumen Operado: $100,000
Comisiones Ganadas: $5,000
```

#### 4. Guardar
Las metas se aplican inmediatamente a todos los operadores.

### Para Operadores

#### Ver Progreso
```
Sidebar → Mi Rendimiento
```

Se muestra:
- ✅ Progreso actual vs meta
- ✅ Barra de progreso visual
- ✅ Porcentaje de cumplimiento

---

## 📊 Metas por Defecto

### Diarias
- Órdenes: 10
- Volumen: $5,000
- Comisiones: $250

### Semanales
- Órdenes: 50
- Volumen: $25,000
- Comisiones: $1,250

### Mensuales
- Órdenes: 200
- Volumen: $100,000
- Comisiones: $5,000

### Trimestrales
- Órdenes: 600
- Volumen: $300,000
- Comisiones: $15,000

### Anuales
- Órdenes: 2,400
- Volumen: $1,200,000
- Comisiones: $60,000

---

## 🔧 Archivos Creados/Modificados

### Backend (5 archivos)

#### 1. Migración
```
database/migrations/2025_10_28_215756_create_performance_goals_table.php
```

#### 2. Modelo
```php
app/Models/PerformanceGoal.php
```

#### 3. Controlador
```php
app/Http/Controllers/PerformanceGoalController.php
```

#### 4. Controlador Actualizado
```php
app/Http/Controllers/PerformanceController.php
// Método getGoals() actualizado para usar BD
```

#### 5. Seeder
```php
database/seeders/PerformanceGoalSeeder.php
```

### Frontend (2 archivos)

#### 1. Página de Configuración
```tsx
resources/js/pages/Performance/Goals.tsx
```

#### 2. Sidebar Actualizado
```tsx
resources/js/components/kuberafi-sidebar.tsx
// Agregado enlace "Configurar Metas"
```

### Rutas (1 archivo)

```php
routes/web.php
// Agregadas rutas:
// GET  /performance-goals
// POST /performance-goals
```

---

## 🎨 Interfaz de Usuario

### Página de Configuración

```
┌─────────────────────────────────────────┐
│ 🎯 Metas de Rendimiento                 │
│ Configura las metas para tus operadores │
├─────────────────────────────────────────┤
│                                         │
│ [Diarias][Semanales][Mensuales]...     │
│                                         │
│ 📈 Metas Mensuales                      │
│ Metas que tus operadores deben          │
│ alcanzar cada mes                       │
│                                         │
│ Órdenes Completadas                     │
│ [200                    ]               │
│                                         │
│ Volumen Operado ($)                     │
│ [100000                 ]               │
│                                         │
│ Comisiones Ganadas ($)                  │
│ [5000                   ]               │
│                                         │
│              [💾 Guardar Metas]         │
│                                         │
│ 💡 Consejos para establecer metas       │
│ • Establece metas realistas...          │
│ • Considera la estacionalidad...        │
└─────────────────────────────────────────┘
```

### Visualización en Mi Rendimiento

```
┌─────────────────────────────────────────┐
│ 🎯 Metas de Este Mes                    │
│ Progreso hacia tus objetivos            │
├─────────────────────────────────────────┤
│                                         │
│ Órdenes Completadas        14 / 200    │
│ [████░░░░░░░░░░░░░░░░░░░░] 7%          │
│                                         │
│ Volumen Operado    $14,500 / $100,000  │
│ [███░░░░░░░░░░░░░░░░░░░░░] 14.5%       │
│                                         │
│ Comisiones         $668.57 / $5,000    │
│ [███░░░░░░░░░░░░░░░░░░░░░] 13.4%       │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔐 Permisos

### Casa de Cambio
- ✅ Ver metas
- ✅ Configurar metas
- ✅ Editar metas
- ✅ Ver progreso de operadores

### Operador
- ✅ Ver metas asignadas
- ✅ Ver su progreso
- ❌ No puede modificar metas

### Super Admin
- ✅ Ver todas las metas
- ❌ No puede modificar (son de cada casa)

---

## 📈 Casos de Uso

### Caso 1: Nueva Casa de Cambio
```
1. Se registra la casa de cambio
2. Se ejecuta el seeder (automático)
3. Se crean metas por defecto
4. Casa puede personalizarlas
```

### Caso 2: Ajuste de Metas
```
1. Casa de cambio accede a "Configurar Metas"
2. Selecciona período (ej: Mensuales)
3. Modifica valores según su realidad
4. Guarda cambios
5. Operadores ven nuevas metas inmediatamente
```

### Caso 3: Operador Consulta Progreso
```
1. Operador accede a "Mi Rendimiento"
2. Selecciona período (ej: Este Mes)
3. Ve barras de progreso hacia metas
4. Identifica áreas de mejora
```

---

## 💡 Consejos para Casas de Cambio

### Establecer Metas Efectivas

1. **Basarse en Datos Históricos**
   - Revisar desempeño de meses anteriores
   - Considerar tendencias de crecimiento
   - Ajustar según capacidad del equipo

2. **Considerar Estacionalidad**
   - Meses altos: aumentar metas
   - Meses bajos: metas más conservadoras
   - Eventos especiales: ajustes temporales

3. **Comunicación Clara**
   - Explicar las metas al equipo
   - Establecer incentivos por cumplimiento
   - Revisar progreso semanalmente

4. **Revisión Periódica**
   - Evaluar cada trimestre
   - Ajustar según resultados
   - Mantener metas desafiantes pero alcanzables

5. **Motivación del Equipo**
   - Celebrar logros
   - Reconocer esfuerzos
   - Ofrecer apoyo para alcanzar metas

---

## 🔄 Flujo de Datos

```
┌─────────────────┐
│ Casa de Cambio  │
│ Configura Metas │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ performance_    │
│ goals (BD)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Performance     │
│ Controller      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Mi Rendimiento  │
│ (Operador)      │
└─────────────────┘
```

---

## 🧪 Testing

### Probar Configuración

```bash
# 1. Acceder como Casa de Cambio
# 2. Ir a "Configurar Metas"
# 3. Cambiar metas mensuales:
#    - Órdenes: 150
#    - Volumen: $75,000
#    - Comisiones: $3,750
# 4. Guardar

# 5. Acceder como Operador de esa casa
# 6. Ir a "Mi Rendimiento"
# 7. Verificar que las metas se reflejen
```

### Verificar Base de Datos

```sql
-- Ver metas de una casa de cambio
SELECT * FROM performance_goals 
WHERE exchange_house_id = 1;

-- Ver progreso vs metas
SELECT 
    pg.period,
    pg.orders_goal,
    COUNT(o.id) as current_orders,
    pg.volume_goal,
    SUM(o.base_amount) as current_volume
FROM performance_goals pg
LEFT JOIN orders o ON o.user_id = 2 -- operador
    AND o.status = 'completed'
    AND o.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
WHERE pg.exchange_house_id = 1
    AND pg.period = 'month'
GROUP BY pg.id;
```

---

## 🚀 Próximas Mejoras

### Prioridad Alta
- [ ] Notificaciones al alcanzar metas
- [ ] Alertas cuando se está lejos de la meta
- [ ] Historial de metas anteriores

### Prioridad Media
- [ ] Metas individuales por operador
- [ ] Comparación entre operadores
- [ ] Gráficas de evolución

### Prioridad Baja
- [ ] Metas por par de divisas
- [ ] Metas por tipo de cliente
- [ ] Predicción de cumplimiento

---

## 📝 Notas Técnicas

### Validaciones
- Metas no pueden ser negativas
- Período debe ser válido
- Solo casas de cambio pueden configurar
- Una meta por período por casa

### Performance
- Índice en `(exchange_house_id, period)`
- Consultas optimizadas
- Cache de metas frecuentes (futuro)

### Seguridad
- Middleware `role:exchange_house`
- Validación de ownership
- Sanitización de inputs

---

## 🎉 Conclusión

El sistema de metas de rendimiento permite a las casas de cambio:

1. ✅ **Establecer objetivos claros** para sus operadores
2. ✅ **Motivar al equipo** con metas alcanzables
3. ✅ **Medir progreso** en tiempo real
4. ✅ **Ajustar estrategias** según resultados
5. ✅ **Mejorar productividad** general

**Fecha de implementación:** Octubre 2025  
**Versión:** 1.0  
**Estado:** ✅ Completado y Funcional
