<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    // Rutas para Super Admin
    Route::middleware(['role:super_admin'])->group(function () {
        Route::resource('exchange-houses', App\Http\Controllers\ExchangeHouseController::class);
        Route::get('admin/commissions', [App\Http\Controllers\DashboardController::class, 'commissions'])->name('admin.commissions');
        Route::get('admin/users', [App\Http\Controllers\DashboardController::class, 'users'])->name('admin.users');
        Route::get('admin/reports', [App\Http\Controllers\DashboardController::class, 'reports'])->name('admin.reports');
        Route::get('admin/settings', [App\Http\Controllers\SystemSettingsController::class, 'index'])->name('admin.settings');
        Route::put('admin/settings', [App\Http\Controllers\SystemSettingsController::class, 'update'])->name('admin.settings.update');
        Route::post('admin/settings', [App\Http\Controllers\SystemSettingsController::class, 'update'])->name('admin.settings.update.post');
        Route::put('admin/settings/{key}', [App\Http\Controllers\SystemSettingsController::class, 'updateSingle'])->name('admin.settings.update-single');
        Route::post('admin/settings/quick-update', [App\Http\Controllers\SystemSettingsController::class, 'quickUpdate'])->name('admin.settings.quick-update');

        // Gestión de Pagos de Comisiones (Sistema Antiguo)
        Route::get('admin/payments', [App\Http\Controllers\CommissionPaymentController::class, 'index'])->name('admin.payments');
        Route::get('admin/payments/dashboard', [App\Http\Controllers\CommissionPaymentController::class, 'dashboard'])->name('admin.payments.dashboard');
        Route::get('admin/payments/{commissionPayment}', [App\Http\Controllers\CommissionPaymentController::class, 'show'])->name('admin.payments.show');
        Route::post('admin/payments/{commissionPayment}/mark-paid', [App\Http\Controllers\CommissionPaymentController::class, 'markAsPaid'])->name('admin.payments.mark-paid');
        Route::delete('admin/payments/{commissionPayment}', [App\Http\Controllers\CommissionPaymentController::class, 'destroy'])->name('admin.payments.destroy');
        Route::post('admin/payments/generate', [App\Http\Controllers\CommissionPaymentController::class, 'generatePayments'])->name('admin.payments.generate');
        
        // Sistema Nuevo de Solicitudes de Pago de Comisiones
        Route::get('admin/commission-requests', [App\Http\Controllers\CommissionPaymentRequestController::class, 'index'])->name('admin.commission-requests');
        Route::post('admin/commission-requests/generate', [App\Http\Controllers\CommissionPaymentRequestController::class, 'generate'])->name('admin.commission-requests.generate');
        Route::get('admin/commission-requests/{paymentRequest}', [App\Http\Controllers\CommissionPaymentRequestController::class, 'show'])->name('admin.commission-requests.show');
        Route::post('admin/commission-requests/{paymentRequest}/confirm', [App\Http\Controllers\CommissionPaymentRequestController::class, 'confirmPayment'])->name('admin.commission-requests.confirm');
        Route::post('admin/commission-requests/{paymentRequest}/reject', [App\Http\Controllers\CommissionPaymentRequestController::class, 'rejectPayment'])->name('admin.commission-requests.reject');

        // Métodos de Pago de la Plataforma (Cuentas de Kuberafi)
        Route::get('admin/platform-payment-methods', [App\Http\Controllers\Admin\PlatformPaymentMethodController::class, 'index'])->name('admin.platform-payment-methods');
        Route::post('admin/platform-payment-methods', [App\Http\Controllers\Admin\PlatformPaymentMethodController::class, 'store'])->name('admin.platform-payment-methods.store');
        Route::put('admin/platform-payment-methods/{platformPaymentMethod}', [App\Http\Controllers\Admin\PlatformPaymentMethodController::class, 'update'])->name('admin.platform-payment-methods.update');
        Route::delete('admin/platform-payment-methods/{platformPaymentMethod}', [App\Http\Controllers\Admin\PlatformPaymentMethodController::class, 'destroy'])->name('admin.platform-payment-methods.destroy');
        Route::post('admin/platform-payment-methods/{platformPaymentMethod}/toggle', [App\Http\Controllers\Admin\PlatformPaymentMethodController::class, 'toggle'])->name('admin.platform-payment-methods.toggle');

        // Cronogramas de Pago
        Route::get('admin/payment-schedules', [App\Http\Controllers\CommissionPaymentController::class, 'schedules'])->name('admin.payment-schedules');
        Route::post('admin/payment-schedules', [App\Http\Controllers\CommissionPaymentController::class, 'storeSchedule'])->name('admin.payment-schedules.store');
        Route::put('admin/payment-schedules/{paymentSchedule}', [App\Http\Controllers\CommissionPaymentController::class, 'updateSchedule'])->name('admin.payment-schedules.update');

        // Gestión de Usuarios (Solo Super Admin)
        Route::get('admin/users/create', [App\Http\Controllers\AdminUserController::class, 'create'])->name('admin.users.create');
        Route::post('admin/users', [App\Http\Controllers\AdminUserController::class, 'store'])->name('admin.users.store');
        Route::get('admin/users/{user}/edit', [App\Http\Controllers\AdminUserController::class, 'edit'])->name('admin.users.edit');
        Route::put('admin/users/{user}', [App\Http\Controllers\AdminUserController::class, 'update'])->name('admin.users.update');
        Route::delete('admin/users/{user}', [App\Http\Controllers\AdminUserController::class, 'destroy'])->name('admin.users.destroy');

        // Ruta temporal para probar configuraciones
        Route::get('admin/test-settings', function () {
            $currentRate = \App\Models\SystemSetting::getPlatformCommissionRate();
            return Inertia::render('Admin/TestSettings', [
                'currentRate' => $currentRate
            ]);
        })->name('admin.test-settings');

        // Gestión de Divisas (Super Admin)
        Route::get('admin/currencies', [App\Http\Controllers\Admin\CurrencyController::class, 'index'])->name('admin.currencies');
        Route::post('admin/currencies', [App\Http\Controllers\Admin\CurrencyController::class, 'store'])->name('admin.currencies.store');
        Route::put('admin/currencies/{currency}', [App\Http\Controllers\Admin\CurrencyController::class, 'update'])->name('admin.currencies.update');
        Route::delete('admin/currencies/{currency}', [App\Http\Controllers\Admin\CurrencyController::class, 'destroy'])->name('admin.currencies.destroy');
        Route::post('admin/currencies/{currency}/toggle', [App\Http\Controllers\Admin\CurrencyController::class, 'toggleActive'])->name('admin.currencies.toggle');

        // Gestión de Pares de Divisas (Super Admin)
        Route::get('admin/currency-pairs', [App\Http\Controllers\Admin\CurrencyPairController::class, 'index'])->name('admin.currency-pairs');
        Route::post('admin/currency-pairs', [App\Http\Controllers\Admin\CurrencyPairController::class, 'store'])->name('admin.currency-pairs.store');
        Route::put('admin/currency-pairs/{currencyPair}', [App\Http\Controllers\Admin\CurrencyPairController::class, 'update'])->name('admin.currency-pairs.update');
        Route::delete('admin/currency-pairs/{currencyPair}', [App\Http\Controllers\Admin\CurrencyPairController::class, 'destroy'])->name('admin.currency-pairs.destroy');
        Route::post('admin/currency-pairs/{currencyPair}/toggle', [App\Http\Controllers\Admin\CurrencyPairController::class, 'toggleActive'])->name('admin.currency-pairs.toggle');
    });

    // Rutas para Casas de Cambio y Super Admin
    Route::middleware(['role:super_admin,exchange_house,operator'])->group(function () {
        // OPTIMIZADO: Definir store separadamente con rate limit
        Route::post('orders', [App\Http\Controllers\OrderController::class, 'store'])
            ->middleware('rate.limit.orders')
            ->name('orders.store');
        Route::resource('orders', App\Http\Controllers\OrderController::class)->except(['store']);
        Route::post('orders/{order}/complete', [App\Http\Controllers\OrderController::class, 'complete'])->name('orders.complete');
        Route::post('orders/{order}/cancel', [App\Http\Controllers\OrderController::class, 'cancel'])->name('orders.cancel');
        Route::get('orders-export', [App\Http\Controllers\OrderController::class, 'export'])->name('orders.export');
    });

    // Rutas solo para Casas de Cambio y Operadores
    Route::middleware(['role:exchange_house,operator'])->group(function () {
        Route::get('my-commissions', [App\Http\Controllers\DashboardController::class, 'myCommissions'])->name('my.commissions');
        Route::get('my-performance', [App\Http\Controllers\PerformanceController::class, 'index'])->name('my.performance');
        
        // Cierre de Operaciones
        Route::get('operation-closure', [App\Http\Controllers\OperationClosureController::class, 'index'])->name('operation-closure.index');
        Route::get('operation-closure/export', [App\Http\Controllers\OperationClosureController::class, 'export'])->name('operation-closure.export');
        Route::get('operation-closure/export-debts', [App\Http\Controllers\OperationClosureController::class, 'exportPendingDebts'])->name('operation-closure.export-debts');
        
        // Sistema de Solicitudes de Pago de Comisiones
        Route::get('my-commission-requests', [App\Http\Controllers\CommissionPaymentRequestController::class, 'myRequests'])->name('my.commission-requests');
        Route::get('my-commission-requests/{paymentRequest}', [App\Http\Controllers\CommissionPaymentRequestController::class, 'myRequestDetail'])->name('my.commission-requests.detail');
        Route::post('my-commission-requests/{paymentRequest}/send-payment', [App\Http\Controllers\CommissionPaymentRequestController::class, 'sendPaymentInfo'])->name('my.commission-requests.send-payment');
        
        // Control de Caja (Fondo de Caja)
        Route::get('cash-box', [App\Http\Controllers\CashBoxController::class, 'index'])->name('cash-box.index');
        Route::post('cash-box/movement', [App\Http\Controllers\CashBoxController::class, 'registerMovement'])->name('cash-box.movement');
        Route::get('cash-box/history', [App\Http\Controllers\CashBoxController::class, 'history'])->name('cash-box.history');
        Route::get('cash-box/export', [App\Http\Controllers\CashBoxController::class, 'export'])->name('cash-box.export');
    });
    
    // Rutas solo para Casas de Cambio
    Route::middleware(['role:exchange_house'])->group(function () {
        // Configuración de Metas de Rendimiento
        Route::get('performance-goals', [App\Http\Controllers\PerformanceGoalController::class, 'index'])->name('performance-goals.index');
        Route::post('performance-goals', [App\Http\Controllers\PerformanceGoalController::class, 'update'])->name('performance-goals.update');
        
        // Currency Pairs para casas de cambio
        Route::get('/currency-pairs', [App\Http\Controllers\ExchangeHouse\CurrencyPairController::class, 'index'])->name('currency-pairs.index');
        Route::post('/currency-pairs/{currencyPair}/attach', [App\Http\Controllers\ExchangeHouse\CurrencyPairController::class, 'attach'])->name('currency-pairs.attach');
        Route::put('/currency-pairs/{currencyPair}', [App\Http\Controllers\ExchangeHouse\CurrencyPairController::class, 'update'])->name('currency-pairs.update');
        Route::delete('/currency-pairs/{currencyPair}/detach', [App\Http\Controllers\ExchangeHouse\CurrencyPairController::class, 'detach'])->name('currency-pairs.detach');
        Route::post('/currency-pairs/{currencyPair}/toggle', [App\Http\Controllers\ExchangeHouse\CurrencyPairController::class, 'toggleActive'])->name('currency-pairs.toggle');
        
        // Historial de tasas
        Route::get('/currency-pairs/{currencyPair}/rate-history', [App\Http\Controllers\CurrencyPairRateHistoryController::class, 'index'])->name('currency-pairs.rate-history');
        Route::get('/currency-pairs/{currencyPair}/rate-history/chart', [App\Http\Controllers\CurrencyPairRateHistoryController::class, 'chartData'])->name('currency-pairs.rate-history.chart');
        Route::get('/currency-pairs/{currencyPair}/rate-history/comparison', [App\Http\Controllers\CurrencyPairRateHistoryController::class, 'comparison'])->name('currency-pairs.rate-history.comparison');
        
        // Payment Methods para casas de cambio
        Route::get('/payment-methods', [App\Http\Controllers\ExchangeHouse\PaymentMethodController::class, 'index'])->name('payment-methods.index');
        Route::post('/payment-methods', [App\Http\Controllers\ExchangeHouse\PaymentMethodController::class, 'store'])->name('payment-methods.store');
        Route::put('/payment-methods/{paymentMethod}', [App\Http\Controllers\ExchangeHouse\PaymentMethodController::class, 'update'])->name('payment-methods.update');
        Route::delete('/payment-methods/{paymentMethod}', [App\Http\Controllers\ExchangeHouse\PaymentMethodController::class, 'destroy'])->name('payment-methods.destroy');
        Route::post('/payment-methods/{paymentMethod}/toggle', [App\Http\Controllers\ExchangeHouse\PaymentMethodController::class, 'toggle'])->name('payment-methods.toggle');
        
        // CRM Customers
        Route::resource('customers', App\Http\Controllers\ExchangeHouse\CustomerController::class);
        Route::post('/customers/{customer}/activities', [App\Http\Controllers\ExchangeHouse\CustomerController::class, 'addActivity'])->name('customers.activities.store');
        Route::post('/customers/{customer}/bank-accounts', [App\Http\Controllers\ExchangeHouse\CustomerBankAccountController::class, 'store'])->name('customers.bank-accounts.store');
        Route::put('/customers/{customer}/bank-accounts/{bankAccount}', [App\Http\Controllers\ExchangeHouse\CustomerBankAccountController::class, 'update'])->name('customers.bank-accounts.update');
        Route::delete('/customers/{customer}/bank-accounts/{bankAccount}', [App\Http\Controllers\ExchangeHouse\CustomerBankAccountController::class, 'destroy'])->name('customers.bank-accounts.destroy');
        
        // Analytics Endpoints
        Route::prefix('analytics')->name('analytics.')->group(function () {
            Route::get('/currency-pair-trends', [App\Http\Controllers\ExchangeHouse\AnalyticsController::class, 'currencyPairTrends'])->name('currency-pair-trends');
            Route::get('/activity-heatmap', [App\Http\Controllers\ExchangeHouse\AnalyticsController::class, 'activityHeatmap'])->name('activity-heatmap');
            Route::get('/margin-analysis', [App\Http\Controllers\ExchangeHouse\AnalyticsController::class, 'marginAnalysis'])->name('margin-analysis');
            Route::get('/liquidity-forecast', [App\Http\Controllers\ExchangeHouse\AnalyticsController::class, 'liquidityForecast'])->name('liquidity-forecast');
            Route::get('/period-comparison', [App\Http\Controllers\ExchangeHouse\AnalyticsController::class, 'periodComparison'])->name('period-comparison');
            Route::get('/payment-method-analysis', [App\Http\Controllers\ExchangeHouse\AnalyticsController::class, 'paymentMethodAnalysis'])->name('payment-method-analysis');
            Route::get('/processing-speed', [App\Http\Controllers\ExchangeHouse\AnalyticsController::class, 'processingSpeed'])->name('processing-speed');
            Route::get('/top-customers', [App\Http\Controllers\ExchangeHouse\AnalyticsController::class, 'topCustomersAnalysis'])->name('top-customers');
        });
        
    });
    
    // Support Tickets - Disponible para todos los usuarios autenticados
    Route::resource('tickets', App\Http\Controllers\SupportTicketController::class);
    Route::post('tickets/{ticket}/messages', [App\Http\Controllers\SupportTicketController::class, 'addMessage'])->name('tickets.messages.store');
    Route::post('tickets/{ticket}/status', [App\Http\Controllers\SupportTicketController::class, 'updateStatus'])->name('tickets.status');
    Route::post('tickets/{ticket}/assign', [App\Http\Controllers\SupportTicketController::class, 'assign'])->name('tickets.assign');
    Route::post('tickets/{ticket}/rate', [App\Http\Controllers\SupportTicketController::class, 'rate'])->name('tickets.rate');
    Route::post('tickets/{ticket}/close', [App\Http\Controllers\SupportTicketController::class, 'close'])->name('tickets.close');
    
    // Notificaciones
    Route::get('notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/unread-count', [App\Http\Controllers\NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::post('notifications/{notification}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
