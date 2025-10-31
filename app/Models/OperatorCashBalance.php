<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OperatorCashBalance extends Model
{
    protected $fillable = [
        'operator_id',
        'payment_method_id',
        'currency',
        'balance',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
    ];

    public function operator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'operator_id');
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_id');
    }

    /**
     * Incrementar el balance
     */
    public function increment($amount, $description = null, $orderId = null, $type = 'deposit')
    {
        $balanceBefore = $this->balance;
        $this->balance += $amount;
        $this->save();

        // Registrar movimiento
        CashMovement::create([
            'operator_id' => $this->operator_id,
            'payment_method_id' => $this->payment_method_id,
            'order_id' => $orderId,
            'type' => $type,
            'currency' => $this->currency,
            'amount' => $amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $this->balance,
            'description' => $description,
        ]);

        return $this;
    }

    /**
     * Decrementar el balance
     */
    public function decrement($amount, $description = null, $orderId = null, $type = 'withdrawal')
    {
        $balanceBefore = $this->balance;
        $this->balance -= $amount;
        $this->save();

        // Registrar movimiento
        CashMovement::create([
            'operator_id' => $this->operator_id,
            'payment_method_id' => $this->payment_method_id,
            'order_id' => $orderId,
            'type' => $type,
            'currency' => $this->currency,
            'amount' => -$amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $this->balance,
            'description' => $description,
        ]);

        return $this;
    }
}
