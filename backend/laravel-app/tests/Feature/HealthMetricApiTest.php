<?php

namespace Tests\Feature;

use App\DataTransferObjects\HealthInsight;
use App\Models\HealthMetric;
use App\Models\User;
use App\Services\AI\Contracts\HealthInsightProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
use Tests\TestCase;

class HealthMetricApiTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsUser(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'api');

        return $user;
    }

    public function test_it_stores_biomarkers_with_ai_generated_insight(): void
    {
        $user = $this->actingAsUser();

        $this->mock(HealthInsightProvider::class, function (MockInterface $mock): void {
            $mock->shouldReceive('interpret')
                ->once()
                ->andReturn(new HealthInsight(
                    interpretation: 'Seus biomarcadores parecem equilibrados.',
                    recommendations: [
                        'Durma de 7 a 8 horas.',
                        'Caminhe 15 minutos após as refeições.',
                        'Pratique 5 minutos de respiração.',
                    ],
                ));
        });

        $response = $this->postJson('/api/health-metrics', [
            'sleep_hours' => 7.5,
            'glucose_level' => 95,
            'heart_rate' => 62,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.biomarkers.sleep_hours', 7.5)
            ->assertJsonPath('data.interpretation', 'Seus biomarcadores parecem equilibrados.')
            ->assertJsonCount(3, 'data.recommendations');

        $this->assertDatabaseHas('health_metrics', [
            'user_id' => $user->id,
            'heart_rate' => 62,
        ]);
        $this->assertDatabaseCount('recommendations', 3);
    }

    public function test_it_rejects_invalid_biomarkers(): void
    {
        $this->actingAsUser();

        $response = $this->postJson('/api/health-metrics', [
            'sleep_hours' => 99,
            'glucose_level' => 'high',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['sleep_hours', 'glucose_level', 'heart_rate']);
    }

    public function test_it_only_lists_metrics_owned_by_the_user(): void
    {
        $user = $this->actingAsUser();
        HealthMetric::factory()->count(2)->for($user)->create();
        HealthMetric::factory()->count(3)->create(); // outros usuários

        $this->getJson('/api/health-metrics')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_it_does_not_expose_another_users_metric(): void
    {
        $this->actingAsUser();
        $foreign = HealthMetric::factory()->create();

        $this->getJson("/api/health-metrics/{$foreign->id}")
            ->assertNotFound();
    }

    public function test_it_requires_authentication(): void
    {
        $this->getJson('/api/health-metrics')
            ->assertUnauthorized();
    }
}
