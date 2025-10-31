#!/bin/bash

echo "🔍 VERIFICACIÓN DE CORRECCIONES - KUBERAFI"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        return 0
    else
        echo -e "${RED}❌ $1${NC}"
        return 1
    fi
}

echo "📋 1. VERIFICANDO MIDDLEWARE..."
echo "--------------------------------"

# Verificar RoleMiddleware
if [ -f "app/Http/Middleware/RoleMiddleware.php" ]; then
    echo -e "${GREEN}✅ RoleMiddleware existe${NC}"
else
    echo -e "${RED}❌ RoleMiddleware NO existe${NC}"
fi

# Verificar RateLimitOrders
if [ -f "app/Http/Middleware/RateLimitOrders.php" ]; then
    echo -e "${GREEN}✅ RateLimitOrders existe${NC}"
else
    echo -e "${RED}❌ RateLimitOrders NO existe${NC}"
fi

echo ""
echo "📋 2. VERIFICANDO BASE DE DATOS..."
echo "--------------------------------"

# Verificar tabla pivot
php artisan tinker --execute="
if (Schema::hasTable('exchange_house_currency_pair')) {
    echo '✅ Tabla exchange_house_currency_pair existe' . PHP_EOL;
} else {
    echo '❌ Tabla exchange_house_currency_pair NO existe' . PHP_EOL;
}
"

# Verificar índices en orders
php artisan tinker --execute="
\$indexes = collect(Schema::getIndexes('orders'))->pluck('name');
if (\$indexes->contains('orders_status_index')) {
    echo '✅ Índice orders_status_index existe' . PHP_EOL;
} else {
    echo '❌ Índice orders_status_index NO existe' . PHP_EOL;
}
"

# Verificar índices en commissions
php artisan tinker --execute="
\$indexes = collect(Schema::getIndexes('commissions'))->pluck('name');
if (\$indexes->contains('commissions_type_index')) {
    echo '✅ Índice commissions_type_index existe' . PHP_EOL;
} else {
    echo '❌ Índice commissions_type_index NO existe' . PHP_EOL;
}
"

echo ""
echo "📋 3. VERIFICANDO CONFIGURACIONES..."
echo "--------------------------------"

# Verificar SystemSettings
php artisan tinker --execute="
\$rate = App\Models\SystemSetting::get('platform_commission_rate');
if (\$rate !== null) {
    echo '✅ platform_commission_rate configurado: ' . \$rate . '%' . PHP_EOL;
} else {
    echo '❌ platform_commission_rate NO configurado' . PHP_EOL;
}
"

php artisan tinker --execute="
\$name = App\Models\SystemSetting::get('platform_name');
if (\$name !== null) {
    echo '✅ platform_name configurado: ' . \$name . PHP_EOL;
} else {
    echo '❌ platform_name NO configurado' . PHP_EOL;
}
"

echo ""
echo "📋 4. VERIFICANDO MODELOS..."
echo "--------------------------------"

# Verificar constantes en User
php artisan tinker --execute="
if (defined('App\Models\User::ROLE_SUPER_ADMIN')) {
    echo '✅ Constantes de roles definidas en User' . PHP_EOL;
    echo '   - ROLE_SUPER_ADMIN: ' . App\Models\User::ROLE_SUPER_ADMIN . PHP_EOL;
    echo '   - ROLE_EXCHANGE_HOUSE: ' . App\Models\User::ROLE_EXCHANGE_HOUSE . PHP_EOL;
    echo '   - ROLE_OPERATOR: ' . App\Models\User::ROLE_OPERATOR . PHP_EOL;
} else {
    echo '❌ Constantes de roles NO definidas' . PHP_EOL;
}
"

echo ""
echo "📋 5. VERIFICANDO RUTAS..."
echo "--------------------------------"

# Verificar rutas críticas
ROUTES=$(php artisan route:list 2>&1)

if echo "$ROUTES" | grep -q "admin.settings"; then
    echo -e "${GREEN}✅ Ruta admin.settings existe${NC}"
else
    echo -e "${RED}❌ Ruta admin.settings NO existe${NC}"
fi

if echo "$ROUTES" | grep -q "exchange-houses.index"; then
    echo -e "${GREEN}✅ Ruta exchange-houses.index existe${NC}"
else
    echo -e "${RED}❌ Ruta exchange-houses.index NO existe${NC}"
fi

if echo "$ROUTES" | grep -q "orders.store"; then
    echo -e "${GREEN}✅ Ruta orders.store existe${NC}"
else
    echo -e "${RED}❌ Ruta orders.store NO existe${NC}"
fi

echo ""
echo "📋 6. VERIFICANDO CONTROLADORES..."
echo "--------------------------------"

# Verificar ExchangeHouseController
if [ -f "app/Http/Controllers/ExchangeHouseController.php" ]; then
    if grep -q "public function index" app/Http/Controllers/ExchangeHouseController.php && \
       grep -q "public function store" app/Http/Controllers/ExchangeHouseController.php && \
       grep -q "public function update" app/Http/Controllers/ExchangeHouseController.php; then
        echo -e "${GREEN}✅ ExchangeHouseController completo (CRUD)${NC}"
    else
        echo -e "${YELLOW}⚠️  ExchangeHouseController incompleto${NC}"
    fi
else
    echo -e "${RED}❌ ExchangeHouseController NO existe${NC}"
fi

# Verificar SystemSettingsController
if [ -f "app/Http/Controllers/SystemSettingsController.php" ]; then
    if grep -q "try {" app/Http/Controllers/SystemSettingsController.php; then
        echo -e "${GREEN}✅ SystemSettingsController con manejo de errores${NC}"
    else
        echo -e "${YELLOW}⚠️  SystemSettingsController sin try-catch${NC}"
    fi
else
    echo -e "${RED}❌ SystemSettingsController NO existe${NC}"
fi

echo ""
echo "📋 7. VERIFICANDO MIGRACIONES..."
echo "--------------------------------"

php artisan migrate:status 2>&1 | tail -10

echo ""
echo "=========================================="
echo "✅ VERIFICACIÓN COMPLETADA"
echo "=========================================="
echo ""
echo "📝 Para más detalles, revisa:"
echo "   - ANALISIS_ERRORES_KUBERAFI.md"
echo "   - CORRECCIONES_APLICADAS.md"
echo ""
