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
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique(); // TKT-00001
            
            // Quién reporta
            $table->foreignId('exchange_house_id')->constrained()->onDelete('cascade');
            $table->foreignId('created_by_user_id')->constrained('users')->onDelete('cascade');
            
            // Asignación
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Información del ticket
            $table->string('subject');
            $table->text('description');
            $table->enum('type', ['bug', 'feature_request', 'question', 'complaint', 'suggestion', 'other'])->default('question');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['open', 'in_progress', 'waiting_response', 'resolved', 'closed'])->default('open');
            
            // Metadata
            $table->json('attachments')->nullable(); // URLs de archivos adjuntos
            $table->integer('messages_count')->default(0);
            
            // Tiempos
            $table->timestamp('first_response_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            
            // Rating (cuando se cierra)
            $table->integer('rating')->nullable(); // 1-5 estrellas
            $table->text('rating_comment')->nullable();
            
            $table->timestamps();
            
            // Índices
            $table->index(['exchange_house_id', 'status']);
            $table->index(['assigned_to_user_id', 'status']);
            $table->index('status');
            $table->index('priority');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('support_tickets');
    }
};
