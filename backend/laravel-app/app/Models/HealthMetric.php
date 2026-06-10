<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HealthMetric extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sleep_hours',
        'glucose_level',
        'heart_rate',
        'interpretation',
    ];

    protected $casts = [
        'sleep_hours' => 'float',
        'glucose_level' => 'float',
        'heart_rate' => 'integer',
    ];

    public function recommendations(): HasMany
    {
        return $this->hasMany(Recommendation::class)->orderBy('position');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
