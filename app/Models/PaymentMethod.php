<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentMethod extends Model
{
    protected $fillable = [
        'exchange_house_id',
        'name',
        'type',
        'currency',
        'account_holder',
        'account_number',
        'bank_name',
        'identification',
        'instructions',
        'is_active',
        'is_default',
        'daily_limit',
        'min_amount',
        'max_amount',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'daily_limit' => 'decimal:2',
        'min_amount' => 'decimal:2',
        'max_amount' => 'decimal:2',
    ];

    public function exchangeHouse(): BelongsTo
    {
        return $this->belongsTo(ExchangeHouse::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get icon for payment method type
     */
    public function getIconAttribute(): string
    {
        return match($this->type) {
            'mobile_payment' => '📱',
            'zelle' => '💵',
            'bank_transfer' => '🏦',
            'crypto' => '💎',
            'cash' => '💰',
            'wire_transfer' => '🌐',
            default => '💳',
        };
    }

    /**
     * Get display name with currency
     */
    public function getDisplayNameAttribute(): string
    {
        return "{$this->name} ({$this->currency})";
    }
}
