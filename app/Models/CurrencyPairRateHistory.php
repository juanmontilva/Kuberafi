<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CurrencyPairRateHistory extends Model
{
    use HasFactory;

    protected $table = 'currency_pair_rate_history';

    protected $fillable = [
        'currency_pair_id',
        'exchange_house_id',
        'rate',
        'margin_percent',
        'effective_rate',
        'min_amount',
        'max_amount',
        'changed_by',
        'change_reason',
        'notes',
        'valid_from',
        'valid_until',
        'is_current',
    ];

    protected $casts = [
        'rate' => 'decimal:8',
        'margin_percent' => 'decimal:4',
        'effective_rate' => 'decimal:8',
        'min_amount' => 'decimal:2',
        'max_amount' => 'decimal:2',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'is_current' => 'boolean',
    ];

    /**
     * Relación con el par de divisas
     */
    public function currencyPair(): BelongsTo
    {
        return $this->belongsTo(CurrencyPair::class);
    }

    /**
     * Relación con la casa de cambio
     */
    public function exchangeHouse(): BelongsTo
    {
        return $this->belongsTo(ExchangeHouse::class);
    }

    /**
     * Usuario que realizó el cambio
     */
    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    /**
     * Scope para obtener solo tasas actuales
     */
    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    /**
     * Scope para obtener historial por rango de fechas
     */
    public function scopeBetweenDates($query, $from, $to)
    {
        return $query->whereBetween('valid_from', [$from, $to]);
    }

    /**
     * Scope para un par de divisas específico
     */
    public function scopeForPair($query, $currencyPairId)
    {
        return $query->where('currency_pair_id', $currencyPairId);
    }

    /**
     * Scope para una casa de cambio específica
     */
    public function scopeForExchangeHouse($query, $exchangeHouseId)
    {
        return $query->where('exchange_house_id', $exchangeHouseId);
    }

    /**
     * Calcular el cambio porcentual respecto a la tasa anterior
     */
    public function getPercentageChangeAttribute(): ?float
    {
        $previous = self::where('currency_pair_id', $this->currency_pair_id)
            ->where('exchange_house_id', $this->exchange_house_id)
            ->where('valid_from', '<', $this->valid_from)
            ->orderBy('valid_from', 'desc')
            ->first();

        if (!$previous || $previous->rate == 0) {
            return null;
        }

        return (($this->rate - $previous->rate) / $previous->rate) * 100;
    }
}
