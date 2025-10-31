<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'exchange_house_id',
        'currency_pair_id',
        'payment_method_id',
        'payment_method_in_id',
        'payment_method_out_id',
        'payment_method_selection_mode',
        'user_id',
        'customer_id',
        'base_amount',
        'quote_amount',
        'market_rate',
        'applied_rate',
        'expected_margin_percent',
        'actual_margin_percent',
        'house_commission_percent',
        'house_commission_amount',
        'platform_commission',
        'exchange_commission',
        'net_amount',
        'status',
        'completed_at',
        'notes',
        'cancellation_reason',
        'cancelled_by',
        'cancelled_at',
    ];

    protected $casts = [
        'base_amount' => 'decimal:2',
        'quote_amount' => 'decimal:2',
        'market_rate' => 'decimal:6',
        'applied_rate' => 'decimal:6',
        'expected_margin_percent' => 'decimal:2',
        'actual_margin_percent' => 'decimal:2',
        'house_commission_percent' => 'decimal:2',
        'house_commission_amount' => 'decimal:2',
        'platform_commission' => 'decimal:2',
        'exchange_commission' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function exchangeHouse(): BelongsTo
    {
        return $this->belongsTo(ExchangeHouse::class);
    }

    public function currencyPair(): BelongsTo
    {
        return $this->belongsTo(CurrencyPair::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function paymentMethodIn(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_in_id');
    }

    public function paymentMethodOut(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_out_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(Commission::class);
    }

    public function calculateCommissions()
    {
        // Validar que tenemos los datos necesarios
        if (!$this->base_amount || !$this->house_commission_percent) {
            throw new \Exception('Faltan datos para calcular comisiones');
        }

        // Comisión total de la casa (ej: 5% = $50 de $1000)
        $houseCommissionAmount = $this->base_amount * ($this->house_commission_percent / 100);
        
        // Verificar si la casa tiene promoción de 0 comisiones
        $hasPromo = $this->exchangeHouse && $this->exchangeHouse->zero_commission_promo;
        
        if ($hasPromo) {
            // Con promoción: la casa no paga nada a la plataforma
            $platformCommission = 0;
            $exchangeCommission = $houseCommissionAmount; // La casa se queda con todo
        } else {
            // Sin promoción: cálculo normal
            $platformRate = SystemSetting::getPlatformCommissionRate();
            
            if (!$platformRate || $platformRate <= 0) {
                throw new \Exception('Tasa de comisión de plataforma no configurada');
            }
            
            $platformCommission = $this->base_amount * ($platformRate / 100);
            $exchangeCommission = $houseCommissionAmount - $platformCommission;
        }
        
        // Monto neto que recibe el cliente
        $netAmount = $this->base_amount - $houseCommissionAmount;

        $this->update([
            'house_commission_amount' => $houseCommissionAmount,
            'platform_commission' => $platformCommission,
            'exchange_commission' => $exchangeCommission,
            'net_amount' => $netAmount,
        ]);

        return [
            'house_total' => $houseCommissionAmount,
            'platform' => $platformCommission,
            'exchange' => $exchangeCommission,
            'exchange_net' => $exchangeCommission,
            'client_receives' => $netAmount,
            'has_promo' => $hasPromo,
        ];
    }

    public function getActualMarginAttribute()
    {
        if (!$this->market_rate || !$this->applied_rate) {
            return 0;
        }

        return (($this->applied_rate - $this->market_rate) / $this->market_rate) * 100;
    }

    // Query Scopes para optimización
    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeThisMonth(Builder $query): Builder
    {
        return $query->where('created_at', '>=', now()->startOfMonth());
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeForExchangeHouse(Builder $query, int $exchangeHouseId): Builder
    {
        return $query->where('exchange_house_id', $exchangeHouseId);
    }

    public function scopeWithRelations(Builder $query): Builder
    {
        return $query->with(['exchangeHouse', 'currencyPair', 'user', 'customer']);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            $order->order_number = 'KBF-' . strtoupper(uniqid());
        });
    }
}
