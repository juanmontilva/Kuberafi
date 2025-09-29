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
        Schema::create('exchange_house_currency_pair', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exchange_house_id')->constrained()->onDelete('cascade');
            $table->foreignId('currency_pair_id')->constrained()->onDelete('cascade');
            
            // Configuración específica de la casa de cambio para este par
            $table->decimal('margin_percent', 8, 4)->default(0); // Margen de ganancia de la casa
            $table->decimal('min_amount', 15, 2)->nullable(); // Override del mínimo del par
            $table->decimal('max_amount', 15, 2)->nullable(); // Override del máximo del par
            $table->boolean('is_active')->default(true); // La casa puede desactivar un par
            
            $table->timestamps();
            
            // Índices para optimizar queries
            $table->unique(['exchange_house_id', 'currency_pair_id'], 'eh_cp_unique');
            $table->index(['exchange_house_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exchange_house_currency_pair');
    }
};
