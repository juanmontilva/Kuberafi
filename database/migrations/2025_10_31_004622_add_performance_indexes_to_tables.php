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
        // Índices para orders - mejora queries de listado y filtrado
        Schema::table('orders', function (Blueprint $table) {
            $table->index(['exchange_house_id', 'status', 'created_at'], 'orders_eh_status_created_idx');
            $table->index(['customer_id', 'status'], 'orders_customer_status_idx');
            $table->index(['user_id', 'created_at'], 'orders_user_created_idx');
            $table->index(['currency_pair_id', 'created_at'], 'orders_pair_created_idx');
            $table->index(['status', 'created_at'], 'orders_status_created_idx');
        });

        // Índices para customers - mejora búsquedas y filtros
        Schema::table('customers', function (Blueprint $table) {
            $table->index(['exchange_house_id', 'tier'], 'customers_eh_tier_idx');
            $table->index(['exchange_house_id', 'is_active', 'is_blocked'], 'customers_eh_active_idx');
            $table->index(['email'], 'customers_email_idx');
            $table->index(['phone'], 'customers_phone_idx');
        });

        // Índices para operator_cash_balances - mejora joins y búsquedas
        Schema::table('operator_cash_balances', function (Blueprint $table) {
            $table->index(['operator_id', 'payment_method_id', 'currency'], 'balances_operator_method_currency_idx');
            $table->index(['payment_method_id', 'currency'], 'balances_method_currency_idx');
        });

        // Índices para cash_movements - mejora reversiones y consultas
        Schema::table('cash_movements', function (Blueprint $table) {
            $table->index(['order_id'], 'movements_order_idx');
            $table->index(['operator_id', 'created_at'], 'movements_operator_created_idx');
            $table->index(['payment_method_id', 'created_at'], 'movements_method_created_idx');
        });

        // Índices para commissions - mejora reportes
        Schema::table('commissions', function (Blueprint $table) {
            $table->index(['type', 'created_at'], 'commissions_type_created_idx');
            $table->index(['exchange_house_id', 'created_at'], 'commissions_eh_created_idx');
            $table->index(['order_id'], 'commissions_order_idx');
        });

        // Índices para payment_methods - mejora filtros
        Schema::table('payment_methods', function (Blueprint $table) {
            $table->index(['exchange_house_id', 'currency', 'is_active'], 'methods_eh_currency_active_idx');
        });

        // Índices para currency_pairs - mejora joins
        Schema::table('currency_pairs', function (Blueprint $table) {
            $table->index(['is_active'], 'pairs_active_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_eh_status_created_idx');
            $table->dropIndex('orders_customer_status_idx');
            $table->dropIndex('orders_user_created_idx');
            $table->dropIndex('orders_pair_created_idx');
            $table->dropIndex('orders_status_created_idx');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex('customers_eh_tier_idx');
            $table->dropIndex('customers_eh_active_idx');
            $table->dropIndex('customers_email_idx');
            $table->dropIndex('customers_phone_idx');
        });

        Schema::table('operator_cash_balances', function (Blueprint $table) {
            $table->dropIndex('balances_operator_method_currency_idx');
            $table->dropIndex('balances_method_currency_idx');
        });

        Schema::table('cash_movements', function (Blueprint $table) {
            $table->dropIndex('movements_order_idx');
            $table->dropIndex('movements_operator_created_idx');
            $table->dropIndex('movements_method_created_idx');
        });

        Schema::table('commissions', function (Blueprint $table) {
            $table->dropIndex('commissions_type_created_idx');
            $table->dropIndex('commissions_eh_created_idx');
            $table->dropIndex('commissions_order_idx');
        });

        Schema::table('payment_methods', function (Blueprint $table) {
            $table->dropIndex('methods_eh_currency_active_idx');
        });

        Schema::table('currency_pairs', function (Blueprint $table) {
            $table->dropIndex('pairs_active_idx');
        });
    }
};
