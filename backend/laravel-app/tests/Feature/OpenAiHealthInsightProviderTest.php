<?php

namespace Tests\Feature;

use App\Services\AI\OpenAiHealthInsightProvider;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class OpenAiHealthInsightProviderTest extends TestCase
{
    public function test_it_sends_the_user_profile_to_the_ai(): void
    {
        Http::fake([
            '*' => Http::response([
                'choices' => [
                    ['message' => ['content' => json_encode([
                        'interpretation' => 'ok',
                        'recommendations' => ['a', 'b', 'c'],
                    ])]],
                ],
            ], 200),
        ]);

        $provider = new OpenAiHealthInsightProvider(
            apiKey: 'test-key',
            model: 'gpt-test',
            baseUrl: 'https://api.openai.com/v1',
        );

        $provider->interpret(
            ['sleep_hours' => 7.5, 'glucose_level' => 95.0, 'heart_rate' => 62],
            ['age' => 28, 'weight' => 70.5, 'height' => 172],
        );

        Http::assertSent(function ($request) {
            $prompt = $request['messages'][1]['content'];

            return str_contains($prompt, 'Perfil do usuário: 28 anos')
                && str_contains($prompt, '70.5 kg')
                && str_contains($prompt, '172 cm');
        });
    }
}
