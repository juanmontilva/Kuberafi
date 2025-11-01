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
        $commissionsQuery = Commission::where('exchange_house_id', $this->exchange_house_id)
            ->where('type', 'platform')
            ->where('status', 'pending');
        
        $pendingCommissions = $commissionsQuery->sum('amount');
        $totalOrders = $commissionsQuery->distinct('order_id')->count('order_id');
        $totalVolume = Order::whereIn('id', $commissionsQuery->pluck('order_id'))
            ->sum('base_amount');

        // NUNCA generar solicitudes de $0 o negativas
        if ($pendingCommissions <= 0) {
            return null;
        }

        // Verificar monto mínimo configurado
        if ($pendingCommissions < $this->minimum_amount) {
            return null;
        }

        $periodStart = $this->getLastPaymentEndDate();
        $periodEnd = Carbon::now();
        
        // CRÍTICO: Validar que el período sea válido (start debe ser antes de end)
        if ($periodStart->isAfter($periodEnd)) {
            // Si el inicio calculado es después del final, usar un período válido
            $periodStart = $periodEnd->copy()->subMonth()->startOfMonth();
        }
        
        $dueDate = $this->getNextPaymentDate();

        // Verificar si ya existe un pago activo para esta casa
        $existingPayment = CommissionPayment::where('exchange_house_id', $this->exchange_house_id)
            ->whereIn('status', ['pending', 'approved', 'payment_info_sent'])
            ->first();

        // Obtener IDs de las comisiones pendientes
        $commissionIds = $commissionsQuery->pluck('id')->toArray();
        
        if ($existingPayment) {
            // Si existe una solicitud pendiente, ACTUALIZARLA con el nuevo total
            // (para incluir las nuevas comisiones que se generaron después)
            if ($existingPayment->status->value === 'pending') {
                $existingPayment->update([
                    'total_commissions' => $pendingCommissions,
                    'total_orders' => $totalOrders,
                    'total_volume' => $totalVolume,
                    'period_end' => $periodEnd,
                    'updated_at' => now(),
                ]);
                
                // Sincronizar comisiones asociadas
                $existingPayment->commissions()->sync($commissionIds);
                
                return $existingPayment; // Retornar la actualizada
            }
            
            // Si ya está aprobada o con info enviada, no modificar
            return null;
        }

        $payment = CommissionPayment::create([
            'exchange_house_id' => $this->exchange_house_id,
            'total_commissions' => $pendingCommissions,
            'total_orders' => $totalOrders,
            'total_volume' => $totalVolume,
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'requested_at' => now(),
            'status' => 'pending',
        ]);
        
        // Vincular las comisiones a esta solicitud
        $payment->commissions()->attach($commissionIds);
        
        return $payment;
    }

    private function getLastPaymentEndDate(): Carbon
    {
        $lastPayment = CommissionPayment::where('exchange_house_id', $this->exchange_house_id)
            ->orderBy('period_end', 'desc')
            ->first();

        return $lastPayment ? Carbon::parse($lastPayment->period_end)->addDay() : Carbon::now()->subMonth();
    }
}
