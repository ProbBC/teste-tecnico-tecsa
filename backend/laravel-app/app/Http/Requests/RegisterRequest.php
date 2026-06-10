<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
            'age' => ['required', 'integer', 'min:1', 'max:120'],
            'weight' => ['required', 'numeric', 'min:1', 'max:500'],
            'height' => ['required', 'integer', 'min:30', 'max:300'],
        ];
    }

    /**
     * @return array{name: string, email: string, password: string, age: int, weight: float, height: int}
     */
    public function credentials(): array
    {
        return [
            'name' => $this->validated('name'),
            'email' => $this->validated('email'),
            'password' => $this->validated('password'),
            'age' => (int) $this->validated('age'),
            'weight' => (float) $this->validated('weight'),
            'height' => (int) $this->validated('height'),
        ];
    }
}
