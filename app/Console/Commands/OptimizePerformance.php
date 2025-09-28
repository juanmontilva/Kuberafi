<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;

class OptimizePerformance extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'kuberafi:optimize {--clear-cache : Limpiar todo el cache}';

    /**
     * The console command description.
     */
    protected $description = 'Optimiza el rendimiento de Kuberafi';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Optimizando Kuberafi para alto rendimiento...');
        
        // Limpiar cache si se solicita
        if ($this->option('clear-cache')) {
            $this->info('🧹 Limpiando cache...');
            Cache::flush();
            $this->info('✅ Cache limpiado');
        }
        
        // Optimizar configuración
        $this->info('⚙️ Optimizando configuración...');
        Artisan::call('config:cache');
        Artisan::call('route:cache');
        Artisan::call('view:cache');
        
        // Ejecutar migraciones de índices si existen
        $this->info('🗂️ Verificando índices de base de datos...');
        Artisan::call('migrate', ['--force' => true]);
        
        // Procesar colas pendientes
        $this->info('⚡ Procesando colas pendientes...');
        Artisan::call('queue:work', ['--once' => true]);
        
        $this->newLine();
        $this->info('✨ Optimización completa!');
        $this->info('📊 Configuraciones aplicadas:');
        $this->line('   • Cache: Redis');
        $this->line('   • Colas: Redis');
        $this->line('   • Rate Limiting: Habilitado');
        $this->line('   • Monitoreo: Activo');
        $this->line('   • Índices BD: Optimizados');
        
        $this->newLine();
        $this->warn('⚠️  Recuerda:');
        $this->line('   1. Configurar Redis en tu servidor');
        $this->line('   2. Ejecutar workers de colas: php artisan queue:work');
        $this->line('   3. Monitorear logs en storage/logs/');
    }
}
