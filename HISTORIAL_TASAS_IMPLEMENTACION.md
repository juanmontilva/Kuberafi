# Sistema de Historial de Tasas - KuberaFi

## 📋 Descripción

Sistema completo para que las casas de cambio gestionen el historial de tasas de sus pares de divisas. Cada vez que actualizan una tasa (ej: de 390 a 391), el sistema guarda el cambio automáticamente.

## 🗄️ Base de Datos

### Tabla: `currency_pair_rate_history`

Almacena todos los cambios de tasas con trazabilidad completa:

- **rate**: Tasa base (ej: 390.00000000)
- **margin_percent**: Margen de ganancia (ej: 2.50%)
- **effective_rate**: Tasa efectiva que ve el cliente
- **valid_from**: Desde cuándo es válida
- **valid_until**: Hasta cuándo fue válida
- **is_current**: Si es la tasa actual
- **changed_by**: Quién hizo el cambio
- **change_reason**: Razón (manual, automático, actualización de mercado)
- **notes**: Notas del operador

## 🚀 Instalación

### 1. Ejecutar la migración

```bash
php artisan migrate
```

### 2. Agregar rutas en `routes/web.php`

```php
// Historial de tasas de pares de divisas
Route::middleware(['auth'])->prefix('currency-pairs')->group(function () {
    Route::get('{currencyPair}/rate-history', [CurrencyPairRateHistoryController::class, 'index'])
        ->name('currency-pairs.rate-history');
    
    Route::get('{currencyPair}/rate-history/chart', [CurrencyPairRateHistoryController::class, 'chartData'])
        ->name('currency-pairs.rate-history.chart');
    
    Route::get('{currencyPair}/rate-history/comparison', [CurrencyPairRateHistoryController::class, 'comparison'])
        ->name('currency-pairs.rate-history.comparison');
});
```

### 3. Actualizar el controlador de pares de divisas

Cuando una casa de cambio actualice su tasa, debes llamar al método `saveRateChange()`:

```php
// En tu CurrencyPairController o donde actualices las tasas

use App\Models\CurrencyPair;

// Cuando actualizan la tasa
$currencyPair = CurrencyPair::find($id);

$currencyPair->saveRateChange(
    exchangeHouseId: auth()->user()->exchange_house_id,
    newRate: $request->input('rate'), // Nueva tasa: 391
    marginPercent: $request->input('margin_percent'), // 2.50%
    userId: auth()->id(),
    reason: 'manual', // o 'automatic', 'market_update'
    notes: $request->input('notes') // Opcional
);

// También actualizar la tasa actual en el par
$currencyPair->update(['current_rate' => $request->input('rate')]);
```

## 📊 Endpoints API

### 1. Obtener historial completo

```
GET /currency-pairs/{id}/rate-history?period=30
```

**Parámetros**:
- `period`: Días hacia atrás (default: 30)
- `from`: Fecha desde (opcional)
- `to`: Fecha hasta (opcional)
- `page`: Número de página

**Respuesta**:
```json
{
  "history": {
    "data": [
      {
        "id": 1,
        "rate": "391.00000000",
        "effective_rate": "400.57500000",
        "margin_percent": "2.5000",
        "valid_from": "2025-01-15 10:30:00",
        "valid_until": null,
        "is_current": true,
        "changed_by": {
          "id": 2,
          "name": "María González"
        },
        "change_reason": "manual",
        "notes": "Ajuste por mercado"
      }
    ],
    "total": 45,
    "per_page": 50
  },
  "stats": {
    "current_rate": "391.00",
    "highest_rate": "395.50",
    "lowest_rate": "385.00",
    "average_rate": "390.23",
    "total_changes": 45
  }
}
```

### 2. Datos para gráfica

```
GET /currency-pairs/{id}/rate-history/chart?period=30
```

**Respuesta**:
```json
{
  "data": [
    {
      "date": "2025-01-01 09:00",
      "dateShort": "01/01",
      "rate": 390.00,
      "effectiveRate": 399.75,
      "margin": 2.50
    },
    {
      "date": "2025-01-02 14:30",
      "dateShort": "02/01",
      "rate": 391.00,
      "effectiveRate": 400.58,
      "margin": 2.50
    }
  ],
  "period": 30
}
```

### 3. Comparación de períodos

```
GET /currency-pairs/{id}/rate-history/comparison
```

**Respuesta**:
```json
{
  "current": {
    "rate": "391.00",
    "effective_rate": "400.58",
    "valid_from": "2025-01-15 10:30:00"
  },
  "comparisons": {
    "yesterday": {
      "rate": "390.00",
      "change_percent": 0.26
    },
    "last_week": {
      "rate": "388.50",
      "change_percent": 0.64
    },
    "last_month": {
      "rate": "385.00",
      "change_percent": 1.56
    }
  }
}
```

## 🎨 Componente UI Recomendado

### Modal de Historial

Crear un modal o drawer que se abra desde la página de pares de divisas y muestre:

1. **Gráfica de línea**: Evolución de la tasa en el tiempo
2. **Cards de comparación**: vs ayer, última semana, último mes
3. **Tabla de historial**: Con paginación
4. **Filtros**: Por período (7, 30, 90 días o rango personalizado)

### Estructura sugerida:

```tsx
// components/CurrencyPairHistory.tsx
import { LineChart } from 'recharts';

interface Props {
  currencyPairId: number;
  symbol: string;
}

export function CurrencyPairHistory({ currencyPairId, symbol }: Props) {
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState(30);
  
  // Fetch data
  useEffect(() => {
    fetchHistory();
    fetchChartData();
  }, [currencyPairId, period]);
  
  return (
    <div>
      {/* Header con título y filtros */}
      <div className="flex justify-between">
        <h2>Historial de {symbol}</h2>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
        </select>
      </div>
      
      {/* Gráfica de evolución */}
      <LineChart data={chartData}>
        <Line dataKey="rate" stroke="#3b82f6" name="Tasa Base" />
        <Line dataKey="effectiveRate" stroke="#10b981" name="Tasa Efectiva" />
      </LineChart>
      
      {/* Tabla de historial */}
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tasa</th>
            <th>Margen</th>
            <th>Tasa Efectiva</th>
            <th>Cambio</th>
            <th>Usuario</th>
          </tr>
        </thead>
        <tbody>
          {history.map(item => (
            <tr key={item.id}>
              <td>{item.valid_from}</td>
              <td>{item.rate}</td>
              <td>{item.margin_percent}%</td>
              <td>{item.effective_rate}</td>
              <td className={item.change > 0 ? 'text-green-500' : 'text-red-500'}>
                {item.change}%
              </td>
              <td>{item.changed_by?.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## 📱 Integración en UI Existente

En tu página de "Mis Pares de Divisas", agregar un botón "Ver Historial" en cada par:

```tsx
// Junto a los botones Editar/Duplicar/Eliminar
<button onClick={() => openHistoryModal(pair.id)}>
  <History className="h-4 w-4" />
  Ver Historial
</button>
```

## 🔄 Flujo Automático

1. Casa de cambio edita USD/VES de 390 → 391
2. Al guardar, se llama `saveRateChange()`
3. Sistema automáticamente:
   - Marca la tasa anterior (390) como `is_current = false`
   - Establece `valid_until` en la tasa anterior
   - Crea nueva entrada con tasa 391 como `is_current = true`
   - Registra quién hizo el cambio y cuándo

## 📊 Beneficios

✅ **Trazabilidad completa**: Saber quién cambió qué y cuándo
✅ **Análisis histórico**: Ver tendencias de precios
✅ **Auditoría**: Registro completo de cambios
✅ **Toma de decisiones**: Comparar con períodos anteriores
✅ **Transparencia**: Cada casa ve su propio historial independiente

## 🎯 Próximos Pasos

1. ✅ Ejecutar migración
2. ✅ Agregar rutas
3. ⏳ Actualizar controlador de pares para usar `saveRateChange()`
4. ⏳ Crear componente UI de historial
5. ⏳ Integrar en página de pares de divisas
6. ⏳ Agregar botón "Ver Historial"
7. ⏳ Testing

## 💡 Ejemplo de Uso Real

```
Hoy (15/01/2025):
- CambioExpress actualiza USD/VES de 390 → 391 a las 10:30 AM
- Sistema guarda: rate=391, valid_from=15/01 10:30, is_current=true

Mañana (16/01/2025):
- CambioExpress actualiza USD/VES de 391 → 392 a las 9:15 AM
- Sistema automáticamente:
  * Actualiza registro anterior: valid_until=16/01 9:15, is_current=false
  * Crea nuevo registro: rate=392, valid_from=16/01 9:15, is_current=true

En el historial verán:
- 392 (actual) ↑ +0.26% vs ayer
- 391 (ayer) ↑ +0.26% vs 15/01
- 390 (15/01)
```

## 🔒 Seguridad

- Cada casa de cambio solo ve su propio historial
- Filtrado por `exchange_house_id` en todos los queries
- Middleware de autenticación en todas las rutas
- Validación de permisos en controladores

---

**Fecha de creación**: 2025-01-15
**Versión**: 1.0.0
**Estado**: ✅ Backend completo - Pendiente integración UI
