<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformPaymentMethod extends Model
{
    protected $fillable = [
        'name',
        'type',
        'currency',
        'account_holder',
        'account_number',
        'bank_name',
        'identification',
        'routing_number',
        'swift_code',
        'instructions',
        'is_active',
        'is_primary',
        'display_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_primary' => 'boolean',
        'display_order' => 'integer',
    ];

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
            'wire_transfer' => '🌐',
            'paypal' => '💳',
            default => '💰',
        };
    }

    /**
     * Get display name with currency
     */
    public function getDisplayNameAttribute(): string
    {
        return "{$this->name} ({$this->currency})";
    }

    /**
     * Get type label in Spanish
     */
    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            'bank_transfer' => 'Transferencia Bancaria',
            'mobile_payment' => 'Pago Móvil',
            'zelle' => 'Zelle',
            'crypto' => 'Criptomoneda',
            'wire_transfer' => 'Transferencia Internacional',
            'paypal' => 'PayPal',
            default => 'Otro',
        };
    }

    /**
     * Scope for active methods
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for specific currency
     */
    public function scopeForCurrency($query, string $currency)
    {
        return $query->where('currency', $currency);
    }

    /**
     * Scope ordered by display order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order')->orderBy('created_at');
    }
}
