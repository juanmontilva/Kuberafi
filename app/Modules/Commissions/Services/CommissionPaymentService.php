<?php

namespace App\Modules\Commissions\Services;

use App\Models\CommissionPayment;
use App\Models\ExchangeHouse;
use App\Models\User;
use App\Enums\CommissionPaymentStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CommissionPaymentService
{
    public function __construct(
        private CommissionService $commissionService
    ) {}

    /**
     * Crear solicitud de pago
     */
    public function createPaymentRequest(
        ExchangeHouse $exchangeHouse,
        User $requestedBy,
        float $amount,
        array $bankData,
        ?string $notes = null
    ): CommissionPayment {
        // Validar que el monto sea válido
        if (!$this->commissionService->canRequestAmount($exchangeHouse, $amount)) {
            throw ValidationException::withMessages([
                'amount' => 'El monto solicitado excede el balance disponible'
            ]);
        }

        return DB::transaction(function() use ($exchangeHouse, $requestedBy, $amount, $bankData, $notes) {
            return CommissionPayment::create([
                'exchange_house_id' => $exchangeHouse->id,
                'requested_by' => $requestedBy->id,
                'total_commissions' => $amount,
                'period_start' => now()->startOfMonth(),
                'period_end' => now()->endOfMonth(),
                'total_orders' => 0,
                'total_volume' => 0,
                'status' => CommissionPaymentStatus::PENDING,
                'bank_name' => $bankData['bank_name'] ?? null,
                'account_number' => $bankData['account_number'] ?? null,
                'account_holder' => $bankData['account_holder'] ?? null,
                'account_type' => $bankData['account_type'] ?? null,
                'identification' => $bankData['identification'] ?? null,
                'requested_at' => now(),
                'request_notes' => $notes,
            ]);
        });
    }

    /**
     * Aprobar solicitud
     */
    public function approveRequest(
        CommissionPayment $payment,
        User $approver,
        ?string $notes = null
    ): CommissionPayment {
        $payment->approve($approver, $notes);
        
        // TODO: Enviar notificación a la casa de cambio
        // event(new CommissionPaymentApproved($payment));
        
        return $payment->fresh();
    }

    /**
     * Rechazar solicitud
     */
    public function rejectRequest(
        CommissionPayment $payment,
        User $user,
        string $reason
    ): CommissionPayment {
        $payment->reject($user, $reason);
        
        // TODO: Enviar notificación a la casa de cambio
        // event(new CommissionPaymentRejected($payment));
        
        return $payment->fresh();
    }

    /**
     * Marcar como pagada
     */
    public function markAsPaid(
        CommissionPayment $payment,
        User $user,
        string $paymentMethod,
        ?string $reference = null,
        ?string $notes = null
    ): CommissionPayment {
        $payment->markAsPaid($user, $paymentMethod, $reference, $notes);
        
        // TODO: Enviar notificación a la casa de cambio
        // event(new CommissionPaymentCompleted($payment));
        
        return $payment->fresh();
    }

    /**
     * Cancelar solicitud
     */
    public function cancelRequest(
        CommissionPayment $payment,
        User $user
    ): CommissionPayment {
        $payment->cancel($user);
        
        return $payment->fresh();
    }

    /**
     * Obtener solicitudes pendientes (para admin)
     */
    public function getPendingRequests(?int $limit = null)
    {
        $query = CommissionPayment::with(['exchangeHouse', 'requestedBy'])
            ->pending()
            ->recent();

        if ($limit) {
            $query->limit($limit);
        }

        return $query->get();
    }

    /**
     * Obtener historial de solicitudes para una casa
     */
    public function getRequestHistory(
        ExchangeHouse $exchangeHouse,
        ?CommissionPaymentStatus $status = null,
        int $perPage = 15
    ) {
        $query = CommissionPayment::with(['requestedBy', 'approvedBy', 'paidBy'])
            ->forExchangeHouse($exchangeHouse->id)
            ->recent();

        if ($status) {
            $query->where('status', $status);
        }

        return $query->paginate($perPage);
    }

    /**
     * Obtener estadísticas de solicitudes (para admin)
     */
    public function getAdminStats(): array
    {
        $pending = CommissionPayment::pending()->count();
        $pendingAmount = CommissionPayment::pending()->sum('amount');
        
        $approved = CommissionPayment::approved()->count();
        $approvedAmount = CommissionPayment::approved()->sum('amount');
        
        $paidThisMonth = CommissionPayment::paid()
            ->whereMonth('paid_at', now()->month)
            ->count();
        $paidAmountThisMonth = CommissionPayment::paid()
            ->whereMonth('paid_at', now()->month)
            ->sum('amount');

        return [
            'pending' => [
                'count' => $pending,
                'amount' => round($pendingAmount, 2),
            ],
            'approved' => [
                'count' => $approved,
                'amount' => round($approvedAmount, 2),
            ],
            'paid_this_month' => [
                'count' => $paidThisMonth,
                'amount' => round($paidAmountThisMonth, 2),
            ],
        ];
    }

    /**
     * Procesamiento por lotes (aprobar múltiples)
     */
    public function batchApprove(
        array $paymentIds,
        User $approver,
        ?string $notes = null
    ): array {
        $results = [
            'approved' => 0,
            'failed' => 0,
            'errors' => [],
        ];

        foreach ($paymentIds as $id) {
            try {
                $payment = CommissionPayment::findOrFail($id);
                $this->approveRequest($payment, $approver, $notes);
                $results['approved']++;
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'id' => $id,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * Procesamiento por lotes (marcar como pagadas)
     */
    public function batchMarkAsPaid(
        array $paymentIds,
        User $user,
        string $paymentMethod,
        ?string $baseReference = null,
        ?string $notes = null
    ): array {
        $results = [
            'paid' => 0,
            'failed' => 0,
            'errors' => [],
        ];

        foreach ($paymentIds as $index => $id) {
            try {
                $payment = CommissionPayment::findOrFail($id);
                $reference = $baseReference ? "{$baseReference}-" . ($index + 1) : null;
                $this->markAsPaid($payment, $user, $paymentMethod, $reference, $notes);
                $results['paid']++;
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'id' => $id,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }
}
