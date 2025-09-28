<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class CommissionPayment extends Model
{
    protected $fillable = [
        'payment_number',
        'exchange_house_id',
        'total_amount',
        'commission_amount',
        'period_start',
        'period_end',
        'due_date',
        'frequency',
        'status',
        'payment_method',
        'payment_reference',
        'paid_at',
        'notes',
        'commission_details',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'period_start' => 'date',
        'period_end' => 'date',
        'due_date' => 'date',
        'paid_at' => 'datetime',
        'commission_details' => 'array',
    ];

    public function exchangeHouse(): BelongsTo
    {
        return $this->belongsTo(ExchangeHouse::class);
    }

    public function isOverdue(): bool
    {
        return $this->status === 'pending' && $this->due_date < now()->toDateString();
    }

    public function getDaysOverdueAttribute(): int
    {
        if (!$this->isOverdue()) {
            return 0;
        }
        return Carbon::parse($this->due_date)->diffInDays(now());
    }

    public function markAsPaid($paymentMethod, $reference = null, $notes = null)
    {
        $this->update([
            'status' => 'paid',
            'payment_method' => $paymentMethod,
            'payment_reference' => $reference,
            'paid_at' => now(),
            'notes' => $notes,
        ]);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (!$payment->payment_number) {
                $payment->payment_number = 'KBF-PAY-' . strtoupper(uniqid());
            }
        });

        static::created(function ($payment) {
            // Actualizar estado si está vencido
            if ($payment->due_date < now()->toDateString() && $payment->status === 'pending') {
                $payment->update(['status' => 'overdue']);
            }
        });
    }
}
