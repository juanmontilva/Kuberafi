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
        // Cambiar el enum de type para que coincida con el formulario
        DB::statement("ALTER TABLE support_tickets MODIFY COLUMN type ENUM('technical', 'billing', 'general', 'feature_request') DEFAULT 'general'");
        
        // Cambiar el enum de priority para que coincida
        DB::statement("ALTER TABLE support_tickets MODIFY COLUMN priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertir a los valores originales
        DB::statement("ALTER TABLE support_tickets MODIFY COLUMN type ENUM('bug', 'feature_request', 'question', 'complaint', 'suggestion', 'other') DEFAULT 'question'");
        DB::statement("ALTER TABLE support_tickets MODIFY COLUMN priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium'");
    }
};
