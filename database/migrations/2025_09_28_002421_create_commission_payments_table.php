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
        Schema::create('commission_payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_number')->unique(); // KBF-PAY-001
            $table->foreignId('exchange_house_id')->constrained()->onDelete('cascade');
            $table->decimal('total_amount', 15, 2); // Total a pagar
            $table->decimal('commission_amount', 15, 2); // Comisiones acumuladas
            $table->date('period_start'); // Inicio del período
            $table->date('period_end'); // Fin del período
            $table->date('due_date'); // Fecha límite de pago
            $table->enum('frequency', ['daily', 'weekly', 'biweekly', 'monthly']); // Frecuencia
            $table->enum('status', ['pending', 'paid', 'overdue', 'cancelled'])->default('pending');
            $table->enum('payment_method', ['bank_transfer', 'cash', 'check', 'digital_wallet'])->nullable();
            $table->text('payment_reference')->nullable(); // Referencia del pago
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('commission_details')->nullable(); // Detalles de las comisiones incluidas
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commission_payments');
    }
};
