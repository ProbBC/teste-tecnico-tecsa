<?php

namespace App\Providers;

use App\Repositories\Contracts\HealthMetricRepository;
use App\Repositories\Contracts\UserRepository;
use App\Repositories\Eloquent\EloquentHealthMetricRepository;
use App\Repositories\Eloquent\EloquentUserRepository;
use App\Services\AI\Contracts\HealthInsightProvider;
use App\Services\AI\Contracts\MealPlanProvider;
use App\Services\AI\OpenAiHealthInsightProvider;
use App\Services\AI\OpenAiMealPlanProvider;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\Operation;
use Dedoc\Scramble\Support\Generator\SecurityRequirement;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Dedoc\Scramble\Support\RouteInfo;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(HealthMetricRepository::class, EloquentHealthMetricRepository::class);
        $this->app->bind(UserRepository::class, EloquentUserRepository::class);

        $this->app->bind(HealthInsightProvider::class, function ($app): OpenAiHealthInsightProvider {
            $config = $app['config']->get('services.openai');

            return new OpenAiHealthInsightProvider(
                apiKey: (string) ($config['key'] ?? ''),
                model: (string) ($config['model'] ?? 'gpt-5.4-mini'),
                baseUrl: (string) ($config['base_url'] ?? 'https://api.openai.com/v1'),
                timeout: (int) ($config['timeout'] ?? 30),
            );
        });

        $this->app->bind(MealPlanProvider::class, function ($app): OpenAiMealPlanProvider {
            $config = $app['config']->get('services.openai');

            return new OpenAiMealPlanProvider(
                apiKey: (string) ($config['key'] ?? ''),
                model: (string) ($config['model'] ?? 'gpt-5.4-mini'),
                baseUrl: (string) ($config['base_url'] ?? 'https://api.openai.com/v1'),
                timeout: (int) ($config['timeout'] ?? 30),
            );
        });
    }

    public function boot(): void
    {
        $this->configureApiDocumentation();
    }

    /**
     * Configure Scramble to register a JWT bearer security scheme and apply it
     * only to the routes protected by the "auth:api" middleware.
     */
    private function configureApiDocumentation(): void
    {
        Scramble::configure()
            ->withDocumentTransformers(function (OpenApi $openApi): void {
                $openApi->components->addSecurityScheme(
                    'bearerAuth',
                    SecurityScheme::http('bearer', 'JWT'),
                );
            })
            ->withOperationTransformers(function (Operation $operation, RouteInfo $routeInfo): void {
                $isProtected = collect($routeInfo->route->gatherMiddleware())
                    ->contains(fn (mixed $middleware): bool => is_string($middleware)
                        && str_starts_with($middleware, 'auth:'));

                if ($isProtected) {
                    $operation->addSecurity(new SecurityRequirement(['bearerAuth' => []]));
                }
            });
    }
}
