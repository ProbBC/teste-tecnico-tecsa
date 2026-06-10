<?php

namespace App\Services;

use App\DataTransferObjects\AuthenticatedUser;
use App\Models\User;
use App\Repositories\Contracts\UserRepository;
use Illuminate\Contracts\Auth\Factory as AuthFactory;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;

class AuthService
{
    private JWTGuard $guard;

    public function __construct(
        private readonly UserRepository $users,
        AuthFactory $auth,
    ) {
        /** @var JWTGuard $guard */
        $guard = $auth->guard('api');
        $this->guard = $guard;
    }

    /**
     * @param  array{name: string, email: string, password: string}  $attributes
     */
    public function register(array $attributes): AuthenticatedUser
    {
        $user = $this->users->create($attributes);
        $token = $this->guard->login($user);

        return new AuthenticatedUser($user, $token, $this->ttlInSeconds());
    }

    /**
     * @param  array{email: string, password: string}  $credentials
     */
    public function login(array $credentials): AuthenticatedUser
    {
        $token = $this->guard->attempt($credentials);

        abort_if($token === false, 401, 'Credenciais inválidas.');

        /** @var User $user */
        $user = $this->guard->user();

        return new AuthenticatedUser($user, $token, $this->ttlInSeconds());
    }

    /**
     * @param  array{name: string, age: int, weight: float, height: int}  $attributes
     */
    public function updateProfile(User $user, array $attributes): User
    {
        return $this->users->update($user, $attributes);
    }

    public function logout(): void
    {
        $this->guard->logout();
    }

    public function currentUser(): User
    {
        /** @var User $user */
        $user = $this->guard->user();

        return $user;
    }

    private function ttlInSeconds(): int
    {
        return (int) $this->guard->factory()->getTTL() * 60;
    }
}
