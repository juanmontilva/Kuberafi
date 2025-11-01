<?php

namespace App\Http\Controllers;

use App\Models\CommissionPaymentRequest;
use App\Models\Commission;
use App\Models\PlatformPaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class CommissionPaymentRequestController extends Controller
{
    /**
     * Vista para Super Admin - Ver todas las solicitudes de pago
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $status = $request->get('status', 'all');
        $exchangeHouseId = $request->get('exchange_house');
        
        $query = CommissionPaymentRequest::with(['exchangeHouse', 'confirmedBy'])
            ->orderBy('created_at', 'desc');
        
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($exchangeHouseId) {
            $query->where('exchange_house_id', $exchangeHouseId);
        }
        
        $requests = $query->paginate(20);
        
        // Estadísticas
        $stats = [
            'pending' => CommissionPaymentRequest::pending()->count(),
            'payment_info_sent' => CommissionPaymentRequest::paymentInfoSent()->count(),
            'paid' => CommissionPaymentRequest::paid()->count(),
            'total_pending_amount' => (float) CommissionPaymentRequest::paymentInfoSent()->sum('total_commissions') ?: 0,
        ];

        // Obtener todas las casas de cambio para el formulario de generación
        $exchangeHouses = \App\Models\ExchangeHouse::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/CommissionPaymentRequests', [
            'requests' => $requests,
            'stats' => $stats,
            'currentStatus' => $status,
            'currentExchangeHouse' => $exchangeHouseId,
            'exchangeHouses' => $exchangeHouses,
        ]);
    }

    /**
     * Vista para Exchange House - Ver sus solicitudes
     */
    public function myRequests(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isExchangeHouse() && !$user->isOperator()) {
            abort(403);
        }

        $requests = CommissionPaymentRequest::forExchangeHouse($user->exchange_house_id)
            ->with('confirmedBy')
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        // Calcular comisiones pendientes TOTALES (lo que deben a Kuberafi)
        $currentPeriodStart = Carbon::now()->startOfMonth();
        $currentPeriodEnd = Carbon::now()->endOfMonth();
        
        // Total acumulado de todas las comisiones pendientes
        $totalPendingCommissions = Commission::where('exchange_house_id', $user->exchange_house_id)
            ->where('type', 'platform')
            ->where('status', 'pending')
            ->selectRaw('
                SUM(amount) as total_amount,
                COUNT(DISTINCT order_id) as total_orders
            ')
            ->first();
            
        // Comisiones solo del mes actual
        $pendingCommissions = Commission::where('exchange_house_id', $user->exchange_house_id)
            ->where('type', 'platform')
            ->where('status', 'pending')
            ->whereBetween('created_at', [$currentPeriodStart, $currentPeriodEnd])
            ->selectRaw('
                SUM(amount) as total_amount_month,
                COUNT(DISTINCT order_id) as total_orders_month
            ')
            ->first();

        // Obtener métodos de pago activos de la plataforma
        $platformPaymentMethods = PlatformPaymentMethod::active()
            ->ordered()
            ->get()
            ->map(function ($method) {
                return [
                    'id' => $method->id,
                    'name' => $method->name,
                    'type' => $method->type,
                    'type_label' => $method->type_label,
                    'currency' => $method->currency,
                    'account_holder' => $method->account_holder,
                    'account_number' => $method->account_number,
                    'bank_name' => $method->bank_name,
                    'identification' => $method->identification,
                    'routing_number' => $method->routing_number,
                    'swift_code' => $method->swift_code,
                    'instructions' => $method->instructions,
                    'is_primary' => $method->is_primary,
                    'icon' => $method->icon,
                    'display_name' => $method->display_name,
                ];
            });

        return Inertia::render('ExchangeHouse/CommissionPaymentRequests', [
            'requests' => $requests,
            'pendingCommissions' => [
                'total_amount' => $totalPendingCommissions->total_amount ?? 0,
                'total_orders' => $totalPendingCommissions->total_orders ?? 0,
                'total_amount_month' => $pendingCommissions->total_amount_month ?? 0,
                'total_orders_month' => $pendingCommissions->total_orders_month ?? 0,
                'period_start' => $currentPeriodStart->format('Y-m-d'),
                'period_end' => $currentPeriodEnd->format('Y-m-d'),
            ],
            'platformPaymentMethods' => $platformPaymentMethods,
        ]);
    }

    /**
     * Generar solicitud de pago para un período
     */
    public function generate(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'exchange_house_id' => 'required|exists:exchange_houses,id',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after:period_start',
        ]);

        $periodStart = Carbon::parse($validated['period_start']);
        $periodEnd = Carbon::parse($validated['period_end']);

        // Verificar que no exista ya una solicitud para este período
        $existing = CommissionPaymentRequest::where('exchange_house_id', $validated['exchange_house_id'])
            ->where('period_start', $periodStart)
            ->where('period_end', $periodEnd)
            ->first();

        if ($existing) {
            return back()->withErrors([
                'error' => 'Ya existe una solicitud de pago para este período.'
            ]);
        }

        // Calcular comisiones del período (tipo 'platform' = lo que el operador debe a Kuberafi)
        $commissions = Commission::where('exchange_house_id', $validated['exchange_house_id'])
            ->where('type', 'platform')
            ->where('status', 'pending')
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->selectRaw('
                SUM(amount) as total_amount,
                COUNT(DISTINCT order_id) as total_orders,
                SUM((SELECT base_amount FROM orders WHERE orders.id = commissions.order_id)) as total_volume
            ')
            ->first();

        if (!$commissions->total_amount || $commissions->total_amount <= 0) {
            return back()->withErrors([
                'error' => 'No hay comisiones para este período.'
            ]);
        }

        // Obtener IDs de las comisiones pendientes del período
        $commissionIds = Commission::where('exchange_house_id', $validated['exchange_house_id'])
            ->where('type', 'platform')
            ->where('status', 'pending')
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->pluck('id');

        // Crear solicitud
        $paymentRequest = CommissionPaymentRequest::create([
            'exchange_house_id' => $validated['exchange_house_id'],
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'total_commissions' => $commissions->total_amount,
            'total_orders' => $commissions->total_orders,
            'total_volume' => $commissions->total_volume ?? 0,
            'status' => 'pending',
        ]);

        // Asociar las comisiones específicas a esta solicitud
        $paymentRequest->commissions()->attach($commissionIds);

        return back()->with('success', 'Solicitud de pago generada exitosamente.');
    }

    /**
     * Casa de cambio envía información de pago
     */
    public function sendPaymentInfo(Request $request, CommissionPaymentRequest $paymentRequest)
    {
        $user = $request->user();
        
        // Verificar permisos
        if (!$user->isExchangeHouse() && !$user->isOperator()) {
            abort(403);
        }

        if ($user->exchange_house_id !== $paymentRequest->exchange_house_id) {
            abort(403, 'No tienes permiso para modificar esta solicitud.');
        }

        if (!$paymentRequest->canSendPaymentInfo()) {
            return back()->withErrors([
                'error' => 'Esta solicitud no puede ser modificada.'
            ]);
        }

        $validated = $request->validate([
            'payment_method' => 'required|string|max:255',
            'payment_reference' => 'required|string|max:255',
            'payment_proof' => 'nullable|string',
            'payment_notes' => 'nullable|string',
        ]);

        $paymentRequest->update([
            'payment_method' => $validated['payment_method'],
            'payment_reference' => $validated['payment_reference'],
            'payment_proof' => $validated['payment_proof'] ?? null,
            'payment_notes' => $validated['payment_notes'] ?? null,
            'payment_sent_at' => now(),
            'status' => 'payment_info_sent',
        ]);

        return back()->with('success', 'Información de pago enviada exitosamente. El administrador la revisará pronto.');
    }

    /**
     * Super Admin confirma el pago
     */
    public function confirmPayment(Request $request, CommissionPaymentRequest $paymentRequest)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        if (!$paymentRequest->canConfirmPayment()) {
            return back()->withErrors([
                'error' => 'Esta solicitud no puede ser confirmada.'
            ]);
        }

        $validated = $request->validate([
            'admin_notes' => 'nullable|string',
        ]);

        $paymentRequest->update([
            'status' => 'paid',
            'confirmed_by' => $user->id,
            'confirmed_at' => now(),
            'admin_notes' => $validated['admin_notes'] ?? null,
        ]);

        // Marcar solo las comisiones asociadas a esta solicitud como pagadas
        $commissionIds = $paymentRequest->commissions()->pluck('commissions.id');
        Commission::whereIn('id', $commissionIds)
            ->update(['status' => 'paid']);

        return back()->with('success', 'Pago confirmado exitosamente.');
    }

    /**
     * Super Admin rechaza el pago
     */
    public function rejectPayment(Request $request, CommissionPaymentRequest $paymentRequest)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }

        if (!$paymentRequest->canConfirmPayment()) {
            return back()->withErrors([
                'error' => 'Esta solicitud no puede ser rechazada.'
            ]);
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        $paymentRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'rejected_at' => now(),
        ]);

        return back()->with('success', 'Pago rechazado. La casa de cambio puede enviar nueva información.');
    }

    /**
     * Ver detalle de una solicitud (para operador)
     */
    public function myRequestDetail(Request $request, CommissionPaymentRequest $paymentRequest)
    {
        $user = $request->user();
        
        // Verificar permisos
        if (!$user->isExchangeHouse() && !$user->isOperator()) {
            abort(403);
        }

        if ($user->exchange_house_id !== $paymentRequest->exchange_house_id) {
            abort(403, 'No tienes permiso para ver esta solicitud.');
        }

        // Obtener comisiones directamente vinculadas a esta solicitud
        $commissions = $paymentRequest->commissions()
            ->with(['order' => function($query) {
                $query->select('id', 'order_number', 'base_amount', 'quote_amount', 'currency_pair_id', 'customer_id', 'created_at')
                    ->with(['currencyPair:id,base_currency,quote_currency', 'customer:id,name,email']);
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return Inertia::render('ExchangeHouse/CommissionPaymentRequestDetail', [
            'paymentRequest' => $paymentRequest,
            'commissions' => $commissions,
        ]);
    }

    /**
     * Ver detalle de una solicitud (para admin)
     */
    public function show(Request $request, CommissionPaymentRequest $paymentRequest)
    {
        $user = $request->user();
        
        // Verificar permisos
        if (!$user->isSuperAdmin() && $user->exchange_house_id !== $paymentRequest->exchange_house_id) {
            abort(403);
        }

        $paymentRequest->load(['exchangeHouse', 'confirmedBy']);

        // Obtener comisiones directamente vinculadas a esta solicitud
        $commissions = $paymentRequest->commissions()
            ->with(['order' => function($query) {
                $query->select('id', 'order_number', 'base_amount', 'quote_amount', 'currency_pair_id', 'customer_id', 'created_at')
                    ->with(['currencyPair:id,base_currency,quote_currency', 'customer:id,name,email']);
            }])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return Inertia::render('Admin/CommissionPaymentRequestDetail', [
            'paymentRequest' => $paymentRequest,
            'commissions' => $commissions,
        ]);
    }
}
