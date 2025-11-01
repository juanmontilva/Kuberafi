<?php

namespace App\Console\Commands;

use App\Models\CommissionPayment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanDuplicatePaymentRequests extends Command
{
    protected $signature = 'commissions:clean-duplicates {--dry-run : Run without making changes}';

    protected $description = 'Limpia solicitudes de pago duplicadas manteniendo la más reciente o con más progreso';

    public function handle()
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->warn('🔍 MODO DRY-RUN: No se harán cambios en la base de datos');
        }

        $this->info('Buscando solicitudes duplicadas...');

        // Agrupar por casa de cambio y buscar solicitudes con períodos solapados
        $duplicates = CommissionPayment::select('exchange_house_id', 'period_start', 'period_end')
            ->whereIn('status', ['pending', 'approved', 'payment_info_sent'])
            ->groupBy('exchange_house_id', 'period_start', 'period_end')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        if ($duplicates->isEmpty()) {
            $this->info('✅ No se encontraron duplicados');
            return 0;
        }

        $this->warn("⚠️  Encontrados {$duplicates->count()} grupo(s) de duplicados");

        $totalDeleted = 0;

        foreach ($duplicates as $duplicate) {
            $payments = CommissionPayment::where('exchange_house_id', $duplicate->exchange_house_id)
                ->where('period_start', $duplicate->period_start)
                ->where('period_end', $duplicate->period_end)
                ->whereIn('status', ['pending', 'approved', 'payment_info_sent'])
                ->orderByRaw("CASE 
                    WHEN status = 'payment_info_sent' THEN 1
                    WHEN status = 'approved' THEN 2
                    WHEN status = 'pending' THEN 3
                    ELSE 4
                END")
                ->orderBy('updated_at', 'desc')
                ->get();

            if ($payments->count() <= 1) {
                continue;
            }

            // Mantener el primero (con más progreso o más reciente)
            $keep = $payments->first();
            $toDelete = $payments->skip(1);

            $this->line("\n📋 Casa de Cambio ID: {$duplicate->exchange_house_id}");
            $this->line("   Período: {$duplicate->period_start} → {$duplicate->period_end}");
            $this->line("   ✅ Mantener: ID #{$keep->id} (Status: {$keep->status->value}, Actualizado: {$keep->updated_at})");

            foreach ($toDelete as $payment) {
                $this->line("   ❌ Eliminar: ID #{$payment->id} (Status: {$payment->status->value}, Actualizado: {$payment->updated_at})");
                
                if (!$dryRun) {
                    $payment->delete(); // Soft delete
                    $totalDeleted++;
                }
            }
        }

        $this->newLine();

        if ($dryRun) {
            $this->info("🔍 Se eliminarían {$totalDeleted} solicitud(es) duplicada(s)");
            $this->info("💡 Ejecuta sin --dry-run para aplicar los cambios");
        } else {
            $this->info("✅ Se eliminaron {$totalDeleted} solicitud(es) duplicada(s)");
        }

        return 0;
    }
}
