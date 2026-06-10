<?php

namespace App\Exceptions;

use RuntimeException;

class MealPlanException extends RuntimeException
{
    public static function requestFailed(string $reason): self
    {
        return new self("Falha ao gerar o plano alimentar no provider de IA: {$reason}");
    }

    public static function malformedResponse(): self
    {
        return new self('A resposta do provider de IA não pôde ser interpretada.');
    }
}
