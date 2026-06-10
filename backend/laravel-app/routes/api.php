<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HealthMetricController;
use App\Http\Controllers\Api\MealPlanController;
use Illuminate\Support\Facades\Route;

Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::patch('auth/me', [AuthController::class, 'update']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    Route::apiResource('health-metrics', HealthMetricController::class)
        ->only(['index', 'store', 'show']);

    Route::post('meal-plans', [MealPlanController::class, 'store']);
});
