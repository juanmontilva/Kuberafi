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
        Schema::table('orders', function (Blueprint $table) {
            // Índices para mejorar performance de queries frecuentes
            $table->index('status', 'orders_status_index');
            $table->index('created_at', 'orders_created_at_index');
            $table->index(['exchange_house_id', 'status'], 'orders_eh_status_index');
            $table->index(['exchange_house_id', 'created_at'], 'orders_eh_created_index');
            $table->index(['status', 'created_at'], 'orders_status_created_index');
        });

        Schema::table('commissions', function (Blueprint $table) {
            // Índices para queries de comisiones
            $table->index('type', 'commissions_type_index');
            $table->index(['type', 'created_at'], 'commissions_type_created_index');
            $table->index(['exchange_house_id', 'type'], 'commissions_eh_type_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_status_index');
            $table->dropIndex('orders_created_at_index');
            $table->dropIndex('orders_eh_status_index');
            $table->dropIndex('orders_eh_created_index');
            $table->dropIndex('orders_status_created_index');
        });

        Schema::table('commissions', function (Blueprint $table) {
            $table->dropIndex('commissions_type_index');
            $table->dropIndex('commissions_type_created_index');
            $table->dropIndex('commissions_eh_type_index');
        });
    }
};
