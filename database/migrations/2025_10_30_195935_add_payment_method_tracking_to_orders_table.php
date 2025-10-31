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
            // Método de pago que RECIBE el dinero (base_currency)
            $table->foreignId('payment_method_in_id')->nullable()->after('payment_method_id')->constrained('payment_methods')->nullOnDelete();
            
            // Método de pago que ENTREGA el dinero (quote_currency)
            $table->foreignId('payment_method_out_id')->nullable()->after('payment_method_in_id')->constrained('payment_methods')->nullOnDelete();
            
            // Modo de selección: 'auto' o 'manual'
            $table->enum('payment_method_selection_mode', ['auto', 'manual'])->default('auto')->after('payment_method_out_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['payment_method_in_id']);
            $table->dropForeign(['payment_method_out_id']);
            $table->dropColumn(['payment_method_in_id', 'payment_method_out_id', 'payment_method_selection_mode']);
        });
    }
};
