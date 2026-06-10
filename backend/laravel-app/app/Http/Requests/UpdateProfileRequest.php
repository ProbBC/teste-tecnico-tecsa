<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
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
            'age' => ['required', 'integer', 'min:1', 'max:120'],
            'weight' => ['required', 'numeric', 'min:1', 'max:500'],
            'height' => ['required', 'integer', 'min:30', 'max:300'],
        ];
    }

    /**
     * @return array{name: string, age: int, weight: float, height: int}
     */
    public function profileData(): array
    {
        return [
            'name' => $this->validated('name'),
            'age' => (int) $this->validated('age'),
            'weight' => (float) $this->validated('weight'),
            'height' => (int) $this->validated('height'),
        ];
    }
}
