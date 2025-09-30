<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ExchangeHouse extends Model
{
    protected $fillable = [
        'name',
        'business_name',
        'tax_id',
        'email',
        'phone',
        'address',
        'commission_rate',
        'is_active',
        'allowed_currencies',
        'daily_limit',
    ];

    protected $casts = [
        'allowed_currencies' => 'array',
        'commission_rate' => 'decimal:4',
        'daily_limit' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(Commission::class);
    }

    public function paymentMethods(): HasMany
    {
        return $this->hasMany(PaymentMethod::class);
    }

    public function commissionPayments(): HasMany
    {
        return $this->hasMany(CommissionPayment::class);
    }

    public function currencyPairs(): BelongsToMany
    {
        return $this->belongsToMany(CurrencyPair::class, 'exchange_house_currency_pair')
            ->withPivot(['margin_percent', 'min_amount', 'max_amount', 'is_active'])
            ->withTimestamps();
    }

    public function activeCurrencyPairs(): BelongsToMany
    {
        return $this->currencyPairs()->wherePivot('is_active', true);
    }

    public function paymentSchedule()
    {
        return $this->hasOne(PaymentSchedule::class);
    }

    public function getTotalOrdersToday()
    {
        return $this->orders()
            ->whereDate('created_at', today())
            ->sum('base_amount');
    }

    public function getTotalCommissionsThisMonth()
    {
        return $this->commissions()
            ->where('type', 'exchange_house')
            ->whereMonth('created_at', now()->month)
            ->sum('amount');
    }
}
