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
        Schema::create('currency_pair_rate_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('currency_pair_id')->constrained('currency_pairs')->onDelete('cascade');
            $table->foreignId('exchange_house_id')->nullable()->constrained('exchange_houses')->onDelete('cascade');
            $table->decimal('rate', 20, 8);
            $table->decimal('margin_percent', 8, 4)->default(0);
            $table->decimal('effective_rate', 20, 8);
            $table->decimal('min_amount', 20, 2)->nullable();
            $table->decimal('max_amount', 20, 2)->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('change_reason')->nullable(); // 'initial', 'manual', 'automatic'
            $table->text('notes')->nullable();
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->boolean('is_current')->default(false);
            $table->timestamps();
            
            // Índices para mejorar rendimiento
            $table->index(['currency_pair_id', 'exchange_house_id', 'is_current'], 'cprh_pair_house_current_idx');
            $table->index(['currency_pair_id', 'created_at'], 'cprh_pair_created_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('currency_pair_rate_history');
    }
};
