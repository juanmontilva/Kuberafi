<?php

namespace Database\Seeders;

use App\Models\ExchangeHouse;
use App\Models\PaymentSchedule;
use App\Models\CommissionPayment;
use App\Models\Commission;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PaymentSystemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $exchangeHouses = ExchangeHouse::all();

        foreach ($exchangeHouses as $house) {
            // Crear cronograma de pagos
            $schedule = PaymentSchedule::create([
                'exchange_house_id' => $house->id,
                'frequency' => $house->id === 1 ? 'weekly' : 'monthly', // Diferentes frecuencias
                'payment_day' => $house->id === 1 ? 1 : 15, // Lunes o día 15
                'minimum_amount' => 50.00,
                'auto_generate' => true,
                'is_active' => true,
                'notification_settings' => [
                    'email_notifications' => true,
                    'days_before_due' => 3,
                ],
            ]);

            // Crear algunos pagos de ejemplo
            $commissions = Commission::where('exchange_house_id', $house->id)
                ->where('type', 'platform')
                ->get();

            if ($commissions->count() > 0) {
                $totalCommissions = $commissions->sum('amount');

                // Pago completado (semana pasada)
                CommissionPayment::create([
                    'exchange_house_id' => $house->id,
                    'total_amount' => $totalCommissions * 0.6,
                    'commission_amount' => $totalCommissions * 0.6,
                    'period_start' => Carbon::now()->subWeeks(2),
                    'period_end' => Carbon::now()->subWeek(),
                    'due_date' => Carbon::now()->subDays(3),
                    'frequency' => $schedule->frequency,
                    'status' => 'paid',
                    'payment_method' => 'bank_transfer',
                    'payment_reference' => 'TRF-' . strtoupper(uniqid()),
                    'paid_at' => Carbon::now()->subDays(2),
                    'notes' => 'Pago procesado correctamente',
                    'commission_details' => [
                        'commissions_count' => $commissions->count(),
                        'period_description' => 'Comisiones de la semana pasada',
                    ],
                ]);

                // Pago pendiente (esta semana)
                CommissionPayment::create([
                    'exchange_house_id' => $house->id,
                    'total_amount' => $totalCommissions * 0.4,
                    'commission_amount' => $totalCommissions * 0.4,
                    'period_start' => Carbon::now()->subWeek(),
                    'period_end' => Carbon::now(),
                    'due_date' => Carbon::now()->addDays(3),
                    'frequency' => $schedule->frequency,
                    'status' => 'pending',
                    'commission_details' => [
                        'commissions_count' => $commissions->count(),
                        'period_description' => 'Comisiones de esta semana',
                    ],
                ]);

                // Pago vencido (para demostración)
                if ($house->id === 2) {
                    CommissionPayment::create([
                        'exchange_house_id' => $house->id,
                        'total_amount' => 125.50,
                        'commission_amount' => 125.50,
                        'period_start' => Carbon::now()->subWeeks(3),
                        'period_end' => Carbon::now()->subWeeks(2),
                        'due_date' => Carbon::now()->subDays(5),
                        'frequency' => $schedule->frequency,
                        'status' => 'overdue',
                        'commission_details' => [
                            'commissions_count' => 3,
                            'period_description' => 'Comisiones vencidas',
                        ],
                    ]);
                }
            }
        }

        $this->command->info('Sistema de pagos configurado exitosamente!');
        $this->command->info('- Cronogramas de pago creados para todas las casas');
        $this->command->info('- Pagos de ejemplo generados');
        $this->command->info('- Sistema listo para gestión financiera profesional');
    }
}
