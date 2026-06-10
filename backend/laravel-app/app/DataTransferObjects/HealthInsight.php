<?php

namespace App\DataTransferObjects;

class HealthInsight
{
    /**
     * @param  list<string>  $recommendations
     */
    public function __construct(
        public readonly string $interpretation,
        public readonly array $recommendations,
    ) {
    }
}
