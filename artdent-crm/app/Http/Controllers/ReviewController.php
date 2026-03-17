<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status', 'all')->toString();

        $query = Review::query()
            ->with(['product:id,name', 'customer:id,name'])
            ->orderByDesc('created_at');

        if (in_array($status, ['pending', 'approved', 'rejected'])) {
            $query->where('status', $status);
        }

        $reviews = $query->paginate(25)->withQueryString();

        $counts = Review::query()
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
            ")
            ->first();

        return Inertia::render('Review/Index', [
            'reviews' => $reviews,
            'counts' => $counts,
            'status' => $status,
        ]);
    }

    public function update(Request $request, Review $review): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:pending,approved,rejected'],
        ]);

        $review->update(['status' => $request->input('status')]);

        return back()->with('success', 'Reseña actualizada.');
    }

    public function destroy(Review $review): RedirectResponse
    {
        $review->delete();

        return back()->with('success', 'Reseña eliminada.');
    }
}
