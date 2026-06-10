<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recommendation extends Model

{
    use HasFactory;

    protected $fillable = [
        'health_metric_id',
        'content',
        'position',
    ];

    protected $casts = [
        'position' => 'integer',
    ];

    public function healthMetric(): BelongsTo
    {
        return $this->belongsTo(HealthMetric::class);
    }
}
