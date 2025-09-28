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
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value');
            $table->string('type')->default('string'); // string, number, boolean, json
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // Insertar configuraciones por defecto
        DB::table('system_settings')->insert([
            [
                'key' => 'platform_commission_rate',
                'value' => '0.15',
                'type' => 'number',
                'description' => 'Tasa de comisión de la plataforma (%)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'platform_name',
                'value' => 'Kuberafi',
                'type' => 'string',
                'description' => 'Nombre de la plataforma',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'max_daily_orders',
                'value' => '1000',
                'type' => 'number',
                'description' => 'Máximo de órdenes por día por casa de cambio',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'maintenance_mode',
                'value' => 'false',
                'type' => 'boolean',
                'description' => 'Modo de mantenimiento',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
