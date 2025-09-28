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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('exchange_house_id')->constrained()->onDelete('cascade');
            $table->foreignId('currency_pair_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Usuario que creó la orden
            
            // Montos
            $table->decimal('base_amount', 15, 2); // Cantidad a cambiar (ej: 1000 USD)
            $table->decimal('quote_amount', 15, 2); // Cantidad recibida (ej: 36,500,000 VES)
            
            // Tasas y márgenes
            $table->decimal('market_rate', 15, 6); // Tasa del mercado al momento
            $table->decimal('applied_rate', 15, 6); // Tasa aplicada en la operación
            $table->decimal('expected_margin_percent', 5, 2); // Margen esperado (ej: 5.00%)
            $table->decimal('actual_margin_percent', 5, 2)->nullable(); // Margen real obtenido
            
            // Comisiones
            $table->decimal('platform_commission', 15, 2)->default(0); // Comisión de la plataforma (0.15%)
            $table->decimal('exchange_commission', 15, 2)->default(0); // Comisión de la casa de cambio
            
            // Estado y fechas
            $table->enum('status', ['pending', 'processing', 'completed', 'cancelled', 'failed'])->default('pending');
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
