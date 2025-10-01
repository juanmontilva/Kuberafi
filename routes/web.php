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

        // Gestión de Pagos de Comisiones
        Route::get('admin/payments', [App\Http\Controllers\CommissionPaymentController::class, 'index'])->name('admin.payments');
        Route::get('admin/payments/dashboard', [App\Http\Controllers\CommissionPaymentController::class, 'dashboard'])->name('admin.payments.dashboard');
        Route::get('admin/payments/{commissionPayment}', [App\Http\Controllers\CommissionPaymentController::class, 'show'])->name('admin.payments.show');
        Route::post('admin/payments/{commissionPayment}/mark-paid', [App\Http\Controllers\CommissionPaymentController::class, 'markAsPaid'])->name('admin.payments.mark-paid');
        Route::post('admin/payments/generate', [App\Http\Controllers\CommissionPaymentController::class, 'generatePayments'])->name('admin.payments.generate');

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
    });

    // Rutas solo para Casas de Cambio y Operadores
    Route::middleware(['role:exchange_house,operator'])->group(function () {
        Route::get('my-commissions', [App\Http\Controllers\DashboardController::class, 'myCommissions'])->name('my.commissions');
        
        // Currency Pairs para casas de cambio
        Route::get('/currency-pairs', [App\Http\Controllers\ExchangeHouse\CurrencyPairController::class, 'index'])->name('currency-pairs.index');
        Route::post('/currency-pairs/{currencyPair}/attach', [App\Http\Controllers\ExchangeHouse\CurrencyPairController::class, 'attach'])->name('currency-pairs.attach');
        Route::put('/currency-pairs/{currencyPair}', [App\Http\Controllers\ExchangeHouse\CurrencyPairController::class, 'update'])->name('currency-pairs.update');
        Route::delete('/currency-pairs/{currencyPair}/detach', [App\Http\Controllers\ExchangeHouse\CurrencyPairController::class, 'detach'])->name('currency-pairs.detach');
        Route::post('/currency-pairs/{currencyPair}/toggle', [App\Http\Controllers\ExchangeHouse\CurrencyPairController::class, 'toggle'])->name('currency-pairs.toggle');
        
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
        
        // Support Tickets
        Route::resource('tickets', App\Http\Controllers\SupportTicketController::class);
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
