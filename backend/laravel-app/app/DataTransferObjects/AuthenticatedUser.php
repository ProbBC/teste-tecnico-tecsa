<?php

namespace App\DataTransferObjects;

use App\Models\User;

class AuthenticatedUser
{
    public function __construct(
        public readonly User $user,
        public readonly string $token,
        public readonly int $expiresIn,
    ) {
    }
}
