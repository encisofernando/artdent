<?php

namespace App\Http\Controllers;

use App\Models\PhaseTemplate;
use App\Models\Tariff;
use App\Support\TariffNotesRenderer;
use chillerlan\QRCode\Common\EccLevel;
use chillerlan\QRCode\Output\QRMarkupSVG;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Browsershot\Browsershot;

class TariffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $query = Tariff::where('company_id', $companyId);

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        $items = $query->with('costs')->orderBy('name', 'asc')->paginate(15)->withQueryString();

        // Get unique categories for the filter dropdown
        $categories = Tariff::where('company_id', $companyId)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return Inertia::render('Tariff/Index', [
            'items' => $items,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category']),
            'tariffNotes' => auth()->user()->company->tariff_notes,
            'tariffPriceMap' => Tariff::where('company_id', $companyId)
                ->where('is_active', true)
                ->get(['name', 'price'])
                ->mapWithKeys(fn (Tariff $t) => [$t->name => (float) $t->price]),
        ]);
    }

    /**
     * Actualiza únicamente el texto de "Importante leer" que se muestra en la última
     * página del PDF del arancel. Vive en este controller (y no en Configuración) porque
     * es contenido específico del arancel, no un dato general de la empresa.
     */
    public function updateNotes(Request $request)
    {
        $validated = $request->validate([
            'tariff_notes' => 'nullable|string|max:4000',
        ]);

        auth()->user()->company->update(['tariff_notes' => $validated['tariff_notes']]);

        return back()->with('success', 'Texto de "Importante leer" actualizado.');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Tariff/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'nullable|string|max:50',
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            // El precio base ahora puede venir precalculado del front, o no.
            'price' => 'nullable|numeric|min:0',
            'margin_pct' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
            'costs' => 'nullable|array',
            'costs.*.type' => 'required|string',
            'costs.*.description' => 'required|string',
            'costs.*.supplier' => 'nullable|string',
            'costs.*.unit' => 'nullable|string',
            'costs.*.unit_cost' => 'required|numeric|min:0',
            'costs.*.quantity' => 'required|numeric|min:0',
            'costs.*.margin_pct' => 'required|numeric|min:0',
        ]);

        $calculatedPrice = 0;
        if (! empty($validated['costs'])) {
            foreach ($validated['costs'] as $cost) {
                $totalCost = $cost['unit_cost'] * $cost['quantity'];
                $suggestedPrice = round($totalCost * (1 + ($cost['margin_pct'] / 100)), 2);
                $calculatedPrice += $suggestedPrice;
            }
        }

        // Si mandaron price manual lo usamos, si no usamos el calculado.
        $finalPrice = isset($validated['price']) && $validated['price'] > 0
            ? $validated['price']
            : $calculatedPrice;

        $tariff = Tariff::create([
            'company_id' => auth()->user()->company_id,
            'code' => $validated['code'],
            'name' => $validated['name'],
            'category' => $validated['category'] ?? 'Otros',
            'price' => $finalPrice,
            'margin_pct' => $validated['margin_pct'] ?? 0,
            'unit' => $validated['unit'] ?? 'unidad',
            'description' => $validated['description'],
            'is_active' => $validated['is_active'],
        ]);

        if (! empty($validated['costs'])) {
            $tariff->costs()->createMany($validated['costs']);
        }

        return redirect()->route('tariffs.index')->with('success', 'Arancel creado exitosamente.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tariff $tariff)
    {
        if ($tariff->company_id !== auth()->user()->company_id) {
            abort(403);
        }

        return Inertia::render('Tariff/Edit', [
            'item' => $tariff->load('costs', 'phases'),
            'phaseTemplates' => PhaseTemplate::where('company_id', $tariff->company_id)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'price']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tariff $tariff)
    {
        if ($tariff->company_id !== auth()->user()->company_id) {
            abort(403);
        }

        $validated = $request->validate([
            'code' => 'nullable|string|max:50',
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'price' => 'nullable|numeric|min:0',
            'margin_pct' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
            'costs' => 'nullable|array',
            'costs.*.type' => 'required|string',
            'costs.*.description' => 'required|string',
            'costs.*.supplier' => 'nullable|string',
            'costs.*.unit' => 'nullable|string',
            'costs.*.unit_cost' => 'required|numeric|min:0',
            'costs.*.quantity' => 'required|numeric|min:0',
            'costs.*.margin_pct' => 'required|numeric|min:0',
        ]);

        $calculatedPrice = 0;
        if (! empty($validated['costs'])) {
            foreach ($validated['costs'] as $cost) {
                $totalCost = $cost['unit_cost'] * $cost['quantity'];
                $suggestedPrice = round($totalCost * (1 + ($cost['margin_pct'] / 100)), 2);
                $calculatedPrice += $suggestedPrice;
            }
        }

        $finalPrice = isset($validated['price']) && $validated['price'] > 0
            ? $validated['price']
            : $calculatedPrice;

        $tariff->update([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'category' => $validated['category'] ?? 'Otros',
            'price' => $finalPrice,
            'margin_pct' => $validated['margin_pct'] ?? 0,
            'unit' => $validated['unit'] ?? 'unidad',
            'description' => $validated['description'],
            'is_active' => $validated['is_active'],
        ]);

        // Reemplazar costos.
        $tariff->costs()->delete();
        if (! empty($validated['costs'])) {
            $tariff->costs()->createMany($validated['costs']);
        }

        return redirect()->route('tariffs.index')->with('success', 'Arancel actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tariff $tariff)
    {
        if ($tariff->company_id !== auth()->user()->company_id) {
            abort(403);
        }

        $tariff->delete();

        return redirect()->route('tariffs.index')->with('success', 'Arancel eliminado exitosamente.');
    }

    /**
     * Orden institucional de categorías del arancel (igual al arancel impreso de referencia
     * del laboratorio). Cualquier categoría nueva que no esté en esta lista se agrega al final,
     * ordenada alfabéticamente, para no romper el PDF cuando se cargan aranceles nuevos.
     *
     * @var array<int, string>
     */
    private const CATEGORY_ORDER = [
        'ACRÍLICO TERMO TRADICIONAL',
        'ACRÍLICO INYECTADO O FLEX',
        'ACRÍLICO POR COLADO APC',
        'PRÓTESIS PROVISORIA',
        'CROMO COBALTO',
        'REPARACIONES',
        'CORONAS',
        'INCRUSTACIONES',
        'PERNOS',
        'CARILLAS',
        'ANCLAJE ATACHMEN',
        'ENCERADO / HIBRIDAS',
        'IMPLANTES Y BARRAS',
        'METALES',
        'PLACAS',
        'PARA COLEGAS Y DOCTORES',
    ];

    /**
     * Genera el PDF del arancel vigente (logo, dirección y teléfono de la empresa +
     * todos los aranceles activos agrupados por categoría, en el mismo orden institucional
     * del arancel impreso), con notas de laboratorio y QR de Instagram/WhatsApp, para
     * compartir con los odontólogos después de un aumento masivo de precios.
     *
     * Se renderiza con Chrome real (Browsershot) en vez de dompdf: el arancel necesita
     * columnas tipo periódico (varias categorías, alturas irregulares, con salto de
     * página automático) y un header/footer degradado repetido en cada página, algo que
     * dompdf no soporta de forma confiable (sin CSS columns, y su position:fixed no se
     * comporta como el de un navegador real).
     */
    public function pdf(Request $request)
    {
        $companyId = auth()->user()->company_id;
        $company = auth()->user()->company;

        $categoryOrder = array_flip(self::CATEGORY_ORDER);

        $categories = Tariff::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('id')
            ->get(['category', 'name', 'price'])
            ->groupBy(fn (Tariff $t) => $t->category ?: 'Otros')
            ->sortBy(fn ($items, $category) => $categoryOrder[$category] ?? (count($categoryOrder) + 1), SORT_NATURAL);

        $months = [1 => 'ENERO', 2 => 'FEBRERO', 3 => 'MARZO', 4 => 'ABRIL', 5 => 'MAYO', 6 => 'JUNIO', 7 => 'JULIO', 8 => 'AGOSTO', 9 => 'SEPTIEMBRE', 10 => 'OCTUBRE', 11 => 'NOVIEMBRE', 12 => 'DICIEMBRE'];
        $now = now();

        $storedLogoUrl = $company->documentLogoUrl('lab');
        $logoSrc = '';
        if ($storedLogoUrl) {
            $logoPath = public_path(ltrim($storedLogoUrl, '/'));
            if (file_exists($logoPath)) {
                $logoSrc = 'data:image/png;base64,'.base64_encode(file_get_contents($logoPath));
            }
        }

        $headerVars = [
            'company' => $company,
            'logoSrc' => $logoSrc,
            'contactLine1' => collect([$company->address ?? null, $company->city ?? null, $company->province ?? null])->filter()->join(' - '),
            'contactLine2' => $company->phone ?? null,
            'monthLabel' => $months[$now->month].' '.$now->year,
        ];

        $igQrSrc = $company->instagram_handle ? $this->buildQrDataUri('https://instagram.com/'.ltrim($company->instagram_handle, '@')) : null;
        $waNumber = preg_replace('/\D/', '', (string) ($company->whatsapp_contact_number ?: $company->phone));
        $waQrSrc = $waNumber ? $this->buildQrDataUri('https://wa.me/'.$waNumber) : null;

        $html = view('pdf.tariff_list', [
            'categories' => $categories,
            'company' => $company,
            'resolvedNotes' => TariffNotesRenderer::resolve($company->tariff_notes, $companyId),
            'igQrSrc' => $igQrSrc,
            'waQrSrc' => $waQrSrc,
        ])->render();

        $headerHtml = view('pdf.partials.tariff_header', $headerVars)->render();
        $footerHtml = view('pdf.partials.tariff_footer', ['company' => $company])->render();

        $browsershot = Browsershot::html($html)
            ->noSandbox()
            ->writeOptionsToFile()
            ->showBackground()
            ->format('A4')
            ->margins(33, 0, 13, 0, 'mm')
            ->headerHtml($headerHtml)
            ->footerHtml($footerHtml)
            ->showBrowserHeaderAndFooter();

        if (file_exists('/usr/bin/google-chrome-stable')) {
            $browsershot->setChromePath('/usr/bin/google-chrome-stable');
        }

        // El servidor web (PHP-FPM / `php artisan serve`) no hereda el PATH que fnm
        // inyecta en una shell interactiva, así que "node"/"npm" no se encuentran ahí
        // aunque sí funcionen desde la terminal. Apuntamos directo a los binarios reales.
        foreach ([getenv('HOME').'/.local/share/fnm/aliases/default/bin/node', '/usr/local/bin/node', '/usr/bin/node'] as $nodeBinary) {
            if (file_exists($nodeBinary)) {
                $browsershot->setNodeBinary($nodeBinary);
                break;
            }
        }
        $browsershot->setNodeModulePath(base_path('node_modules'));

        return response($browsershot->pdf(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="arancel-'.now()->format('Y-m').'.pdf"',
        ]);
    }

    private function buildQrDataUri(string $url): string
    {
        $qrOpts = new QROptions;
        $qrOpts->outputInterface = QRMarkupSVG::class;
        $qrOpts->eccLevel = EccLevel::M;
        $qrOpts->scale = 4;
        $qrOpts->addQuietzone = true;
        $qrOpts->quietzoneSize = 2;

        return (new QRCode($qrOpts))->render($url);
    }
}
