<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHealthMetricRequest;
use App\Http\Resources\HealthMetricResource;
use App\Services\HealthMetricService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class HealthMetricController extends Controller
{
    public function __construct(
        private readonly HealthMetricService $service,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $metrics = $this->service->listFor($request->user());

        return HealthMetricResource::collection($metrics)->response();
    }

    public function store(StoreHealthMetricRequest $request): JsonResponse
    {
        $metric = $this->service->saveHealthMetricWithRecommendation($request->user(), $request->biomarkers());

        return HealthMetricResource::make($metric)
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $metric = $this->service->findForUserOrFail($request->user(), $id);

        return HealthMetricResource::make($metric)->response();
    }
}
