<?php

namespace App\Modules\Analytics\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Analytics\Services\AnalyticsService;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(
        private AnalyticsService $analyticsService
    ) {}

    /**
     * Evolución de tasas de cambio por par (últimos 30 días)
     */
    public function currencyPairTrends(Request $request)
    {
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;
        $days = $request->input('days', 30);

        $trends = $this->analyticsService->getCurrencyPairTrends($exchangeHouseId, $days);

        return response()->json($trends);
    }

    /**
     * Heatmap de operaciones por hora y día de la semana
     */
    public function activityHeatmap(Request $request)
    {
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;
        $days = $request->input('days', 30);

        $heatmap = $this->analyticsService->getActivityHeatmap($exchangeHouseId, $days);

        return response()->json($heatmap);
    }

    /**
     * Análisis de márgenes por par de divisa
     */
    public function marginAnalysis(Request $request)
    {
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;

        $marginData = $this->analyticsService->getMarginAnalysis($exchangeHouseId);

        return response()->json($marginData);
    }

    /**
     * Proyección de liquidez (basado en tendencia de los últimos 7 días)
     */
    public function liquidityForecast(Request $request)
    {
        $user = $request->user();
        $exchangeHouse = $user->exchangeHouse;

        $forecast = $this->analyticsService->getLiquidityForecast($exchangeHouse);

        return response()->json($forecast);
    }

    /**
     * Comparación de períodos (mes actual vs mes anterior)
     */
    public function periodComparison(Request $request)
    {
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;

        $comparison = $this->analyticsService->getPeriodComparison($exchangeHouseId);

        return response()->json($comparison);
    }

    /**
     * Análisis por método de pago
     */
    public function paymentMethodAnalysis(Request $request)
    {
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;

        $paymentStats = $this->analyticsService->getPaymentMethodAnalysis($exchangeHouseId);

        return response()->json($paymentStats);
    }

    /**
     * Análisis de velocidad de procesamiento
     */
    public function processingSpeed(Request $request)
    {
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;

        $speedStats = $this->analyticsService->getProcessingSpeed($exchangeHouseId);

        return response()->json($speedStats);
    }

    /**
     * Top clientes con análisis de comportamiento
     */
    public function topCustomersAnalysis(Request $request)
    {
        $user = $request->user();
        $exchangeHouseId = $user->exchange_house_id;

        $topCustomers = $this->analyticsService->getTopCustomersAnalysis($exchangeHouseId);

        return response()->json($topCustomers);
    }
}
