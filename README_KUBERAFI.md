# 🏦 Kuberafi - Plataforma de Gestión para Casas de Cambio

Kuberafi es una plataforma administrativa completa diseñada para gestionar casas de cambio, su contabilidad diaria, finanzas y operaciones de intercambio de divisas.

## 🚀 Características Principales

### 💼 Sistema de Roles
- **Super Administrador**: Control total de la plataforma, gestión de casas de cambio y comisiones
- **Casa de Cambio**: Gestión de sus propias operaciones, órdenes y reportes
- **Operador**: Creación y gestión de órdenes individuales

### 💱 Gestión de Divisas
- Múltiples pares de divisas (USD/VES, EUR/VES, COP/VES, etc.)
- Tasas de mercado en tiempo real
- Cálculo automático de márgenes y comisiones
- Límites configurables por par de divisas

### 📊 Sistema de Comisiones
- **Comisión de plataforma**: 0.15% para el super administrador
- **Comisión de casa de cambio**: Configurable por cada casa
- Seguimiento automático de ganancias reales vs esperadas
- Reportes detallados de comisiones

### 🎯 Gestión de Órdenes
- Creación de órdenes con márgenes personalizables
- Calculadora en tiempo real de conversiones
- Seguimiento de estado (Pendiente, Procesando, Completada, etc.)
- Comparación entre margen esperado vs real obtenido

### 📈 Dashboard Inteligente
- Métricas en tiempo real por rol de usuario
- Gráficos de rendimiento y volumen
- Top casas de cambio por volumen
- Límites diarios y alertas

## 🛠️ Stack Tecnológico

### Backend
- **Laravel 12** - Framework PHP robusto
- **MySQL** - Base de datos relacional
- **Inertia.js** - Comunicación seamless entre backend y frontend

### Frontend
- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para mayor seguridad
- **Tailwind CSS** - Framework de estilos utilitarios
- **shadcn/ui** - Componentes UI elegantes y accesibles
- **Radix UI** - Primitivos de UI accesibles

### Herramientas de Desarrollo
- **Vite** - Build tool rápido
- **Laravel Fortify** - Autenticación y seguridad
- **Pest** - Testing framework

## 🏗️ Arquitectura de Base de Datos

### Tablas Principales
- `users` - Usuarios del sistema con roles
- `exchange_houses` - Casas de cambio registradas
- `currency_pairs` - Pares de divisas disponibles
- `orders` - Órdenes de intercambio
- `commissions` - Registro de comisiones generadas

### Relaciones Clave
- Usuario pertenece a una casa de cambio
- Orden pertenece a una casa de cambio y usuario
- Comisiones se generan automáticamente por cada orden

## 🔐 Credenciales de Acceso

### Super Administrador
- **Email**: admin@kuberafi.com
- **Password**: password
- **Permisos**: Control total de la plataforma

### Casa de Cambio 1 - CambioExpress
- **Email**: maria@cambioexpress.com
- **Password**: password
- **Comisión**: 2.5%
- **Límite diario**: $50,000

### Casa de Cambio 2 - DivisasVIP
- **Email**: carlos@divisasvip.com
- **Password**: password
- **Comisión**: 3.0%
- **Límite diario**: $75,000

## 🚀 Instalación y Configuración

### Prerrequisitos
- PHP 8.2+
- Node.js 18+
- MySQL 8.0+
- Composer

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd kuberafi
```

2. **Instalar dependencias PHP**
```bash
composer install
```

3. **Instalar dependencias Node.js**
```bash
npm install
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Configurar base de datos en .env**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kuberafi_db
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

6. **Ejecutar migraciones y seeders**
```bash
php artisan migrate
php artisan db:seed --class=KuberafiSeeder
```

7. **Compilar assets**
```bash
npm run build
```

8. **Iniciar servidor de desarrollo**
```bash
php artisan serve
```

## 💰 Modelo de Negocio

### Flujo de Comisiones
1. **Casa de cambio** crea una orden con margen esperado (ej: 5%)
2. **Sistema** calcula automáticamente:
   - Comisión de plataforma: 0.15% del monto base
   - Comisión de casa de cambio: según su tasa configurada
3. **Al completar** la orden, se registra el margen real obtenido
4. **Reportes** muestran la diferencia entre esperado vs real

### Ejemplo Práctico
- Cliente quiere cambiar $1,000 USD a VES
- Tasa de mercado: 36.50 VES/USD
- Margen esperado: 5%
- Tasa aplicada: 38.325 VES/USD
- Cliente recibe: 38,325 VES
- Comisión plataforma: $1.50 (0.15%)
- Comisión casa de cambio: $25.00 (2.5%)

## 📊 Funcionalidades Clave

### Para Super Administrador
- ✅ Dashboard con métricas globales
- ✅ Gestión de casas de cambio
- ✅ Configuración de pares de divisas
- ✅ Reportes de comisiones de plataforma
- ✅ Control de usuarios y permisos

### Para Casas de Cambio
- ✅ Dashboard personalizado con métricas propias
- ✅ Gestión de órdenes de su casa
- ✅ Calculadora de conversiones en tiempo real
- ✅ Reportes de comisiones ganadas
- ✅ Control de límites diarios

### Para Operadores
- ✅ Dashboard simple con sus métricas
- ✅ Creación de órdenes individuales
- ✅ Seguimiento de sus transacciones
- ✅ Calculadora integrada

## 🔒 Seguridad

- Autenticación robusta con Laravel Fortify
- Middleware de roles para control de acceso
- Validación de datos en frontend y backend
- Protección CSRF automática
- Sanitización de inputs

## 🎨 Diseño UI/UX

- Interfaz moderna y elegante con shadcn/ui
- Responsive design para todos los dispositivos
- Tema claro/oscuro automático
- Navegación intuitiva por roles
- Feedback visual inmediato

## 📈 Métricas y Reportes

- Volumen de transacciones en tiempo real
- Comparación de márgenes esperados vs reales
- Top casas de cambio por rendimiento
- Alertas de límites diarios
- Histórico de comisiones

## 🔄 Próximas Funcionalidades

- [ ] API REST para integraciones
- [ ] Notificaciones en tiempo real
- [ ] Reportes avanzados con gráficos
- [ ] Sistema de alertas automáticas
- [ ] Integración con APIs de tasas de cambio
- [ ] Módulo de contabilidad avanzada
- [ ] Sistema de aprobaciones multi-nivel

## 🤝 Contribución

Este proyecto está diseñado para ser escalable y mantenible. Las contribuciones son bienvenidas siguiendo las mejores prácticas de Laravel y React.

## 📞 Soporte

Para soporte técnico o consultas sobre la plataforma, contacta al equipo de desarrollo.

---

**Kuberafi** - Transformando la gestión de casas de cambio con tecnología moderna y elegante. 🚀