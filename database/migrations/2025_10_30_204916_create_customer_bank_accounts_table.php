<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->string('account_name'); // Nombre de la cuenta (ej: "Cuenta Principal", "Cuenta Nómina")
            $table->string('bank_name'); // Nombre del banco
            $table->string('account_number'); // Número de cuenta
            $table->string('account_type')->nullable(); // Tipo: ahorro, corriente, etc.
            $table->string('currency', 10)->default('USD'); // Moneda de la cuenta
            $table->text('notes')->nullable(); // Notas adicionales
            $table->timestamps();
            
            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_bank_accounts');
    }
};
