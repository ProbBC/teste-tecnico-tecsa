<?php

namespace Tests\Feature;

use App\DataTransferObjects\Meal;
use App\DataTransferObjects\MealPlan;
use App\Models\User;
use App\Services\AI\Contracts\MealPlanProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
use Tests\TestCase;

class MealPlanApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_generates_a_meal_plan_for_the_authenticated_user(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'api');

        $this->mock(MealPlanProvider::class, function (MockInterface $mock): void {
            $mock->shouldReceive('generate')
                ->once()
                ->andReturn(new MealPlan(
                    summary: 'Plano equilibrado para o seu perfil.',
                    dailyCalories: 2000,
                    meals: [
                        new Meal('Café da manhã', ['Ovos', 'Aveia'], 400),
                        new Meal('Almoço', ['Frango', 'Arroz integral', 'Salada'], 600),
                        new Meal('Lanche', ['Iogurte'], 200),
                        new Meal('Jantar', ['Salmão', 'Legumes'], 550),
                    ],
                    notes: 'Sugestão educativa, não substitui um nutricionista.',
                ));
        });

        $this->postJson('/api/meal-plans')
            ->assertOk()
            ->assertJsonPath('data.summary', 'Plano equilibrado para o seu perfil.')
            ->assertJsonPath('data.daily_calories', 2000)
            ->assertJsonCount(4, 'data.meals')
            ->assertJsonPath('data.meals.0.type', 'Café da manhã')
            ->assertJsonStructure([
                'data' => ['summary', 'daily_calories', 'meals' => [['type', 'items', 'kcal']], 'notes'],
            ]);
    }

    public function test_it_requires_authentication(): void
    {
        $this->postJson('/api/meal-plans')->assertUnauthorized();
    }
}
