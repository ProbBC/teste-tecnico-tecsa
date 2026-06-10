<?php

namespace App\DataTransferObjects;

class Meal
{
    /**
     * @param  list<string>  $items
     */
    public function __construct(
        public readonly string $type,
        public readonly array $items,
        public readonly ?int $kcal,
    ) {
    }
}
