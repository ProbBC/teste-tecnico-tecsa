<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\AuthenticatedUser;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $service,
    ) {
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $authenticated = $this->service->register($request->credentials());

        return $this->tokenResponse($authenticated, Response::HTTP_CREATED);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $authenticated = $this->service->login($request->credentials());

        return $this->tokenResponse($authenticated);
    }

    public function me(): JsonResponse
    {
        return UserResource::make($this->service->currentUser())->response();
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->service->updateProfile($request->user(), $request->profileData());

        return UserResource::make($user)->response();
    }

    public function logout(): JsonResponse
    {
        $this->service->logout();

        return response()->json(['message' => 'Logout realizado com sucesso.']);
    }

    private function tokenResponse(
        AuthenticatedUser $authenticated,
        int $status = Response::HTTP_OK,
    ): JsonResponse {
        return response()->json([
            'data' => [
                'user' => UserResource::make($authenticated->user),
                'token' => $authenticated->token,
                'token_type' => 'bearer',
                'expires_in' => $authenticated->expiresIn,
            ],
        ], $status);
    }
}
