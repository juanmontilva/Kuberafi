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
        Schema::create('payment_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exchange_house_id')->constrained()->onDelete('cascade');
            $table->enum('frequency', ['daily', 'weekly', 'biweekly', 'monthly'])->default('weekly');
            $table->integer('payment_day')->nullable(); // Día del pago (1-31 para mensual, 1-7 para semanal)
            $table->decimal('minimum_amount', 15, 2)->default(0); // Monto mínimo para generar pago
            $table->boolean('auto_generate')->default(true); // Generar pagos automáticamente
            $table->boolean('is_active')->default(true);
            $table->json('notification_settings')->nullable(); // Configuración de notificaciones
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_schedules');
    }
};
