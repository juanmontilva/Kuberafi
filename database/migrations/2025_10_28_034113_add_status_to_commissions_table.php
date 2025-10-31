<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('commissions', function (Blueprint $table) {
            // Agregar campo status si no existe
            if (!Schema::hasColumn('commissions', 'status')) {
                $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending')->after('base_amount');
            }
            
            // Agregar paid_at si no existe
            if (!Schema::hasColumn('commissions', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('commissions', function (Blueprint $table) {
            $table->dropColumn(['status', 'paid_at']);
        });
    }
};
