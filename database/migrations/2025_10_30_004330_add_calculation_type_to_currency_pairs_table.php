<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('currency_pairs', function (Blueprint $table) {
            $table->enum('calculation_type', ['multiply', 'divide'])
                  ->default('multiply')
                  ->after('current_rate')
                  ->comment('multiply: base × rate, divide: base ÷ rate');
        });
    }

    public function down(): void
    {
        Schema::table('currency_pairs', function (Blueprint $table) {
            $table->dropColumn('calculation_type');
        });
    }
};
