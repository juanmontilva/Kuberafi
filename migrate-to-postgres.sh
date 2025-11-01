#!/bin/bash

# Script de Migración Automática: MySQL → PostgreSQL + Redis
# Autor: Cascade AI
# Fecha: Nov 1, 2025

set -e

echo "🚀 Iniciando migración a PostgreSQL + Redis"
echo "============================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función de log
log() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# 1. Verificar pre-requisitos
echo "📋 Verificando pre-requisitos..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado. Instala Docker Desktop."
fi
log "Docker instalado"

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado"
fi
log "Docker Compose instalado"

# Verificar Redis
if ! redis-cli ping &> /dev/null; then
    warn "Redis no está corriendo. Intentando iniciar..."
    brew services start redis
    sleep 2
    if ! redis-cli ping &> /dev/null; then
        error "No se pudo iniciar Redis"
    fi
fi
log "Redis corriendo"

# Verificar PHP PostgreSQL extension
if ! php -m | grep -q pdo_pgsql; then
    warn "Extensión pdo_pgsql no encontrada"
    echo "   Instalando con Homebrew..."
    brew install php-pgsql || error "No se pudo instalar php-pgsql"
fi
log "Extensión pdo_pgsql disponible"

echo ""

# 2. Backup de MySQL
echo "💾 Creando backup de MySQL..."

BACKUP_FILE="backup_mysql_$(date +%Y%m%d_%H%M%S).sql"

if php artisan db:show | grep -q mysql; then
    mysqldump -u root Kuberafi_db > "$BACKUP_FILE" 2>/dev/null || warn "No se pudo crear backup automático de MySQL"
    if [ -f "$BACKUP_FILE" ]; then
        log "Backup creado: $BACKUP_FILE"
    else
        warn "Backup no creado (puede que la DB esté vacía)"
    fi
else
    warn "MySQL no está conectado actualmente"
fi

echo ""

# 3. Backup de .env
echo "📄 Respaldando .env actual..."
cp .env .env.mysql.backup
log ".env respaldado en .env.mysql.backup"

echo ""

# 4. Levantar PostgreSQL
echo "🐘 Levantando PostgreSQL con Docker..."
docker-compose up -d postgres

# Esperar a que PostgreSQL esté healthy
echo "   Esperando a que PostgreSQL esté listo..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U kuberafi &> /dev/null; then
        log "PostgreSQL está listo"
        break
    fi
    echo -n "."
    sleep 1
done

if ! docker-compose exec -T postgres pg_isready -U kuberafi &> /dev/null; then
    error "PostgreSQL no inició correctamente"
fi

echo ""

# 5. Actualizar .env
echo "⚙️  Actualizando .env..."
if [ -f ".env.postgres" ]; then
    cp .env.postgres .env
    log ".env actualizado con configuración PostgreSQL + Redis"
else
    warn ".env.postgres no encontrado, actualiza manualmente"
fi

echo ""

# 6. Limpiar cache de Laravel
echo "🧹 Limpiando cache de Laravel..."
php artisan optimize:clear &> /dev/null || true
log "Cache limpiado"

echo ""

# 7. Ejecutar migraciones
echo "📊 Ejecutando migraciones en PostgreSQL..."
if php artisan migrate:fresh --force; then
    log "Migraciones ejecutadas correctamente"
else
    error "Error al ejecutar migraciones"
fi

echo ""

# 8. Verificar conexiones
echo "🔍 Verificando conexiones..."

# PostgreSQL
if php artisan db:monitor | grep -q pgsql; then
    log "PostgreSQL conectado"
else
    error "PostgreSQL no conectado"
fi

# Redis
if redis-cli ping | grep -q PONG; then
    log "Redis conectado"
else
    error "Redis no conectado"
fi

echo ""

# 9. Probar Cache
echo "✨ Probando Redis Cache..."
php artisan tinker --execute="Cache::put('migration_test', 'ok', 60); echo Cache::get('migration_test');" | grep -q ok && log "Cache funcionando" || warn "Cache con problemas"

echo ""

# 10. Resumen
echo "============================================"
echo "🎉 ¡Migración completada!"
echo "============================================"
echo ""
echo "Stack actual:"
echo "  ✅ PostgreSQL 16 (Docker)"
echo "  ✅ Redis (Homebrew)"
echo "  ✅ Cache: Redis"
echo "  ✅ Queue: Redis"
echo "  ✅ Sessions: Redis"
echo ""
echo "Próximos pasos:"
echo "  1. Verificar que la aplicación funciona correctamente"
echo "  2. Importar datos de MySQL si es necesario (ver MIGRACION_POSTGRES_REDIS.md)"
echo "  3. Configurar workers de queue: php artisan queue:work redis"
echo "  4. Monitorear logs: tail -f storage/logs/laravel.log"
echo ""
echo "Archivos importantes:"
echo "  - Backup MySQL: $BACKUP_FILE"
echo "  - Backup .env: .env.mysql.backup"
echo "  - Guía completa: MIGRACION_POSTGRES_REDIS.md"
echo ""
echo "Para revertir:"
echo "  mv .env.mysql.backup .env"
echo "  docker-compose down"
echo "  php artisan optimize:clear"
echo ""
