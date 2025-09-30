<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureExchangeHouseOwnership
{
    /**
     * Handle an incoming request.
     * Verifica que el recurso pertenezca a la casa de cambio del usuario
     */
    public function handle(Request $request, Closure $next, ?string $modelParam = null): Response
    {
        $user = $request->user();
        
        // Super admin puede ver todo
        if ($user->isSuperAdmin()) {
            return $next($request);
        }
        
        // Verificar que el usuario tenga exchange_house_id
        if (!$user->exchange_house_id) {
            abort(403, 'Usuario no pertenece a ninguna casa de cambio');
        }
        
        // Si se especificó un parámetro de modelo, verificar ownership
        if ($modelParam && $request->route($modelParam)) {
            $model = $request->route($modelParam);
            
            // Verificar que el modelo tenga exchange_house_id
            if (property_exists($model, 'exchange_house_id')) {
                if ($model->exchange_house_id !== $user->exchange_house_id) {
                    abort(403, 'No tienes permiso para acceder a este recurso');
                }
            }
        }
        
        return $next($request);
    }
}
