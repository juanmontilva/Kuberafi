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
        Schema::create('performance_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exchange_house_id')->constrained('users')->onDelete('cascade');
            $table->enum('period', ['today', 'week', 'month', 'quarter', 'year']);
            $table->integer('orders_goal')->default(0);
            $table->decimal('volume_goal', 15, 2)->default(0);
            $table->decimal('commission_goal', 15, 2)->default(0);
            $table->timestamps();
            
            // Una meta por período por casa de cambio
            $table->unique(['exchange_house_id', 'period']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('performance_goals');
    }
};
