<?php

namespace Database\Factories;

use App\Models\HealthMetric;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HealthMetric>
 */
class HealthMetricFactory extends Factory
{
    protected $model = HealthMetric::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'sleep_hours' => $this->faker->randomFloat(1, 4, 9),
            'glucose_level' => $this->faker->randomFloat(1, 70, 140),
            'heart_rate' => $this->faker->numberBetween(40, 90),
            'interpretation' => $this->faker->sentence(),
        ];
    }
}
