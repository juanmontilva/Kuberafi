<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Commission extends Model
{
    protected $fillable = [
        'order_id',
        'exchange_house_id',
        'type',
        'rate_percent',
        'amount',
        'base_amount',
        'status',
        'paid_at',
    ];
    
    protected $attributes = [
        'status' => 'pending',
    ];

    protected $casts = [
        'rate_percent' => 'decimal:4',
        'amount' => 'decimal:2',
        'base_amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function exchangeHouse(): BelongsTo
    {
        return $this->belongsTo(ExchangeHouse::class);
    }

    public static function createFromOrder(Order $order)
    {
        // Asegurar que exchangeHouse esté cargado para evitar N+1
        $order->loadMissing('exchangeHouse');
        
        $commissions = $order->calculateCommissions();
        $platformRate = SystemSetting::getPlatformCommissionRate();

        // Crear comisión de la plataforma
        self::create([
            'order_id' => $order->id,
            'exchange_house_id' => $order->exchange_house_id,
            'type' => 'platform',
            'rate_percent' => $platformRate / 100,
            'amount' => $commissions['platform'],
            'base_amount' => $order->base_amount,
        ]);

        // Crear comisión de la casa de cambio
        self::create([
            'order_id' => $order->id,
            'exchange_house_id' => $order->exchange_house_id,
            'type' => 'exchange_house',
            'rate_percent' => $order->exchangeHouse->commission_rate / 100,
            'amount' => $commissions['exchange'],
            'base_amount' => $order->base_amount,
        ]);
    }
}
