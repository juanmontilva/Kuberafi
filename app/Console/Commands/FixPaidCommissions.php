<?php

namespace App\Console\Commands;

use App\Models\CommissionPayment;
use App\Models\Commission;
use Illuminate\Console\Command;

class FixPaidCommissions extends Command
{
    protected $signature = 'commissions:fix-paid';

    protected $description = 'Corrige comisiones que deberían estar marcadas como pagadas según los payment requests';

    public function handle()
    {
        $this->info('🔧 Buscando solicitudes de pago completadas...');

        // Obtener todas las solicitudes pagadas
        $paidRequests = CommissionPayment::where('status', 'paid')
            ->whereNotNull('period_start')
            ->whereNotNull('period_end')
            ->get();

        if ($paidRequests->isEmpty()) {
            $this->info('✅ No hay solicitudes pagadas que procesar');
            return 0;
        }

        $this->info("📋 Encontradas {$paidRequests->count()} solicitud(es) pagada(s)");
        
        $totalFixed = 0;

        foreach ($paidRequests as $request) {
            $this->line("\n🏦 Casa de Cambio ID: {$request->exchange_house_id}");
            $this->line("   Período: {$request->period_start} → {$request->period_end}");
            $this->line("   Monto: \${$request->total_commissions}");

            // Contar comisiones pendientes en este período
            $pendingCount = Commission::where('exchange_house_id', $request->exchange_house_id)
                ->where('type', 'platform')
                ->where('status', 'pending')
                ->whereBetween('created_at', [$request->period_start, $request->period_end])
                ->count();

            if ($pendingCount === 0) {
                $this->line("   ✅ Sin comisiones pendientes en este período");
                continue;
            }

            $this->warn("   ⚠️  Encontradas {$pendingCount} comisiones incorrectas (deberían estar 'paid')");

            // Actualizar
            $updated = Commission::where('exchange_house_id', $request->exchange_house_id)
                ->where('type', 'platform')
                ->where('status', 'pending')
                ->whereBetween('created_at', [$request->period_start, $request->period_end])
                ->update([
                    'status' => 'paid',
                    'paid_at' => $request->paid_at ?? now(),
                ]);

            $this->info("   ✅ Actualizadas {$updated} comisiones");
            $totalFixed += $updated;
        }

        $this->newLine();
        $this->info("🎉 Proceso completado: {$totalFixed} comisiones actualizadas");

        return 0;
    }
}
