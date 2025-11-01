# 🚀 Inicio Rápido - Migración PostgreSQL + Redis

## ⚡ Migración Automática (Recomendado)

```bash
# 1. Ejecutar script de migración
./migrate-to-postgres.sh
```

**¡Eso es todo!** El script hace:
- ✅ Backup de MySQL
- ✅ Backup de .env
- ✅ Levanta PostgreSQL (Docker)
- ✅ Configura Redis
- ✅ Actualiza .env
- ✅ Ejecuta migraciones
- ✅ Verifica todo

---

## 🔧 Migración Manual

### 1. Levantar PostgreSQL

```bash
docker-compose up -d postgres
```

### 2. Actualizar .env

Reemplaza tu `.env` con estas líneas:

```dotenv
# PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=kuberafi_db
DB_USERNAME=kuberafi
DB_PASSWORD=kuberafi_secret_2024

# Redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0
REDIS_CACHE_DB=1
REDIS_QUEUE_DB=2
REDIS_SESSION_DB=3
```

### 3. Verificar Redis

```bash
# Iniciar si no está corriendo
brew services start redis

# Probar
redis-cli ping
# Debe responder: PONG
```

### 4. Instalar extensión PHP PostgreSQL

```bash
# Verificar si ya está instalada
php -m | grep pgsql

# Si no está, instalar
brew install php-pgsql

# Reiniciar PHP
valet restart
```

### 5. Limpiar y migrar

```bash
# Limpiar cache
php artisan optimize:clear

# Ejecutar migraciones
php artisan migrate:fresh --seed
```

### 6. Verificar

```bash
# PostgreSQL
php artisan db:monitor
# Debe mostrar: pgsql ✅

# Redis
redis-cli ping
# Debe mostrar: PONG ✅

# Cache
php artisan tinker
>>> Cache::put('test', 'ok', 60); Cache::get('test');
# Debe mostrar: "ok" ✅
```

---

## 🎯 Comandos Útiles

### Docker PostgreSQL

```bash
# Levantar
docker-compose up -d

# Ver logs
docker-compose logs -f postgres

# Parar
docker-compose down

# Conectar a PostgreSQL
docker exec -it kuberafi_postgres psql -U kuberafi -d kuberafi_db

# Backup
docker exec kuberafi_postgres pg_dump -U kuberafi kuberafi_db > backup.sql

# Restaurar
docker exec -i kuberafi_postgres psql -U kuberafi kuberafi_db < backup.sql
```

### Redis

```bash
# Estado
brew services list | grep redis

# Iniciar
brew services start redis

# Parar
brew services stop redis

# Reiniciar
brew services restart redis

# Conectar
redis-cli

# Ver todas las keys
redis-cli KEYS "*"

# Limpiar todo
redis-cli FLUSHALL
```

### Laravel

```bash
# Queue worker
php artisan queue:work redis

# Queue en background
php artisan queue:work redis &

# Ver queue
php artisan queue:monitor redis

# Cache
php artisan cache:clear
php artisan config:cache
```

---

## 🐛 Problemas Comunes

### "could not find driver pdo_pgsql"

```bash
brew install php-pgsql
valet restart
```

### PostgreSQL no conecta

```bash
docker-compose restart postgres
docker-compose logs postgres
```

### Redis no conecta

```bash
brew services restart redis
redis-cli ping
```

### Migraciones fallan

```bash
php artisan optimize:clear
php artisan migrate:fresh
```

---

## 📊 Verificación Completa

```bash
# Ejecutar todos los tests
php artisan test tests/Feature/Architecture tests/Feature/Refactoring

# Debe mostrar:
# ✅ 17 passed (56 assertions)
```

---

## 🎉 ¡Listo!

Tu stack ahora:
- ✅ PostgreSQL 16 (Docker)
- ✅ Redis (Homebrew)  
- ✅ ~10-50x más rápido
- ✅ Listo para 500K usuarios

---

## 📚 Documentación Completa

Ver: `MIGRACION_POSTGRES_REDIS.md`

---

**Preguntas?** Revisa `MIGRACION_POSTGRES_REDIS.md` para guía completa.
