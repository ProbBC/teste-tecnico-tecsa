<?php

namespace App\Services\AI\Contracts;

use App\DataTransferObjects\MealPlan;

interface MealPlanProvider
{
    /**
     * Generate a single-day meal plan from the user's profile and (optionally)
     * their most recent biomarkers.
     *
     * @param  array{age: int, weight: float, height: int}  $profile
     * @param  array{sleep_hours: float, glucose_level: float, heart_rate: int}|null  $biomarkers
     *
     * @throws \App\Exceptions\MealPlanException
     */
    public function generate(array $profile, ?array $biomarkers): MealPlan;
}
