<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\Commission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessOrderCommissions implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 60;
    public $tries = 3;

    public function __construct(
        public int $orderId
    ) {}

    /**
     * Procesa las comisiones de una orden de forma asíncrona
     */
    public function handle(): void
    {
        try {
            DB::transaction(function () {
                $order = Order::with('exchangeHouse')->findOrFail($this->orderId);
                
                // Solo procesar si la orden está pendiente
                if ($order->status !== 'pending') {
                    Log::info("Order {$this->orderId} already processed");
                    return;
                }

                // Crear comisiones
                Commission::createFromOrder($order);
                
                Log::info("Commissions processed for order {$this->orderId}");
            });
        } catch (\Exception $e) {
            Log::error("Failed to process commissions for order {$this->orderId}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle job failure
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("ProcessOrderCommissions job failed for order {$this->orderId}", [
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}
