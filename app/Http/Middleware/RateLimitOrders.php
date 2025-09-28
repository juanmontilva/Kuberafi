<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class RateLimitOrders
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $key = 'orders:' . $request->user()->id;
        $maxAttempts = config('performance.rate_limits.orders_per_minute', 60);
        
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);
            
            return response()->json([
                'message' => "Demasiadas órdenes. Intenta de nuevo en {$seconds} segundos.",
                'retry_after' => $seconds
            ], 429);
        }
        
        RateLimiter::hit($key, 60); // 1 minuto de ventana
        
        return $next($request);
    }
}
