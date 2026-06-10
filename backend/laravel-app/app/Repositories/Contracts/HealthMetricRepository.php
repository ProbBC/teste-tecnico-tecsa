<?php

namespace App\Repositories\Contracts;

use App\Models\HealthMetric;
use Illuminate\Support\Collection;

interface HealthMetricRepository
{
    /**
     * @return Collection<int, HealthMetric>
     */
    public function latestForUser(int $userId): Collection;

    public function findForUser(int $id, int $userId): ?HealthMetric;

    /**
     * @param  array{user_id: int, sleep_hours: float, glucose_level: float, heart_rate: int, interpretation: string}  $attributes
     * @param  list<string>  $recommendations
     */
    public function createWithRecommendations(array $attributes, array $recommendations): HealthMetric;
}
