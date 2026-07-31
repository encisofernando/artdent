<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NewsletterSubscriberController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $query = NewsletterSubscriber::query()->orderByDesc('created_at');

        if ($search) {
            $query->where(function ($q) use ($search): void {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $items = $query->paginate(20)->withQueryString()->through(fn (NewsletterSubscriber $s) => [
            'id' => $s->id,
            'email' => $s->email,
            'name' => $s->name,
            'is_active' => $s->is_active,
            'created_at' => $s->created_at?->format('d/m/Y H:i'),
        ]);

        return Inertia::render('NewsletterSubscriber/Index', [
            'items' => $items,
            'filters' => ['search' => $search],
            'total' => NewsletterSubscriber::count(),
            'activeCount' => NewsletterSubscriber::where('is_active', true)->count(),
        ]);
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $search = $request->input('search');

        $query = NewsletterSubscriber::query()->orderByDesc('created_at');

        if ($search) {
            $query->where(function ($q) use ($search): void {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $filename = 'newsletter_suscriptores_'.now()->format('Ymd_His').'.csv';

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ['Email', 'Nombre', 'Estado', 'Fecha de alta'], ';');
            $query->chunk(500, function ($chunk) use ($out): void {
                foreach ($chunk as $subscriber) {
                    fputcsv($out, [
                        $subscriber->email,
                        $subscriber->name ?? '',
                        $subscriber->is_active ? 'Activo' : 'Dado de baja',
                        $subscriber->created_at?->format('d/m/Y H:i') ?? '',
                    ], ';');
                }
            });
            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function destroy(NewsletterSubscriber $newsletterSubscriber): \Illuminate\Http\RedirectResponse
    {
        $newsletterSubscriber->delete();

        return redirect()->route('newsletter-subscribers.index');
    }
}
