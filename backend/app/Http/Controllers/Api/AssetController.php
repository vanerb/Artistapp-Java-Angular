<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AssetController extends Controller
{
    public function show(Request $request, string $path)
    {
        $path = str_replace('\\', '/', $path);
        abort_if(str_contains($path, '..') || str_starts_with($path, '/') || !Storage::disk('public')->exists($path), 404);

        return Storage::disk('public')->response($path, basename($path), [
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
