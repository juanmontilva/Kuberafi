# Plan de Migración a PostgreSQL - KuberaFi

## Estado Actual
- Actualmente usando base de datos SQLite (desarrollo)
- Necesidad de migrar a PostgreSQL para producción
- PostgreSQL es necesario para potenciar la fórmula de KuberaFi

## Razones para la Migración

### 1. **Capacidades Avanzadas de PostgreSQL**
- **JSON/JSONB**: Soporte nativo para datos JSON con indexación y consultas optimizadas
- **Funciones de Ventana**: Análisis avanzado de datos financieros
- **CTEs (Common Table Expressions)**: Consultas recursivas para cálculos complejos
- **Full-Text Search**: Búsqueda avanzada de transacciones
- **Extensiones**: PostGIS, pg_trgm, hstore, etc.

### 2. **Escalabilidad**
- Manejo de millones de transacciones concurrentes
- Mejor performance en operaciones de escritura simultáneas
- Soporte para particionamiento de tablas
- Replicación y alta disponibilidad

### 3. **Integridad de Datos**
- Constraints más robustos
- Triggers y stored procedures avanzados
- ACID compliant con mejor aislamiento de transacciones
- Tipos de datos especializados (NUMERIC para precisión financiera)

### 4. **Análisis Financiero Avanzado**
- Agregaciones complejas para gráficas del dashboard
- Cálculos de comisiones y tasas en tiempo real
- Análisis histórico de tendencias
- Reportes financieros complejos

## Pasos de Migración

### Fase 1: Preparación (Pendiente)
- [ ] Instalar PostgreSQL localmente
- [ ] Configurar conexión en `.env`
- [ ] Verificar que todas las migraciones sean compatibles con PostgreSQL
- [ ] Revisar queries específicas de SQLite que necesiten ajuste

### Fase 2: Configuración (Pendiente)
```bash
# 1. Instalar PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# 2. Crear base de datos
createdb kuberafi_dev
createdb kuberafi_test

# 3. Configurar .env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=kuberafi_dev
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

### Fase 3: Ajustes de Código (Pendiente)
- [ ] Revisar tipos de datos en migraciones:
  - `DECIMAL` → `NUMERIC` para valores monetarios
  - `BOOLEAN` manejo nativo
  - `JSON` → `JSONB` para mejor performance
  
- [ ] Ajustar queries específicas:
  - SQLite: `strftime()` → PostgreSQL: `to_char()`
  - SQLite: `||` (concatenación) → PostgreSQL: `CONCAT()` o `||`
  - SQLite: `AUTOINCREMENT` → PostgreSQL: `SERIAL` o `BIGSERIAL`

### Fase 4: Testing (Pendiente)
- [ ] Ejecutar suite de tests completa
- [ ] Verificar integridad de datos
- [ ] Performance testing con datos de prueba
- [ ] Verificar todas las queries del dashboard

### Fase 5: Producción (Pendiente)
- [ ] Backup completo de datos actuales
- [ ] Migración de datos de SQLite a PostgreSQL
- [ ] Verificación en staging
- [ ] Deploy a producción
- [ ] Monitoreo post-migración

## Mejoras Pendientes con PostgreSQL

### 1. Dashboard de Casas de Cambio
```sql
-- Query optimizado para gráficas con Window Functions
WITH daily_stats AS (
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as orders,
    SUM(base_amount) as volume,
    SUM(commission) as commissions,
    LAG(SUM(base_amount)) OVER (ORDER BY DATE(created_at)) as prev_volume
  FROM orders
  WHERE created_at >= NOW() - INTERVAL '7 days'
  GROUP BY DATE(created_at)
)
SELECT 
  date,
  orders,
  volume,
  commissions,
  CASE 
    WHEN prev_volume > 0 THEN ((volume - prev_volume) / prev_volume * 100)
    ELSE 0
  END as volume_change_percent
FROM daily_stats;
```

### 2. Análisis de Horarios Pico
```sql
-- Distribución de operaciones por hora
SELECT 
  EXTRACT(HOUR FROM created_at) as hour,
  COUNT(*) as operations,
  SUM(base_amount) as volume,
  AVG(base_amount) as avg_amount
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour;
```

### 3. Top Clientes con Métricas
```sql
-- Top clientes con análisis avanzado
SELECT 
  u.name,
  u.email,
  COUNT(o.id) as total_operations,
  SUM(o.base_amount) as total_volume,
  SUM(o.commission) as total_commission,
  AVG(o.base_amount) as avg_operation,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY o.base_amount) as median_operation
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.created_at >= DATE_TRUNC('month', NOW())
GROUP BY u.id, u.name, u.email
ORDER BY total_volume DESC
LIMIT 10;
```

### 4. Análisis de Comisiones por Par
```sql
-- Comisiones por par de divisas con tendencias
WITH pair_stats AS (
  SELECT 
    cp.symbol,
    DATE_TRUNC('day', o.created_at) as date,
    COUNT(*) as operations,
    SUM(o.commission) as daily_commission,
    SUM(o.base_amount) as daily_volume
  FROM orders o
  JOIN currency_pairs cp ON o.currency_pair_id = cp.id
  WHERE o.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY cp.symbol, DATE_TRUNC('day', o.created_at)
)
SELECT 
  symbol,
  SUM(operations) as total_operations,
  SUM(daily_commission) as total_commission,
  AVG(daily_commission) as avg_daily_commission,
  STDDEV(daily_commission) as volatility
FROM pair_stats
GROUP BY symbol
ORDER BY total_commission DESC;
```

## Ventajas para KuberaFi

### 1. **Fórmula de KuberaFi Potenciada**
- Cálculos financieros precisos con tipo NUMERIC
- Window functions para análisis de tendencias
- CTEs recursivos para cálculos complejos de tasas

### 2. **Dashboard Mejorado**
- Queries más rápidas para gráficas en tiempo real
- Agregaciones complejas sin impacto en performance
- Análisis histórico eficiente

### 3. **Multi-Tenancy Optimizado**
- Row-Level Security (RLS) para aislamiento de datos
- Schemas separados por tenant
- Mejor gestión de conexiones concurrentes

### 4. **Integridad y Seguridad**
- Constraints y validaciones a nivel de BD
- Triggers para auditoría automática
- Mejor manejo de transacciones concurrentes

## Checklist Pre-Migración

### Base de Datos
- [ ] Revisar todas las migraciones
- [ ] Verificar tipos de datos
- [ ] Identificar queries específicas de SQLite
- [ ] Planificar índices optimizados

### Aplicación
- [ ] Actualizar queries en modelos Eloquent
- [ ] Verificar raw queries
- [ ] Actualizar tests
- [ ] Documentar cambios

### Infraestructura
- [ ] Configurar PostgreSQL en servidores
- [ ] Configurar backups automáticos
- [ ] Configurar monitoring
- [ ] Configurar replicación (si aplica)

### Testing
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Tests de performance
- [ ] Tests de carga

## Notas Importantes

1. **No eliminar SQLite aún**: Mantener compatibilidad durante desarrollo
2. **Usar NUMERIC para dinero**: Evitar problemas de precisión con FLOAT/DOUBLE
3. **Índices estratégicos**: Crear índices en columnas frecuentemente consultadas
4. **Prepared Statements**: Laravel/Eloquent ya lo maneja, pero verificar raw queries
5. **Connection Pooling**: Configurar PgBouncer para mejor performance en producción

## Timeline Estimado

1. **Preparación**: 1-2 días
2. **Configuración y ajustes**: 2-3 días
3. **Testing**: 2-3 días
4. **Migración producción**: 1 día
5. **Monitoreo y ajustes**: 1 semana

**Total estimado**: 2 semanas

## Recursos

- [Documentación PostgreSQL](https://www.postgresql.org/docs/)
- [Laravel + PostgreSQL Best Practices](https://laravel.com/docs/database#configuration)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Window Functions Tutorial](https://www.postgresql.org/docs/current/tutorial-window.html)

---

**Última actualización**: 2025-09-29
**Responsable**: Equipo de Desarrollo KuberaFi
**Prioridad**: Alta (necesario para potenciar fórmula de KuberaFi)
