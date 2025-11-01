<?php

namespace App\Enums;

enum CommissionPaymentStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case PAID = 'paid';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pendiente',
            self::APPROVED => 'Aprobada',
            self::REJECTED => 'Rechazada',
            self::PAID => 'Pagada',
            self::CANCELLED => 'Cancelada',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::PENDING => 'warning',
            self::APPROVED => 'info',
            self::REJECTED => 'danger',
            self::PAID => 'success',
            self::CANCELLED => 'secondary',
        };
    }

    public function badge(): string
    {
        return match($this) {
            self::PENDING => 'bg-yellow-100 text-yellow-800',
            self::APPROVED => 'bg-blue-100 text-blue-800',
            self::REJECTED => 'bg-red-100 text-red-800',
            self::PAID => 'bg-green-100 text-green-800',
            self::CANCELLED => 'bg-gray-100 text-gray-800',
        };
    }

    public function canBeApproved(): bool
    {
        return $this === self::PENDING;
    }

    public function canBeRejected(): bool
    {
        return $this === self::PENDING;
    }

    public function canBePaid(): bool
    {
        return $this === self::APPROVED;
    }

    public function canBeCancelled(): bool
    {
        return $this === self::PENDING;
    }
}
