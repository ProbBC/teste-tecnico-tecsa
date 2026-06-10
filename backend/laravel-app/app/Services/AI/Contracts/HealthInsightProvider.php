<?php

namespace App\Services\AI\Contracts;

use App\DataTransferObjects\HealthInsight;

interface HealthInsightProvider
{
    /**
     * Interpret a set of biomarkers in the context of the user's profile and
     * return an interpretation plus daily-habit recommendations.
     *
     * @param  array{sleep_hours: float, glucose_level: float, heart_rate: int}  $biomarkers
     * @param  array{age: int, weight: float, height: int}  $profile
     *
     * @throws \App\Exceptions\HealthInsightException
     */
    public function interpret(array $biomarkers, array $profile): HealthInsight;
}
