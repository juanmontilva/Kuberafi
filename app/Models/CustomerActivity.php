<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerActivity extends Model
{
    protected $fillable = [
        'customer_id',
        'user_id',
        'type',
        'title',
        'description',
        'metadata',
        'requires_followup',
        'followup_date',
    ];

    protected $casts = [
        'metadata' => 'array',
        'requires_followup' => 'boolean',
        'followup_date' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
