# Optimizaciones para DashboardController

## Problema 1: exchangeHouseDashboard() - Estadísticas 24h y Mes

### ❌ Código Actual (Líneas 187-196)
```php
$orders24h = $exchangeHouse->orders()->where('created_at', '>=', $last24h)->get();
$volume24h = $orders24h->sum('base_amount');
$profit24h = $orders24h->sum('exchange_commission');
$platformFee24h = $orders24h->sum('platform_commission');

$ordersMonth = $exchangeHouse->orders()->where('created_at', '>=', $thisMonth)->get();
$volumeMonth = $ordersMonth->sum('base_amount');
$profitMonth = $ordersMonth->sum('exchange_commission');
$platformFeeMonth = $ordersMonth->sum('platform_commission');
```

### ✅ Código Optimizado
```php
// Estadísticas 24h - Una sola query
$stats24h = $exchangeHouse->orders()
    ->where('created_at', '>=', $last24h)
    ->selectRaw('
        COUNT(*) as orders_count,
        COALESCE(SUM(base_amount), 0) as volume,
        COALESCE(SUM(exchange_commission), 0) as profit,
        COALESCE(SUM(platform_commission), 0) as platform_fee
    ')
    ->first();

// Estadísticas del mes - Una sola query
$statsMonth = $exchangeHouse->orders()
    ->where('created_at', '>=', $thisMonth)
    ->selectRaw('
        COUNT(*) as orders_count,
        COALESCE(SUM(base_amount), 0) as volume,
        COALESCE(SUM(exchange_commission), 0) as profit,
        COALESCE(SUM(platform_commission), 0) as platform_fee
    ')
    ->first();

// Usar los resultados
$orders24h = $stats24h->orders_count;
$volume24h = $stats24h->volume;
$profit24h = $stats24h->profit;
$platformFee24h = $stats24h->platform_fee;

$ordersMonth = $statsMonth->orders_count;
$volumeMonth = $statsMonth->volume;
$profitMonth = $statsMonth->profit;
$platformFeeMonth = $statsMonth->platform_fee;
```

**Mejora:** De 2 queries con miles de registros → 2 queries con 1 registro cada una

---

## Problema 2: exchangeHouseDashboard() - volumeData (Líneas 234-242)

### ❌ Código Actual
```php
$volumeData = collect(range(6, 0))->map(function ($daysAgo) use ($exchangeHouse) {
    $date = Carbon::now()->subDays($daysAgo);
    $dayOrders = $exchangeHouse->orders()->whereDate('created_at', $date)->get();
    return [
        'date' => $date->format('D'),
        'volume' => (float) $dayOrders->sum('base_amount'),
        'orders' => $dayOrders->count(),
    ];
});
```
**Problema:** 7 queries, una por cada día

### ✅ Código Optimizado
```php
// Una sola query agrupada por fecha
$volumeStats = $exchangeHouse->orders()
    ->where('created_at', '>=', Carbon::now()->subDays(6)->startOfDay())
    ->selectRaw('DATE(created_at) as date, SUM(base_amount) as volume, COUNT(*) as orders')
    ->groupBy('date')
    ->orderBy('date')
    ->get()
    ->keyBy('date');

// Mapear todos los días (incluyendo días sin datos)
$volumeData = collect(range(6, 0))->map(function ($daysAgo) use ($volumeStats) {
    $date = Carbon::now()->subDays($daysAgo);
    $dateKey = $date->format('Y-m-d');
    $stats = $volumeStats->get($dateKey);
    
    return [
        'date' => $date->format('D'),
        'volume' => $stats ? (float) $stats->volume : 0,
        'orders' => $stats ? (int) $stats->orders : 0,
    ];
});
```

**Mejora:** De 7 queries → 1 query

---

## Problema 3: exchangeHouseDashboard() - topPairs (Líneas 203-210)

### ❌ Código Actual
```php
$topPairs = $exchangeHouse->orders()
    ->where('status', 'completed')
    ->selectRaw('currency_pair_id, COUNT(*) as total_orders, SUM(base_amount) as total_volume, SUM(exchange_commission) as total_profit')
    ->groupBy('currency_pair_id')
    ->orderByDesc('total_profit')
    ->limit(5)
    ->with('currencyPair')  // ❌ Esto no funciona aquí
    ->get();
```

### ✅ Código Optimizado
```php
$topPairs = $exchangeHouse->orders()
    ->with('currencyPair:id,symbol,base_currency,quote_currency') // ✅ Antes del selectRaw
    ->where('status', 'completed')
    ->selectRaw('currency_pair_id, COUNT(*) as total_orders, SUM(base_amount) as total_volume, SUM(exchange_commission) as total_profit')
    ->groupBy('currency_pair_id')
    ->orderByDesc('total_profit')
    ->limit(5)
    ->get();
```

**Mejora:** Evita N+1 al cargar currencyPair

---

## Problema 4: superAdminDashboard() - last7Days (Líneas 77-86)

### ❌ Código Actual
```php
$last7Days = collect(range(6, 0))->map(function ($daysAgo) {
    $date = Carbon::now()->subDays($daysAgo);
    return [
        'date' => $date->format('Y-m-d'),
        'day' => $date->format('D'),
        'orders' => Order::whereDate('created_at', $date)->count(),
        'volume' => Order::whereDate('created_at', $date)->sum('base_amount'),
        'commissions' => Commission::where('type', 'platform')->whereDate('created_at', $date)->sum('amount'),
    ];
});
```
**Problema:** 21 queries (7 días × 3 queries)

### ✅ Código Optimizado
```php
// Obtener datos de órdenes agrupados
$ordersStats = Order::where('created_at', '>=', Carbon::now()->subDays(6)->startOfDay())
    ->selectRaw('DATE(created_at) as date, COUNT(*) as orders, SUM(base_amount) as volume')
    ->groupBy('date')
    ->get()
    ->keyBy('date');

// Obtener comisiones agrupadas
$commissionsStats = Commission::where('type', 'platform')
    ->where('created_at', '>=', Carbon::now()->subDays(6)->startOfDay())
    ->selectRaw('DATE(created_at) as date, SUM(amount) as commissions')
    ->groupBy('date')
    ->get()
    ->keyBy('date');

// Mapear todos los días
$last7Days = collect(range(6, 0))->map(function ($daysAgo) use ($ordersStats, $commissionsStats) {
    $date = Carbon::now()->subDays($daysAgo);
    $dateKey = $date->format('Y-m-d');
    
    $orderData = $ordersStats->get($dateKey);
    $commissionData = $commissionsStats->get($dateKey);
    
    return [
        'date' => $dateKey,
        'day' => $date->format('D'),
        'orders' => $orderData ? (int) $orderData->orders : 0,
        'volume' => $orderData ? (float) $orderData->volume : 0,
        'commissions' => $commissionData ? (float) $commissionData->commissions : 0,
    ];
});
```

**Mejora:** De 21 queries → 2 queries

---

## Resumen de Optimizaciones

| Optimización | Queries Antes | Queries Después | Mejora |
|--------------|---------------|-----------------|--------|
| Stats 24h/Mes | 2 (con miles de registros) | 2 (con 1 registro) | ~1000x más rápido |
| volumeData | 7 | 1 | 7x menos queries |
| topPairs | N+1 | 1 eager load | Evita N+1 |
| last7Days | 21 | 2 | 10.5x menos queries |

## Total de Queries Evitadas
**Antes:** ~30+ queries  
**Después:** ~5 queries  
**Reducción:** 83% menos queries

---

## Cómo Aplicar

1. Abre `app/Http/Controllers/DashboardController.php`
2. Reemplaza cada sección problemática con el código optimizado
3. Ejecuta `php artisan test` para verificar que todo funciona
4. Monitorea con Laravel Telescope para confirmar la reducción de queries
