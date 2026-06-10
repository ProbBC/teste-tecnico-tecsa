<?php

namespace App\Services;

use App\DataTransferObjects\MealPlan;
use App\Models\HealthMetric;
use App\Models\User;
use App\Repositories\Contracts\HealthMetricRepository;
use App\Services\AI\Contracts\MealPlanProvider;

class MealPlanService
{
    public function __construct(
        private readonly MealPlanProvider $mealPlanProvider,
        private readonly HealthMetricRepository $healthMetrics,
    ) {
    }

    /**
     * Generate a single-day meal plan for the user from their profile and most
     * recent biomarkers (if any). The plan is not persisted.
     */
    public function generateFor(User $user): MealPlan
    {
        $latest = $this->healthMetrics->latestForUser($user->id)->first();

        return $this->mealPlanProvider->generate(
            [
                'age' => $user->age,
                'weight' => $user->weight,
                'height' => $user->height,
            ],
            $latest instanceof HealthMetric ? [
                'sleep_hours' => $latest->sleep_hours,
                'glucose_level' => $latest->glucose_level,
                'heart_rate' => $latest->heart_rate,
            ] : null,
        );
    }
}
