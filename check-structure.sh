#!/bin/bash

echo "🔍 Verificando estructura modular de Kuberafi..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar si existe un archivo/directorio
check_exists() {
    if [ -e "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1"
        return 1
    fi
}

echo "📁 Estructura de Módulos:"
echo "========================"

# Orders Module
echo ""
echo "Orders Module:"
check_exists "app/Modules/Orders/Controllers/OrderController.php"
check_exists "app/Modules/Orders/Services/OrderService.php"
check_exists "app/Modules/Orders/Services/CommissionCalculator.php"
check_exists "app/Modules/Orders/Services/PaymentMethodSelector.php"

# Customers Module
echo ""
echo "Customers Module:"
check_exists "app/Modules/Customers/Controllers/CustomerController.php"
check_exists "app/Modules/Customers/Services/CustomerService.php"

# Payments Module
echo ""
echo "Payments Module:"
check_exists "app/Modules/Payments/Controllers/PaymentMethodController.php"
check_exists "app/Modules/Payments/Controllers/CashBoxController.php"
check_exists "app/Modules/Payments/Services/PaymentService.php"

# Analytics Module
echo ""
echo "Analytics Module:"
check_exists "app/Modules/Analytics/Controllers/AnalyticsController.php"
check_exists "app/Modules/Analytics/Services/AnalyticsService.php"

# Providers
echo ""
echo "Providers:"
check_exists "app/Providers/ModuleServiceProvider.php"

# Documentation
echo ""
echo "📚 Documentación:"
echo "================"
check_exists "docs/ARQUITECTURA_MODULAR.md"
check_exists "docs/GUIA_MIGRACION.md"
check_exists "README.md"

# Check if old controller still exists
echo ""
echo "⚠️  Verificando archivos antiguos:"
echo "================================="
if [ -e "app/Http/Controllers/OrderController.php" ]; then
    echo -e "${YELLOW}⚠${NC} app/Http/Controllers/OrderController.php (antiguo - puede eliminarse después de testing)"
else
    echo -e "${GREEN}✓${NC} OrderController antiguo eliminado"
fi

# Count lines of code
echo ""
echo "📊 Estadísticas:"
echo "==============="

if command -v cloc &> /dev/null; then
    echo ""
    echo "Líneas de código en módulos:"
    cloc app/Modules/ --quiet
else
    echo "Instala 'cloc' para ver estadísticas de código: brew install cloc"
fi

echo ""
echo "✅ Verificación completada!"
echo ""
echo "Próximos pasos:"
echo "1. Ejecuta: php artisan config:clear"
echo "2. Ejecuta: composer dump-autoload"
echo "3. Prueba crear una orden para verificar que todo funciona"
echo "4. Lee docs/GUIA_MIGRACION.md para continuar la refactorización"
