<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class ModuleServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Orders Module
        $this->app->singleton(
            \App\Modules\Orders\Services\CommissionCalculator::class
        );
        
        $this->app->singleton(
            \App\Modules\Orders\Services\PaymentMethodSelector::class
        );
        
        $this->app->singleton(
            \App\Modules\Orders\Services\OrderService::class
        );
        
        // Customers Module
        $this->app->singleton(
            \App\Modules\Customers\Services\CustomerService::class
        );
        
        // Payments Module
        $this->app->singleton(
            \App\Modules\Payments\Services\PaymentService::class
        );
        
        // Analytics Module
        $this->app->singleton(
            \App\Modules\Analytics\Services\AnalyticsService::class
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
