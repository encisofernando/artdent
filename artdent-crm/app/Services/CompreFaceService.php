<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class CompreFaceService
{
    private string $url;

    private string $apiKey;

    private float $detProb;

    private float $threshold;

    public function __construct()
    {
        $this->url = rtrim(config('compreface.url'), '/');
        $this->apiKey = config('compreface.api_key');
        $this->detProb = (float) config('compreface.det_prob');
        $this->threshold = (float) config('compreface.threshold');
    }

    /** Add a face to a subject (enroll). $imageBase64 is base64 PNG/JPG */
    public function enrollFace(string $subjectId, string $imageBase64): array
    {
        $imageData = base64_decode(preg_replace('/^data:image\/\w+;base64,/', '', $imageBase64));

        // CompreFace requires 'subject' as a query parameter, not a form field
        $response = Http::withHeaders(['x-api-key' => $this->apiKey])
            ->attach('file', $imageData, 'face.jpg')
            ->post("{$this->url}/api/v1/recognition/faces?subject={$subjectId}");

        return $response->json() ?? [];
    }

    /** Recognize a face from base64 image. Returns ['subject' => ..., 'similarity' => ...] or null */
    public function recognizeFace(string $imageBase64): ?array
    {
        $imageData = base64_decode(preg_replace('/^data:image\/\w+;base64,/', '', $imageBase64));

        // CompreFace requires query params in the URL
        $response = Http::withHeaders(['x-api-key' => $this->apiKey])
            ->attach('file', $imageData, 'face.jpg')
            ->post("{$this->url}/api/v1/recognition/recognize?limit=1&det_prob_threshold={$this->detProb}");

        $data = $response->json();
        if (empty($data['result'][0]['subjects'])) {
            return null;
        }

        $best = $data['result'][0]['subjects'][0];
        if ($best['similarity'] < $this->threshold) {
            return null;
        }

        return $best; // ['subject' => 'collab-5', 'similarity' => 0.92]
    }

    /** Delete all faces for a subject */
    public function deleteFaces(string $subjectId): void
    {
        Http::withHeaders(['x-api-key' => $this->apiKey])
            ->delete("{$this->url}/api/v1/recognition/faces?subject={$subjectId}");
    }
}
