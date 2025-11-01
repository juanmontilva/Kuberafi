<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('commission_payment_requests', function (Blueprint $table) {
            // Nuevas relaciones para flujo manual
            $table->foreignId('requested_by')->nullable()->after('exchange_house_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('paid_by')->nullable()->after('confirmed_by')->constrained('users')->onDelete('set null');
            
            // Datos bancarios del beneficiario
            $table->string('bank_name')->nullable()->after('payment_notes');
            $table->string('account_number')->nullable()->after('bank_name');
            $table->string('account_holder')->nullable()->after('account_number');
            $table->string('account_type')->nullable()->after('account_holder')->comment('savings, checking');
            $table->string('identification')->nullable()->after('account_type')->comment('Cédula/RIF');
            
            // Fechas adicionales
            $table->timestamp('requested_at')->nullable()->after('period_end');
            $table->timestamp('paid_at')->nullable()->after('confirmed_at');
            $table->timestamp('cancelled_at')->nullable()->after('rejected_at');
            
            // Notas de solicitud
            $table->text('request_notes')->nullable()->after('identification')->comment('Notas de la solicitud');
            
            // Agregar soft deletes
            $table->softDeletes();
            
            // Índices adicionales
            $table->index('requested_by');
        });
        
        // Actualizar estados posibles (agregar 'approved' y 'cancelled')
        DB::statement("ALTER TABLE commission_payment_requests MODIFY COLUMN status ENUM('pending', 'approved', 'payment_info_sent', 'paid', 'rejected', 'cancelled') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commission_payment_requests', function (Blueprint $table) {
            $table->dropForeign(['requested_by']);
            $table->dropForeign(['paid_by']);
            $table->dropColumn([
                'requested_by',
                'paid_by',
                'bank_name',
                'account_number',
                'account_holder',
                'account_type',
                'identification',
                'requested_at',
                'paid_at',
                'cancelled_at',
                'request_notes',
                'deleted_at',
            ]);
            $table->dropIndex(['requested_by']);
        });
        
        // Revertir estados
        DB::statement("ALTER TABLE commission_payment_requests MODIFY COLUMN status ENUM('pending', 'payment_info_sent', 'paid', 'rejected') DEFAULT 'pending'");
    }
};
