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
            $table->string('tenant_id')->nullable()->after('id')->unique();
            $table->string('schema_name')->nullable()->after('tenant_id');
            $table->string('subdomain')->nullable()->unique();
            
            // Index para búsquedas rápidas
            $table->index('tenant_id');
            $table->index('subdomain');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exchange_houses', function (Blueprint $table) {
            $table->dropIndex(['tenant_id']);
            $table->dropIndex(['subdomain']);
            $table->dropColumn(['tenant_id', 'schema_name', 'subdomain']);
        });
    }
};
