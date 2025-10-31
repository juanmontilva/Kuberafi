<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommissionPaymentRequest extends Model
{
    protected $fillable = [
        'exchange_house_id',
        'period_start',
        'period_end',
        'total_commissions',
        'total_orders',
        'total_volume',
        'status',
        'payment_method',
        'payment_reference',
        'payment_proof',
        'payment_notes',
        'payment_sent_at',
        'confirmed_by',
        'confirmed_at',
        'admin_notes',
        'rejection_reason',
        'rejected_at',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'total_commissions' => 'decimal:2',
        'total_orders' => 'integer',
        'total_volume' => 'decimal:2',
        'payment_sent_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function exchangeHouse(): BelongsTo
    {
        return $this->belongsTo(ExchangeHouse::class);
    }

    public function confirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    public function commissions()
    {
        return $this->belongsToMany(Commission::class, 'commission_payment_request_commission', 'payment_request_id', 'commission_id')
            ->withTimestamps();
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isPaymentInfoSent(): bool
    {
        return $this->status === 'payment_info_sent';
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function canSendPaymentInfo(): bool
    {
        return in_array($this->status, ['pending', 'rejected']);
    }

    public function canConfirmPayment(): bool
    {
        return $this->status === 'payment_info_sent';
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaymentInfoSent($query)
    {
        return $query->where('status', 'payment_info_sent');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeForExchangeHouse($query, $exchangeHouseId)
    {
        return $query->where('exchange_house_id', $exchangeHouseId);
    }
}
