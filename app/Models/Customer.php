<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'exchange_house_id',
        'name',
        'email',
        'phone',
        'identification',
        'address',
        'tier',
        'tags',
        'total_volume',
        'total_orders',
        'average_order_value',
        'preferred_currency_pair',
        'preferred_payment_method',
        'loyalty_points',
        'last_order_date',
        'internal_notes',
        'kyc_status',
        'kyc_verified_at',
        'is_active',
        'is_blocked',
        'blocked_reason',
    ];

    protected $casts = [
        'tags' => 'array',
        'total_volume' => 'decimal:2',
        'average_order_value' => 'decimal:2',
        'last_order_date' => 'date',
        'kyc_verified_at' => 'datetime',
        'is_active' => 'boolean',
        'is_blocked' => 'boolean',
    ];

    public function exchangeHouse(): BelongsTo
    {
        return $this->belongsTo(ExchangeHouse::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(CustomerActivity::class);
    }

    /**
     * Actualizar métricas del cliente
     */
    public function updateMetrics(): void
    {
        $this->total_orders = $this->orders()->count();
        
        // Calcular volumen total
        $totalVolume = $this->orders()->sum('base_amount');
        $this->setAttribute('total_volume', $totalVolume);
        
        // Calcular promedio
        if ($this->total_orders > 0) {
            $avgValue = $totalVolume / $this->total_orders;
            $this->setAttribute('average_order_value', $avgValue);
        } else {
            $this->setAttribute('average_order_value', 0);
        }
        
        // Última orden
        $latestOrder = $this->orders()->latest()->first();
        $this->last_order_date = $latestOrder ? $latestOrder->created_at->toDateString() : null;
        
        // Auto-segmentar por volumen
        if ($this->total_volume >= 50000) {
            $this->tier = 'vip';
        } elseif ($this->total_volume >= 10000) {
            $this->tier = 'regular';
        } elseif ($this->last_order_date && now()->parse($this->last_order_date)->lt(now()->subDays(30))) {
            $this->tier = 'inactive';
        }
        
        $this->save();
    }

    /**
     * Agregar puntos de lealtad
     */
    public function addLoyaltyPoints(int $points): void
    {
        $this->increment('loyalty_points', $points);
    }

    /**
     * Canjear puntos
     */
    public function redeemPoints(int $points): bool
    {
        if ($this->loyalty_points >= $points) {
            $this->decrement('loyalty_points', $points);
            return true;
        }
        return false;
    }
}
