# 🧪 GUÍA DE TESTING POST-CORRECCIONES - KUBERAFI

## 📋 CHECKLIST DE PRUEBAS

Usa esta guía para verificar que todas las correcciones funcionan correctamente en tu entorno.

---

## 🔐 1. PRUEBAS DE SEGURIDAD Y ROLES

### Test 1.1: Acceso por Roles

**Objetivo:** Verificar que el middleware de roles funciona correctamente

**Pasos:**
1. Crear 3 usuarios de prueba (uno de cada rol)
2. Intentar acceder a rutas protegidas con cada usuario
3. Verificar que solo usuarios autorizados pueden acceder

**Comandos:**
```bash
# Crear usuarios de prueba
php artisan tinker

# En tinker:
$superAdmin = User::create([
    'name' => 'Super Admin Test',
    'email' => 'superadmin@test.com',
    'password' => bcrypt('password'),
    'role' => User::ROLE_SUPER_ADMIN,
    'is_active' => true
]);

$exchangeHouse = User::create([
    'name' => 'Exchange House Test',
    'email' => 'exchange@test.com',
    'password' => bcrypt('password'),
    'role' => User::ROLE_EXCHANGE_HOUSE,
    'exchange_house_id' => 1, // Ajustar según tu BD
    'is_active' => true
]);

$operator = User::create([
    'name' => 'Operator Test',
    'email' => 'operator@test.com',
    'password' => bcrypt('password'),
    'role' => User::ROLE_OPERATOR,
    'exchange_house_id' => 1, // Ajustar según tu BD
    'is_active' => true
]);
```

**Pruebas Manuales:**
1. Login como Super Admin → Acceder a `/admin/settings` → ✅ Debe funcionar
2. Login como Exchange House → Acceder a `/admin/settings` → ❌ Debe dar 403
3. Login como Operator → Acceder a `/admin/settings` → ❌ Debe dar 403
4. Login como Exchange House → Acceder a `/orders` → ✅ Debe funcionar
5. Login como Operator → Acceder a `/orders` → ✅ Debe funcionar

**Resultado Esperado:**
- ✅ Super Admin puede acceder a todo
- ✅ Exchange House solo a sus rutas
- ✅ Operator solo a sus rutas
- ✅ Errores 403 cuando no tiene permisos

---

### Test 1.2: Rate Limiting en Órdenes

**Objetivo:** Verificar que el rate limiting protege contra spam

**Pasos:**
1. Login como usuario con permisos para crear órdenes
2. Intentar crear más de 60 órdenes en 1 minuto
3. Verificar que se bloquea después del límite

**Script de Prueba:**
```bash
# Crear script de test
cat > test_rate_limit.sh << 'EOF'
#!/bin/bash
for i in {1..65}; do
    echo "Intento $i..."
    curl -X POST http://localhost:8000/orders \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer YOUR_TOKEN" \
        -d '{"currency_pair_id":1,"base_amount":100}' \
        -w "\nStatus: %{http_code}\n"
    sleep 0.5
done
EOF

chmod +x test_rate_limit.sh
```

**Resultado Esperado:**
- ✅ Primeras 60 peticiones: Status 200 o 201
- ✅ Peticiones 61+: Status 429 (Too Many Requests)
- ✅ Mensaje: "Demasiadas órdenes. Intenta de nuevo en X segundos"

---

## 🗄️ 2. PRUEBAS DE BASE DE DATOS

### Test 2.1: Relación Exchange House - Currency Pairs

**Objetivo:** Verificar que la tabla pivot funciona correctamente

**Comandos:**
```bash
php artisan tinker

# En tinker:
$eh = ExchangeHouse::first();
$pair = CurrencyPair::first();

// Asociar par a casa de cambio
$eh->currencyPairs()->attach($pair->id, [
    'margin_percent' => 2.5,
    'min_amount' => 10,
    'max_amount' => 10000,
    'is_active' => true
]);

// Verificar
$eh->currencyPairs; // Debe mostrar el par asociado
$eh->activeCurrencyPairs; // Debe mostrar solo pares activos
```

**Resultado Esperado:**
- ✅ Asociación se crea sin errores
- ✅ `currencyPairs()` retorna la relación
- ✅ `activeCurrencyPairs()` filtra correctamente
- ✅ Datos pivot (margin_percent, etc.) se guardan

---

### Test 2.2: Performance con Índices

**Objetivo:** Verificar que los índices mejoran el performance

**Comandos:**
```bash
php artisan tinker

# En tinker:
use Illuminate\Support\Facades\DB;

// Test 1: Query sin índice (simulado)
$start = microtime(true);
Order::where('status', 'completed')->count();
$time1 = microtime(true) - $start;
echo "Tiempo con índice: {$time1}s\n";

// Test 2: Query compleja
$start = microtime(true);
Order::where('exchange_house_id', 1)
    ->where('status', 'completed')
    ->whereDate('created_at', '>=', now()->subDays(30))
    ->count();
$time2 = microtime(true) - $start;
echo "Tiempo query compleja: {$time2}s\n";

// Verificar que usa índices
DB::enableQueryLog();
Order::where('status', 'completed')->get();
dd(DB::getQueryLog());
```

**Resultado Esperado:**
- ✅ Queries ejecutan en <100ms
- ✅ EXPLAIN muestra uso de índices
- ✅ No hay "Using filesort" en EXPLAIN

---

### Test 2.3: Customers y Payment Methods

**Objetivo:** Verificar relaciones con exchange_house_id

**Comandos:**
```bash
php artisan tinker

# En tinker:
$eh = ExchangeHouse::first();

// Test Customers
$customer = $eh->customers()->create([
    'name' => 'Cliente Test',
    'email' => 'cliente@test.com',
    'phone' => '+58412345678',
    'tier' => 'new'
]);

echo "Customer creado: {$customer->id}\n";
echo "Exchange House: {$customer->exchangeHouse->name}\n";

// Test Payment Methods
$pm = $eh->paymentMethods()->create([
    'name' => 'Pago Móvil Test',
    'type' => 'mobile_payment',
    'currency' => 'VES',
    'account_holder' => 'Test User',
    'account_number' => '04121234567',
    'bank_name' => 'Banco Test',
    'is_active' => true
]);

echo "Payment Method creado: {$pm->id}\n";
echo "Exchange House: {$pm->exchangeHouse->name}\n";
```

**Resultado Esperado:**
- ✅ Customer se crea con exchange_house_id correcto
- ✅ PaymentMethod se crea con exchange_house_id correcto
- ✅ Relaciones inversas funcionan
- ✅ No hay errores de FK

---

## 💰 3. PRUEBAS DE LÓGICA DE NEGOCIO

### Test 3.1: Cálculo de Comisiones

**Objetivo:** Verificar que las comisiones se calculan correctamente

**Comandos:**
```bash
php artisan tinker

# En tinker:
// Verificar configuración
$platformRate = SystemSetting::getPlatformCommissionRate();
echo "Platform Rate: {$platformRate}%\n";

// Crear orden de prueba
$order = Order::create([
    'order_number' => 'TEST-' . uniqid(),
    'exchange_house_id' => 1,
    'currency_pair_id' => 1,
    'user_id' => 1,
    'base_amount' => 1000,
    'quote_amount' => 1000,
    'market_rate' => 1.0,
    'applied_rate' => 1.05,
    'house_commission_percent' => 5.0,
    'status' => 'pending'
]);

// Calcular comisiones
$commissions = $order->calculateCommissions();

echo "Base Amount: $1000\n";
echo "House Commission (5%): $" . $commissions['house_total'] . "\n";
echo "Platform Commission (0.15%): $" . $commissions['platform'] . "\n";
echo "Exchange Net: $" . $commissions['exchange_net'] . "\n";
echo "Client Receives: $" . $commissions['client_receives'] . "\n";

// Verificar valores esperados
assert($commissions['house_total'] == 50, 'House commission debe ser $50');
assert($commissions['platform'] == 1.5, 'Platform commission debe ser $1.50');
assert($commissions['exchange_net'] == 48.5, 'Exchange net debe ser $48.50');
assert($commissions['client_receives'] == 950, 'Client debe recibir $950');

echo "\n✅ Todos los cálculos son correctos\n";
```

**Resultado Esperado:**
```
Base Amount: $1000
House Commission (5%): $50
Platform Commission (0.15%): $1.5
Exchange Net: $48.5
Client Receives: $950

✅ Todos los cálculos son correctos
```

---

### Test 3.2: Validaciones en Order

**Objetivo:** Verificar que las validaciones funcionan

**Comandos:**
```bash
php artisan tinker

# En tinker:
// Test 1: Sin base_amount
try {
    $order = new Order([
        'house_commission_percent' => 5.0
    ]);
    $order->calculateCommissions();
    echo "❌ ERROR: Debería lanzar excepción\n";
} catch (\Exception $e) {
    echo "✅ Validación correcta: {$e->getMessage()}\n";
}

// Test 2: Sin platform_commission_rate configurado
SystemSetting::where('key', 'platform_commission_rate')->delete();
try {
    $order = new Order([
        'base_amount' => 1000,
        'house_commission_percent' => 5.0
    ]);
    $order->calculateCommissions();
    echo "❌ ERROR: Debería lanzar excepción\n";
} catch (\Exception $e) {
    echo "✅ Validación correcta: {$e->getMessage()}\n";
}

// Restaurar configuración
SystemSetting::set('platform_commission_rate', 0.15, 'number');
```

**Resultado Esperado:**
- ✅ Excepción cuando faltan datos
- ✅ Excepción cuando no hay configuración
- ✅ Mensajes de error claros

---

## 🎨 4. PRUEBAS DE FRONTEND

### Test 4.1: Dashboard Super Admin

**Pasos Manuales:**
1. Login como Super Admin
2. Ir a `/dashboard`
3. Verificar que se muestran:
   - Total de casas de cambio
   - Total de usuarios
   - Órdenes de hoy
   - Volumen de hoy
   - Comisiones de la plataforma
   - Gráficas de últimos 7 días
   - Top casas de cambio

**Resultado Esperado:**
- ✅ Dashboard carga en <1 segundo
- ✅ Todas las métricas se muestran
- ✅ Gráficas se renderizan correctamente
- ✅ No hay errores en consola

---

### Test 4.2: Configuraciones del Sistema

**Pasos Manuales:**
1. Login como Super Admin
2. Ir a `/admin/settings`
3. Cambiar `platform_commission_rate` de 0.15 a 0.20
4. Guardar cambios
5. Verificar que se guardó correctamente
6. Crear una orden nueva
7. Verificar que usa la nueva tasa (0.20%)

**Resultado Esperado:**
- ✅ Configuración se guarda sin errores
- ✅ Mensaje de éxito se muestra
- ✅ Nueva tasa se aplica inmediatamente
- ✅ Cálculos usan la nueva tasa

---

### Test 4.3: CRUD de Casas de Cambio

**Pasos Manuales:**
1. Login como Super Admin
2. Ir a `/exchange-houses`
3. Click en "Crear Casa de Cambio"
4. Llenar formulario:
   - Nombre: "Casa Test"
   - RIF: "J-12345678-9"
   - Email: "test@casa.com"
   - Comisión: 5%
   - Límite diario: $50,000
5. Guardar
6. Verificar que aparece en la lista
7. Editar la casa creada
8. Cambiar comisión a 6%
9. Guardar
10. Verificar cambios

**Resultado Esperado:**
- ✅ Formulario de creación funciona
- ✅ Validaciones funcionan (email único, etc.)
- ✅ Casa se crea correctamente
- ✅ Edición funciona
- ✅ Cambios se guardan

---

## 📊 5. PRUEBAS DE PERFORMANCE

### Test 5.1: Dashboard con Muchos Datos

**Objetivo:** Verificar que el dashboard es rápido incluso con muchos datos

**Preparación:**
```bash
php artisan tinker

# Crear datos de prueba
for ($i = 0; $i < 1000; $i++) {
    Order::create([
        'order_number' => 'PERF-' . uniqid(),
        'exchange_house_id' => rand(1, 5),
        'currency_pair_id' => rand(1, 3),
        'user_id' => rand(1, 10),
        'base_amount' => rand(100, 10000),
        'quote_amount' => rand(100, 10000),
        'market_rate' => 1.0,
        'applied_rate' => 1.05,
        'house_commission_percent' => 5.0,
        'status' => 'completed',
        'created_at' => now()->subDays(rand(0, 30))
    ]);
}
```

**Prueba:**
1. Abrir DevTools → Network
2. Ir a `/dashboard`
3. Medir tiempo de carga

**Resultado Esperado:**
- ✅ Dashboard carga en <2 segundos
- ✅ Queries ejecutan en <500ms total
- ✅ No hay queries N+1
- ✅ Cache funciona correctamente

---

### Test 5.2: Queries Optimizadas

**Comandos:**
```bash
php artisan tinker

# Habilitar query log
DB::enableQueryLog();

// Ejecutar dashboard
$controller = new \App\Http\Controllers\DashboardController();
$request = request();
$request->setUserResolver(function() {
    return User::where('role', 'super_admin')->first();
});

// Ver queries ejecutadas
$queries = DB::getQueryLog();
echo "Total queries: " . count($queries) . "\n";

// Verificar que no hay N+1
foreach ($queries as $query) {
    echo $query['query'] . "\n";
}
```

**Resultado Esperado:**
- ✅ Menos de 20 queries totales
- ✅ No hay queries repetitivas (N+1)
- ✅ Uso de eager loading visible
- ✅ Uso de índices en EXPLAIN

---

## 🔧 6. PRUEBAS DE MANEJO DE ERRORES

### Test 6.1: Errores en SystemSettings

**Comandos:**
```bash
php artisan tinker

# Test: Actualizar con datos inválidos
try {
    SystemSetting::set('platform_commission_rate', 'invalid', 'number');
    echo "❌ ERROR: Debería manejar el error\n";
} catch (\Exception $e) {
    echo "✅ Error manejado: {$e->getMessage()}\n";
}

// Test: Obtener configuración inexistente
$value = SystemSetting::get('nonexistent_key', 'default_value');
if ($value === 'default_value') {
    echo "✅ Default value funciona correctamente\n";
}
```

**Resultado Esperado:**
- ✅ Errores se capturan correctamente
- ✅ Mensajes de error son claros
- ✅ Default values funcionan
- ✅ No hay crashes

---

## 📝 CHECKLIST FINAL

Marca cada item cuando lo hayas probado:

### Seguridad
- [ ] Middleware de roles funciona
- [ ] Rate limiting funciona
- [ ] Usuarios sin permisos reciben 403
- [ ] Tokens de autenticación funcionan

### Base de Datos
- [ ] Tabla pivot exchange_house_currency_pair funciona
- [ ] Índices mejoran performance
- [ ] Relaciones Customer funcionan
- [ ] Relaciones PaymentMethod funcionan
- [ ] Migraciones ejecutan sin errores

### Lógica de Negocio
- [ ] Cálculo de comisiones es correcto
- [ ] Validaciones funcionan
- [ ] SystemSettings se guardan correctamente
- [ ] Cache funciona correctamente

### Frontend
- [ ] Dashboard Super Admin carga correctamente
- [ ] Dashboard Exchange House carga correctamente
- [ ] Configuraciones se pueden editar
- [ ] CRUD de casas de cambio funciona
- [ ] Formularios validan correctamente

### Performance
- [ ] Dashboard carga en <2 segundos
- [ ] No hay queries N+1
- [ ] Índices se usan correctamente
- [ ] Cache reduce queries

### Manejo de Errores
- [ ] Errores se capturan correctamente
- [ ] Mensajes de error son claros
- [ ] No hay crashes inesperados
- [ ] Logs registran errores

---

## 🚀 COMANDOS ÚTILES PARA TESTING

```bash
# Limpiar todo antes de probar
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Ver logs en tiempo real
tail -f storage/logs/laravel.log

# Ejecutar tests automatizados
php artisan test

# Verificar queries lentas
php artisan tinker --execute="DB::enableQueryLog(); /* tu código */; dd(DB::getQueryLog());"

# Verificar índices
php artisan tinker --execute="dd(Schema::getIndexes('orders'));"

# Verificar configuraciones
php artisan tinker --execute="SystemSetting::all()->each(fn(\$s) => echo \$s->key . ': ' . \$s->value . PHP_EOL);"
```

---

## 📞 SOPORTE

Si encuentras algún problema durante las pruebas:

1. Revisa los logs: `storage/logs/laravel.log`
2. Verifica la configuración: `php artisan config:show`
3. Consulta la documentación: `CORRECCIONES_APLICADAS.md`
4. Ejecuta el script de verificación: `./verificar_correcciones.sh`

---

**Generado:** 27 de Octubre, 2025  
**Plataforma:** Kuberafi v1.0  
**Testing Guide por:** Kiro AI Assistant
