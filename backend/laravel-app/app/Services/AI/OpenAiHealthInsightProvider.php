<?php

namespace App\Services\AI;

use App\DataTransferObjects\HealthInsight;
use App\Exceptions\HealthInsightException;
use App\Services\AI\Contracts\HealthInsightProvider;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class OpenAiHealthInsightProvider implements HealthInsightProvider
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $model,
        private readonly string $baseUrl,
        private readonly int $timeout = 30,
    ) {
    }

    public function interpret(array $biomarkers, array $profile): HealthInsight
    {
        $response = $this->requestCompletion($biomarkers, $profile);

        return $this->parse($response);
    }

    /**
     * @param  array{sleep_hours: float, glucose_level: float, heart_rate: int}  $biomarkers
     * @param  array{age: int, weight: float, height: int}  $profile
     * @return array<string, mixed>
     */
    private function requestCompletion(array $biomarkers, array $profile): array
    {
        try {
            $response = Http::withToken($this->apiKey)
                ->timeout($this->timeout)
                ->baseUrl($this->baseUrl)
                ->post('/chat/completions', [
                    'model' => $this->model,
                    'temperature' => 0.4,
                    'response_format' => ['type' => 'json_object'],
                    'messages' => [
                        ['role' => 'system', 'content' => $this->systemPrompt()],
                        ['role' => 'user', 'content' => $this->userPrompt($biomarkers, $profile)],
                    ],
                ]);
        } catch (ConnectionException $e) {
            throw HealthInsightException::requestFailed($e->getMessage());
        }

        if ($response->failed()) {
            throw HealthInsightException::requestFailed(
                "HTTP {$response->status()}"
            );
        }

        return $response->json();
    }

    /**
     * @param  array<string, mixed>  $response
     */
    private function parse(array $response): HealthInsight
    {
        $content = data_get($response, 'choices.0.message.content');

        if (! is_string($content)) {
            throw HealthInsightException::malformedResponse();
        }

        $payload = json_decode($content, true);

        $interpretation = data_get($payload, 'interpretation');
        $recommendations = data_get($payload, 'recommendations');

        if (! is_string($interpretation) || ! is_array($recommendations)) {
            throw HealthInsightException::malformedResponse();
        }

        $recommendations = array_values(array_filter(
            array_map('strval', $recommendations),
            static fn (string $item): bool => $item !== '',
        ));

        if ($recommendations === []) {
            throw HealthInsightException::malformedResponse();
        }

        return new HealthInsight($interpretation, $recommendations);
    }

    private function systemPrompt(): string
    {
        return <<<'PROMPT'
        Você é um assistente de saúde que interpreta biomarcadores diários para um painel de bem-estar.
        Você nunca fornece um diagnóstico médico e sempre incentiva o usuário a consultar um profissional em caso de preocupações clínicas.

        Responda APENAS com um objeto JSON usando esta forma exata:
        {
          "interpretation": "<um parágrafo curto e amigável interpretando os biomarcadores>",
          "recommendations": ["<hábito 1>", "<hábito 2>", "<hábito 3>"]
        }

        Forneça exatamente 3 recomendações de hábitos diários concisas e acionáveis.
        PROMPT;
    }

    /**
     * @param  array{sleep_hours: float, glucose_level: float, heart_rate: int}  $biomarkers
     * @param  array{age: int, weight: float, height: int}  $profile
     */
    private function userPrompt(array $biomarkers, array $profile): string
    {
        return sprintf(
            'Perfil do usuário: %d anos, %.1f kg, %d cm. '
            .'Considerando esse perfil, interprete estes biomarcadores: '
            .'sono %.1f horas, glicose %.1f mg/dL, frequência cardíaca %d bpm.',
            $profile['age'],
            $profile['weight'],
            $profile['height'],
            $biomarkers['sleep_hours'],
            $biomarkers['glucose_level'],
            $biomarkers['heart_rate'],
        );
    }
}
