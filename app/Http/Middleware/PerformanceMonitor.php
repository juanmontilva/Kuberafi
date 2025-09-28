<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class PerformanceMonitor
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        $startMemory = memory_get_usage(true);
        
        // Iniciar monitoreo de queries
        DB::enableQueryLog();
        
        $response = $next($request);
        
        // Calcular métricas
        $executionTime = (microtime(true) - $startTime) * 1000; // ms
        $memoryUsed = (memory_get_usage(true) - $startMemory) / 1024 / 1024; // MB
        $queries = DB::getQueryLog();
        $queryCount = count($queries);
        
        // Detectar queries lentas
        $slowQueries = array_filter($queries, function($query) {
            return $query['time'] > config('performance.monitoring.slow_query_threshold', 1000);
        });
        
        // Log de performance si excede umbrales
        if ($executionTime > 2000 || $memoryUsed > 50 || count($slowQueries) > 0) {
            Log::warning('Performance Alert', [
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'execution_time_ms' => round($executionTime, 2),
                'memory_mb' => round($memoryUsed, 2),
                'query_count' => $queryCount,
                'slow_queries' => count($slowQueries),
                'user_id' => $request->user()?->id,
            ]);
        }
        
        // Agregar headers de debug en desarrollo
        if (config('app.debug')) {
            $response->headers->set('X-Debug-Time', round($executionTime, 2) . 'ms');
            $response->headers->set('X-Debug-Memory', round($memoryUsed, 2) . 'MB');
            $response->headers->set('X-Debug-Queries', $queryCount);
        }
        
        return $response;
    }
}
