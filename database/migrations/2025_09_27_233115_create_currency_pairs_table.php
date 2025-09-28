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
        Schema::create('currency_pairs', function (Blueprint $table) {
            $table->id();
            $table->string('base_currency', 3); // USD, EUR, etc.
            $table->string('quote_currency', 3); // VES, USD, etc.
            $table->string('symbol')->unique(); // USD/VES, EUR/USD
            $table->decimal('current_rate', 15, 6); // Tasa actual del mercado
            $table->decimal('min_amount', 15, 2)->default(0); // Monto mínimo
            $table->decimal('max_amount', 15, 2)->nullable(); // Monto máximo
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('currency_pairs');
    }
};
