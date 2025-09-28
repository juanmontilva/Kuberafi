<?php

namespace App\Http\Controllers;

use App\Models\CommissionPayment;
use App\Models\ExchangeHouse;
use App\Models\PaymentSchedule;
use App\Models\Commission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class CommissionPaymentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $payments = CommissionPayment::with(['exchangeHouse'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        // Estadísticas
        $totalPending = CommissionPayment::where('status', 'pending')->sum('total_amount');
        $totalOverdue = CommissionPayment::where('status', 'overdue')->sum('total_amount');
        $totalPaidThisMonth = CommissionPayment::where('status', 'paid')
            ->whereMonth('paid_at', now()->month)
            ->sum('total_amount');

        $overdueCount = CommissionPayment::where('status', 'overdue')->count();

        return Inertia::render('Admin/CommissionPayments', [
            'payments' => $payments,
            'stats' => [
                'totalPending' => number_format($totalPending, 2),
                'totalOverdue' => number_format($totalOverdue, 2),
                'totalPaidThisMonth' => number_format($totalPaidThisMonth, 2),
                'overdueCount' => $overdueCount,
            ],
        ]);
    }

    public function show(CommissionPayment $commissionPayment)
    {
        $commissionPayment->load(['exchangeHouse']);
        
        return Inertia::render('Admin/CommissionPaymentDetail', [
            'payment' => $commissionPayment,
        ]);
    }

    public function markAsPaid(Request $request, CommissionPayment $commissionPayment)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'payment_method' => 'required|in:bank_transfer,cash,check,digital_wallet',
            'payment_reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $commissionPayment->markAsPaid(
            $validated['payment_method'],
            $validated['payment_reference'] ?? null,
            $validated['notes'] ?? null
        );

        return back()->with('success', 'Pago marcado como completado exitosamente');
    }

    public function schedules(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $schedules = PaymentSchedule::with(['exchangeHouse'])
            ->orderBy('created_at', 'desc')
            ->get();

        $exchangeHouses = ExchangeHouse::where('is_active', true)
            ->whereDoesntHave('paymentSchedule')
            ->get();

        return Inertia::render('Admin/PaymentSchedules', [
            'paymentSchedules' => $schedules,
            'exchangeHouses' => $exchangeHouses,
        ]);
    }

    public function storeSchedule(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'exchange_house_id' => 'required|exists:exchange_houses,id',
            'frequency' => 'required|in:daily,weekly,biweekly,monthly',
            'payment_day' => 'nullable|integer|min:1|max:31',
            'minimum_amount' => 'required|numeric|min:0',
            'auto_generate' => 'boolean',
        ]);

        PaymentSchedule::create($validated);

        return back()->with('success', 'Cronograma de pagos creado exitosamente');
    }

    public function updateSchedule(Request $request, PaymentSchedule $paymentSchedule)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'frequency' => 'required|in:daily,weekly,biweekly,monthly',
            'payment_day' => 'nullable|integer|min:1|max:31',
            'minimum_amount' => 'required|numeric|min:0',
            'auto_generate' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $paymentSchedule->update($validated);

        return back()->with('success', 'Cronograma de pagos actualizado exitosamente');
    }

    public function generatePayments(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $schedules = PaymentSchedule::where('is_active', true)
            ->where('auto_generate', true)
            ->get();

        $generated = 0;
        foreach ($schedules as $schedule) {
            $payment = $schedule->generatePayment();
            if ($payment) {
                $generated++;
            }
        }

        return back()->with('success', "Se generaron {$generated} pagos automáticamente");
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        // Pagos pendientes por casa de cambio
        $pendingByHouse = CommissionPayment::with('exchangeHouse')
            ->where('status', 'pending')
            ->get()
            ->groupBy('exchange_house_id')
            ->map(function ($payments) {
                return [
                    'house' => $payments->first()->exchangeHouse,
                    'total' => $payments->sum('total_amount'),
                    'count' => $payments->count(),
                    'oldest' => $payments->min('due_date'),
                ];
            });

        // Pagos vencidos
        $overduePayments = CommissionPayment::with('exchangeHouse')
            ->where('status', 'overdue')
            ->orderBy('due_date', 'asc')
            ->limit(10)
            ->get();

        // Próximos pagos (próximos 7 días)
        $upcomingPayments = CommissionPayment::with('exchangeHouse')
            ->where('status', 'pending')
            ->whereBetween('due_date', [now(), now()->addDays(7)])
            ->orderBy('due_date', 'asc')
            ->get();

        return Inertia::render('Admin/PaymentsDashboard', [
            'pendingByHouse' => $pendingByHouse->values(),
            'overduePayments' => $overduePayments,
            'upcomingPayments' => $upcomingPayments,
        ]);
    }
}
