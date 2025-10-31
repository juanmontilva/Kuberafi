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
        Schema::create('operator_cash_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('operator_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('payment_method_id')->constrained('payment_methods')->onDelete('cascade');
            $table->string('currency', 10); // USD, VES, etc.
            $table->decimal('balance', 15, 2)->default(0);
            $table->timestamps();
            
            // Un balance por operador, método de pago y moneda
            $table->unique(['operator_id', 'payment_method_id', 'currency'], 'operator_payment_currency_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('operator_cash_balances');
    }
};
