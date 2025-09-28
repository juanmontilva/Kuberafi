<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class PaymentSchedule extends Model
{
    protected $fillable = [
        'exchange_house_id',
        'frequency',
        'payment_day',
        'minimum_amount',
        'auto_generate',
        'is_active',
        'notification_settings',
    ];

    protected $casts = [
        'minimum_amount' => 'decimal:2',
        'auto_generate' => 'boolean',
        'is_active' => 'boolean',
        'notification_settings' => 'array',
    ];

    public function exchangeHouse(): BelongsTo
    {
        return $this->belongsTo(ExchangeHouse::class);
    }

    public function getNextPaymentDate(): Carbon
    {
        $now = Carbon::now();
        
        switch ($this->frequency) {
            case 'daily':
                return $now->addDay();
                
            case 'weekly':
                $dayOfWeek = $this->payment_day ?? 1; // 1 = Lunes
                return $now->next($dayOfWeek);
                
            case 'biweekly':
                return $now->addWeeks(2);
                
            case 'monthly':
                $day = $this->payment_day ?? 1;
                $nextMonth = $now->copy()->addMonth();
                return $nextMonth->day($day);
                
            default:
                return $now->addWeek();
        }
    }

    public function generatePayment()
    {
        if (!$this->is_active || !$this->auto_generate) {
            return null;
        }

        // Obtener comisiones pendientes de la casa de cambio
        $pendingCommissions = Commission::where('exchange_house_id', $this->exchange_house_id)
            ->where('type', 'platform')
            ->where('status', 'pending')
            ->sum('amount');

        if ($pendingCommissions < $this->minimum_amount) {
            return null;
        }

        $periodStart = $this->getLastPaymentEndDate();
        $periodEnd = Carbon::now();
        $dueDate = $this->getNextPaymentDate();

        return CommissionPayment::create([
            'exchange_house_id' => $this->exchange_house_id,
            'total_amount' => $pendingCommissions,
            'commission_amount' => $pendingCommissions,
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'due_date' => $dueDate,
            'frequency' => $this->frequency,
        ]);
    }

    private function getLastPaymentEndDate(): Carbon
    {
        $lastPayment = CommissionPayment::where('exchange_house_id', $this->exchange_house_id)
            ->orderBy('period_end', 'desc')
            ->first();

        return $lastPayment ? Carbon::parse($lastPayment->period_end)->addDay() : Carbon::now()->subMonth();
    }
}
