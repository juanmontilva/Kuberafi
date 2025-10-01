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
        Schema::create('customer_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // Usuario que registró
            
            // Tipo de actividad
            $table->enum('type', [
                'note',           // Nota manual
                'call',           // Llamada telefónica
                'email',          // Email enviado
                'meeting',        // Reunión
                'order_created',  // Orden creada (auto)
                'kyc_update',     // Actualización de KYC
                'status_change',  // Cambio de estado
                'tier_change',    // Cambio de tier
                'other'
            ]);
            
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            
            // Metadata flexible
            $table->json('metadata')->nullable(); // {"order_id": 123, "amount": 500, etc}
            
            // Seguimiento
            $table->boolean('requires_followup')->default(false);
            $table->timestamp('followup_date')->nullable();
            
            $table->timestamps();
            
            // Índices
            $table->index(['customer_id', 'created_at']);
            $table->index(['customer_id', 'type']);
            $table->index('followup_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_activities');
    }
};
