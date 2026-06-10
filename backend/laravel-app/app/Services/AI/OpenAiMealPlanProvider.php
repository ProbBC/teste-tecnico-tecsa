<?php

namespace App\Services\AI;

use App\DataTransferObjects\Meal;
use App\DataTransferObjects\MealPlan;
use App\Exceptions\MealPlanException;
use App\Services\AI\Contracts\MealPlanProvider;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class OpenAiMealPlanProvider implements MealPlanProvider
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $model,
        private readonly string $baseUrl,
        private readonly int $timeout = 30,
    ) {
    }

    public function generate(array $profile, ?array $biomarkers): MealPlan
    {
        $response = $this->requestCompletion($profile, $biomarkers);

        return $this->parse($response);
    }

    /**
     * @param  array{age: int, weight: float, height: int}  $profile
     * @param  array{sleep_hours: float, glucose_level: float, heart_rate: int}|null  $biomarkers
     * @return array<string, mixed>
     */
    private function requestCompletion(array $profile, ?array $biomarkers): array
    {
        try {
            $response = Http::withToken($this->apiKey)
                ->timeout($this->timeout)
                ->baseUrl($this->baseUrl)
                ->post('/chat/completions', [
                    'model' => $this->model,
                    'temperature' => 0.6,
                    'response_format' => ['type' => 'json_object'],
                    'messages' => [
                        ['role' => 'system', 'content' => $this->systemPrompt()],
                        ['role' => 'user', 'content' => $this->userPrompt($profile, $biomarkers)],
                    ],
                ]);
        } catch (ConnectionException $e) {
            throw MealPlanException::requestFailed($e->getMessage());
        }

        if ($response->failed()) {
            throw MealPlanException::requestFailed("HTTP {$response->status()}");
        }

        return $response->json();
    }

    /**
     * @param  array<string, mixed>  $response
     */
    private function parse(array $response): MealPlan
    {
        $content = data_get($response, 'choices.0.message.content');

        if (! is_string($content)) {
            throw MealPlanException::malformedResponse();
        }

        $payload = json_decode($content, true);

        $summary = data_get($payload, 'summary');
        $meals = data_get($payload, 'meals');

        if (! is_string($summary) || ! is_array($meals) || $meals === []) {
            throw MealPlanException::malformedResponse();
        }

        $parsedMeals = array_values(array_filter(array_map(
            $this->parseMeal(...),
            $meals,
        )));

        if ($parsedMeals === []) {
            throw MealPlanException::malformedResponse();
        }

        return new MealPlan(
            summary: $summary,
            dailyCalories: is_numeric(data_get($payload, 'daily_calories'))
                ? (int) data_get($payload, 'daily_calories')
                : null,
            meals: $parsedMeals,
            notes: is_string(data_get($payload, 'notes')) ? data_get($payload, 'notes') : '',
        );
    }

    /**
     * @param  mixed  $meal
     */
    private function parseMeal($meal): ?Meal
    {
        $type = data_get($meal, 'type');
        $items = data_get($meal, 'items');

        if (! is_string($type) || ! is_array($items)) {
            return null;
        }

        $items = array_values(array_filter(
            array_map('strval', $items),
            static fn (string $item): bool => $item !== '',
        ));

        if ($items === []) {
            return null;
        }

        return new Meal(
            type: $type,
            items: $items,
            kcal: is_numeric(data_get($meal, 'kcal')) ? (int) data_get($meal, 'kcal') : null,
        );
    }

    private function systemPrompt(): string
    {
        return <<<'PROMPT'
        Você é um assistente de nutrição que monta um plano alimentar de UM dia para um
        painel de bem-estar. O conteúdo é educativo e NÃO substitui a orientação de um
        nutricionista — sempre deixe isso claro no campo "notes".

        Responda APENAS com um objeto JSON usando esta forma exata:
        {
          "summary": "<resumo curto explicando as escolhas, considerando o perfil e os biomarcadores>",
          "daily_calories": <inteiro estimado de calorias do dia>,
          "meals": [
            { "type": "Café da manhã", "items": ["<item>", "<item>"], "kcal": <inteiro> },
            { "type": "Almoço", "items": ["..."], "kcal": <inteiro> },
            { "type": "Lanche", "items": ["..."], "kcal": <inteiro> },
            { "type": "Jantar", "items": ["..."], "kcal": <inteiro> }
          ],
          "notes": "<aviso de que é sugestão educativa, não prescrição>"
        }
        PROMPT;
    }

    /**
     * @param  array{age: int, weight: float, height: int}  $profile
     * @param  array{sleep_hours: float, glucose_level: float, heart_rate: int}|null  $biomarkers
     */
    private function userPrompt(array $profile, ?array $biomarkers): string
    {
        $base = sprintf(
            'Monte um plano alimentar de um dia para o perfil: %d anos, %.1f kg, %d cm.',
            $profile['age'],
            $profile['weight'],
            $profile['height'],
        );

        if ($biomarkers === null) {
            return $base.' Não há biomarcadores recentes registrados; baseie-se no perfil.';
        }

        return $base.sprintf(
            ' Considere também os biomarcadores mais recentes: sono %.1f horas, '
            .'glicose %.1f mg/dL, frequência cardíaca %d bpm.',
            $biomarkers['sleep_hours'],
            $biomarkers['glucose_level'],
            $biomarkers['heart_rate'],
        );
    }
}
