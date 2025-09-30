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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exchange_house_id')->constrained()->onDelete('cascade');
            
            // Información básica
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('identification')->nullable(); // CI, RIF, Passport
            $table->text('address')->nullable();
            
            // Segmentación
            $table->enum('tier', ['new', 'regular', 'vip', 'inactive'])->default('new');
            $table->json('tags')->nullable(); // ['cliente_frecuente', 'puntual', etc.]
            
            // Métricas
            $table->decimal('total_volume', 15, 2)->default(0); // Volumen total operado
            $table->integer('total_orders')->default(0);
            $table->decimal('average_order_value', 15, 2)->default(0);
            $table->string('preferred_currency_pair')->nullable();
            $table->string('preferred_payment_method')->nullable();
            
            // Loyalty
            $table->integer('loyalty_points')->default(0);
            $table->date('last_order_date')->nullable();
            
            // Notas internas
            $table->text('internal_notes')->nullable();
            
            // KYC
            $table->enum('kyc_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->timestamp('kyc_verified_at')->nullable();
            
            // Estado
            $table->boolean('is_active')->default(true);
            $table->boolean('is_blocked')->default(false);
            $table->text('blocked_reason')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Índices
            $table->index(['exchange_house_id', 'tier']);
            $table->index(['exchange_house_id', 'is_active']);
            $table->index('email');
            $table->index('phone');
            $table->index('total_volume');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
