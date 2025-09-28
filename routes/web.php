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
    });

    // Rutas para Casas de Cambio y Super Admin
    Route::middleware(['role:super_admin,exchange_house,operator'])->group(function () {
        Route::resource('orders', App\Http\Controllers\OrderController::class);
    });

    // Rutas solo para Casas de Cambio y Operadores
    Route::middleware(['role:exchange_house,operator'])->group(function () {
        Route::get('my-commissions', [App\Http\Controllers\DashboardController::class, 'myCommissions'])->name('my.commissions');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
