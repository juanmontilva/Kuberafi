<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ExchangeHouseCurrencyPair extends Pivot
{
    protected $table = 'exchange_house_currency_pair';
    
    protected $fillable = [
        'exchange_house_id',
        'currency_pair_id',
        'margin_percent',
        'commission_model',
        'commission_percent',
        'buy_rate',
        'sell_rate',
        'min_amount',
        'max_amount',
        'is_active',
    ];

    protected $casts = [
        'margin_percent' => 'decimal:2',
        'commission_percent' => 'decimal:2',
        'buy_rate' => 'decimal:6',
        'sell_rate' => 'decimal:6',
        'min_amount' => 'decimal:2',
        'max_amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function currencyPair()
    {
        return $this->belongsTo(CurrencyPair::class);
    }

    public function exchangeHouse()
    {
        return $this->belongsTo(ExchangeHouse::class);
    }

    /**
     * Calcular cuánto paga el cliente según el modelo de comisión
     * 
     * @param float $baseAmount Monto en moneda base
     * @param string $direction 'buy' (cliente compra) o 'sell' (cliente vende)
     * @return array
     */
    public function calculateOrder($baseAmount, $direction = 'buy')
    {
        switch ($this->commission_model) {
            case 'percentage':
                return $this->calculateWithPercentage($baseAmount);
                
            case 'spread':
                return $this->calculateWithSpread($baseAmount, $direction);
                
            case 'mixed':
                return $this->calculateWithMixed($baseAmount, $direction);
                
            default:
                return $this->calculateWithPercentage($baseAmount);
        }
    }

    /**
     * Modelo: Porcentaje Fijo
     * Cliente paga comisión % sobre el monto
     */
    private function calculateWithPercentage($baseAmount)
    {
        $currencyPair = $this->currencyPair;
        $rate = $currencyPair->current_rate;
        
        // Calcular comisión
        $commissionAmount = $baseAmount * ($this->commission_percent / 100);
        
        // Monto neto después de comisión
        $netAmount = $baseAmount - $commissionAmount;
        
        // Convertir a moneda cotizada
        if ($currencyPair->calculation_type === 'divide') {
            $quoteAmount = $netAmount / $rate;
        } else {
            $quoteAmount = $netAmount * $rate;
        }
        
        return [
            'quote_amount' => $quoteAmount,
            'commission_amount' => $commissionAmount,
            'profit' => $commissionAmount,
            'rate_applied' => $rate,
            'commission_model' => 'percentage',
            'buy_rate' => null,
            'sell_rate' => null,
            'spread_profit' => 0,
        ];
    }

    /**
     * Modelo: Spread (Compra/Venta)
     * Ganancia por diferencia de tasas
     */
    private function calculateWithSpread($baseAmount, $direction)
    {
        // Determinar qué tasa usar
        $rateToClient = $direction === 'buy' ? $this->sell_rate : $this->buy_rate;
        $costRate = $direction === 'buy' ? $this->buy_rate : $this->sell_rate;
        
        // Calcular monto en moneda cotizada
        $quoteAmount = $baseAmount * $rateToClient;
        
        // Calcular costo y ganancia
        $cost = $baseAmount * $costRate;
        $spreadProfit = abs($quoteAmount - $cost);
        
        return [
            'quote_amount' => $quoteAmount,
            'commission_amount' => 0, // No hay comisión %, solo spread
            'profit' => $spreadProfit,
            'rate_applied' => $rateToClient,
            'commission_model' => 'spread',
            'buy_rate' => $this->buy_rate,
            'sell_rate' => $this->sell_rate,
            'spread_profit' => $spreadProfit,
        ];
    }

    /**
     * Modelo: Mixto (Spread + Porcentaje)
     * Spread sobre monto completo + comisión % adicional descontada del quote
     */
    private function calculateWithMixed($baseAmount, $direction)
    {
        $rateToClient = $direction === 'buy' ? $this->sell_rate : $this->buy_rate;
        $costRate = $direction === 'buy' ? $this->buy_rate : $this->sell_rate;
        
        // Cambiar TODO el monto a tasa de venta
        $quoteAmount = $baseAmount * $rateToClient;
        
        // Calcular ganancia por spread (sobre monto completo)
        $cost = $baseAmount * $costRate;
        $spreadProfit = abs($quoteAmount - $cost);
        
        // Comisión % adicional (descontada del quote)
        $commissionAmount = $baseAmount * ($this->commission_percent / 100);
        $commissionInQuote = $commissionAmount * $rateToClient;
        
        // Cliente recibe quote menos comisión
        $finalQuoteAmount = $quoteAmount - $commissionInQuote;
        
        // Ganancia total = spread + comisión
        $totalProfit = $spreadProfit + $commissionInQuote;
        
        return [
            'quote_amount' => $finalQuoteAmount,
            'commission_amount' => $commissionAmount,
            'profit' => $totalProfit,
            'rate_applied' => $rateToClient,
            'commission_model' => 'mixed',
            'buy_rate' => $this->buy_rate,
            'sell_rate' => $this->sell_rate,
            'spread_profit' => $spreadProfit,
        ];
    }

    /**
     * Obtener el spread en puntos
     */
    public function getSpreadAttribute()
    {
        if (!$this->sell_rate || !$this->buy_rate) {
            return 0;
        }
        
        return $this->sell_rate - $this->buy_rate;
    }

    /**
     * Obtener el spread en porcentaje
     */
    public function getSpreadPercentAttribute()
    {
        if (!$this->buy_rate || $this->buy_rate == 0) {
            return 0;
        }
        
        return (($this->sell_rate - $this->buy_rate) / $this->buy_rate) * 100;
    }
}
