<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_registers_a_user_and_returns_a_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Maria Souza',
            'email' => 'maria@example.com',
            'password' => 'password123',
            'age' => 30,
            'weight' => 68.5,
            'height' => 170,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.email', 'maria@example.com')
            ->assertJsonPath('data.user.age', 30)
            ->assertJsonPath('data.user.height', 170)
            ->assertJsonPath('data.token_type', 'bearer')
            ->assertJsonStructure(['data' => ['user' => ['id', 'name', 'email', 'age', 'weight', 'height'], 'token', 'expires_in']]);

        $this->assertDatabaseHas('users', ['email' => 'maria@example.com', 'age' => 30]);
    }

    public function test_it_requires_profile_fields_on_register(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Maria Souza',
            'email' => 'maria@example.com',
            'password' => 'password123',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['age', 'weight', 'height']);
    }

    public function test_it_rejects_duplicate_email_on_register(): void
    {
        User::factory()->create(['email' => 'maria@example.com']);

        $this->postJson('/api/auth/register', [
            'name' => 'Maria Souza',
            'email' => 'maria@example.com',
            'password' => 'password123',
            'age' => 30,
            'weight' => 68.5,
            'height' => 170,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_it_updates_the_authenticated_users_profile(): void
    {
        $user = User::factory()->create(['name' => 'Antigo', 'age' => 25]);

        $this->actingAs($user, 'api')
            ->patchJson('/api/auth/me', [
                'name' => 'Novo Nome',
                'age' => 31,
                'weight' => 72.4,
                'height' => 175,
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Novo Nome')
            ->assertJsonPath('data.age', 31);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Novo Nome',
            'age' => 31,
            'height' => 175,
        ]);
    }

    public function test_it_logs_in_with_valid_credentials(): void
    {
        User::factory()->create([
            'email' => 'joao@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'joao@example.com',
            'password' => 'password123',
        ])->assertOk()
            ->assertJsonPath('data.user.email', 'joao@example.com')
            ->assertJsonStructure(['data' => ['user', 'token', 'expires_in']]);
    }

    public function test_it_rejects_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'joao@example.com',
            'password' => 'password123',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'joao@example.com',
            'password' => 'wrong-password',
        ])->assertUnauthorized();
    }

    public function test_it_returns_the_authenticated_user_with_a_bearer_token(): void
    {
        $user = User::factory()->create(['email' => 'ana@example.com']);
        $token = JWTAuth::fromUser($user);

        $this->withToken($token)
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'ana@example.com');
    }
}
