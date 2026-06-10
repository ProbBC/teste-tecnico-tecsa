<?php

namespace App\Http\Resources;

use App\DataTransferObjects\Meal;
use App\DataTransferObjects\MealPlan;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin MealPlan
 */
class MealPlanResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'summary' => $this->summary,
            'daily_calories' => $this->dailyCalories,
            'meals' => array_map(
                static fn (Meal $meal): array => [
                    'type' => $meal->type,
                    'items' => $meal->items,
                    'kcal' => $meal->kcal,
                ],
                $this->meals,
            ),
            'notes' => $this->notes,
        ];
    }
}
