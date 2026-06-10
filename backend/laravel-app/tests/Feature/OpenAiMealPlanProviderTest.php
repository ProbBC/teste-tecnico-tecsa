<?php

namespace Tests\Feature;

use App\Services\AI\OpenAiMealPlanProvider;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class OpenAiMealPlanProviderTest extends TestCase
{
    public function test_it_sends_profile_and_biomarkers_and_parses_the_plan(): void
    {
        Http::fake([
            '*' => Http::response([
                'choices' => [
                    ['message' => ['content' => json_encode([
                        'summary' => 'Plano equilibrado.',
                        'daily_calories' => 1900,
                        'meals' => [
                            ['type' => 'Café da manhã', 'items' => ['Ovos', 'Aveia'], 'kcal' => 400],
                            ['type' => 'Jantar', 'items' => ['Salmão'], 'kcal' => 500],
                        ],
                        'notes' => 'Sugestão educativa.',
                    ])]],
                ],
            ], 200),
        ]);

        $provider = new OpenAiMealPlanProvider(
            apiKey: 'test-key',
            model: 'gpt-test',
            baseUrl: 'https://api.openai.com/v1',
        );

        $plan = $provider->generate(
            ['age' => 28, 'weight' => 70.5, 'height' => 172],
            ['sleep_hours' => 6.0, 'glucose_level' => 110.0, 'heart_rate' => 70],
        );

        $this->assertSame('Plano equilibrado.', $plan->summary);
        $this->assertSame(1900, $plan->dailyCalories);
        $this->assertCount(2, $plan->meals);
        $this->assertSame('Café da manhã', $plan->meals[0]->type);

        Http::assertSent(function ($request) {
            $prompt = $request['messages'][1]['content'];

            return str_contains($prompt, '28 anos')
                && str_contains($prompt, '70.5 kg')
                && str_contains($prompt, '172 cm')
                && str_contains($prompt, 'glicose 110.0 mg/dL');
        });
    }
}
