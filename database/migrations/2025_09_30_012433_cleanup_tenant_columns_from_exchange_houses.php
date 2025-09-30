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
        Schema::table('exchange_houses', function (Blueprint $table) {
            // Eliminar columnas si existen (de intentos anteriores)
            if (Schema::hasColumn('exchange_houses', 'tenant_id')) {
                $table->dropIndex(['tenant_id']);
                $table->dropUnique(['tenant_id']);
                $table->dropColumn('tenant_id');
            }
            
            if (Schema::hasColumn('exchange_houses', 'schema_name')) {
                $table->dropColumn('schema_name');
            }
            
            if (Schema::hasColumn('exchange_houses', 'subdomain')) {
                $table->dropIndex(['subdomain']);
                $table->dropUnique(['subdomain']);
                $table->dropColumn('subdomain');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No hacer nada en rollback, las columnas se agregarán en otra migración
    }
};
