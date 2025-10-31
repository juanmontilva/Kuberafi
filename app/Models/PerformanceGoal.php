<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceGoal extends Model
{
    protected $fillable = [
        'exchange_house_id',
        'period',
        'orders_goal',
        'volume_goal',
        'commission_goal',
    ];

    protected $casts = [
        'orders_goal' => 'integer',
        'volume_goal' => 'decimal:2',
        'commission_goal' => 'decimal:2',
    ];

    public function exchangeHouse(): BelongsTo
    {
        return $this->belongsTo(User::class, 'exchange_house_id');
    }
}
