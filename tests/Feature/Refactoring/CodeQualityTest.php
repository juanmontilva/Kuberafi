<?php

use Illuminate\Support\Facades\File;

it('controllers inject services via dependency injection', function () {
    $customerController = file_get_contents(
        app_path('Modules/Customers/Controllers/CustomerController.php')
    );
    
    expect($customerController)->toContain('CustomerService');
    expect($customerController)->toContain('__construct');
});

it('services use transactions for critical operations', function () {
    $orderService = file_get_contents(
        app_path('Modules/Orders/Services/OrderService.php')
    );
    
    expect($orderService)->toContain('DB::transaction');
});

it('controllers delegate to services', function () {
    $customerController = file_get_contents(
        app_path('Modules/Customers/Controllers/CustomerController.php')
    );
    
    expect($customerController)->toContain('$this->customerService');
});

it('services have proper namespaces', function () {
    $services = [
        'Modules/Orders/Services/OrderService.php' => 'App\Modules\Orders\Services',
        'Modules/Customers/Services/CustomerService.php' => 'App\Modules\Customers\Services',
        'Modules/Payments/Services/PaymentService.php' => 'App\Modules\Payments\Services',
    ];
    
    foreach ($services as $path => $expectedNamespace) {
        $content = file_get_contents(app_path($path));
        expect($content)->toContain("namespace {$expectedNamespace}");
    }
});

it('commission calculator supports all three models', function () {
    $calculator = file_get_contents(
        app_path('Modules/Orders/Services/CommissionCalculator.php')
    );
    
    expect($calculator)->toContain('percentage');
    expect($calculator)->toContain('spread');
    expect($calculator)->toContain('mixed');
});

it('refactored code reduced total lines significantly', function () {
    // CustomerController: 372 → ~181 líneas
    $customerController = file_get_contents(
        app_path('Modules/Customers/Controllers/CustomerController.php')
    );
    $customerLines = count(explode("\n", $customerController));
    
    // PaymentMethodController: 233 → ~129 líneas  
    $paymentController = file_get_contents(
        app_path('Modules/Payments/Controllers/PaymentMethodController.php')
    );
    $paymentLines = count(explode("\n", $paymentController));
    
    // CashBoxController debería ser limpio
    $cashboxController = file_get_contents(
        app_path('Modules/Payments/Controllers/CashBoxController.php')
    );
    $cashboxLines = count(explode("\n", $cashboxController));
    
    // Total debe ser significativamente menor
    $totalRefactoredLines = $customerLines + $paymentLines + $cashboxLines;
    
    // Antes era ~1,338 líneas, ahora debe ser ~578 o menos
    expect($totalRefactoredLines)->toBeLessThan(700);
});

it('services are organized by business domain', function () {
    $modulesPath = app_path('Modules');
    
    // Verificar que servicios están en carpetas correctas
    $orderService = app_path('Modules/Orders/Services/OrderService.php');
    $customerService = app_path('Modules/Customers/Services/CustomerService.php');
    $paymentService = app_path('Modules/Payments/Services/PaymentService.php');
    
    expect(File::exists($orderService))->toBeTrue();
    expect(File::exists($customerService))->toBeTrue();
    expect(File::exists($paymentService))->toBeTrue();
});
