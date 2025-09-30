<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketMessage extends Model
{
    protected $fillable = [
        'support_ticket_id',
        'user_id',
        'message',
        'attachments',
        'is_internal',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'attachments' => 'array',
        'is_internal' => 'boolean',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::created(function ($message) {
            // Incrementar contador de mensajes
            $message->ticket->increment('messages_count');
            
            // Si es primera respuesta del admin
            if ($message->user->isSuperAdmin() && !$message->ticket->first_response_at) {
                $message->ticket->update([
                    'first_response_at' => now(),
                    'status' => 'in_progress',
                ]);
            }
        });
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(SupportTicket::class, 'support_ticket_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Marcar como leído
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
     * Verificar si es del admin
     */
    public function isFromAdmin(): bool
    {
        return $this->user->isSuperAdmin();
    }
}
