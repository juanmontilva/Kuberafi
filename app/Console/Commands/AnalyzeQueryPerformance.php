<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AnalyzeQueryPerformance extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'analyze:queries {--enable} {--disable}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Analiza y muestra las queries ejecutadas para detectar problemas N+1';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('enable')) {
            $this->enableQueryLogging();
            return;
        }

        if ($this->option('disable')) {
            $this->disableQueryLogging();
            return;
        }

        $this->info('Analizando queries...');
        $this->info('');

        // Habilitar logging de queries
        DB::enableQueryLog();

        // Simular algunas operaciones comunes
        $this->info('📊 Ejecutando operaciones de prueba...');
        
        try {
            // Test 1: Listar órdenes
            $this->info('1. Listando órdenes...');
            $orders = \App\Models\Order::withRelations()->take(5)->get();
            $queryCount1 = count(DB::getQueryLog());
            DB::flushQueryLog();
            
            // Test 2: Listar clientes
            $this->info('2. Listando clientes...');
            $customers = \App\Models\Customer::take(5)->get();
            $queryCount2 = count(DB::getQueryLog());
            DB::flushQueryLog();
            
            // Test 3: Dashboard stats
            $this->info('3. Cargando estadísticas...');
            $stats = \App\Models\Order::selectRaw('COUNT(*) as total, SUM(base_amount) as volume')
                ->first();
            $queryCount3 = count(DB::getQueryLog());
            
            $this->info('');
            $this->info('✅ Resultados:');
            $this->table(
                ['Operación', 'Queries', 'Estado'],
                [
                    ['Listar 5 órdenes (con relaciones)', $queryCount1, $queryCount1 <= 2 ? '✅ Óptimo' : '⚠️ Revisar'],
                    ['Listar 5 clientes', $queryCount2, $queryCount2 <= 1 ? '✅ Óptimo' : '⚠️ Revisar'],
                    ['Estadísticas dashboard', $queryCount3, $queryCount3 <= 1 ? '✅ Óptimo' : '⚠️ Revisar'],
                ]
            );
            
            $this->info('');
            $this->info('💡 Recomendaciones:');
            $this->line('- Queries óptimas: 1-2 por operación');
            $this->line('- Si ves más de 5 queries, probablemente hay N+1');
            $this->line('- Usa --enable para logging detallado en desarrollo');
            $this->line('- Instala Laravel Debugbar para análisis visual');
            
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
        }
    }

    private function enableQueryLogging()
    {
        $envPath = base_path('.env');
        $envContent = file_get_contents($envPath);
        
        if (strpos($envContent, 'QUERY_LOG_ENABLED') === false) {
            file_put_contents($envPath, $envContent . "\nQUERY_LOG_ENABLED=true\n");
        } else {
            $envContent = preg_replace('/QUERY_LOG_ENABLED=.*/', 'QUERY_LOG_ENABLED=true', $envContent);
            file_put_contents($envPath, $envContent);
        }
        
        $this->info('✅ Query logging habilitado');
        $this->info('Las queries se mostrarán en los logs de Laravel');
    }

    private function disableQueryLogging()
    {
        $envPath = base_path('.env');
        $envContent = file_get_contents($envPath);
        
        $envContent = preg_replace('/QUERY_LOG_ENABLED=.*/', 'QUERY_LOG_ENABLED=false', $envContent);
        file_put_contents($envPath, $envContent);
        
        $this->info('✅ Query logging deshabilitado');
    }
}
