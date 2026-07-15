<?php

namespace App\Http\Controllers;

use App\Models\ArtAccident;
use App\Models\ArtProvider;
use App\Models\Employee;
use App\Models\MedicalExam;
use App\Support\CompanyContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MedicinaLaboralController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = CompanyContext::id();

        $employees = Employee::query()
            ->with('user:id,name')
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('id')
            ->get(['id', 'user_id', 'art_provider_id']);

        $artProviders = ArtProvider::query()
            ->where('company_id', $companyId)
            ->withCount('employees')
            ->orderBy('name')
            ->get();

        $medicalExams = MedicalExam::query()
            ->with('employee.user:id,name')
            ->where('company_id', $companyId)
            ->orderByDesc('exam_date')
            ->get();

        // Alertas de vencimiento: exámenes vencidos o que vencen dentro de 30 días.
        $expiringExams = $medicalExams
            ->filter(fn (MedicalExam $exam) => $exam->expires_at !== null && $exam->isExpiringSoon(30))
            ->sortBy('expires_at')
            ->values();

        $expiredExams = $medicalExams
            ->filter(fn (MedicalExam $exam) => $exam->isExpired())
            ->sortBy('expires_at')
            ->values();

        $artAccidents = ArtAccident::query()
            ->with('employee.user:id,name')
            ->where('company_id', $companyId)
            ->orderByDesc('occurred_at')
            ->get();

        return Inertia::render('Rrhh/MedicinaLaboral/Index', [
            'employees' => $employees,
            'artProviders' => $artProviders,
            'medicalExams' => $medicalExams,
            'expiringExams' => $expiringExams,
            'expiredExams' => $expiredExams,
            'artAccidents' => $artAccidents,
        ]);
    }
}
