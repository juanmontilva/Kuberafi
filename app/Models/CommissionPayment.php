<?php

namespace App\Models;

use App\Enums\CommissionPaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class CommissionPayment extends Model
{
    use SoftDeletes;

    protected $table = 'commission_payment_requests';

    protected $fillable = [
        'exchange_house_id',
        'requested_by',
        'confirmed_by', // approved_by
        'paid_by',
        'total_commissions', // amount
        'period_start',
        'period_end',
        'total_orders',
        'total_volume',
        'status',
        'payment_method',
        'payment_reference',
        'payment_proof',
        'payment_notes',
        'payment_sent_at',
        'bank_name',
        'account_number',
        'account_holder',
        'account_type',
        'identification',
        'requested_at',
        'confirmed_at', // approved_at
        'rejected_at',
        'paid_at',
        'cancelled_at',
        'request_notes',
        'admin_notes', // approval_notes
        'rejection_reason',
    ];

    protected $casts = [
        'total_commissions' => 'decimal:2',
        'total_volume' => 'decimal:2',
        'period_start' => 'date',
        'period_end' => 'date',
        'status' => CommissionPaymentStatus::class,
        'requested_at' => 'datetime',
        'confirmed_at' => 'datetime', // approved_at
        'rejected_at' => 'datetime',
        'paid_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'payment_sent_at' => 'datetime',
    ];

    // Mapeo de atributos para compatibilidad
    protected $appends = ['amount', 'approved_at', 'approved_by', 'approval_notes'];

    // Accessors para compatibilidad con código nuevo
    public function getAmountAttribute()
    {
        return $this->total_commissions;
    }

    public function getApprovedAtAttribute()
    {
        return $this->confirmed_at;
    }

    public function getApprovedByAttribute()
    {
        return $this->confirmed_by;
    }

    public function getApprovalNotesAttribute()
    {
        return $this->admin_notes;
    }

    // Mutators para compatibilidad
    public function setAmountAttribute($value)
    {
        $this->attributes['total_commissions'] = $value;
    }

    // Relaciones
    public function exchangeHouse(): BelongsTo
    {
        return $this->belongsTo(ExchangeHouse::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    public function confirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    public function paidBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    public function commissions()
    {
        return $this->belongsToMany(
            Commission::class,
            'commission_payment_request_commission',
            'payment_request_id',
            'commission_id'
        )->withTimestamps();
    }

    // Métodos de estado
    public function isPending(): bool
    {
        return $this->status === CommissionPaymentStatus::PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === CommissionPaymentStatus::APPROVED;
    }

    public function isRejected(): bool
    {
        return $this->status === CommissionPaymentStatus::REJECTED;
    }

    public function isPaid(): bool
    {
        return $this->status === CommissionPaymentStatus::PAID;
    }

    public function isCancelled(): bool
    {
        return $this->status === CommissionPaymentStatus::CANCELLED;
    }

    // Acciones
    public function approve(User $user, ?string $notes = null): void
    {
        if (!$this->status->canBeApproved()) {
            throw new \Exception('Esta solicitud no puede ser aprobada');
        }

        $this->update([
            'status' => CommissionPaymentStatus::APPROVED,
            'confirmed_by' => $user->id,
            'confirmed_at' => now(),
            'admin_notes' => $notes,
        ]);
    }

    public function reject(User $user, string $reason): void
    {
        if (!$this->status->canBeRejected()) {
            throw new \Exception('Esta solicitud no puede ser rechazada');
        }

        $this->update([
            'status' => CommissionPaymentStatus::REJECTED,
            'rejected_at' => now(),
            'rejection_reason' => $reason,
        ]);
    }

    public function markAsPaid(User $user, string $paymentMethod, ?string $reference = null, ?string $notes = null): void
    {
        if (!$this->status->canBePaid()) {
            throw new \Exception('Esta solicitud no puede ser marcada como pagada');
        }

        $this->update([
            'status' => CommissionPaymentStatus::PAID,
            'paid_by' => $user->id,
            'paid_at' => now(),
            'payment_method' => $paymentMethod,
            'payment_reference' => $reference,
            'payment_notes' => $notes,
        ]);

        // Marcar como pagadas las comisiones vinculadas explícitamente a esta solicitud
        $commissionIds = $this->commissions()->pluck('commissions.id')->toArray();
        if (!empty($commissionIds)) {
            Commission::whereIn('id', $commissionIds)
                ->where('status', 'pending')
                ->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                ]);
        } else {
            // Fallback para solicitudes antiguas sin vínculos explícitos: usar el período (corrigiendo si está invertido)
            $start = $this->period_start <= $this->period_end ? $this->period_start : $this->period_end;
            $end = $this->period_start <= $this->period_end ? $this->period_end : $this->period_start;

            Commission::where('exchange_house_id', $this->exchange_house_id)
                ->where('type', 'platform')
                ->where('status', 'pending')
                ->whereBetween('created_at', [$start, $end])
                ->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                ]);
        }
    }

    public function cancel(User $user): void
    {
        if (!$this->status->canBeCancelled()) {
            throw new \Exception('Esta solicitud no puede ser cancelada');
        }

        $this->update([
            'status' => CommissionPaymentStatus::CANCELLED,
            'cancelled_at' => now(),
        ]);
    }

    // Atributos calculados
    public function getDaysWaitingAttribute(): int
    {
        if ($this->isPaid() || $this->isRejected()) {
            return 0;
        }

        return Carbon::parse($this->requested_at)->diffInDays(now());
    }

    public function getStatusLabelAttribute(): string
    {
        return $this->status->label();
    }

    public function getStatusBadgeAttribute(): string
    {
        return $this->status->badge();
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', CommissionPaymentStatus::PENDING);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', CommissionPaymentStatus::APPROVED);
    }

    public function scopePaid($query)
    {
        return $query->where('status', CommissionPaymentStatus::PAID);
    }

    public function scopeForExchangeHouse($query, int $exchangeHouseId)
    {
        return $query->where('exchange_house_id', $exchangeHouseId);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('requested_at', 'desc');
    }
}
