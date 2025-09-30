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

    /**
     * Historial de tasas para este par de divisas
     */
    public function rateHistory(): HasMany
    {
        return $this->hasMany(CurrencyPairRateHistory::class);
    }

    /**
     * Obtener historial de tasas para una casa de cambio específica
     */
    public function rateHistoryForExchangeHouse($exchangeHouseId)
    {
        return $this->rateHistory()
            ->where('exchange_house_id', $exchangeHouseId)
            ->orderBy('valid_from', 'desc');
    }

    /**
     * Guardar cambio de tasa en el historial
     */
    public function saveRateChange($exchangeHouseId, $newRate, $marginPercent, $userId = null, $reason = 'manual', $notes = null)
    {
        // Marcar la tasa actual como no actual y establecer valid_until
        CurrencyPairRateHistory::where('currency_pair_id', $this->id)
            ->where('exchange_house_id', $exchangeHouseId)
            ->where('is_current', true)
            ->update([
                'is_current' => false,
                'valid_until' => now(),
            ]);

        // Crear nueva entrada en el historial
        $effectiveRate = $newRate * (1 + ($marginPercent / 100));

        return $this->rateHistory()->create([
            'exchange_house_id' => $exchangeHouseId,
            'rate' => $newRate,
            'margin_percent' => $marginPercent,
            'effective_rate' => $effectiveRate,
            'min_amount' => $this->min_amount,
            'max_amount' => $this->max_amount,
            'changed_by' => $userId,
            'change_reason' => $reason,
            'notes' => $notes,
            'valid_from' => now(),
            'is_current' => true,
        ]);
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
