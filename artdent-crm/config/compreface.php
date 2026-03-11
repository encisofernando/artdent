<?php

return [
    'url' => env('COMPREFACE_URL', 'http://localhost:8000'),
    'api_key' => env('COMPREFACE_API_KEY', ''),
    'det_prob' => env('COMPREFACE_DET_PROB', 0.8),
    'threshold' => env('COMPREFACE_THRESHOLD', 0.85),
];
