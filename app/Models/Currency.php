<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    protected $fillable = [
        'code',
        'name',
        'symbol',
        'decimals',
        'is_active',
    ];

    protected $casts = [
        'decimals' => 'integer',
        'is_active' => 'boolean',
    ];

    // Scope para monedas activas
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
