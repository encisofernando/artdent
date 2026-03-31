<?php

namespace App\Services\Afip;

use App\Models\Company;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use SoapClient;
use SoapFault;

/**
 * Consulta el padrón de contribuyentes de ARCA (ws_sr_constancia_inscripcion).
 *
 * Dado un CUIT retorna los datos fiscales del contribuyente normalizados.
 * Los resultados se cachean 24 horas para reducir latencia y evitar bloqueos.
 */
class PadronService
{
    private const AFIP_SERVICE = 'ws_sr_constancia_inscripcion';

    private const CACHE_TTL = 86400; // 24 horas

    /**
     * Mapa idImpuesto → condición IVA interna.
     * Fuente: FEParamGetTiposIva / documentación ARCA A5.
     */
    private const IVA_IMPUESTO = [
        30 => 'responsable_inscripto', // IVA - Responsable Inscripto
        32 => 'exento',                // IVA - Exento
        163 => 'monotributista',        // Monotributo
    ];

    private readonly string $companyCuit;

    private readonly string $certPath;

    private readonly string $keyPath;

    private readonly string $environment;

    public function __construct(
        private readonly WsaaService $wsaa,
        Company $company
    ) {
        $this->environment = $company->afip_environment ?? 'homo';
        $this->companyCuit = preg_replace('/\D/', '', $company->cuit ?? '');
        $this->certPath = $company->afipCertPath($this->environment) ?? '';
        $this->keyPath = $company->afip_key_path ?? '';
    }

    /**
     * Retorna los datos fiscales de un contribuyente dado su CUIT.
     * Resultado cacheado 24 horas.
     *
     * @return array{
     *   cuit: string,
     *   razon_social: string,
     *   tipo_persona: string,
     *   estado: string,
     *   condicion_iva: string,
     *   condicion_iva_label: string,
     *   direccion: string,
     *   localidad: string,
     *   provincia: string,
     *   cod_postal: string,
     * }
     */
    public function getClienteByCuit(string $cuit): array
    {
        $cuit = preg_replace('/\D/', '', $cuit);

        if (strlen($cuit) !== 11 || ! ctype_digit($cuit)) {
            throw new RuntimeException("CUIT inválido: debe tener 11 dígitos numéricos (recibido: '{$cuit}').");
        }

        return Cache::remember(
            "padron_{$this->environment}_{$cuit}",
            self::CACHE_TTL,
            fn () => $this->fetchFromArca($cuit)
        );
    }

    /**
     * Invalida la cache de un CUIT para forzar reconsulta.
     */
    public function invalidate(string $cuit): void
    {
        $cuit = preg_replace('/\D/', '', $cuit);
        Cache::forget("padron_{$this->environment}_{$cuit}");
    }

    // ─── Internals ────────────────────────────────────────────────────────────

    private function fetchFromArca(string $cuit): array
    {
        $auth = $this->wsaa->getAuth($this->companyCuit, $this->certPath, $this->keyPath, self::AFIP_SERVICE);
        $client = $this->buildClient();

        $maxAttempts = 2;

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                $response = $client->getPersona_v2([
                    'token' => $auth['token'],
                    'sign' => $auth['sign'],
                    'cuitRepresentada' => $this->companyCuit,
                    'idPersona' => $cuit,
                ]);

                return $this->normalize($response, $cuit);

            } catch (SoapFault $e) {
                $msg = $e->getMessage();

                // Detectar CUIT inexistente vs. error de servicio
                if (str_contains($msg, 'No existe persona') || str_contains($msg, '10016')) {
                    throw new RuntimeException("El CUIT {$cuit} no existe en el padrón ARCA.");
                }

                Log::warning("PadronService intento {$attempt}/{$maxAttempts} fallido", [
                    'cuit' => $cuit,
                    'message' => $msg,
                ]);

                if ($attempt >= $maxAttempts) {
                    Log::error('PadronService: sin más reintentos', ['cuit' => $cuit, 'error' => $msg]);
                    throw new RuntimeException("Error consultando padrón ARCA: {$msg}");
                }

                sleep(1);
            }
        }

        throw new RuntimeException('Error inesperado consultando el padrón.');
    }

    private function normalize(mixed $response, string $cuit): array
    {
        // La respuesta real de ARCA tiene la estructura:
        // personaReturn -> datosGenerales (datos básicos del contribuyente)
        // personaReturn -> datosMonotributo (si es monotributista)
        // personaReturn -> datosRegimenGeneral (si es RI/Exento)
        $personaReturn = $response->personaReturn ?? null;
        $datos = $personaReturn->datosGenerales ?? null;

        if (empty($datos)) {
            throw new RuntimeException("El CUIT {$cuit} no fue encontrado en el padrón ARCA.");
        }

        $tipoPersona = strtoupper((string) ($datos->tipoPersona ?? 'FISICA'));

        if ($tipoPersona === 'JURIDICA') {
            $razonSocial = (string) ($datos->razonSocial ?? '');
        } else {
            $nombre = trim((string) ($datos->nombre ?? ''));
            $apellido = trim((string) ($datos->apellido ?? ''));
            $razonSocial = trim("{$apellido} {$nombre}");
        }

        // Domicilio fiscal — ARCA devuelve la dirección ya combinada en el campo "direccion"
        $dom = $datos->domicilioFiscal ?? null;
        $direccion = trim((string) ($dom->direccion ?? ''));
        if (empty($direccion)) {
            $calle = trim((string) ($dom->calle ?? ''));
            $numero = trim((string) ($dom->numero ?? ''));
            $direccion = $numero ? "{$calle} {$numero}" : $calle;
        }

        $condicionIva = $this->resolveIvaCondition($personaReturn);

        $condicionLabels = [
            'responsable_inscripto' => 'Responsable Inscripto',
            'monotributista' => 'Responsable Monotributo',
            'exento' => 'IVA Exento',
            'consumidor_final' => 'Consumidor Final',
        ];

        return [
            'cuit' => $cuit,
            'razon_social' => $razonSocial,
            'tipo_persona' => $tipoPersona,
            'estado' => strtoupper((string) ($datos->estadoClave ?? 'ACTIVO')),
            'condicion_iva' => $condicionIva,
            'condicion_iva_label' => $condicionLabels[$condicionIva] ?? $condicionIva,
            'direccion' => $direccion,
            'localidad' => (string) ($dom->localidad ?? ''),
            'provincia' => (string) ($dom->descripcionProvincia ?? ''),
            'cod_postal' => (string) ($dom->codPostal ?? ''),
        ];
    }

    private function resolveIvaCondition(mixed $personaReturn): string
    {
        // Monotributista: tiene sección datosMonotributo
        if (! empty($personaReturn->datosMonotributo)) {
            return 'monotributista';
        }

        // RI / Exento: tienen datosRegimenGeneral con lista de impuestos
        $regimenGeneral = $personaReturn->datosRegimenGeneral ?? null;
        if (! empty($regimenGeneral)) {
            $impuestos = $regimenGeneral->impuesto ?? null;
            if (! empty($impuestos)) {
                $items = is_array($impuestos) ? $impuestos : [$impuestos];
                foreach ($items as $imp) {
                    $id = (int) ($imp->idImpuesto ?? 0);
                    if (isset(self::IVA_IMPUESTO[$id])) {
                        return self::IVA_IMPUESTO[$id];
                    }
                }
            }
        }

        return 'consumidor_final';
    }

    private function buildClient(): SoapClient
    {
        $wsdl = config("afip.padron.{$this->environment}.wsdl");

        $systemCa = '/etc/ssl/certs/ca-certificates.crt';
        $sslOpts = [
            'verify_peer' => file_exists($systemCa),
            'verify_peer_name' => file_exists($systemCa),
            'cafile' => $systemCa,
            'ciphers' => 'DEFAULT:@SECLEVEL=0',
        ];

        $options = [
            'soap_version' => \SOAP_1_1,  // Padrón A5 usa SOAP 1.1
            'exceptions' => true,
            'trace' => false,
            'cache_wsdl' => \WSDL_CACHE_NONE,
            'connection_timeout' => 10,
            'stream_context' => stream_context_create(['ssl' => $sslOpts]),
        ];

        try {
            return new SoapClient($wsdl, $options);
        } catch (SoapFault $e) {
            throw new RuntimeException("No se pudo conectar con el padrón ARCA: {$e->getMessage()}", 0, $e);
        }
    }
}
