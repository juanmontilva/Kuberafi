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
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exchange_house_id')->constrained()->onDelete('cascade');
            
            // Información básica
            $table->string('name'); // Ej: "Pago Móvil Personal"
            $table->enum('type', ['bank_transfer', 'mobile_payment', 'zelle', 'crypto', 'cash', 'wire_transfer', 'other']);
            $table->string('currency', 10); // USD, VES, EUR, BTC, USDT
            
            // Detalles del método
            $table->string('account_holder')->nullable(); // Nombre del titular
            $table->string('account_number')->nullable(); // Número de cuenta o identificador
            $table->string('bank_name')->nullable(); // Nombre del banco o servicio
            $table->string('identification')->nullable(); // CI, RIF, teléfono
            $table->text('instructions')->nullable(); // Instrucciones para el cliente
            
            // Control
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false); // Método por defecto
            
            // Límites opcionales
            $table->decimal('daily_limit', 15, 2)->nullable();
            $table->decimal('min_amount', 15, 2)->nullable();
            $table->decimal('max_amount', 15, 2)->nullable();
            
            $table->timestamps();
            
            // Índices
            $table->index(['exchange_house_id', 'is_active']);
            $table->index(['exchange_house_id', 'currency']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
