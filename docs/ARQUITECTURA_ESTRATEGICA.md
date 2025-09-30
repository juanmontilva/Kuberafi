# 🏗️ KuberaFi - Arquitectura Estratégica
## SaaS vs Multi-Tenant vs Dedicated

---

## 🎯 TU CASO DE USO

**Realidad:**
- Cada casa de cambio trabaja **independientemente**
- NO comparten clientes
- NO comparten liquidez (aún)
- Datos sensibles y críticos
- Necesitan aislamiento total

**Problema Actual:**
- Usas single database con foreign keys
- Una vulnerabilidad afecta a todos
- Un bug puede exponer datos de otras casas
- Difícil cumplir regulaciones (GDPR, FINRA)

---

## 📋 COMPARACIÓN DE MODELOS

### Modelo 1: SaaS Single-Tenant (Actual)
```
┌─────────────────────────────────────────┐
│         Base de Datos Única             │
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │  Casa A  │  │  Casa B  │           │
│  │  orders  │  │  orders  │           │
│  │  users   │  │  users   │           │
│  └──────────┘  └──────────┘           │
│                                         │
│  exchange_house_id en TODAS las tablas  │
└─────────────────────────────────────────┘

PROS:
✓ Simple de implementar
✓ Queries cross-tenant fáciles (para admin)
✓ Mantenimiento único
✓ Costos bajos

CONTRAS:
✗ Riesgo de data leak (un WHERE mal puesto)
✗ Performance degradado con escala
✗ Compliance difícil
✗ No puedes ofrecer "dedicated" a clientes enterprise
✗ Un problema afecta a todos
```

### Modelo 2: Multi-Tenant (Database Per Tenant)
```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   Casa A DB    │  │   Casa B DB    │  │   Casa C DB    │
│                │  │                │  │                │
│  orders        │  │  orders        │  │  orders        │
│  users         │  │  users         │  │  users         │
│  payment_...   │  │  payment_...   │  │  payment_...   │
└────────────────┘  └────────────────┘  └────────────────┘
         ↓                  ↓                    ↓
┌──────────────────────────────────────────────────────┐
│              Central Management DB                    │
│  - tenants (casas de cambio)                         │
│  - system_settings                                   │
│  - platform_metrics                                  │
└──────────────────────────────────────────────────────┘

PROS:
✓ Aislamiento TOTAL de datos
✓ Mejor performance (DBs más pequeñas)
✓ Escalabilidad horizontal
✓ Backup/restore independiente
✓ Cumplimiento regulatorio fácil
✓ Puedes ofrecer tiers (shared vs dedicated)
✓ Un problema solo afecta a un tenant

CONTRAS:
✗ Más complejo de implementar
✗ Queries cross-tenant requieren federated queries
✗ Migraciones deben correr en N databases
✗ Mayor costo de infraestructura
```

### Modelo 3: Híbrido (RECOMENDADO)
```
┌─────────────────────────────────────────────────────┐
│              SHARED INFRASTRUCTURE                   │
│                                                      │
│  ┌──────────────────────────────────────────┐      │
│  │         Central Management                │      │
│  │  - Tenants                                │      │
│  │  - Platform Settings                      │      │
│  │  - Billing                                │      │
│  │  - Global Analytics                       │      │
│  └──────────────────────────────────────────┘      │
│                                                      │
│  ┌────────────────┐  ┌────────────────┐            │
│  │  Schema: casa_a│  │  Schema: casa_b│            │
│  │                │  │                │            │
│  │  orders        │  │  orders        │            │
│  │  users         │  │  users         │            │
│  │  payment_...   │  │  payment_...   │            │
│  └────────────────┘  └────────────────┘            │
│                                                      │
│  PostgreSQL: Multi-Schema en MISMO servidor         │
│  (pero casas enterprise pueden tener DB dedicada)   │
└─────────────────────────────────────────────────────┘

PROS:
✓ Mejor de ambos mundos
✓ Aislamiento lógico (schemas)
✓ Queries cross-tenant posibles
✓ Flexible (shared o dedicated según tier)
✓ Costos moderados
✓ Migración más fácil desde modelo actual

CONTRAS:
✗ Requiere refactoring significativo
✗ PostgreSQL específico (no funciona igual en MySQL)
```

---

## 🎯 RECOMENDACIÓN: Modelo Híbrido

### Fase 1: Multi-Schema en PostgreSQL (3-4 semanas)

**Estructura:**
```sql
-- Database central
CREATE DATABASE kuberafi;

-- Schema público para gestión
CREATE SCHEMA management;
  └─ tenants
  └─ users (super admins)
  └─ system_settings
  └─ platform_commissions
  └─ audit_logs

-- Schema por casa de cambio
CREATE SCHEMA casa_cambioexpress;
  └─ orders
  └─ users (operadores)
  └─ payment_methods
  └─ customers
  └─ commissions

CREATE SCHEMA casa_venezuelachange;
  └─ orders
  └─ users
  └─ ...
```

**Implementación con Laravel:**
```php
// config/multitenancy.php
return [
    'tenant_model' => App\Models\Tenant::class,
    'tenant_schema_prefix' => 'casa_',
    'central_domains' => ['admin.kuberafi.com', 'app.kuberafi.com'],
];

// app/Models/Tenant.php
class Tenant extends Model
{
    public function configure()
    {
        // Cambiar schema automáticamente
        DB::statement("SET search_path TO {$this->schema_name}, public");
    }
}

// Middleware
class TenantMiddleware
{
    public function handle($request, $next)
    {
        $tenant = $this->identifyTenant($request);
        
        if ($tenant) {
            $tenant->configure();
            app()->instance('tenant', $tenant);
        }
        
        return $next($request);
    }
    
    private function identifyTenant($request)
    {
        // Opción 1: Subdomain
        if ($subdomain = $this->getSubdomain($request)) {
            return Tenant::where('subdomain', $subdomain)->first();
        }
        
        // Opción 2: User's exchange_house_id
        if ($user = $request->user()) {
            return $user->exchangeHouse->tenant;
        }
        
        return null;
    }
}
```

### Fase 2: Migración de Datos

```php
// Migration plan
class MigrateToMultiSchema
{
    public function migrate()
    {
        $exchangeHouses = ExchangeHouse::all();
        
        foreach ($exchangeHouses as $house) {
            // 1. Crear schema
            $schemaName = "casa_" . Str::slug($house->slug);
            DB::statement("CREATE SCHEMA {$schemaName}");
            
            // 2. Crear tablas en nuevo schema
            $this->createTablesInSchema($schemaName);
            
            // 3. Migrar datos
            $this->migrateOrders($house, $schemaName);
            $this->migrateUsers($house, $schemaName);
            $this->migratePaymentMethods($house, $schemaName);
            
            // 4. Crear tenant record
            Tenant::create([
                'exchange_house_id' => $house->id,
                'schema_name' => $schemaName,
                'subdomain' => $house->slug,
            ]);
        }
    }
    
    private function migrateOrders($house, $schema)
    {
        DB::statement("SET search_path TO {$schema}");
        
        $orders = Order::where('exchange_house_id', $house->id)->get();
        
        foreach ($orders->chunk(1000) as $chunk) {
            // Insertar en nuevo schema
            DB::table('orders')->insert($chunk->toArray());
        }
    }
}
```

---

## 🗄️ MEJORAS A LA BASE DE DATOS

### 1. Índices Optimizados

```sql
-- Índices actuales son básicos
-- Agregar índices compuestos para queries comunes

-- Orders
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX idx_orders_house_status ON orders(exchange_house_id, status);
CREATE INDEX idx_orders_pair_date ON orders(currency_pair_id, created_at);

-- Para búsquedas
CREATE INDEX idx_orders_order_number_gin ON orders USING gin(order_number gin_trgm_ops);

-- Para analytics
CREATE INDEX idx_orders_completed_date ON orders(completed_at) 
  WHERE status = 'completed';
```

### 2. Particionamiento de Tablas Grandes

```sql
-- Particionar orders por fecha (hot/cold data)
CREATE TABLE orders (
    id BIGSERIAL,
    order_number VARCHAR(50),
    created_at TIMESTAMP,
    ...
) PARTITION BY RANGE (created_at);

-- Particiones
CREATE TABLE orders_2025_09 PARTITION OF orders
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

CREATE TABLE orders_2025_10 PARTITION OF orders
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- Auto-crear particiones con pg_cron
-- Datos antiguos se pueden mover a cold storage (S3)
```

### 3. Tabla de Audit Log Inmutable

```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    -- Hash para inmutabilidad
    previous_hash VARCHAR(64),
    current_hash VARCHAR(64) GENERATED ALWAYS AS (
        encode(
            digest(
                id || tenant_id || user_id || action || 
                entity_type || entity_id || created_at || 
                COALESCE(previous_hash, ''), 
                'sha256'
            ),
            'hex'
        )
    ) STORED
) PARTITION BY RANGE (created_at);

-- No permite UPDATE ni DELETE (append-only)
CREATE RULE no_update_audit AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS ON DELETE TO audit_logs DO INSTEAD NOTHING;
```

### 4. Tabla de Eventos para Event Sourcing

```sql
CREATE TABLE domain_events (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL, -- 'Order', 'User', etc.
    aggregate_id BIGINT NOT NULL,
    event_type VARCHAR(100) NOT NULL, -- 'OrderCreated', 'PaymentVerified'
    event_data JSONB NOT NULL,
    metadata JSONB,
    occurred_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    
    -- Para reconstruir estado
    sequence_number BIGINT,
    
    CONSTRAINT unique_sequence UNIQUE (aggregate_type, aggregate_id, sequence_number)
);

CREATE INDEX idx_events_aggregate ON domain_events(aggregate_type, aggregate_id, sequence_number);
CREATE INDEX idx_events_unprocessed ON domain_events(processed_at) WHERE processed_at IS NULL;
```

### 5. Tabla de Cache Materializado

```sql
-- Para queries pesados de analytics
CREATE MATERIALIZED VIEW daily_metrics AS
SELECT 
    date_trunc('day', created_at) as day,
    exchange_house_id,
    currency_pair_id,
    COUNT(*) as total_orders,
    SUM(base_amount) as total_volume,
    SUM(exchange_commission) as total_profit,
    AVG(house_commission_percent) as avg_commission
FROM orders
WHERE status = 'completed'
GROUP BY day, exchange_house_id, currency_pair_id;

-- Índices en materialized view
CREATE INDEX idx_daily_metrics_house ON daily_metrics(exchange_house_id, day DESC);

-- Refresh automático (pg_cron)
SELECT cron.schedule('refresh-daily-metrics', '0 1 * * *', 
    'REFRESH MATERIALIZED VIEW CONCURRENTLY daily_metrics');
```

### 6. Tabla de Time-Series para Tasas

```sql
-- TimescaleDB extension para series temporales
CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE exchange_rates_history (
    time TIMESTAMPTZ NOT NULL,
    currency_pair_id BIGINT NOT NULL,
    rate DECIMAL(20, 8) NOT NULL,
    source VARCHAR(50), -- 'manual', 'binance', 'reserve'
    metadata JSONB
);

-- Convertir a hypertable (TimescaleDB)
SELECT create_hypertable('exchange_rates_history', 'time');

-- Compresión automática de datos antiguos
ALTER TABLE exchange_rates_history SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'currency_pair_id'
);

-- Política de compresión
SELECT add_compression_policy('exchange_rates_history', INTERVAL '7 days');
```

---

## 🚀 PLAN DE MIGRACIÓN

### Semana 1-2: Preparación
```
✓ Backup completo
✓ Crear schemas de prueba
✓ Migrar 1-2 casas de prueba
✓ Testing exhaustivo
✓ Ajustar queries
```

### Semana 3: Migración Gradual
```
✓ Migrar casas pequeñas primero
✓ Monitorear performance
✓ Rollback plan ready
✓ Comunicación con clientes
```

### Semana 4: Finalización
```
✓ Migrar casas grandes
✓ Eliminar código legacy
✓ Optimizar queries
✓ Documentación
```

---

## 💰 PRICING BASADO EN ARQUITECTURA

### Tier 1: Shared ($99/mes)
- Schema compartido con otras casas
- Recursos compartidos
- Backup diario
- 99% uptime

### Tier 2: Isolated Schema ($299/mes)
- Schema dedicado (aislamiento lógico)
- Recursos dedicados (CPU/RAM)
- Backup continuo
- 99.5% uptime

### Tier 3: Dedicated Database ($999/mes)
- Base de datos completamente separada
- Servidor dedicado
- Backup en tiempo real
- 99.9% uptime
- SLA con garantía

### Enterprise: Custom
- Infraestructura on-premise
- Compliance personalizado
- Soporte 24/7
- White-glove onboarding

---

## 📊 COMPARACIÓN DE COSTOS

```
Modelo Actual (Single DB):
├─ 50 casas = 1 servidor PostgreSQL
├─ Costo: $200/mes
└─ Costo por casa: $4/mes

Modelo Multi-Schema:
├─ 50 casas = 1 servidor más potente
├─ Costo: $500/mes
└─ Costo por casa: $10/mes
   (pero puedes cobrar $99-$299)

Modelo Dedicated:
├─ 50 casas = 50 servers pequeños
├─ Costo: $2,500/mes
└─ Costo por casa: $50/mes
   (pero cobras $999)
```

---

## 🎯 RECOMENDACIÓN FINAL

**Para KuberaFi, el mejor modelo es:**

### 🏆 HÍBRIDO Multi-Schema

**Razones:**
1. Cada casa trabaja independiente → necesitan aislamiento
2. Datos financieros sensibles → seguridad crítica
3. Compliance regulatorio → aislamiento ayuda
4. Escalabilidad → puedes crecer sin límites
5. Flexibilidad → ofreces tiers shared/dedicated
6. Migración viable → 3-4 semanas vs 6+ meses

**Implementación:**
```
Mes 1: Refactoring a multi-schema
Mes 2: Migración gradual
Mes 3: Optimizaciones
Mes 4: Lanzar tier "Dedicated"
```

**ROI:**
- Puedes cobrar 3-10x más
- Mejor seguridad = menos riesgo legal
- Escalas a 1000+ casas sin problemas
- Vendes "Enterprise" a grandes casas

---

## 🛠️ SIGUIENTE PASO

¿Quieres que implemente el sistema multi-schema?

Incluiría:
1. Middleware de tenant identification
2. Migración automática de schemas
3. Queries tenant-aware
4. Testing completo
5. Documentación

**Tiempo estimado:** 3-4 semanas
**Impacto:** Transformación completa de la plataforma
