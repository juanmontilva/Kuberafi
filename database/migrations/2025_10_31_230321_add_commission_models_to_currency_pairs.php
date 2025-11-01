<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Agregar campos a la tabla pivot exchange_house_currency_pair
        Schema::table('exchange_house_currency_pair', function (Blueprint $table) {
            $table->enum('commission_model', ['percentage', 'spread', 'mixed'])
                ->default('percentage')
                ->after('margin_percent');
            
            $table->decimal('commission_percent', 5, 2)
                ->nullable()
                ->after('commission_model')
                ->comment('Porcentaje de comisión para modelo percentage o mixed');
            
            $table->decimal('buy_rate', 10, 6)
                ->nullable()
                ->after('commission_percent')
                ->comment('Tasa de compra para modelo spread o mixed');
            
            $table->decimal('sell_rate', 10, 6)
                ->nullable()
                ->after('buy_rate')
                ->comment('Tasa de venta para modelo spread o mixed');
        });

        // Agregar campos a la tabla orders para registrar el modelo usado
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('commission_model', ['percentage', 'spread', 'mixed'])
                ->nullable()
                ->after('applied_rate')
                ->comment('Modelo de comisión usado en esta orden');
            
            $table->decimal('buy_rate', 10, 6)
                ->nullable()
                ->after('commission_model')
                ->comment('Tasa de compra (costo) para modelo spread');
            
            $table->decimal('sell_rate', 10, 6)
                ->nullable()
                ->after('buy_rate')
                ->comment('Tasa de venta (precio) para modelo spread');
            
            $table->decimal('spread_profit', 10, 2)
                ->nullable()
                ->after('sell_rate')
                ->comment('Ganancia por spread');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exchange_house_currency_pair', function (Blueprint $table) {
            $table->dropColumn([
                'commission_model',
                'commission_percent',
                'buy_rate',
                'sell_rate',
            ]);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'commission_model',
                'buy_rate',
                'sell_rate',
                'spread_profit',
            ]);
        });
    }
};
