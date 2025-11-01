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
        'commission_model',
        'buy_rate',
        'sell_rate',
        'spread_profit',
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
        'buy_rate' => 'decimal:6',
        'sell_rate' => 'decimal:6',
        'spread_profit' => 'decimal:2',
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
        // Validaciones básicas
        if (!$this->base_amount) {
            throw new \Exception('Falta base_amount para calcular comisiones');
        }

        // Cargar relación necesaria si no está cargada
        $this->loadMissing('exchangeHouse');

        $platformRate = SystemSetting::getPlatformCommissionRate(); // %
        $hasPromo = $this->exchangeHouse && $this->exchangeHouse->zero_commission_promo;

        // Inicializar variables a utilizar en todos los modelos
        $houseCommissionAmount = 0.0;           // En moneda base
        $platformCommission = 0.0;              // En moneda base
        $exchangeCommission = 0.0;              // En moneda base (ganancia neta de la casa)
        $netAmount = $this->base_amount;        // En moneda base (lo que se usa para cambiar)

        switch ($this->commission_model) {
            case 'percentage':
            default: {
                // Requiere porcentaje
                $percent = (float) ($this->house_commission_percent ?? 0);
                $houseCommissionAmount = $this->base_amount * ($percent / 100);

                // Plataforma cobra sobre el monto base (no sobre la comisión)
                $platformCommission = $hasPromo ? 0 : ($this->base_amount * ($platformRate / 100));
                $exchangeCommission = $houseCommissionAmount - $platformCommission;

                // El cliente recibe monto base menos comisión
                $netAmount = $this->base_amount - $houseCommissionAmount;
                break;
            }

            case 'spread': {
                // Ganancia por diferencia de tasas. spread_profit está en moneda cotizada.
                $spreadProfitQuote = (float) ($this->spread_profit ?? 0);
                $buyRate = (float) ($this->buy_rate ?? 0);
                $spreadProfitBase = $buyRate > 0 ? ($spreadProfitQuote / $buyRate) : 0.0;

                // En spread puro no hay comisión %
                $houseCommissionAmount = 0.0;
                $platformCommission = $hasPromo ? 0 : ($this->base_amount * ($platformRate / 100));
                $exchangeCommission = $spreadProfitBase - $platformCommission;

                // El cliente paga el monto completo (no se descuenta comisión de su monto base)
                $netAmount = $this->base_amount;
                break;
            }

            case 'mixed': {
                // Spread + Porcentaje: spread sobre monto completo + comisión % adicional
                $percent = (float) ($this->house_commission_percent ?? 0);
                $houseCommissionAmount = $this->base_amount * ($percent / 100); // En base

                // Spread sobre monto completo (no sobre neto)
                $spreadProfitQuote = (float) ($this->spread_profit ?? 0);
                $buyRate = (float) ($this->buy_rate ?? 0);
                $spreadProfitBase = $buyRate > 0 ? ($spreadProfitQuote / $buyRate) : 0.0;

                // Ganancia total = spread completo + comisión %
                $totalProfitBase = $spreadProfitBase + $houseCommissionAmount;
                $platformCommission = $hasPromo ? 0 : ($this->base_amount * ($platformRate / 100));
                $exchangeCommission = $totalProfitBase - $platformCommission;
                
                // Cliente recibe base menos comisión para efectos de registro
                $netAmount = $this->base_amount - $houseCommissionAmount;
                break;
            }
        }

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
        return $query->with([
            'exchangeHouse:id,name',
            'currencyPair:id,symbol,base_currency,quote_currency',
            'user:id,name,email',
            'customer:id,name,email,phone',
            'paymentMethodIn:id,name,currency',
            'paymentMethodOut:id,name,currency',
            'cancelledBy:id,name'
        ]);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            $order->order_number = 'KBF-' . strtoupper(uniqid());
        });
    }
}
