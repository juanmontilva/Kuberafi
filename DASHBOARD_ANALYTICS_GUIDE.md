# 📊 Guía de Analytics Avanzados - Dashboard KuberaFi

## Resumen de Implementación

Se han agregado **gráficos y visualizaciones financieras avanzadas** al dashboard de KuberaFi para proporcionar un mejor control y análisis del producto de casa de cambio.

---

## 🎯 Nuevas Visualizaciones Implementadas

### 1. **Evolución de Tasas de Cambio por Par**
**Archivo**: `resources/js/components/dashboard/CurrencyPairTrendsChart.tsx`

**Características**:
- Gráfico de líneas mostrando tendencia de tasas en los últimos 30 días
- Selector de par de divisas para análisis específico
- Visualización de margen aplicado vs tasa base
- Identificación de volatilidad y mejores momentos para ajustar tasas

**Endpoint**: `GET /analytics/currency-pair-trends?days=30`

**Uso**:
```tsx
import { CurrencyPairTrendsChart } from '@/components/dashboard/CurrencyPairTrendsChart';

<CurrencyPairTrendsChart />
```

**Beneficios**:
- Detectar patrones de cambio en las tasas
- Optimizar márgenes basado en tendencias
- Comparar comportamiento entre diferentes pares

---

### 2. **Mapa de Calor de Actividad (Heatmap)**
**Archivo**: `resources/js/components/dashboard/ActivityHeatmap.tsx`

**Características**:
- Matriz que muestra operaciones por día de la semana y hora del día
- Identificación visual de horarios pico y valles
- Tooltip con volumen y cantidad de operaciones
- Gradiente de color basado en intensidad de actividad

**Endpoint**: `GET /analytics/activity-heatmap?days=30`

**Uso**:
```tsx
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';

<ActivityHeatmap />
```

**Beneficios**:
- Optimizar staffing según horarios de mayor demanda
- Planificar mantenimiento en horarios de baja actividad
- Identificar patrones de comportamiento de clientes

---

### 3. **Análisis de Márgenes por Par**
**Componente**: Dashboard principal

**Características**:
- Gráfico combinado (ComposedChart) con barras y líneas
- Muestra margen promedio, máximo y mínimo por par
- Volumen total y número de operaciones
- Comparación visual entre diferentes pares

**Endpoint**: `GET /analytics/margin-analysis`

**Datos retornados**:
```json
[
  {
    "pair": "USD/VES",
    "avgMargin": 2.5,
    "minMargin": 1.2,
    "maxMargin": 4.8,
    "operations": 145,
    "volume": 125000.50
  }
]
```

**Beneficios**:
- Identificar pares más rentables
- Optimizar estrategia de pricing
- Detectar inconsistencias en márgenes

---

### 4. **Comparación de Períodos**
**Archivo**: `resources/js/components/dashboard/PeriodComparisonCard.tsx`

**Características**:
- Comparación mes actual vs mes anterior
- Métricas: Órdenes, Volumen, Ganancia
- Cálculo automático de crecimiento (%)
- Indicadores visuales de tendencia (arriba/abajo)

**Endpoint**: `GET /analytics/period-comparison`

**Datos retornados**:
```json
{
  "current": {
    "orders": 234,
    "volume": 450000,
    "profit": 11250
  },
  "previous": {
    "orders": 198,
    "volume": 380000,
    "profit": 9500
  },
  "growth": {
    "orders": 18.2,
    "volume": 18.4,
    "profit": 18.4
  }
}
```

**Beneficios**:
- Medir crecimiento del negocio
- Establecer metas basadas en históricos
- Detectar tendencias positivas o negativas

---

### 5. **Análisis por Método de Pago**
**Endpoint**: `GET /analytics/payment-method-analysis`

**Características**:
- Lista detallada de cada método de pago
- Volumen, operaciones, ticket promedio, ganancia
- Identificación de métodos más utilizados
- Análisis de rentabilidad por método

**Datos retornados**:
```json
[
  {
    "name": "Transferencia Bancaria",
    "type": "bank_transfer",
    "operations": 89,
    "volume": 234500,
    "avgTicket": 2635.39,
    "profit": 5862.50
  }
]
```

**Beneficios**:
- Identificar métodos más rentables
- Optimizar comisiones por método
- Priorizar métodos de pago preferidos

---

### 6. **Velocidad de Procesamiento**
**Endpoint**: `GET /analytics/processing-speed`

**Características**:
- Tiempo promedio de completado de órdenes
- Distribución por rangos de tiempo (< 5min, 5-15min, etc.)
- Métricas de mínimo y máximo tiempo
- Gráfico de torta con distribución visual

**Datos retornados**:
```json
{
  "averageMinutes": 8.5,
  "minMinutes": 2,
  "maxMinutes": 45,
  "totalCompleted": 234,
  "distribution": {
    "under5min": 45,
    "between5and15min": 120,
    "between15and30min": 55,
    "over30min": 14
  }
}
```

**Beneficios**:
- Medir eficiencia operativa
- Identificar cuellos de botella
- Mejorar experiencia del cliente
- Establecer SLAs realistas

---

### 7. **Proyección de Liquidez**
**Endpoint**: `GET /analytics/liquidity-forecast`

**Características**:
- Volumen utilizado hoy vs límite diario
- Promedio de volumen diario (últimos 7 días)
- Proyección de días restantes de liquidez
- Estado de tendencia (high/medium/low)

**Datos retornados**:
```json
{
  "dailyLimit": 500000,
  "todayVolume": 234500,
  "remainingToday": 265500,
  "avgDailyVolume": 187500,
  "projectedDaysRemaining": 1.4,
  "utilizationPercent": 46.9,
  "trendStatus": "medium"
}
```

**Beneficios**:
- Prevenir quedarse sin liquidez
- Planificar recargas de fondos
- Alertas tempranas de liquidez baja

---

### 8. **Top Clientes Avanzado**
**Endpoint**: `GET /analytics/top-customers`

**Características**:
- Top 10 clientes por volumen mensual
- Análisis de comportamiento (frecuencia)
- Tier del cliente y última operación
- Ticket promedio y ganancia generada

**Datos retornados**:
```json
[
  {
    "id": 45,
    "name": "Juan Pérez",
    "tier": "vip",
    "operations": 23,
    "volume": 45000,
    "avgTicket": 1956.52,
    "profit": 1125,
    "lastOperation": "Hace 2 horas",
    "frequency": "Muy Alta"
  }
]
```

**Beneficios**:
- Identificar clientes VIP
- Estrategias de retención personalizadas
- Análisis de valor de vida del cliente (LTV)

---

## 🏗️ Estructura de Archivos

### Backend (Laravel)
```
app/
├── Http/
│   └── Controllers/
│       └── ExchangeHouse/
│           └── AnalyticsController.php     # Nuevo controlador de analytics
│
routes/
└── web.php                                  # Rutas de analytics agregadas
```

### Frontend (React/TypeScript)
```
resources/js/
├── pages/
│   └── Dashboard/
│       ├── ExchangeHouse.tsx               # Dashboard existente (mejorado)
│       └── ExchangeHouseAdvanced.tsx       # Nuevo dashboard con analytics
│
└── components/
    └── dashboard/
        ├── CurrencyPairTrendsChart.tsx     # Evolución de tasas
        ├── ActivityHeatmap.tsx             # Mapa de calor
        └── PeriodComparisonCard.tsx        # Comparación de períodos
```

---

## 🔌 Endpoints API Disponibles

Todos los endpoints están protegidos por middleware `role:exchange_house,operator`:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/analytics/currency-pair-trends` | GET | Evolución de tasas (30 días) |
| `/analytics/activity-heatmap` | GET | Mapa de calor por día/hora |
| `/analytics/margin-analysis` | GET | Análisis de márgenes por par |
| `/analytics/liquidity-forecast` | GET | Proyección de liquidez |
| `/analytics/period-comparison` | GET | Comparación mes actual vs anterior |
| `/analytics/payment-method-analysis` | GET | Análisis por método de pago |
| `/analytics/processing-speed` | GET | Velocidad de procesamiento |
| `/analytics/top-customers` | GET | Top 10 clientes del mes |

---

## 📈 Cómo Usar los Nuevos Gráficos

### Opción 1: Usar el Dashboard Avanzado Completo
```tsx
// Cambiar en routes/web.php o directamente en Inertia
return Inertia::render('Dashboard/ExchangeHouseAdvanced', [
  'exchangeHouse' => $exchangeHouse,
  'stats' => $stats,
  // ... otros datos
]);
```

### Opción 2: Agregar Componentes Individuales al Dashboard Existente
```tsx
import { CurrencyPairTrendsChart } from '@/components/dashboard/CurrencyPairTrendsChart';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { PeriodComparisonCard } from '@/components/dashboard/PeriodComparisonCard';

function ExchangeHouseDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats existentes */}
      
      {/* Nuevos componentes */}
      <CurrencyPairTrendsChart />
      <ActivityHeatmap />
      <PeriodComparisonCard />
    </div>
  );
}
```

---

## 🎨 Paleta de Colores Usada

Los gráficos utilizan una paleta consistente con el diseño oscuro de KuberaFi:

- **Azul** (#3b82f6): Volumen, tasas principales
- **Esmeralda** (#10b981): Ganancias, positivo
- **Morado** (#8b5cf6): Límites, proyecciones
- **Ámbar** (#f59e0b): Advertencias, rangos medios
- **Rojo** (#ef4444): Alertas, negativo

---

## 🚀 Próximas Mejoras Sugeridas

1. **Predicción con ML**: Usar datos históricos para predecir volumen futuro
2. **Alertas Inteligentes**: Notificaciones cuando detecte anomalías
3. **Exportación de Reportes**: PDF/Excel con todos los gráficos
4. **Dashboard Personalizable**: Drag & drop de widgets
5. **Comparación con Competencia**: Benchmark vs otras casas de cambio
6. **Análisis de Sentimiento**: Integrar con tickets de soporte

---

## 📝 Notas Técnicas

### Optimizaciones Implementadas
- Queries SQL optimizadas con agregaciones
- Cache de 5 minutos para datos no críticos
- Lazy loading de componentes pesados
- Uso de índices en tablas para queries rápidas

### Consideraciones de Performance
- Los heatmaps con 30+ días pueden ser pesados
- Considera agregar paginación a top clientes si hay muchos
- Implementar cache Redis para analytics históricos

### Seguridad
- Todos los endpoints validan que el usuario pertenece a una casa de cambio
- Filtros por `exchange_house_id` en todas las queries
- Rate limiting aplicado (60 requests/minuto)

---

## 🤝 Contribución

Para agregar nuevos gráficos:

1. Crear endpoint en `AnalyticsController.php`
2. Agregar ruta en `routes/web.php`
3. Crear componente React en `resources/js/components/dashboard/`
4. Documentar en este archivo

---

## 📧 Soporte

Para dudas o mejoras, contactar al equipo de desarrollo de KuberaFi.

---

**Versión**: 1.0.0  
**Fecha**: 2025-09-30  
**Autor**: Equipo KuberaFi
