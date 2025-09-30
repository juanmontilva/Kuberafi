<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupportTicket extends Model
{
    protected $fillable = [
        'ticket_number',
        'exchange_house_id',
        'created_by_user_id',
        'assigned_to_user_id',
        'subject',
        'description',
        'type',
        'priority',
        'status',
        'attachments',
        'messages_count',
        'first_response_at',
        'resolved_at',
        'closed_at',
        'rating',
        'rating_comment',
    ];

    protected $casts = [
        'attachments' => 'array',
        'first_response_at' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($ticket) {
            if (!$ticket->ticket_number) {
                $ticket->ticket_number = 'TKT-' . str_pad(
                    static::max('id') + 1,
                    5,
                    '0',
                    STR_PAD_LEFT
                );
            }
        });
    }

    public function exchangeHouse(): BelongsTo
    {
        return $this->belongsTo(ExchangeHouse::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(TicketMessage::class);
    }

    /**
     * Asignar ticket a un admin
     */
    public function assignTo(User $user): void
    {
        $this->update(['assigned_to_user_id' => $user->id]);
    }

    /**
     * Marcar como resuelto
     */
    public function markAsResolved(): void
    {
        $this->update([
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);
    }

    /**
     * Cerrar ticket
     */
    public function close(?int $rating = null, ?string $comment = null): void
    {
        $this->update([
            'status' => 'closed',
            'closed_at' => now(),
            'rating' => $rating,
            'rating_comment' => $comment,
        ]);
    }

    /**
     * Verificar si necesita respuesta
     */
    public function needsResponse(): bool
    {
        return $this->status === 'open' || $this->status === 'waiting_response';
    }

    /**
     * Scope para tickets abiertos
     */
    public function scopeOpen($query)
    {
        return $query->whereIn('status', ['open', 'in_progress', 'waiting_response']);
    }

    /**
     * Scope por prioridad
     */
    public function scopeUrgent($query)
    {
        return $query->where('priority', 'urgent');
    }
}
