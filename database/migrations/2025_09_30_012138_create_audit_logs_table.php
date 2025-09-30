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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exchange_house_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            
            // Acción realizada
            $table->string('action', 100); // 'create_order', 'update_rate', 'delete_user'
            $table->string('entity_type', 100)->nullable(); // 'Order', 'User', 'CurrencyPair'
            $table->bigInteger('entity_id')->nullable();
            
            // Cambios realizados
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            
            // Metadata
            $table->string('ip_address', 45)->nullable(); // IPv4 o IPv6
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable(); // jsonb solo en PostgreSQL
            
            // Hash chain para inmutabilidad (blockchain-style)
            $table->string('previous_hash', 64)->nullable();
            $table->string('current_hash', 64)->nullable();
            
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            
            // Índices
            $table->index(['exchange_house_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['entity_type', 'entity_id']);
            $table->index('action');
        });
        
        // Reglas para hacer la tabla append-only (no UPDATE ni DELETE)
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('CREATE RULE no_update_audit AS ON UPDATE TO audit_logs DO INSTEAD NOTHING');
            DB::statement('CREATE RULE no_delete_audit AS ON DELETE TO audit_logs DO INSTEAD NOTHING');
        } else {
            // MySQL/MariaDB usa TRIGGERS
            DB::unprepared('
                CREATE TRIGGER prevent_audit_update
                BEFORE UPDATE ON audit_logs
                FOR EACH ROW
                BEGIN
                    SIGNAL SQLSTATE "45000"
                    SET MESSAGE_TEXT = "Cannot update audit_logs table. This table is append-only.";
                END
            ');
            
            DB::unprepared('
                CREATE TRIGGER prevent_audit_delete
                BEFORE DELETE ON audit_logs
                FOR EACH ROW
                BEGIN
                    SIGNAL SQLSTATE "45000"
                    SET MESSAGE_TEXT = "Cannot delete from audit_logs table. This table is append-only.";
                END
            ');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('DROP RULE IF EXISTS no_update_audit ON audit_logs');
            DB::statement('DROP RULE IF EXISTS no_delete_audit ON audit_logs');
        } else {
            DB::unprepared('DROP TRIGGER IF EXISTS prevent_audit_update');
            DB::unprepared('DROP TRIGGER IF EXISTS prevent_audit_delete');
        }
        Schema::dropIfExists('audit_logs');
    }
};
