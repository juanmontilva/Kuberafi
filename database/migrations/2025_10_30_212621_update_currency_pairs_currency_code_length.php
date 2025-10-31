<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('currency_pairs', function (Blueprint $table) {
            $table->string('base_currency', 10)->change();
            $table->string('quote_currency', 10)->change();
            $table->string('symbol', 25)->change();
        });
    }

    public function down(): void
    {
        Schema::table('currency_pairs', function (Blueprint $table) {
            $table->string('base_currency', 3)->change();
            $table->string('quote_currency', 3)->change();
            $table->string('symbol', 10)->change();
        });
    }
};
