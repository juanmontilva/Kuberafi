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
        Schema::create('commission_payment_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exchange_house_id')->constrained()->onDelete('cascade');
            
            // Período de comisiones
            $table->date('period_start');
            $table->date('period_end');
            
            // Montos
            $table->decimal('total_commissions', 15, 2)->comment('Total de comisiones del período');
            $table->integer('total_orders')->default(0)->comment('Cantidad de órdenes');
            $table->decimal('total_volume', 15, 2)->default(0)->comment('Volumen total operado');
            
            // Estado del pago
            $table->enum('status', ['pending', 'payment_info_sent', 'paid', 'rejected'])->default('pending');
            
            // Información de pago (enviada por la casa de cambio)
            $table->string('payment_method')->nullable()->comment('Método de pago usado');
            $table->string('payment_reference')->nullable()->comment('Referencia del pago');
            $table->text('payment_proof')->nullable()->comment('URL del comprobante');
            $table->text('payment_notes')->nullable()->comment('Notas adicionales');
            $table->timestamp('payment_sent_at')->nullable();
            
            // Confirmación del admin
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('confirmed_at')->nullable();
            $table->text('admin_notes')->nullable()->comment('Notas del administrador');
            
            // Rechazo
            $table->text('rejection_reason')->nullable();
            $table->timestamp('rejected_at')->nullable();
            
            $table->timestamps();
            
            // Índices
            $table->index(['exchange_house_id', 'status']);
            $table->index(['period_start', 'period_end']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commission_payment_requests');
    }
};
