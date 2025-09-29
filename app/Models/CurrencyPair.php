<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CurrencyPair extends Model
{
    protected $fillable = [
        'base_currency',
        'quote_currency',
        'symbol',
        'current_rate',
        'min_amount',
        'max_amount',
        'is_active',
    ];

    protected $casts = [
        'current_rate' => 'decimal:6',
        'min_amount' => 'decimal:2',
        'max_amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function exchangeHouses(): BelongsToMany
    {
        return $this->belongsToMany(ExchangeHouse::class, 'exchange_house_currency_pair')
            ->withPivot(['margin_percent', 'min_amount', 'max_amount', 'is_active'])
            ->withTimestamps();
    }

    public function calculateQuoteAmount($baseAmount, $marginPercent = 0)
    {
        $rateWithMargin = $this->current_rate * (1 + ($marginPercent / 100));
        return $baseAmount * $rateWithMargin;
    }

    public function getFormattedSymbolAttribute()
    {
        return "{$this->base_currency}/{$this->quote_currency}";
    }
}
