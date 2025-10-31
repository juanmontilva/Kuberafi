<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\TicketMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupportTicketController extends Controller
{
    /**
     * Lista de tickets
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $status = $request->get('status', 'all');
        
        $query = SupportTicket::with(['exchangeHouse', 'createdBy', 'assignedTo'])
            ->orderBy('created_at', 'desc');
        
        // Filtrar según rol
        if (!$user->isSuperAdmin()) {
            $query->where('exchange_house_id', $user->exchange_house_id);
        }
        
        // Filtrar por estado
        if ($status !== 'all') {
            if ($status === 'open') {
                $query->open();
            } else {
                $query->where('status', $status);
            }
        }
        
        $tickets = $query->paginate(20);
        
        // Estadísticas
        $statsQuery = SupportTicket::query();
        if (!$user->isSuperAdmin()) {
            $statsQuery->where('exchange_house_id', $user->exchange_house_id);
        }
        
        $stats = [
            'open' => (clone $statsQuery)->open()->count(),
            'resolved' => (clone $statsQuery)->where('status', 'resolved')->count(),
            'closed' => (clone $statsQuery)->where('status', 'closed')->count(),
            'urgent' => (clone $statsQuery)->urgent()->open()->count(),
        ];
        
        return Inertia::render('Support/Tickets', [
            'tickets' => $tickets,
            'stats' => $stats,
            'currentStatus' => $status,
        ]);
    }

    /**
     * Formulario para crear ticket
     */
    public function create(Request $request)
    {
        $user = $request->user();
        
        // Super Admin no puede crear tickets (él es quien los responde)
        if ($user->isSuperAdmin()) {
            return redirect()->route('tickets.index')
                ->with('info', 'Como administrador, tu rol es responder tickets, no crearlos.');
        }
        
        return Inertia::render('Support/CreateTicket');
    }

    /**
     * Crear nuevo ticket
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        // Super Admin no puede crear tickets
        if ($user->isSuperAdmin()) {
            return redirect()->route('tickets.index')
                ->withErrors(['error' => 'Como administrador, no puedes crear tickets.']);
        }
        
        // Prevenir duplicados: verificar si tiene tickets abiertos con el mismo asunto
        $recentTicket = SupportTicket::where('created_by_user_id', $user->id)
            ->where('subject', 'like', '%' . $request->subject . '%')
            ->whereIn('status', ['open', 'in_progress'])
            ->where('created_at', '>=', now()->subHours(24))
            ->first();
        
        if ($recentTicket) {
            return redirect()->route('tickets.show', $recentTicket)
                ->with('info', 'Ya tienes un ticket similar abierto. Por favor usa este ticket para continuar la conversación.');
        }
        
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:technical,billing,general,feature_request',
            'priority' => 'required|in:low,normal,high,urgent',
            'attachments' => 'nullable|array',
        ]);
        
        $ticket = SupportTicket::create([
            'exchange_house_id' => $user->exchange_house_id,
            'created_by_user_id' => $user->id,
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'priority' => $validated['priority'],
            'status' => 'open',
            'attachments' => $validated['attachments'] ?? [],
        ]);
        
        // Crear notificación para el usuario
        \App\Models\Notification::ticketCreated($ticket);
        
        // Notificar a todos los admins
        \App\Models\Notification::notifyAdminsNewTicket($ticket);
        
        return redirect()->route('tickets.show', $ticket)
            ->with('success', 'Ticket creado exitosamente. Pronto serás contactado por soporte.');
    }

    /**
     * Ver detalle del ticket
     */
    public function show(Request $request, SupportTicket $ticket)
    {
        $user = $request->user();
        
        // Verificar permisos
        if (!$user->isSuperAdmin() && $ticket->exchange_house_id !== $user->exchange_house_id) {
            abort(403, 'No tienes permiso para ver este ticket.');
        }
        
        $ticket->load([
            'exchangeHouse',
            'createdBy',
            'assignedTo',
            'messages' => function ($query) {
                $query->with('user')->orderBy('created_at', 'asc');
            }
        ]);
        
        // Marcar mensajes como leídos
        $ticket->messages()
            ->where('user_id', '!=', $user->id)
            ->where('is_read', false)
            ->each(function ($message) {
                $message->markAsRead();
            });
        
        return Inertia::render('Support/TicketDetail', [
            'ticket' => $ticket,
        ]);
    }

    /**
     * Agregar mensaje al ticket
     */
    public function addMessage(Request $request, SupportTicket $ticket)
    {
        $user = $request->user();
        
        // Verificar permisos
        if (!$user->isSuperAdmin() && $ticket->exchange_house_id !== $user->exchange_house_id) {
            abort(403);
        }
        
        $validated = $request->validate([
            'message' => 'required|string',
            'attachments' => 'nullable|array',
            'is_internal' => 'boolean',
        ]);
        
        $message = TicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $validated['message'],
            'attachments' => $validated['attachments'] ?? [],
            'is_internal' => $validated['is_internal'] ?? false,
        ]);
        
        // Actualizar estado del ticket
        if ($ticket->status === 'resolved') {
            $ticket->update(['status' => 'open']);
        }
        
        // Crear notificación para el otro usuario
        \App\Models\Notification::ticketResponded($ticket, $user);
        
        return back()->with('success', 'Mensaje enviado exitosamente.');
    }

    /**
     * Cambiar estado del ticket
     */
    public function updateStatus(Request $request, SupportTicket $ticket)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403, 'Solo el administrador puede cambiar el estado.');
        }
        
        $validated = $request->validate([
            'status' => 'required|in:open,in_progress,waiting_response,resolved,closed',
        ]);
        
        $ticket->update(['status' => $validated['status']]);
        
        if ($validated['status'] === 'resolved') {
            $ticket->markAsResolved();
        } elseif ($validated['status'] === 'closed') {
            $ticket->close();
        }
        
        return back()->with('success', 'Estado actualizado exitosamente.');
    }

    /**
     * Asignar ticket a un admin
     */
    public function assign(Request $request, SupportTicket $ticket)
    {
        $user = $request->user();
        
        if (!$user->isSuperAdmin()) {
            abort(403);
        }
        
        $validated = $request->validate([
            'assigned_to_user_id' => 'required|exists:users,id',
        ]);
        
        $ticket->assignTo(\App\Models\User::find($validated['assigned_to_user_id']));
        
        return back()->with('success', 'Ticket asignado exitosamente.');
    }

    /**
     * Calificar ticket (solo cuando está cerrado)
     */
    public function rate(Request $request, SupportTicket $ticket)
    {
        $user = $request->user();
        
        if ($ticket->created_by_user_id !== $user->id) {
            abort(403);
        }
        
        if ($ticket->status !== 'closed') {
            return back()->withErrors(['error' => 'Solo puedes calificar tickets cerrados.']);
        }
        
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'rating_comment' => 'nullable|string',
        ]);
        
        $ticket->update([
            'rating' => $validated['rating'],
            'rating_comment' => $validated['rating_comment'] ?? null,
        ]);
        
        return back()->with('success', 'Gracias por tu calificación.');
    }

    /**
     * Cerrar ticket
     */
    public function close(Request $request, SupportTicket $ticket)
    {
        $user = $request->user();
        
        // Solo el creador o admin pueden cerrar
        if (!$user->isSuperAdmin() && $ticket->created_by_user_id !== $user->id) {
            abort(403);
        }
        
        $ticket->close();
        
        return back()->with('success', 'Ticket cerrado exitosamente.');
    }
}
