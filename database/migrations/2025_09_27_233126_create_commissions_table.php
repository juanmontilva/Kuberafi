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
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('exchange_house_id')->constrained()->onDelete('cascade');
            
            $table->enum('type', ['platform', 'exchange_house']); // Tipo de comisión
            $table->decimal('rate_percent', 5, 4); // Porcentaje de comisión (ej: 0.1500 para 0.15%)
            $table->decimal('amount', 15, 2); // Monto de la comisión
            $table->decimal('base_amount', 15, 2); // Monto base sobre el que se calculó
            
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};
