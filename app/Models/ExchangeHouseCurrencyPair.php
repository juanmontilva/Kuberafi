<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExchangeHouseCurrencyPair extends Pivot
{
    use SoftDeletes;

    protected $table = 'exchange_house_currency_pair';

    protected $fillable = [
        'exchange_house_id',
        'currency_pair_id',
        'margin_percent',
        'min_amount',
        'max_amount',
        'is_active',
    ];

    protected $casts = [
        'margin_percent' => 'decimal:4',
        'min_amount' => 'decimal:2',
        'max_amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Relación con la casa de cambio
     */
    public function exchangeHouse()
    {
        return $this->belongsTo(ExchangeHouse::class);
    }

    /**
     * Relación con el par de divisas
     */
    public function currencyPair()
    {
        return $this->belongsTo(CurrencyPair::class);
    }
}
