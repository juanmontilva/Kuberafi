<?php

namespace App\Console\Commands;

use App\Models\OperatorCashBalance;
use App\Models\User;
use App\Models\PaymentMethod;
use Illuminate\Console\Command;

class DiagnoseCashBalances extends Command
{
    protected $signature = 'cash:diagnose {currency?}';
    protected $description = 'Diagnosticar saldos de caja por moneda';

    public function handle()
    {
        $currency = $this->argument('currency');
        
        $this->info('🔍 Diagnóstico de Saldos de Caja');
        $this->newLine();
        
        $query = OperatorCashBalance::with(['operator', 'paymentMethod']);
        
        if ($currency) {
            $query->where('currency', strtoupper($currency));
            $this->info("Filtrando por moneda: " . strtoupper($currency));
        }
        
        $balances = $query->orderBy('balance', 'desc')->get();
        
        if ($balances->isEmpty()) {
            $this->warn('No se encontraron saldos registrados.');
            return 0;
        }
        
        $this->info("Total de registros: {$balances->count()}");
        $this->newLine();
        
        $headers = ['ID', 'Operador', 'Email', 'Método de Pago', 'Moneda', 'Saldo', 'Creado'];
        $rows = [];
        
        foreach ($balances as $balance) {
            $operator = $balance->operator;
            $method = $balance->paymentMethod;
            
            $rows[] = [
                $balance->id,
                $operator ? $operator->name : '❌ Usuario eliminado',
                $operator ? $operator->email : 'N/A',
                $method ? $method->name : '❌ Método eliminado',
                $balance->currency,
                number_format($balance->balance, 2),
                $balance->created_at->format('Y-m-d H:i'),
            ];
        }
        
        $this->table($headers, $rows);
        
        // Resumen por moneda
        $this->newLine();
        $this->info('📊 Resumen por Moneda:');
        $summary = $balances->groupBy('currency')->map(function ($group) {
            return [
                'total' => $group->sum('balance'),
                'count' => $group->count(),
            ];
        });
        
        foreach ($summary as $curr => $data) {
            $this->line("  {$curr}: " . number_format($data['total'], 2) . " ({$data['count']} registros)");
        }
        
        // Detectar problemas
        $this->newLine();
        $this->info('⚠️  Problemas Detectados:');
        
        $orphanBalances = $balances->filter(fn($b) => !$b->operator);
        if ($orphanBalances->isNotEmpty()) {
            $this->warn("  • {$orphanBalances->count()} saldos sin operador asociado");
        }
        
        $orphanMethods = $balances->filter(fn($b) => !$b->paymentMethod);
        if ($orphanMethods->isNotEmpty()) {
            $this->warn("  • {$orphanMethods->count()} saldos sin método de pago asociado");
        }
        
        if ($orphanBalances->isEmpty() && $orphanMethods->isEmpty()) {
            $this->info('  ✅ No se detectaron problemas');
        }
        
        return 0;
    }
}
