<?php

namespace App\DataTransferObjects;

class MealPlan
{
    /**
     * @param  list<Meal>  $meals
     */
    public function __construct(
        public readonly string $summary,
        public readonly ?int $dailyCalories,
        public readonly array $meals,
        public readonly string $notes,
    ) {
    }
}
