<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MealPlanResource;
use App\Services\MealPlanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MealPlanController extends Controller
{
    public function __construct(
        private readonly MealPlanService $service,
    ) {
    }

    /**
     * Generate a single-day meal plan for the authenticated user.
     */
    public function store(Request $request): JsonResponse
    {
        $plan = $this->service->generateFor($request->user());

        return MealPlanResource::make($plan)->response();
    }
}
