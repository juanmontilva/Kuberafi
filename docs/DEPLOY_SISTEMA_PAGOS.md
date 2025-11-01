# 🚀 Instrucciones de Despliegue - Sistema de Métodos de Pago

## 📋 Pre-requisitos

- ✅ PHP 8.1+
- ✅ Laravel 11
- ✅ Node.js 18+
- ✅ Base de datos configurada
- ✅ Acceso al servidor

## 🔧 Pasos de Despliegue

### 1. Ejecutar Migraciones

```bash
# Ejecutar la nueva migración
php artisan migrate

# Verificar que se creó la tabla
php artisan db:show
```

**Resultado esperado:**
- Tabla `platform_payment_methods` creada
- Sin errores

### 2. Cargar Datos de Ejemplo (Opcional)

```bash
# Cargar métodos de pago de ejemplo
php artisan db:seed --class=PlatformPaymentMethodSeeder
```

**Resultado esperado:**
- 4 métodos de pago creados:
  1. Cuenta Principal USD
  2. Zelle Empresarial
  3. Pago Móvil Venezuela
  4. USDT (TRC20)

### 3. Compilar Assets

```bash
# Desarrollo
npm run dev

# Producción
npm run build
```

**Resultado esperado:**
- Assets compilados sin errores
- Archivos en `public/build/`

### 4. Limpiar Caché

```bash
# Limpiar caché de rutas
php artisan route:clear
php artisan route:cache

# Limpiar caché de configuración
php artisan config:clear
php artisan config:cache

# Limpiar caché de vistas
php artisan view:clear
php artisan view:cache

# Limpiar caché de aplicación
php artisan cache:clear
```

### 5. Optimizar para Producción

```bash
# Optimizar autoload
composer dump-autoload --optimize

# Optimizar configuración
php artisan optimize

# Generar manifest de Vite
npm run build
```

## ✅ Verificación Post-Despliegue

### 1. Verificar Base de Datos

```bash
# Verificar tabla
php artisan tinker
```

```php
// En tinker
\App\Models\PlatformPaymentMethod::count();
// Debe retornar 4 si cargaste los datos de ejemplo

\App\Models\PlatformPaymentMethod::active()->get();
// Debe mostrar los métodos activos
```

### 2. Verificar Rutas

```bash
# Listar rutas relacionadas
php artisan route:list --name=platform-payment
```

**Rutas esperadas:**
```
GET    /admin/platform-payment-methods
POST   /admin/platform-payment-methods
PUT    /admin/platform-payment-methods/{platformPaymentMethod}
DELETE /admin/platform-payment-methods/{platformPaymentMethod}
POST   /admin/platform-payment-methods/{platformPaymentMethod}/toggle
```

### 3. Verificar Permisos

```bash
# Verificar permisos de archivos
ls -la app/Models/PlatformPaymentMethod.php
ls -la app/Http/Controllers/Admin/PlatformPaymentMethodController.php
```

### 4. Probar en Navegador

#### Como Administrador:

1. **Login como Super Admin**
   - Ir a `/login`
   - Usar credenciales de administrador

2. **Acceder al Panel**
   - Ir a `/admin/platform-payment-methods`
   - Verificar que se muestran los métodos

3. **Crear Método de Prueba**
   - Clic en "Nuevo Método"
   - Completar formulario
   - Guardar
   - Verificar que aparece en la lista

4. **Editar Método**
   - Clic en ícono de editar
   - Modificar datos
   - Guardar
   - Verificar cambios

5. **Toggle Activo/Inactivo**
   - Clic en ícono de ojo
   - Verificar cambio de estado

#### Como Operador:

1. **Login como Operador**
   - Ir a `/login`
   - Usar credenciales de operador

2. **Ver Solicitudes de Pago**
   - Ir a `/my-commission-requests`
   - Verificar que se muestra la deuda

3. **Enviar Pago**
   - Clic en "Enviar Pago"
   - Verificar que se muestran los métodos activos
   - Seleccionar un método
   - Verificar que se expanden los detalles
   - Completar formulario
   - Enviar (o cancelar para no crear datos de prueba)

## 🐛 Troubleshooting

### Error: "Table not found"

```bash
# Verificar migraciones pendientes
php artisan migrate:status

# Ejecutar migraciones
php artisan migrate
```

### Error: "Class not found"

```bash
# Regenerar autoload
composer dump-autoload

# Limpiar caché
php artisan clear-compiled
php artisan cache:clear
```

### Error: "Route not found"

```bash
# Limpiar y regenerar caché de rutas
php artisan route:clear
php artisan route:cache
```

### Error: "Assets not loading"

```bash
# Recompilar assets
npm run build

# Verificar manifest
cat public/build/manifest.json
```

### Error: "Permission denied"

```bash
# Ajustar permisos (Linux/Mac)
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# O según tu configuración de servidor
```

## 🔒 Seguridad

### 1. Verificar Permisos de Rutas

```php
// En routes/web.php
// Verificar que las rutas estén dentro del middleware 'auth'
Route::middleware(['auth'])->group(function () {
    // Rutas de admin
});
```

### 2. Verificar Validaciones

```php
// En PlatformPaymentMethodController
// Verificar que existan validaciones en store() y update()
$validated = $request->validate([...]);
```

### 3. Verificar Autorización

```php
// En el controlador
if (!$user->isSuperAdmin()) {
    abort(403);
}
```

## 📊 Monitoreo Post-Despliegue

### Métricas a Monitorear:

1. **Uso del Sistema:**
   - Cantidad de métodos creados
   - Métodos más usados
   - Tasa de activación/desactivación

2. **Errores:**
   - Logs de Laravel
   - Errores de JavaScript en consola
   - Errores de validación

3. **Performance:**
   - Tiempo de carga de páginas
   - Tiempo de respuesta de API
   - Uso de base de datos

### Comandos de Monitoreo:

```bash
# Ver logs en tiempo real
tail -f storage/logs/laravel.log

# Ver últimos errores
tail -100 storage/logs/laravel.log | grep ERROR

# Verificar uso de base de datos
php artisan db:monitor
```

## 🔄 Rollback (Si es necesario)

### 1. Revertir Migración

```bash
# Revertir última migración
php artisan migrate:rollback --step=1

# O específicamente
php artisan migrate:rollback --path=database/migrations/2025_10_28_040000_create_platform_payment_methods_table.php
```

### 2. Revertir Código

```bash
# Si usas Git
git revert <commit-hash>

# O restaurar archivos específicos
git checkout HEAD~1 -- app/Models/PlatformPaymentMethod.php
git checkout HEAD~1 -- app/Http/Controllers/Admin/PlatformPaymentMethodController.php
```

### 3. Limpiar Caché

```bash
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

## 📝 Checklist de Despliegue

### Pre-Despliegue:
- [ ] Código revisado y probado localmente
- [ ] Tests pasando (si existen)
- [ ] Documentación actualizada
- [ ] Backup de base de datos realizado

### Durante Despliegue:
- [ ] Migraciones ejecutadas
- [ ] Seeders ejecutados (si aplica)
- [ ] Assets compilados
- [ ] Caché limpiado
- [ ] Permisos verificados

### Post-Despliegue:
- [ ] Rutas funcionando
- [ ] Panel de admin accesible
- [ ] Vista de operador funcionando
- [ ] Métodos de pago visibles
- [ ] Formularios funcionando
- [ ] Sin errores en logs
- [ ] Performance aceptable

## 🎯 Configuración Recomendada

### Producción:

```env
# .env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tudominio.com

# Caché
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Optimizaciones
OPTIMIZE_IMAGES=true
MINIFY_HTML=true
```

### Desarrollo:

```env
# .env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

# Caché
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

## 📞 Contacto y Soporte

Si encuentras problemas durante el despliegue:

1. **Revisar logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Verificar configuración:**
   ```bash
   php artisan config:show
   ```

3. **Consultar documentación:**
   - `SISTEMA_PAGOS_PLATAFORMA.md`
   - `GUIA_USO_METODOS_PAGO.md`
   - `RESUMEN_SISTEMA_PAGOS.md`

4. **Contactar al equipo de desarrollo**

## ✅ Confirmación de Despliegue Exitoso

El despliegue es exitoso cuando:

- ✅ Tabla `platform_payment_methods` existe
- ✅ Rutas responden correctamente
- ✅ Panel de admin carga sin errores
- ✅ Operadores ven métodos de pago
- ✅ Formularios funcionan correctamente
- ✅ No hay errores en logs
- ✅ Assets cargan correctamente
- ✅ Permisos funcionan correctamente

---

**Última actualización:** 28 de Octubre, 2025
**Versión:** 1.0.0
**Estado:** ✅ Listo para Producción
