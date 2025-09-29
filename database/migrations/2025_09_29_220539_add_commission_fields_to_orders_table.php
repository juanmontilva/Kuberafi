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
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('house_commission_percent', 5, 2)->default(0)->after('actual_margin_percent');
            $table->decimal('house_commission_amount', 15, 2)->default(0)->after('house_commission_percent');
            $table->decimal('net_amount', 15, 2)->default(0)->after('exchange_commission');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['house_commission_percent', 'house_commission_amount', 'net_amount']);
        });
    }
};
