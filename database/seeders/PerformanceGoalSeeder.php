<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\PerformanceGoal;
use Illuminate\Database\Seeder;

class PerformanceGoalSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Obtener todas las casas de cambio
        $exchangeHouses = User::where('role', 'exchange_house')->get();

        $defaultGoals = [
            'today' => [
                'orders_goal' => 10,
                'volume_goal' => 5000,
                'commission_goal' => 250,
            ],
            'week' => [
                'orders_goal' => 50,
                'volume_goal' => 25000,
                'commission_goal' => 1250,
            ],
            'month' => [
                'orders_goal' => 200,
                'volume_goal' => 100000,
                'commission_goal' => 5000,
            ],
            'quarter' => [
                'orders_goal' => 600,
                'volume_goal' => 300000,
                'commission_goal' => 15000,
            ],
            'year' => [
                'orders_goal' => 2400,
                'volume_goal' => 1200000,
                'commission_goal' => 60000,
            ],
        ];

        foreach ($exchangeHouses as $exchangeHouse) {
            foreach ($defaultGoals as $period => $goals) {
                PerformanceGoal::updateOrCreate(
                    [
                        'exchange_house_id' => $exchangeHouse->id,
                        'period' => $period,
                    ],
                    $goals
                );
            }
        }

        $this->command->info('Metas de rendimiento creadas para todas las casas de cambio.');
    }
}
