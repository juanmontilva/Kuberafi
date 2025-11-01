<?php

namespace App\Console\Commands;

use App\Models\CommissionPayment;
use Illuminate\Console\Command;

class CleanInvalidPaymentRequests extends Command
{
    protected $signature = 'commissions:clean-invalid';

    protected $description = 'Elimina solicitudes de pago inválidas (monto $0, períodos incorrectos, etc.)';

    public function handle()
    {
        $this->info('🧹 Limpiando solicitudes de pago inválidas...');
        
        $totalCleaned = 0;

        // 1. Eliminar solicitudes con monto $0 o negativo
        $this->line("\n1️⃣ Buscando solicitudes con monto $0 o negativo...");
        $zeroAmount = CommissionPayment::where('status', 'pending')
            ->where('total_commissions', '<=', 0)
            ->count();
        
        if ($zeroAmount > 0) {
            CommissionPayment::where('status', 'pending')
                ->where('total_commissions', '<=', 0)
                ->delete();
            $this->warn("   ❌ Eliminadas {$zeroAmount} solicitudes con monto $0");
            $totalCleaned += $zeroAmount;
        } else {
            $this->info("   ✅ Sin solicitudes con monto $0");
        }

        // 2. Eliminar solicitudes con período inválido (period_end antes de period_start)
        $this->line("\n2️⃣ Buscando solicitudes con período inválido...");
        $invalidPeriod = CommissionPayment::where('status', 'pending')
            ->whereNotNull('period_start')
            ->whereNotNull('period_end')
            ->whereRaw('period_end < period_start')
            ->count();
        
        if ($invalidPeriod > 0) {
            CommissionPayment::where('status', 'pending')
                ->whereNotNull('period_start')
                ->whereNotNull('period_end')
                ->whereRaw('period_end < period_start')
                ->delete();
            $this->warn("   ❌ Eliminadas {$invalidPeriod} solicitudes con período inválido");
            $totalCleaned += $invalidPeriod;
        } else {
            $this->info("   ✅ Sin solicitudes con período inválido");
        }

        // 3. Eliminar solicitudes muy antiguas (más de 6 meses) que sigan pendientes
        $this->line("\n3️⃣ Buscando solicitudes antiguas...");
        $oldRequests = CommissionPayment::where('status', 'pending')
            ->where('created_at', '<', now()->subMonths(6))
            ->count();
        
        if ($oldRequests > 0 && $this->confirm("   ⚠️  Encontradas {$oldRequests} solicitudes de hace más de 6 meses. ¿Eliminar?", true)) {
            CommissionPayment::where('status', 'pending')
                ->where('created_at', '<', now()->subMonths(6))
                ->delete();
            $this->warn("   ❌ Eliminadas {$oldRequests} solicitudes antiguas");
            $totalCleaned += $oldRequests;
        } else {
            $this->info("   ✅ Sin solicitudes antiguas o cancelado");
        }

        $this->newLine();
        
        if ($totalCleaned > 0) {
            $this->info("🎉 Limpieza completada: {$totalCleaned} solicitudes eliminadas");
        } else {
            $this->info("✨ Sistema limpio: No se encontraron solicitudes inválidas");
        }

        // Mostrar resumen de solicitudes actuales
        $this->newLine();
        $this->info("📊 Solicitudes actuales:");
        $pending = CommissionPayment::where('status', 'pending')->count();
        $this->line("   Pendientes: {$pending}");

        return 0;
    }
}
