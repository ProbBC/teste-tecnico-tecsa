<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreHealthMetricRequest extends FormRequest
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
            'sleep_hours' => ['required', 'numeric', 'min:0', 'max:24'],
            'glucose_level' => ['required', 'numeric', 'min:0', 'max:1000'],
            'heart_rate' => ['required', 'integer', 'min:0', 'max:300'],
        ];
    }

    /**
     * @return array{sleep_hours: float, glucose_level: float, heart_rate: int}
     */
    public function biomarkers(): array
    {
        return [
            'sleep_hours' => (float) $this->validated('sleep_hours'),
            'glucose_level' => (float) $this->validated('glucose_level'),
            'heart_rate' => (int) $this->validated('heart_rate'),
        ];
    }
}
