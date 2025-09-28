<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Índices críticos para alto volumen de transferencias
     */
    public function up(): void
    {
        // Solo crear índices si las tablas existen
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                // Índices para consultas frecuentes
                $table->index('created_at', 'idx_orders_created_at');
                $table->index(['exchange_house_id', 'created_at'], 'idx_orders_house_created');
                $table->index(['user_id', 'created_at'], 'idx_orders_user_created');
                $table->index(['status', 'created_at'], 'idx_orders_status_created');
                $table->index(['currency_pair_id', 'created_at'], 'idx_orders_pair_created');
                
                // Índice para reportes y agregaciones
                $table->index(['status', 'exchange_house_id'], 'idx_orders_status_house');
            });
        }

        if (Schema::hasTable('commissions')) {
            Schema::table('commissions', function (Blueprint $table) {
                // Índices para consultas de comisiones
                $table->index(['type', 'created_at'], 'idx_commissions_type_created');
                $table->index(['exchange_house_id', 'type'], 'idx_commissions_house_type');
                $table->index(['status', 'created_at'], 'idx_commissions_status_created');
                
                // Para reportes mensuales
                $table->index(['type', 'status'], 'idx_commissions_type_status');
            });
        }

        if (Schema::hasTable('commission_payments')) {
            Schema::table('commission_payments', function (Blueprint $table) {
                // Índices para pagos
                $table->index(['status', 'due_date'], 'idx_payments_status_due');
                $table->index(['exchange_house_id', 'status'], 'idx_payments_house_status');
            });
        }

        if (Schema::hasTable('currency_pairs')) {
            Schema::table('currency_pairs', function (Blueprint $table) {
                // Para consultas de pares activos
                $table->index('is_active', 'idx_pairs_active');
            });
        }
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_created_at');
            $table->dropIndex('idx_orders_house_created');
            $table->dropIndex('idx_orders_user_created');
            $table->dropIndex('idx_orders_status_created');
            $table->dropIndex('idx_orders_pair_created');
            $table->dropIndex('idx_orders_status_house');
        });

        Schema::table('commissions', function (Blueprint $table) {
            $table->dropIndex('idx_commissions_type_created');
            $table->dropIndex('idx_commissions_house_type');
            $table->dropIndex('idx_commissions_status_created');
            $table->dropIndex('idx_commissions_type_status');
        });

        Schema::table('commission_payments', function (Blueprint $table) {
            $table->dropIndex('idx_payments_status_due');
            $table->dropIndex('idx_payments_house_status');
        });

        Schema::table('currency_pairs', function (Blueprint $table) {
            $table->dropIndex('idx_pairs_active');
        });
    }
};
