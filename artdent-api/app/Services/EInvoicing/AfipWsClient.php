<?php

namespace App\Services\EInvoicing;

use Exception;

class AfipWsClient
{
    /** @var string */
    private $env; // homologacion | produccion (usamos homologacion por defecto)
    /** @var string */
    public $certPath;
    /** @var string */
    public $keyPath;
    /** @var string */
    public $caInfo;

    /** Directorio base donde dejamos tra.xml / tra.cms */
    private $workDir;

    public function __construct()
    {
        // 1) Leer variables .env
        $this->env = env('AFIP_ENV', 'homologacion');

        // Aceptamos AFIP_CERT o AFIP_CERT_PATH (idem KEY)
        $cert = env('AFIP_CERT') ?: env('AFIP_CERT_PATH', '');
        $key  = env('AFIP_KEY')  ?: env('AFIP_KEY_PATH',  '');
        $ca   = env('AFIP_CAINFO', '');

        // 2) Normalizar (absoluto si es relativo; si ya es absoluto, lo respetamos)
        $this->certPath = $this->resolvePath($cert);
        $this->keyPath  = $this->resolvePath($key);
        $this->caInfo   = $this->resolvePath($ca);

        // 3) Validar legibilidad
        $this->assertReadable($this->certPath, 'Certificado (AFIP_CERT)');
        $this->assertReadable($this->keyPath,  'Clave privada (AFIP_KEY)');
        $this->assertReadable($this->caInfo,   'CA bundle (AFIP_CAINFO)');

        // 4) Directorio de trabajo
        $this->workDir = storage_path('app/afip/'.$this->env);
        if (!is_dir($this->workDir) && !@mkdir($concurrentDirectory = $this->workDir, 0775, true) && !is_dir($concurrentDirectory)) {
            throw new Exception("No se pudo crear directorio de trabajo AFIP: {$this->workDir}");
        }
    }

    /**
     * Autoriza factura: obtiene LoginTicket (CMS), llama WS, etc.
     * Aquí solo mostramos la parte de login y firma del TRA.
     */
    public function authorizeInvoice(array $payload)
    {
        // 1) Login CMS
        $loginCms = $this->loginCms('wsfe');

        // 2) ... llamar WSFE con $loginCms (omito por brevedad)
        //    retornar respuesta simulada
        return [
            'status' => 'ok',
            'loginCms_len' => strlen($loginCms),
        ];
    }

    /**
     * Genera y firma el TRA y devuelve el CMS binario (string)
     */
    private function loginCms(string $service = 'wsfe'): string
    {
        // Crear TRA (válido +/- 1 hora)
        $traXmlPath = $this->workDir.'/tra.xml';
        $this->writeTRA($traXmlPath, $service);

        // Firmar TRA (PKCS#7 S/MIME DER)
        $cmsPath = $this->workDir.'/tra.cms';
        $this->signTRA($traXmlPath, $cmsPath);

        // Devolver binario del CMS
        $cms = @file_get_contents($cmsPath);
        if ($cms === false || strlen($cms) === 0) {
            throw new Exception('No se pudo leer el CMS firmado (tra.cms).');
        }
        return $cms;
    }

    private function writeTRA(string $path, string $service): void
    {
        $now = new \DateTimeImmutable('now');
        // AFIP suele aceptar +/- 10 min; dejamos 1h de ventana por claridad
        $gen = $now->modify('-10 minutes')->format('c');
        $exp = $now->modify('+50 minutes')->format('c');

        $xml = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
  <header>
    <uniqueId>{$now->getTimestamp()}</uniqueId>
    <generationTime>{$gen}</generationTime>
    <expirationTime>{$exp}</expirationTime>
  </header>
  <service>{$service}</service>
</loginTicketRequest>
XML;

        if (@file_put_contents($path, $xml) === false) {
            throw new Exception("No se pudo escribir TRA en: {$path}");
        }
    }

    /**
     * Firma el TRA en $inXml y genera $outCms (DER, nodetach, binary)
     */
    private function signTRA(string $inXml, string $outCms): void
    {
        if (!is_file($inXml) || !is_readable($inXml)) {
            throw new Exception("TRA no es legible: {$inXml}");
        }
        $this->assertReadable($this->certPath, 'Certificado (AFIP_CERT)');
        $this->assertReadable($this->keyPath,  'Clave privada (AFIP_KEY)');

        // Comando OpenSSL S/MIME
        // Nota: usamos / en Windows; OpenSSL lo soporta.
        $cmd = [
            'openssl', 'smime', '-sign',
            '-signer', $this->certPath,
            '-inkey',  $this->keyPath,
            '-in',     $inXml,
            '-out',    $outCms,
            '-outform','DER',
            '-nodetach',
            '-binary'
        ];

        $this->runOpenSSL($cmd, $outCms);

        // Validar tamaño de salida
        clearstatcache(true, $outCms);
        if (!is_file($outCms) || filesize($outCms) === 0) {
            throw new Exception('Error al firmar TRA (openssl). Salida vacía.');
        }
    }

    /**
     * Ejecuta openssl y, si falla, arroja excepción con stderr.
     */
    private function runOpenSSL(array $cmd, string $expectOutPath = null): void
    {
        $spec = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ];

        $proc = proc_open($cmd, $spec, $pipes, $this->workDir);
        if (!\is_resource($proc)) {
            throw new Exception('No se pudo lanzar openssl.');
        }

        fclose($pipes[0]);
        $stdout = stream_get_contents($pipes[1]); fclose($pipes[1]);
        $stderr = stream_get_contents($pipes[2]); fclose($pipes[2]);

        $exit = proc_close($proc);

        if ($exit !== 0) {
            $cmdline = implode(' ', array_map([$this,'escapeArgForLog'], $cmd));
            throw new Exception("OpenSSL error (code {$exit}). CMD: {$cmdline}\nSTDERR: {$stderr}\nSTDOUT: {$stdout}");
        }

        if ($expectOutPath !== null && (!is_file($expectOutPath) || filesize($expectOutPath) === 0)) {
            throw new Exception("OpenSSL no generó salida en {$expectOutPath}. STDERR: {$stderr}");
        }
    }

    private function escapeArgForLog(string $a): string
    {
        // Solo para logging
        return strpos($a, ' ') !== false ? "\"{$a}\"" : $a;
    }

    private function assertReadable(string $path, string $label): void
    {
        if ($path === '' || !is_file($path) || !is_readable($path)) {
            throw new Exception("{$label} no es legible: {$path}");
        }
    }

    private function resolvePath(string $path): string
    {
        $path = trim($path);
        if ($path === '') {
            return $path;
        }

        // Ya absoluto? (Windows: C:\ o \\server, Unix: /)
        if ($this->isAbsolutePath($path)) {
            return $this->normalizeSep($path);
        }

        // Relativo al base_path del proyecto
        return $this->normalizeSep(base_path($path));
    }

    private function isAbsolutePath(string $p): bool
    {
        // C:\..., \\server\..., o /...
        return (bool)preg_match('~^(?:[A-Za-z]:[\\/]|\\\\\\\\|/)~', $p);
    }

    private function normalizeSep(string $p): string
    {
        // Aceptamos "/" en Windows; normalizamos dobles slashes accidentales
        $p = str_replace('\\', '/', $p);
        $p = preg_replace('#/+#','/', $p);
        return $p;
    }
}
