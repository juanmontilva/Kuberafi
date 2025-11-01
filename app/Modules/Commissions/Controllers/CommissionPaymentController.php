<?php

namespace App\Modules\Commissions\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Commissions\Services\CommissionService;
use App\Modules\Commissions\Services\CommissionPaymentService;
use App\Models\CommissionPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class CommissionPaymentController extends Controller
{
    public function __construct(
        private CommissionService $commissionService,
        private CommissionPaymentService $paymentService
    ) {}

    /**
     * Mostrar formulario de solicitud de pago
     */
    public function create(Request $request)
    {
        $user = $request->user();
        $exchangeHouse = $user->exchangeHouse;

        $balance = $this->commissionService->getAccumulatedCommissions($exchangeHouse);

        return Inertia::render('Commissions/RequestPayment', [
            'balance' => $balance,
        ]);
    }

    /**
     * Crear solicitud de pago
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $exchangeHouse = $user->exchangeHouse;

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'bank_name' => 'required|string|max:100',
            'account_number' => 'required|string|max:50',
            'account_holder' => 'required|string|max:100',
            'account_type' => 'required|in:savings,checking',
            'identification' => 'required|string|max:20',
            'request_notes' => 'nullable|string|max:500',
        ]);

        try {
            $payment = $this->paymentService->createPaymentRequest(
                $exchangeHouse,
                $user,
                $validated['amount'],
                [
                    'bank_name' => $validated['bank_name'],
                    'account_number' => $validated['account_number'],
                    'account_holder' => $validated['account_holder'],
                    'account_type' => $validated['account_type'],
                    'identification' => $validated['identification'],
                ],
                $validated['request_notes'] ?? null
            );

            return redirect()->route('commissions.history')
                ->with('success', 'Solicitud de pago creada exitosamente');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        }
    }

    /**
     * Ver detalles de una solicitud
     */
    public function show(CommissionPayment $payment)
    {
        // Verificar que el usuario puede ver esta solicitud
        $this->authorize('view', $payment);

        $payment->load(['exchangeHouse', 'requestedBy', 'approvedBy', 'paidBy']);

        return Inertia::render('Commissions/PaymentDetails', [
            'payment' => $payment,
        ]);
    }

    /**
     * Cancelar solicitud
     */
    public function cancel(Request $request, CommissionPayment $payment)
    {
        $this->authorize('cancel', $payment);

        try {
            $this->paymentService->cancelRequest($payment, $request->user());

            return redirect()->route('commissions.history')
                ->with('success', 'Solicitud cancelada exitosamente');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    // ============================================
    // MÉTODOS ADMIN
    // ============================================

    /**
     * Panel de administración de solicitudes
     */
    public function adminIndex(Request $request)
    {
        $this->authorize('viewAny', CommissionPayment::class);

        $status = $request->input('status');
        $exchangeHouseId = $request->input('exchange_house_id');

        $query = CommissionPayment::with(['exchangeHouse', 'requestedBy', 'approvedBy', 'paidBy'])
            ->recent();

        if ($status) {
            $query->where('status', $status);
        }

        if ($exchangeHouseId) {
            $query->where('exchange_house_id', $exchangeHouseId);
        }

        $payments = $query->paginate(15);
        $stats = $this->paymentService->getAdminStats();

        return Inertia::render('Admin/CommissionPayments/Index', [
            'payments' => $payments,
            'stats' => $stats,
            'filters' => [
                'status' => $status,
                'exchange_house_id' => $exchangeHouseId,
            ],
        ]);
    }

    /**
     * Aprobar solicitud (Admin)
     */
    public function approve(Request $request, CommissionPayment $payment)
    {
        $this->authorize('approve', $payment);

        $validated = $request->validate([
            'approval_notes' => 'nullable|string|max:500',
        ]);

        try {
            $this->paymentService->approveRequest(
                $payment,
                $request->user(),
                $validated['approval_notes'] ?? null
            );

            return back()->with('success', 'Solicitud aprobada exitosamente');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Rechazar solicitud (Admin)
     */
    public function reject(Request $request, CommissionPayment $payment)
    {
        $this->authorize('reject', $payment);

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        try {
            $this->paymentService->rejectRequest(
                $payment,
                $request->user(),
                $validated['rejection_reason']
            );

            return back()->with('success', 'Solicitud rechazada');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Marcar como pagada (Admin)
     */
    public function markAsPaid(Request $request, CommissionPayment $payment)
    {
        $this->authorize('markAsPaid', $payment);

        $validated = $request->validate([
            'payment_method' => 'required|string|max:50',
            'payment_reference' => 'nullable|string|max:100',
            'payment_notes' => 'nullable|string|max:500',
        ]);

        try {
            $this->paymentService->markAsPaid(
                $payment,
                $request->user(),
                $validated['payment_method'],
                $validated['payment_reference'] ?? null,
                $validated['payment_notes'] ?? null
            );

            return back()->with('success', 'Pago registrado exitosamente');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Aprobar múltiples solicitudes por lotes
     */
    public function batchApprove(Request $request)
    {
        $this->authorize('approve', CommissionPayment::class);

        $validated = $request->validate([
            'payment_ids' => 'required|array|min:1',
            'payment_ids.*' => 'required|exists:commission_payments,id',
            'approval_notes' => 'nullable|string|max:500',
        ]);

        $results = $this->paymentService->batchApprove(
            $validated['payment_ids'],
            $request->user(),
            $validated['approval_notes'] ?? null
        );

        $message = sprintf(
            'Procesadas: %d aprobadas, %d fallidas',
            $results['approved'],
            $results['failed']
        );

        return back()->with('success', $message);
    }

    /**
     * Marcar múltiples como pagadas por lotes
     */
    public function batchMarkAsPaid(Request $request)
    {
        $this->authorize('markAsPaid', CommissionPayment::class);

        $validated = $request->validate([
            'payment_ids' => 'required|array|min:1',
            'payment_ids.*' => 'required|exists:commission_payments,id',
            'payment_method' => 'required|string|max:50',
            'base_reference' => 'nullable|string|max:50',
            'payment_notes' => 'nullable|string|max:500',
        ]);

        $results = $this->paymentService->batchMarkAsPaid(
            $validated['payment_ids'],
            $request->user(),
            $validated['payment_method'],
            $validated['base_reference'] ?? null,
            $validated['payment_notes'] ?? null
        );

        $message = sprintf(
            'Procesadas: %d pagadas, %d fallidas',
            $results['paid'],
            $results['failed']
        );

        return back()->with('success', $message);
    }
}
