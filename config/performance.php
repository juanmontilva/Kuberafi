<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Configuraciones de Performance para Alto Volumen
    |--------------------------------------------------------------------------
    | Configuraciones optimizadas para manejar gran cantidad de transferencias
    */

    // Base de Datos
    'database' => [
        'mysql' => [
            // Conexiones concurrentes
            'max_connections' => env('DB_MAX_CONNECTIONS', 200),
            
            // Pool de conexiones
            'min_pool_size' => env('DB_MIN_POOL', 10),
            'max_pool_size' => env('DB_MAX_POOL', 50),
            
            // Timeouts optimizados
            'connection_timeout' => env('DB_CONNECTION_TIMEOUT', 5),
            'read_timeout' => env('DB_READ_TIMEOUT', 30),
            'write_timeout' => env('DB_WRITE_TIMEOUT', 30),
        ],
    ],

    // Sistema de Colas
    'queues' => [
        'high_priority' => [
            'driver' => 'redis',
            'workers' => env('QUEUE_HIGH_WORKERS', 10),
        ],
        'normal_priority' => [
            'driver' => 'database', 
            'workers' => env('QUEUE_NORMAL_WORKERS', 5),
        ],
    ],

    // Cache
    'cache' => [
        'dashboard_ttl' => env('CACHE_DASHBOARD_TTL', 300), // 5 minutos
        'settings_ttl' => env('CACHE_SETTINGS_TTL', 3600), // 1 hora
        'rates_ttl' => env('CACHE_RATES_TTL', 60), // 1 minuto
    ],

    // Límites de Rate Limiting
    'rate_limits' => [
        'orders_per_minute' => env('RATE_LIMIT_ORDERS', 60),
        'api_calls_per_minute' => env('RATE_LIMIT_API', 1000),
    ],

    // Monitoreo
    'monitoring' => [
        'slow_query_threshold' => env('SLOW_QUERY_THRESHOLD', 1000), // ms
        'memory_limit_warning' => env('MEMORY_WARNING_MB', 512),
    ],
];
