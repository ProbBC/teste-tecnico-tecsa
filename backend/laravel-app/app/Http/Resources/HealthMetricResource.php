<?php

namespace App\Http\Resources;

use App\Models\HealthMetric;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin HealthMetric
 */
class HealthMetricResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'biomarkers' => [
                'sleep_hours' => $this->sleep_hours,
                'glucose_level' => $this->glucose_level,
                'heart_rate' => $this->heart_rate,
            ],
            'interpretation' => $this->interpretation,
            'recommendations' => $this->recommendations
                ->pluck('content')
                ->all(),
            'recorded_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
