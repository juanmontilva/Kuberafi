<?php

namespace App\Modules\Orders\Services;

use App\Models\Order;
use App\Models\ExchangeHouse;
use App\Models\SystemSetting;

class CommissionCalculator
{
    /**
     * Calcular comisiones para una nueva orden
     */
    public function calculate($pivotData, float $baseAmount, string $direction, ExchangeHouse $exchangeHouse): array
    {
        $calculation = $pivotData->pivot->calculateOrder($baseAmount, $direction);
        
        $commissionModel = $calculation['commission_model'];
        $houseCommissionAmount = $calculation['commission_amount'];
        $spreadProfit = $calculation['spread_profit'];
        
        // Calcular ganancia total según modelo
        $totalProfitInBase = $this->calculateTotalProfit(
            $commissionModel,
            $houseCommissionAmount,
            $spreadProfit,
            $calculation['buy_rate'] ?? 1
        );
        
        // Calcular comisión de plataforma
        $platformCommission = $this->calculatePlatformCommission($exchangeHouse, $baseAmount);
        $exchangeCommission = $totalProfitInBase - $platformCommission;
        
        // Calcular margen
        $marginPercent = $baseAmount > 0 ? ($totalProfitInBase / $baseAmount) * 100 : 0;
        
        return [
            'quote_amount' => $calculation['quote_amount'],
            'rate_applied' => $calculation['rate_applied'],
            'commission_model' => $commissionModel,
            'commission_amount' => $houseCommissionAmount,
            'commission_percent' => $pivotData->pivot->commission_percent ?? 0,
            'buy_rate' => $calculation['buy_rate'] ?? null,
            'sell_rate' => $calculation['sell_rate'] ?? null,
            'spread_profit' => $spreadProfit,
            'platform_commission' => $platformCommission,
            'exchange_commission' => $exchangeCommission,
            'net_amount' => $baseAmount - $houseCommissionAmount,
            'margin_percent' => $marginPercent,
            'total_profit' => $totalProfitInBase,
        ];
    }

    /**
     * Calcular comisiones reales al completar orden
     */
    public function calculateActual(Order $order, float $actualRate, float $actualQuoteAmount): array
    {
        $expectedQuoteAmount = $order->quote_amount;
        $differenceInQuote = $expectedQuoteAmount - $actualQuoteAmount;
        $differenceInBase = $differenceInQuote / $actualRate;
        
        $commissionModel = $order->commission_model ?? 'percentage';
        
        $result = match($commissionModel) {
            'percentage' => $this->calculatePercentageActual($order, $differenceInBase),
            'spread' => $this->calculateSpreadActual($order, $differenceInBase),
            'mixed' => $this->calculateMixedActual($order, $differenceInBase),
            default => $this->calculatePercentageActual($order, $differenceInBase),
        };
        
        // Calcular comisión de plataforma
        $exchangeHouse = $order->exchangeHouse;
        $platformCommission = $this->calculatePlatformCommission($exchangeHouse, (float) $order->base_amount);
        $exchangeCommission = $result['total_profit'] - $platformCommission;
        
        return [
            'house_commission' => $result['house_commission'],
            'platform_commission' => $platformCommission,
            'exchange_commission' => $exchangeCommission,
            'total_profit' => $result['total_profit'],
        ];
    }

    /**
     * Calcular ganancia total según modelo
     */
    private function calculateTotalProfit(string $model, float $commissionAmount, float $spreadProfit, float $buyRate): float
    {
        return match($model) {
            'percentage' => $commissionAmount,
            'spread' => $buyRate > 0 ? $spreadProfit / $buyRate : 0,
            'mixed' => $commissionAmount + ($buyRate > 0 ? $spreadProfit / $buyRate : 0),
            default => $commissionAmount,
        };
    }

    /**
     * Calcular comisión de plataforma
     */
    private function calculatePlatformCommission(ExchangeHouse $exchangeHouse, float $baseAmount): float
    {
        if ($exchangeHouse->zero_commission_promo) {
            return 0;
        }
        
        $platformRate = SystemSetting::getPlatformCommissionRate() / 100;
        return $baseAmount * $platformRate;
    }

    /**
     * Calcular comisión real para modelo percentage
     */
    private function calculatePercentageActual(Order $order, float $differenceInBase): array
    {
        $expectedCommission = $order->house_commission_amount;
        $realCommission = $expectedCommission + $differenceInBase;
        
        return [
            'house_commission' => $realCommission,
            'total_profit' => $realCommission,
        ];
    }

    /**
     * Calcular comisión real para modelo spread
     */
    private function calculateSpreadActual(Order $order, float $differenceInBase): array
    {
        $buyRate = (float) ($order->buy_rate ?? 1);
        $spreadProfitQuote = (float) ($order->spread_profit ?? 0);
        $spreadProfitBase = $buyRate > 0 ? $spreadProfitQuote / $buyRate : 0;
        $totalProfit = $spreadProfitBase + $differenceInBase;
        
        return [
            'house_commission' => 0,
            'total_profit' => $totalProfit,
        ];
    }

    /**
     * Calcular comisión real para modelo mixed
     */
    private function calculateMixedActual(Order $order, float $differenceInBase): array
    {
        $buyRate = (float) ($order->buy_rate ?? 1);
        $spreadProfitQuote = (float) ($order->spread_profit ?? 0);
        $spreadProfitBase = $buyRate > 0 ? $spreadProfitQuote / $buyRate : 0;
        
        $expectedCommission = $order->house_commission_amount;
        $realCommission = $expectedCommission + $differenceInBase;
        $totalProfit = $spreadProfitBase + $realCommission;
        
        return [
            'house_commission' => $realCommission,
            'total_profit' => $totalProfit,
        ];
    }
}
