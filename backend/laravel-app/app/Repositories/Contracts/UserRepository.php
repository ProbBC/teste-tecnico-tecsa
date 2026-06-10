<?php

namespace App\Repositories\Contracts;

use App\Models\User;

interface UserRepository
{
    /**
     * @param  array{name: string, email: string, password: string, age: int, weight: float, height: int}  $attributes
     */
    public function create(array $attributes): User;

    public function findByEmail(string $email): ?User;

    /**
     * @param  array{name?: string, age?: int, weight?: float, height?: int}  $attributes
     */
    public function update(User $user, array $attributes): User;
}
