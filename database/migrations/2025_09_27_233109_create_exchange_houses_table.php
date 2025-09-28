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
        Schema::create('exchange_houses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('business_name');
            $table->string('tax_id')->unique();
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->decimal('commission_rate', 5, 4)->default(0.0000); // Comisión que cobra la casa
            $table->boolean('is_active')->default(true);
            $table->json('allowed_currencies')->nullable(); // Monedas permitidas
            $table->decimal('daily_limit', 15, 2)->nullable(); // Límite diario de operaciones
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exchange_houses');
    }
};
