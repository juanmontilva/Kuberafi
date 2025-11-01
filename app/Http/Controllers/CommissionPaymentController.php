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

        // Estadísticas detalladas
        $totalPending = CommissionPayment::where('status', 'pending')->sum('total_commissions');
        $totalCommissionPending = CommissionPayment::where('status', 'pending')->sum('total_commissions');
        
        $totalOverdue = CommissionPayment::where('status', 'overdue')->sum('total_commissions');
        $totalCommissionOverdue = CommissionPayment::where('status', 'overdue')->sum('total_commissions');
        
        $totalPaidThisMonth = CommissionPayment::where('status', 'paid')
            ->whereMonth('paid_at', now()->month)
            ->sum('total_commissions');
        $totalCommissionPaidThisMonth = CommissionPayment::where('status', 'paid')
            ->whereMonth('paid_at', now()->month)
            ->sum('total_commissions');

        $overdueCount = CommissionPayment::where('status', 'overdue')->count();
        
        // Total de comisiones acumuladas (lo que le deben a la plataforma)
        $totalCommissionsOwed = CommissionPayment::whereIn('status', ['pending', 'overdue'])
            ->sum('total_commissions');

        return Inertia::render('Admin/CommissionPayments', [
            'payments' => $payments,
            'stats' => [
                'totalPending' => number_format($totalPending, 2),
                'totalCommissionPending' => number_format($totalCommissionPending, 2),
                'totalOverdue' => number_format($totalOverdue, 2),
                'totalCommissionOverdue' => number_format($totalCommissionOverdue, 2),
                'totalPaidThisMonth' => number_format($totalPaidThisMonth, 2),
                'totalCommissionPaidThisMonth' => number_format($totalCommissionPaidThisMonth, 2),
                'totalCommissionsOwed' => number_format($totalCommissionsOwed, 2),
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

    public function destroy(Request $request, CommissionPayment $commissionPayment)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        if ($commissionPayment->status !== 'pending') {
            return back()->withErrors(['error' => 'Solo se pueden eliminar pagos pendientes']);
        }

        $commissionPayment->delete();

        return redirect()->route('admin.payments')->with('success', 'Pago eliminado exitosamente');
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
        $updated = 0;
        $skipped = 0;
        $totalAmount = 0;
        
        foreach ($schedules as $schedule) {
            $payment = $schedule->generatePayment();
            if ($payment) {
                if ($payment->wasRecentlyCreated) {
                    $generated++;
                } else {
                    $updated++;
                }
                $totalAmount += $payment->total_commissions;
            } else {
                $skipped++;
            }
        }

        if ($generated === 0 && $updated === 0) {
            if ($skipped > 0) {
                return back()->with('info', "No se generaron ni actualizaron pagos. Las casas tienen solicitudes en proceso o sin monto suficiente.");
            }
            return back()->with('info', "No hay cronogramas activos configurados.");
        }

        $messages = [];
        if ($generated > 0) {
            $messages[] = "✅ {$generated} solicitud(es) generada(s)";
        }
        if ($updated > 0) {
            $messages[] = "🔄 {$updated} solicitud(es) actualizada(s) con nuevas comisiones";
        }
        
        $message = implode(" | ", $messages) . " | Total: $" . number_format($totalAmount, 2);
        
        return back()->with('success', $message);
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        // Pagos pendientes por casa de cambio - Optimizado para evitar N+1
        $pendingByHouse = CommissionPayment::with('exchangeHouse')
            ->where('status', 'pending')
            ->get()
            ->groupBy('exchange_house_id')
            ->map(function ($payments) {
                $firstPayment = $payments->first();
                return [
                    'house' => $firstPayment->exchangeHouse, // Ya cargado por with()
                    'total' => $payments->sum('total_commissions'),
                    'count' => $payments->count(),
                    'oldest' => $payments->min('requested_at'),
                ];
            });

        // Pagos vencidos (más de 7 días sin procesar)
        $overduePayments = CommissionPayment::with('exchangeHouse')
            ->where('status', 'pending')
            ->where('requested_at', '<', now()->subDays(7))
            ->orderBy('requested_at', 'asc')
            ->limit(10)
            ->get();

        // Solicitudes recientes (últimos 7 días)
        $upcomingPayments = CommissionPayment::with('exchangeHouse')
            ->where('status', 'pending')
            ->where('requested_at', '>=', now()->subDays(7))
            ->orderBy('requested_at', 'desc')
            ->get();

        return Inertia::render('Admin/PaymentsDashboard', [
            'pendingByHouse' => $pendingByHouse->values(),
            'overduePayments' => $overduePayments,
            'upcomingPayments' => $upcomingPayments,
        ]);
    }
}
