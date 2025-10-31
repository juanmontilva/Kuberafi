<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'link',
        'related_type',
        'related_id',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Marcar como leída
     */
    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }
    }

    /**
     * Crear notificación de ticket creado
     */
    public static function ticketCreated(SupportTicket $ticket): self
    {
        return self::create([
            'user_id' => $ticket->created_by_user_id,
            'type' => 'ticket_created',
            'title' => 'Ticket Creado',
            'message' => "Tu ticket #{$ticket->ticket_number} ha sido creado. Pronto serás contactado por soporte.",
            'link' => "/tickets/{$ticket->id}",
            'related_type' => 'SupportTicket',
            'related_id' => $ticket->id,
        ]);
    }

    /**
     * Crear notificación de respuesta en ticket
     */
    public static function ticketResponded(SupportTicket $ticket, User $responder): self
    {
        // Notificar al creador del ticket (si no es quien respondió)
        if ($ticket->created_by_user_id !== $responder->id) {
            return self::create([
                'user_id' => $ticket->created_by_user_id,
                'type' => 'ticket_responded',
                'title' => 'Nueva Respuesta en tu Ticket',
                'message' => "{$responder->name} ha respondido tu ticket #{$ticket->ticket_number}",
                'link' => "/tickets/{$ticket->id}",
                'related_type' => 'SupportTicket',
                'related_id' => $ticket->id,
            ]);
        }
        
        return new self();
    }

    /**
     * Notificar a admins sobre nuevo ticket
     */
    public static function notifyAdminsNewTicket(SupportTicket $ticket): void
    {
        $admins = User::where('role', 'super_admin')->get();
        
        foreach ($admins as $admin) {
            self::create([
                'user_id' => $admin->id,
                'type' => 'ticket_created',
                'title' => 'Nuevo Ticket de Soporte',
                'message' => "{$ticket->createdBy->name} ha creado un ticket: {$ticket->subject}",
                'link' => "/tickets/{$ticket->id}",
                'related_type' => 'SupportTicket',
                'related_id' => $ticket->id,
            ]);
        }
    }

    /**
     * Scope para no leídas
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope para un usuario
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
