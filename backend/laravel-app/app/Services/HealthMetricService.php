<?php

namespace App\Services;

use App\Models\HealthMetric;
use App\Models\User;
use App\Repositories\Contracts\HealthMetricRepository;
use App\Services\AI\Contracts\HealthInsightProvider;
use Illuminate\Support\Collection;

class HealthMetricService
{
    public function __construct(
        private readonly HealthMetricRepository $repository,
        private readonly HealthInsightProvider $insightProvider,
    ) {
    }

    /**
     * @return Collection<int, HealthMetric>
     */
    public function listFor(User $user): Collection
    {
        return $this->repository->latestForUser($user->id);
    }

    public function findForUserOrFail(User $user, int $id): HealthMetric
    {
        $metric = $this->repository->findForUser($id, $user->id);

        abort_if($metric === null, 404, 'Métrica de saúde não encontrada.');

        return $metric;
    }

    /**
     * Persist a new set of biomarkers enriched with an AI interpretation and
     * daily-habit recommendations for the given user.
     *
     * @param  array{sleep_hours: float, glucose_level: float, heart_rate: int}  $biomarkers
     */
    public function saveHealthMetricWithRecommendation(User $user, array $biomarkers): HealthMetric
    {
        $insight = $this->insightProvider->interpret($biomarkers, [
            'age' => $user->age,
            'weight' => $user->weight,
            'height' => $user->height,
        ]);

        return $this->repository->createWithRecommendations(
            [
                'user_id' => $user->id,
                ...$biomarkers,
                'interpretation' => $insight->interpretation,
            ],
            $insight->recommendations,
        );
    }
}
