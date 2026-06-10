<?php

namespace App\Repositories\Eloquent;

use App\Models\HealthMetric;
use App\Repositories\Contracts\HealthMetricRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class EloquentHealthMetricRepository implements HealthMetricRepository
{
    public function latestForUser(int $userId): Collection
    {
        return HealthMetric::with('recommendations')
            ->where('user_id', $userId)
            ->latest()
            ->get();
    }

    public function findForUser(int $id, int $userId): ?HealthMetric
    {
        return HealthMetric::with('recommendations')
            ->where('user_id', $userId)
            ->find($id);
    }

    public function createWithRecommendations(array $attributes, array $recommendations): HealthMetric
    {
        return DB::transaction(function () use ($attributes, $recommendations): HealthMetric {
            $metric = HealthMetric::create($attributes);

            foreach (array_values($recommendations) as $position => $content) {
                $metric->recommendations()->create([
                    'content' => $content,
                    'position' => $position + 1,
                ]);
            }

            return $metric->load('recommendations');
        });
    }
}
