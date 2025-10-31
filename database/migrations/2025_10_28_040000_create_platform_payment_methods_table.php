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
        Schema::create('platform_payment_methods', function (Blueprint $table) {
            $table->id();
            
            // Información básica
            $table->string('name'); // Ej: "Cuenta Bancaria Principal USD"
            $table->enum('type', ['bank_transfer', 'mobile_payment', 'zelle', 'crypto', 'wire_transfer', 'paypal', 'other']);
            $table->string('currency', 10); // USD, VES, EUR, BTC, USDT
            
            // Detalles del método
            $table->string('account_holder')->nullable(); // Nombre del titular
            $table->string('account_number')->nullable(); // Número de cuenta
            $table->string('bank_name')->nullable(); // Nombre del banco
            $table->string('identification')->nullable(); // CI, RIF, teléfono
            $table->string('routing_number')->nullable(); // Para transferencias internacionales
            $table->string('swift_code')->nullable(); // Para transferencias SWIFT
            $table->text('instructions'); // Instrucciones para los operadores
            
            // Control
            $table->boolean('is_active')->default(true);
            $table->boolean('is_primary')->default(false); // Método principal
            
            // Orden de visualización
            $table->integer('display_order')->default(0);
            
            $table->timestamps();
            
            // Índices
            $table->index(['is_active', 'currency']);
            $table->index('display_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('platform_payment_methods');
    }
};
