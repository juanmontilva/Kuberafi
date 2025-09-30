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
        Schema::create('currency_pair_rate_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('currency_pair_id')->constrained()->onDelete('cascade');
            $table->foreignId('exchange_house_id')->constrained()->onDelete('cascade');
            
            // Tasas históricas
            $table->decimal('rate', 20, 8); // Tasa base histórica
            $table->decimal('margin_percent', 8, 4)->default(0); // Margen de ganancia
            $table->decimal('effective_rate', 20, 8); // Tasa efectiva (rate + margin)
            
            // Límites de transacción en ese momento
            $table->decimal('min_amount', 20, 2)->nullable();
            $table->decimal('max_amount', 20, 2)->nullable();
            
            // Información del cambio
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('change_reason')->nullable(); // manual, automatic, market_update, etc.
            $table->text('notes')->nullable(); // Notas del operador
            
            // Metadata
            $table->timestamp('valid_from'); // Desde cuándo es válida esta tasa
            $table->timestamp('valid_until')->nullable(); // Hasta cuándo fue válida
            $table->boolean('is_current')->default(false); // Si es la tasa actual
            
            $table->timestamps();
            
            // Índices para optimizar consultas
            $table->index(['currency_pair_id', 'valid_from']);
            $table->index(['exchange_house_id', 'valid_from']);
            $table->index(['currency_pair_id', 'is_current']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('currency_pair_rate_history');
    }
};
