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
        Schema::create('commission_payment_request_commission', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payment_request_id');
            $table->unsignedBigInteger('commission_id');
            $table->timestamps();
            
            // Foreign keys con nombres cortos
            $table->foreign('payment_request_id', 'cpr_comm_request_fk')
                ->references('id')->on('commission_payment_requests')
                ->onDelete('cascade');
            
            $table->foreign('commission_id', 'cpr_comm_commission_fk')
                ->references('id')->on('commissions')
                ->onDelete('cascade');
            
            // Índices
            $table->unique(['payment_request_id', 'commission_id'], 'cpr_comm_unique');
            $table->index('payment_request_id', 'cpr_comm_request_idx');
            $table->index('commission_id', 'cpr_comm_commission_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commission_payment_request_commission');
    }
};
