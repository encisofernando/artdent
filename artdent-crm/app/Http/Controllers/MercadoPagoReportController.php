<?php

namespace App\Http\Controllers;

use App\Services\MercadoPagoReportService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MercadoPagoReportController extends Controller
{
    protected MercadoPagoReportService $reportService;

    public function __construct(MercadoPagoReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Display the reports dashboard.
     */
    public function index()
    {
        try {
            $reports = $this->reportService->listReports();
        } catch (Exception $e) {
            $reports = [];
            session()->flash('error', 'Error al obtener reportes: '.$e->getMessage());
        }

        return Inertia::render('Ecommerce/Reports', [
            'reports' => $reports,
        ]);
    }

    /**
     * Request a new report generation.
     */
    public function generate(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        try {
            $start = Carbon::parse($request->start_date);
            $end = Carbon::parse($request->end_date);

            $result = $this->reportService->generateReleasesReport($start, $end);

            return back()->with('success', 'Reporte solicitado correctamente. El ID es: '.($result['id'] ?? 'N/A'));
        } catch (Exception $e) {
            return back()->with('error', 'Error al generar reporte: '.$e->getMessage());
        }
    }

    /**
     * Download a specific report file.
     */
    public function download(string $fileName)
    {
        try {
            $content = $this->reportService->getReportContent($fileName);

            return response($content)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', "attachment; filename=\"{$fileName}\"");
        } catch (Exception $e) {
            return back()->with('error', 'No se pudo descargar el reporte: '.$e->getMessage());
        }
    }
}
