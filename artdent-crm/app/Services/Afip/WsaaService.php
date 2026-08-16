<?php

namespace App\Services\Afip;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use SoapClient;
use SoapFault;

/**
 * Web Service de Autenticación y Autorización (WSAA) de ARCA/AFIP.
 *
 * Genera y cachea el Ticket de Acceso (TA) durante 12 horas.
 * Basado en la especificación técnica WSAA 1.2.2.
 */
class WsaaService
{
    public function __construct(
        private readonly string $environment = 'homo'
    ) {}

    /**
     * Retorna el token y sign para usar en otros web services.
     * Si el TA está en caché y es válido, lo reutiliza.
     *
     * @return array{token: string, sign: string}
     */
    public function getAuth(string $cuit, string $certPath, string $keyPath, string $service = 'wsfe'): array
    {
        $cacheKey = $this->cacheKey($cuit, $service);

        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $ta = $this->requestTicket($certPath, $keyPath, $service);
        $auth = [
            'token' => $ta['token'],
            'sign' => $ta['sign'],
        ];

        // Cachear hasta 10 minutos antes de que expire (AFIP emite tickets de 12hs)
        $ttl = max(0, $ta['expires_at'] - time() - 600);
        Cache::put($cacheKey, $auth, $ttl);

        return $auth;
    }

    /**
     * Invalida el ticket en caché para forzar renovación.
     */
    public function invalidate(string $cuit, string $service = 'wsfe'): void
    {
        Cache::forget($this->cacheKey($cuit, $service));
    }

    /**
     * El CUIT ya scopea esto en la práctica (cada company tiene el suyo),
     * pero se agrega tenant_id igual como defensa en profundidad — mismo
     * criterio que el bug real ya confirmado una vez con el cache de
     * permisos de Spatie (ver project_spatie_permission_cache_multitenant_bug
     * en memoria): no depender de que un valor de negocio sea siempre único
     * entre tenants para que el cache no se cruce.
     */
    private function cacheKey(string $cuit, string $service): string
    {
        $tenantId = function_exists('tenant') && tenancy()->initialized ? tenant('id') : 'no-tenant';

        return "afip_ta_{$tenantId}_{$this->environment}_{$cuit}_{$service}";
    }

    // ─── Internals ────────────────────────────────────────────────────────────

    private function requestTicket(string $certPath, string $keyPath, string $service): array
    {
        $this->validatePaths($certPath, $keyPath);

        $traXml = $this->buildTra($service);
        $cms = $this->signTra($traXml, $certPath, $keyPath);
        $taXml = $this->callWsaa($cms);

        return $this->parseTa($taXml);
    }

    /**
     * Construye el TRA (Ticket de Requerimiento de Acceso) en XML.
     */
    private function buildTra(string $service): string
    {
        $now = time();
        $genTime = date('c', $now - 60);
        $expireTime = date('c', $now + config('afip.wsaa.ttl_seconds', 43200));
        $uniqueId = $now;

        return <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
        <loginTicketRequest version="1.0">
          <header>
            <uniqueId>{$uniqueId}</uniqueId>
            <generationTime>{$genTime}</generationTime>
            <expirationTime>{$expireTime}</expirationTime>
          </header>
          <service>{$service}</service>
        </loginTicketRequest>
        XML;
    }

    /**
     * Firma el TRA con la clave privada de la empresa (PKCS#7/CMS).
     * Devuelve el CMS en Base64 tal como espera AFIP.
     */
    private function signTra(string $traXml, string $certPath, string $keyPath): string
    {
        // Escribir TRA a archivo temporal seguro
        $traFile = tempnam(sys_get_temp_dir(), 'afip_tra_');
        $cmsFile = $traFile.'.cms';

        try {
            file_put_contents($traFile, $traXml);

            // Cargar y validar el certificado (soporta PEM y DER)
            $certContent = file_get_contents($certPath);
            $certResource = @openssl_x509_read($certContent);
            if ($certResource === false) {
                // Intentar conversión DER → PEM
                $pem = '-----BEGIN CERTIFICATE-----'."\n"
                    .chunk_split(base64_encode($certContent), 64, "\n")
                    .'-----END CERTIFICATE-----'."\n";
                $certResource = @openssl_x509_read($pem);
                if ($certResource === false) {
                    throw new RuntimeException(
                        'No se pudo leer el certificado AFIP. '.
                        'Asegúrese de subir el archivo .crt del certificado (no la clave privada). '.
                        'Error: '.openssl_error_string()
                    );
                }
                $certContent = $pem;
            }

            // Cargar y validar la clave privada
            $keyContent = file_get_contents($keyPath);
            $keyResource = @openssl_pkey_get_private($keyContent);
            if ($keyResource === false) {
                $firstLine = strtok(trim($keyContent), "\n");
                $hint = str_contains($firstLine, 'CERTIFICATE')
                    ? ' El archivo subido como clave privada es un certificado. Suba el archivo .key o .pem con la clave privada RSA.'
                    : '';
                throw new RuntimeException(
                    'No se pudo cargar la clave privada AFIP.'.$hint.' Error: '.openssl_error_string()
                );
            }

            $signed = openssl_pkcs7_sign(
                $traFile,
                $cmsFile,
                $certContent,
                $keyResource,            // recurso OpenSSL ya validado
                [],                       // extra headers
                \PKCS7_NOOLDMIMETYPE       // evita cabecera MIME antigua
            );

            if (! $signed) {
                throw new RuntimeException('No se pudo firmar el TRA: '.openssl_error_string());
            }

            $rawCms = file_get_contents($cmsFile);

            // El CMS viene en formato MIME con separadores; extraemos solo el bloque Base64
            $parts = explode("\n\n", $rawCms);
            if (count($parts) < 2) {
                throw new RuntimeException('Formato de CMS inesperado.');
            }
            $b64Block = explode("\n\n--", $parts[1]);
            $base64Cms = str_replace("\n", '', $b64Block[0]);

            return $base64Cms;

        } finally {
            @unlink($traFile);
            @unlink($cmsFile);
        }
    }

    /**
     * Llama al servicio WSAA vía SOAP y retorna el XML del TA.
     */
    private function callWsaa(string $cms): string
    {
        $wsdl = config("afip.wsaa.{$this->environment}.wsdl");

        // Los servidores AFIP/ARCA usan certificados SSL de autoridades públicas (SSL.com),
        // verificables con el bundle del sistema — no con la CA chain de aplicación de AFIP.
        // Se permiten ciphers con DH keys pequeñas porque los servidores de prod de AFIP
        // usan DH de 512 bits, rechazado por OpenSSL con security level >= 1.
        $systemCa = '/etc/ssl/certs/ca-certificates.crt';
        // open_basedir en hosting compartido puede bloquear file_exists() en /etc/ssl
        $caExists = @file_exists($systemCa);
        $sslOpts = [
            'verify_peer' => $caExists,
            'verify_peer_name' => $caExists,
            'cafile' => $systemCa,
            'ciphers' => 'DEFAULT:@SECLEVEL=0',
        ];

        $options = [
            'soap_version' => \SOAP_1_2,
            'exceptions' => true,
            'trace' => false,
            'cache_wsdl' => \WSDL_CACHE_NONE,
            'connection_timeout' => 30,
            'stream_context' => stream_context_create(['ssl' => $sslOpts]),
        ];

        try {
            $client = new SoapClient($wsdl, $options);
            $response = $client->loginCms(['in0' => $cms]);

            return $response->loginCmsReturn;

        } catch (SoapFault $e) {
            Log::error('WSAA SOAP fault', ['code' => $e->getCode(), 'message' => $e->getMessage()]);
            throw new RuntimeException('Error WSAA: '.$e->getMessage(), (int) $e->getCode(), $e);
        }
    }

    /**
     * Parsea el XML del TA y extrae token, sign y expiración.
     *
     * @return array{token: string, sign: string, expires_at: int}
     */
    private function parseTa(string $taXml): array
    {
        $xml = simplexml_load_string($taXml);

        if ($xml === false) {
            throw new RuntimeException('No se pudo parsear el TA de AFIP.');
        }

        return [
            'token' => (string) $xml->credentials->token,
            'sign' => (string) $xml->credentials->sign,
            'expires_at' => strtotime((string) $xml->header->expirationTime),
        ];
    }

    private function validatePaths(string $certPath, string $keyPath): void
    {
        if (! file_exists($certPath)) {
            throw new RuntimeException("Certificado AFIP no encontrado: {$certPath}");
        }
        if (! file_exists($keyPath)) {
            throw new RuntimeException("Clave privada AFIP no encontrada: {$keyPath}");
        }
    }
}
