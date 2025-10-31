<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique(); // USD, VES, ZELLE, BTC
            $table->string('name'); // Dólar Estadounidense, Bolívar Venezolano
            $table->string('symbol', 10); // $, Bs., ₿
            $table->integer('decimals')->default(2); // Precisión decimal
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
