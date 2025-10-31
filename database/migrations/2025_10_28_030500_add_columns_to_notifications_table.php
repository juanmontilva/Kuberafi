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
        Schema::table('notifications', function (Blueprint $table) {
            $table->foreignId('user_id')->after('id')->constrained()->onDelete('cascade');
            
            // Tipo de notificación
            $table->enum('type', [
                'ticket_created',
                'ticket_responded',
                'ticket_status_changed',
                'ticket_assigned',
                'commission_payment_generated',
                'commission_payment_confirmed',
                'order_completed'
            ])->after('user_id');
            
            // Contenido
            $table->string('title')->after('type');
            $table->text('message')->after('title');
            $table->string('link')->nullable()->after('message');
            
            // Relacionado
            $table->string('related_type')->nullable()->after('link');
            $table->unsignedBigInteger('related_id')->nullable()->after('related_type');
            
            // Estado
            $table->boolean('is_read')->default(false)->after('related_id');
            $table->timestamp('read_at')->nullable()->after('is_read');
            
            // Índices
            $table->index(['user_id', 'is_read']);
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropIndex(['user_id', 'is_read']);
            $table->dropIndex(['user_id', 'created_at']);
            
            $table->dropColumn([
                'user_id',
                'type',
                'title',
                'message',
                'link',
                'related_type',
                'related_id',
                'is_read',
                'read_at',
            ]);
        });
    }
};
