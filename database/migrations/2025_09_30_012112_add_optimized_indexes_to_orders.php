<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Índices compuestos para queries comunes
            $table->index(['status', 'created_at'], 'idx_orders_status_created');
            $table->index(['exchange_house_id', 'status'], 'idx_orders_house_status');
            $table->index(['currency_pair_id', 'created_at'], 'idx_orders_pair_date');
            $table->index(['user_id', 'created_at'], 'idx_orders_user_date');
            
            // Índice para órdenes completadas (analytics)
            $table->index('completed_at', 'idx_orders_completed');
            
            // Índice para búsqueda por número de orden
            // varchar_pattern_ops es solo para PostgreSQL, en MySQL usamos índice normal
            if (DB::connection()->getDriverName() === 'pgsql') {
                DB::statement('CREATE INDEX idx_orders_order_number_pattern ON orders (order_number varchar_pattern_ops)');
            } else {
                // MySQL/MariaDB - índice normal es suficiente
                $table->index('order_number', 'idx_orders_order_number_pattern');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_status_created');
            $table->dropIndex('idx_orders_house_status');
            $table->dropIndex('idx_orders_pair_date');
            $table->dropIndex('idx_orders_user_date');
            $table->dropIndex('idx_orders_completed');
        });
        
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('DROP INDEX IF EXISTS idx_orders_order_number_pattern');
        }
        // En MySQL se elimina con el dropIndex de arriba si fue creado con $table->index()
    }
};
