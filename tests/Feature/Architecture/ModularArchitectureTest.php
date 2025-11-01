<?php

use Illuminate\Support\Facades\File;

it('has modules directory structure', function () {
    $modulesPath = app_path('Modules');
    
    expect(File::isDirectory($modulesPath))->toBeTrue();
    
    // Verificar módulos principales
    $expectedModules = ['Orders', 'Customers', 'Payments', 'Analytics'];
    
    foreach ($expectedModules as $module) {
        expect(File::isDirectory("{$modulesPath}/{$module}"))->toBeTrue();
    }
});

it('has correct Orders module structure', function () {
    $ordersPath = app_path('Modules/Orders');
    
    expect(File::isDirectory("{$ordersPath}/Services"))->toBeTrue();
    expect(File::exists("{$ordersPath}/Services/OrderService.php"))->toBeTrue();
    expect(File::exists("{$ordersPath}/Services/CommissionCalculator.php"))->toBeTrue();
    expect(File::exists("{$ordersPath}/Services/PaymentMethodSelector.php"))->toBeTrue();
});

it('has correct Customers module structure', function () {
    $customersPath = app_path('Modules/Customers');
    
    expect(File::isDirectory("{$customersPath}/Services"))->toBeTrue();
    expect(File::isDirectory("{$customersPath}/Controllers"))->toBeTrue();
    expect(File::exists("{$customersPath}/Services/CustomerService.php"))->toBeTrue();
    expect(File::exists("{$customersPath}/Controllers/CustomerController.php"))->toBeTrue();
});

it('has correct Payments module structure', function () {
    $paymentsPath = app_path('Modules/Payments');
    
    expect(File::isDirectory("{$paymentsPath}/Services"))->toBeTrue();
    expect(File::isDirectory("{$paymentsPath}/Controllers"))->toBeTrue();
    expect(File::exists("{$paymentsPath}/Services/PaymentService.php"))->toBeTrue();
    expect(File::exists("{$paymentsPath}/Controllers/PaymentMethodController.php"))->toBeTrue();
    expect(File::exists("{$paymentsPath}/Controllers/CashBoxController.php"))->toBeTrue();
});

it('has correct Analytics module structure', function () {
    $analyticsPath = app_path('Modules/Analytics');
    
    expect(File::isDirectory("{$analyticsPath}/Services"))->toBeTrue();
    expect(File::exists("{$analyticsPath}/Services/AnalyticsService.php"))->toBeTrue();
});

it('has all service classes available', function () {
    $services = [
        \App\Modules\Orders\Services\OrderService::class,
        \App\Modules\Orders\Services\CommissionCalculator::class,
        \App\Modules\Orders\Services\PaymentMethodSelector::class,
        \App\Modules\Customers\Services\CustomerService::class,
        \App\Modules\Payments\Services\PaymentService::class,
        \App\Modules\Analytics\Services\AnalyticsService::class,
    ];
    
    foreach ($services as $service) {
        expect(class_exists($service))->toBeTrue();
    }
});

it('has all refactored controllers', function () {
    $controllers = [
        app_path('Modules/Customers/Controllers/CustomerController.php'),
        app_path('Modules/Payments/Controllers/PaymentMethodController.php'),
        app_path('Modules/Payments/Controllers/CashBoxController.php'),
    ];
    
    foreach ($controllers as $controller) {
        expect(File::exists($controller))->toBeTrue();
    }
});

it('has smaller refactored controllers', function () {
    // CustomerController debería tener ~181 líneas (vs 372 original)
    $customerController = file_get_contents(
        app_path('Modules/Customers/Controllers/CustomerController.php')
    );
    $lines = count(explode("\n", $customerController));
    expect($lines)->toBeLessThan(250);
    
    // PaymentMethodController debería tener ~129 líneas (vs 233 original)
    $paymentController = file_get_contents(
        app_path('Modules/Payments/Controllers/PaymentMethodController.php')
    );
    $lines = count(explode("\n", $paymentController));
    expect($lines)->toBeLessThan(200);
});

it('services follow naming convention', function () {
    $servicesPath = app_path('Modules');
    $serviceFiles = File::allFiles($servicesPath);
    
    foreach ($serviceFiles as $file) {
        if (str_contains($file->getPath(), 'Services')) {
            $filename = $file->getFilename();
            $validName = str_ends_with($filename, 'Service.php') || 
                        str_ends_with($filename, 'Calculator.php') ||
                        str_ends_with($filename, 'Selector.php');
            expect($validName)->toBeTrue();
        }
    }
});

it('has no legacy controllers in modules', function () {
    $modulesPath = app_path('Modules');
    $allFiles = File::allFiles($modulesPath);
    
    foreach ($allFiles as $file) {
        if (str_contains($file->getPath(), 'Controllers')) {
            $content = file_get_contents($file->getPathname());
            $lines = count(explode("\n", $content));
            expect($lines)->toBeLessThan(500);
        }
    }
});
