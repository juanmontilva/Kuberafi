# Kuberafi - Sistema de Casa de Cambio

Sistema modular para gestión de casas de cambio con soporte multi-tenant.

## 🏗️ Arquitectura

Este proyecto utiliza una **arquitectura de monolito modular** que separa la lógica de negocio en módulos independientes y reutilizables.

### Módulos Principales

- **Orders** - Gestión de órdenes de cambio
- **Customers** - CRM y gestión de clientes
- **Payments** - Métodos de pago y balances
- **Analytics** - Métricas y reportes

Ver [Arquitectura Modular](docs/ARQUITECTURA_MODULAR.md) para más detalles.

## 🚀 Stack Tecnológico

- **Backend:** Laravel 11 (PHP 8.3+)
- **Frontend:** React + Inertia.js + TypeScript
- **Base de Datos:** PostgreSQL 16 (Docker)
- **Cache/Queue:** Redis (Homebrew)
- **Estilos:** TailwindCSS + shadcn/ui
- **Gráficos:** Recharts

## 📦 Instalación

```bash
# 1. Instalar dependencias
composer install
npm install

# 2. Configurar entorno
cp .env.example .env
php artisan key:generate

# 3. Levantar PostgreSQL (Docker)
docker-compose up -d postgres

# 4. Migrar base de datos
php artisan migrate --seed

# 5. Iniciar desarrollo
npm run dev
# En otra terminal:
php artisan serve
```

**Para migrar de MySQL a PostgreSQL:** Ver [docs/database/INICIO_RAPIDO.md](docs/database/INICIO_RAPIDO.md)

## 🧪 Testing

```bash
# Tests de arquitectura y calidad
php artisan test tests/Feature/Architecture tests/Feature/Refactoring

# Todos los tests
php artisan test

# Con coverage
php artisan test --coverage
```

**Estado actual:** ✅ 17 tests passing (56 assertions) - Ver [docs/refactorizacion/TESTS_COMPLETADOS.md](docs/refactorizacion/TESTS_COMPLETADOS.md)

## 📚 Documentación

### Inicio Rápido
- [Migración a PostgreSQL + Redis](docs/database/INICIO_RAPIDO.md) ⚡
- [Arquitectura Modular](docs/ARQUITECTURA_MODULAR.md)
- [Modelo de Comisiones](docs/MODELO_COMISIONES_SIMPLE.md)

### Desarrollo
- [Progreso de Refactorización](docs/refactorizacion/PROGRESO_REFACTORIZACION.md)
- [Tests Completados](docs/refactorizacion/TESTS_COMPLETADOS.md)
- [Guía de Migración](docs/GUIA_MIGRACION.md)

### Base de Datos
- [Migración PostgreSQL](docs/database/MIGRACION_POSTGRES_REDIS.md)
- [Guía Completa](docs/database/MIGRACION_COMPLETADA.md)

### Funcionalidades
- [CRM](docs/CRM_IMPLEMENTATION.md)
- [Métodos de Pago](docs/METODOS_DE_PAGO.md)
- [Analytics](docs/DASHBOARD_ANALYTICS_GUIDE.md)

## 🔐 Roles y Permisos

- **Super Admin** - Administración completa de la plataforma
- **Exchange House** - Gestión de casa de cambio
- **Operator** - Operador de órdenes

## 🎯 Características Principales

### ✅ Gestión de Órdenes
- Creación de órdenes con múltiples modelos de comisión
- Cálculo automático de spreads y márgenes
- Selección automática/manual de métodos de pago
- Control de saldos y balances

### ✅ CRM de Clientes
- Gestión completa de clientes
- Segmentación por tier (VIP, Regular, Nuevo)
- Historial de actividades
- Cuentas bancarias asociadas

### ✅ Sistema de Comisiones
- 3 modelos: Percentage, Spread, Mixed
- Cálculo automático de comisiones de plataforma
- Promociones de comisión cero
- Reportes de comisiones

### ✅ Analytics
- Dashboard con métricas en tiempo real
- Gráficos de tendencias
- Top clientes y pares de divisas
- Análisis de márgenes

### ✅ Control de Caja
- Gestión de fondos por operador
- Movimientos de entrada/salida
- Historial de transacciones
- Exportación de reportes

## 🛠️ Comandos Útiles

```bash
# Optimizar performance
php artisan optimize

# Limpiar cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Analizar queries
php artisan analyze:queries

# Sincronizar configuración
php artisan settings:sync
```

## 📊 Monitoreo (Recomendado para Producción)

### Esencial
- **Laravel Telescope** (desarrollo)
- **Sentry** (errores en producción)
- **Logs estructurados** (JSON format)

### Profesional
- **Grafana + Prometheus** (métricas)
- **Laravel Horizon** (queues)
- **Uptime monitoring**

Ver [Guía de Monitoreo](docs/MONITOREO.md) para más información.

## 🚢 Deployment

```bash
# Optimizar para producción
composer install --optimize-autoloader --no-dev
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Propietario - Todos los derechos reservados

## 👥 Equipo

Desarrollado por el equipo de Kuberafi

---

**Versión:** 2.0.0 (Arquitectura Modular)  
**Última actualización:** Noviembre 2025  
**Progreso:** 60% completado | Tests: 17/17 ✅ | PostgreSQL + Redis ⚡
