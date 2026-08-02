<?php

namespace App\Services;

use App\Models\EcommerceOrder;
use App\Models\ShippingCarrierConfig;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Integración con la pasarela de Andreani para e-commerce
 * (woocommerce-api-acom.andreani.com) — la misma que usa el plugin oficial
 * de WooCommerce, no la API general de desarrolladores (apis.andreani.com,
 * que usa usuario/contraseña en vez de una Credencial ID única).
 *
 * Auth: header "Authorization: {hash_andreani}" tal cual, sin "Basic "
 * ni base64 — confirmado leyendo el plugin oficial (validate_hash()).
 */
class AndreaniService
{
    private const BASE_URL = 'https://woocommerce-api-acom.andreani.com';

    private ?array $config = null;

    private function config(): array
    {
        if ($this->config === null) {
            $record = ShippingCarrierConfig::query()
                ->where('type', 'andreani')
                ->first();

            $this->config = $record?->config ?? [];
        }

        return $this->config;
    }

    private function hash(): ?string
    {
        return $this->config()['hash_andreani'] ?? null;
    }

    public function cpOrigen(): ?string
    {
        return $this->config()['cp_origen'] ?? null;
    }

    private function endpoint(string $name): string
    {
        $clientType = $this->clientType();
        $group = in_array($clientType, ['pyme', 'middle_market'], true) ? 'Pyme' : 'Corporative';

        return match ($name) {
            'login' => self::BASE_URL.'/api/v1/Login',
            'settings' => self::BASE_URL.'/api/v1/Settings',
            'sucursales' => self::BASE_URL.'/api/v1/Branch',
            'cotizacion' => self::BASE_URL."/api/v1/{$group}/rates",
            'orden' => self::BASE_URL."/api/v1/{$group}/ShippingRegistration",
            'etiqueta' => self::BASE_URL."/api/v1/{$group}/ticket",
            'shipments' => self::BASE_URL.'/api/v1/Shipments',
            default => throw new \InvalidArgumentException("Endpoint Andreani desconocido: {$name}"),
        };
    }

    /**
     * Verifica la Credencial ID contra Andreani y devuelve (con caché de
     * 23 hs) la info del cliente: tipo de cuenta (pyme/corporativo) y
     * contratos disponibles. Es la misma respuesta que usa el plugin
     * oficial para guardar "info_cliente".
     *
     * @return array{clientType: string, contratos: array}|null
     */
    public function clientInfo(): ?array
    {
        $hash = $this->hash();
        if (! $hash) {
            Log::channel('andreani')->error('Andreani: falta la Credencial ID.');

            return null;
        }

        $cacheKey = 'andreani_client_info_'.md5($hash);

        return Cache::remember($cacheKey, now()->addHours(23), function () use ($hash): ?array {
            $response = Http::withHeaders([
                'Authorization' => $hash,
                'Content-Type' => 'application/json',
            ])->post($this->rawLoginUrl());

            if (! $response->successful()) {
                Log::channel('andreani')->error('Andreani: Credencial ID inválida o error de conexión.', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);

                return null;
            }

            $data = $response->json('response') ?? $response->json();

            $clientType = $this->detectClientType($data);

            $info = [
                'clientType' => $clientType,
                'contratos' => $data['contratos'] ?? [],
                'raw' => $data,
            ];

            // Persiste el tipo de cuenta detectado — evita tener que
            // volver a llamar a login() solo para saber qué endpoints usar.
            $record = ShippingCarrierConfig::query()->where('type', 'andreani')->first();
            if ($record) {
                $record->update([
                    'config' => array_merge($record->config ?? [], [
                        'client_type' => $clientType,
                        'contratos' => $info['contratos'],
                    ]),
                ]);
            }

            return $info;
        });
    }

    private function rawLoginUrl(): string
    {
        return self::BASE_URL.'/api/v1/Login';
    }

    /**
     * Andreani no documenta públicamente la forma exacta de este campo en
     * la respuesta de login para esta pasarela — se infiere de forma
     * defensiva (varios nombres posibles) y se cachea una vez detectado.
     * Si no se puede inferir, se asume "pyme" (el tipo de cuenta esperable
     * para un comercio de este tamaño).
     */
    private function detectClientType(?array $data): string
    {
        if (! $data) {
            return 'pyme';
        }

        $candidates = [$data['tipoCliente'] ?? null, $data['clientType'] ?? null, $data['tipo'] ?? null];

        foreach ($candidates as $candidate) {
            if (is_string($candidate) && str_contains(strtolower($candidate), 'corp')) {
                return 'corporativo';
            }
        }

        return 'pyme';
    }

    private function clientType(): string
    {
        $cached = $this->config()['client_type'] ?? null;

        return is_string($cached) && $cached !== '' ? $cached : 'pyme';
    }

    /**
     * Todas las llamadas posteriores al login usan el accessToken de esa
     * respuesta como header X-Auth-Token — no la Credencial ID de nuevo
     * (confirmado leyendo el plugin oficial: la Credencial ID solo se usa
     * una vez, en /Login).
     */
    private function accessToken(): ?string
    {
        return $this->clientInfo()['raw']['accessToken'] ?? null;
    }

    /**
     * Cotiza el envío de un carrito real. $productos es un array de
     * productos ya agrupados en bultos:
     *   [
     *     ['quantity' => 2, 'price' => 15000, 'width' => 10, 'height' => 10, 'depth' => 10, 'grams' => 500],
     *     ...
     *   ]
     *
     * @return array{code: string, total: float, label?: string}[]|null null si no se pudo cotizar
     */
    public function cotizar(string $cpDestino, array $productos): ?array
    {
        $cpOrigen = $this->cpOrigen();
        if (! $cpOrigen || empty($productos)) {
            return null;
        }

        $token = $this->accessToken();
        if (! $token) {
            return null;
        }

        $body = [
            'postal_code_origin' => $cpOrigen,
            'postal_code_destination' => $cpDestino,
            'products' => array_map(fn (array $p): array => [
                'quantity' => (int) $p['quantity'],
                'price' => (int) round($p['price']),
                'dimensions' => [
                    'width' => (int) $p['width'],
                    'height' => (int) $p['height'],
                    'depth' => (int) $p['depth'],
                    'grams' => (int) $p['grams'],
                ],
            ], $productos),
        ];

        $response = Http::withHeaders([
            'X-Auth-Token' => $token,
            'Content-Type' => 'application/json',
        ])->post($this->endpoint('cotizacion'), $body);

        if (! $response->successful()) {
            Log::channel('andreani')->error('Andreani: error al cotizar envío.', [
                'status' => $response->status(),
                'response' => $response->body(),
                'body_enviado' => $body,
            ]);

            return null;
        }

        $rates = $response->json('response.rates') ?? $response->json('rates') ?? [];

        if (empty($rates)) {
            Log::channel('andreani')->warning('Andreani: cotización sin tarifas para esta combinación.', [
                'cp_destino' => $cpDestino,
            ]);
        }

        return $rates;
    }

    /**
     * Registra una orden de envío real en Andreani. Esto tiene efecto en
     * el mundo real (Andreani planifica el retiro) — no se debe llamar a
     * modo de prueba sin confirmación explícita.
     */
    public function crearOrden(array $orderData): ?array
    {
        $token = $this->accessToken();
        if (! $token) {
            return null;
        }

        $response = Http::withHeaders([
            'X-Auth-Token' => $token,
            'Content-Type' => 'application/json',
        ])->post($this->endpoint('orden'), $orderData);

        if (! $response->successful()) {
            Log::channel('andreani')->error('Andreani: error al crear la orden de envío.', [
                'status' => $response->status(),
                'response' => $response->body(),
                'body_enviado' => $orderData,
            ]);

            return null;
        }

        return $response->json();
    }

    /**
     * Arma y envía la orden de envío real para un pedido de e-commerce ya
     * pago, usando el contrato "estándar" (envío a domicilio) detectado en
     * el login. Devuelve el identificador que Andreani usa después para
     * pedir la etiqueta y consultar el estado (pedidoId, para cuentas pyme).
     *
     * @return array{ok: bool, message?: string, numero?: string, raw?: array}
     */
    public function crearOrdenParaPedido(EcommerceOrder $order): array
    {
        $order->loadMissing(['customer', 'ecommerce_order_items.product']);

        $cpOrigen = $this->cpOrigen();
        if (! $cpOrigen) {
            return ['ok' => false, 'message' => 'Falta configurar el Código Postal de origen de Andreani.'];
        }

        $contrato = $this->contratoEstandar();
        if (! $contrato) {
            return ['ok' => false, 'message' => 'No se encontró el contrato "estándar" de Andreani. Probá la conexión en Transportistas.'];
        }

        if (! $order->shipping_address || ! $order->shipping_city || ! $order->shipping_postal) {
            return ['ok' => false, 'message' => 'Faltan datos de dirección de envío en el pedido.'];
        }

        $direccion = $this->parsearDireccion($order->shipping_address);

        [$nombre, $apellido] = $this->separarNombre((string) $order->shipping_name);
        $dni = $order->customer->dni ?? $order->guest_dni ?? '';
        $telefono = $order->shipping_phone ?: (string) ($order->customer->phone ?? '');
        $email = $order->customer->email ?? $order->guest_email ?? '';

        if ($nombre === '' || $apellido === '' || $telefono === '') {
            return ['ok' => false, 'message' => 'Faltan datos del destinatario (nombre, apellido o teléfono) en el pedido.'];
        }

        $productos = [];
        foreach ($order->ecommerce_order_items as $item) {
            $product = $item->product;
            if (! $product || ! $product->weight || ! $product->width_cm || ! $product->height_cm || ! $product->depth_cm) {
                $nombreProducto = $product->name ?? "#{$item->product_id}";

                return ['ok' => false, 'message' => "Falta peso o dimensiones en el producto \"{$nombreProducto}\" — no se puede armar el envío."];
            }

            $productos[] = [
                'price' => (float) $product->price,
                'quantity' => (int) $item->quantity,
                'kgrams' => (float) $product->weight,
                'width' => (float) $product->width_cm,
                'depth' => (float) $product->depth_cm,
                'height' => (float) $product->height_cm,
            ];
        }

        $body = [
            'contract' => ['id_contract' => $contrato['id'] ?? null],
            'price_shipment' => (float) $order->shipping_cost,
            'origin' => ['postal_code' => $cpOrigen],
            'destination' => [
                'street' => $direccion['calle'],
                'number' => $direccion['numero'],
                'floor' => '',
                'postal_code' => $order->shipping_postal,
                'locality' => $order->shipping_city,
                'code_branch' => '',
            ],
            'recipient' => [
                'name' => $nombre,
                'last_name' => $apellido,
                'phone_number' => $telefono,
                'dni' => (string) $dni,
                'email' => $email,
            ],
            'products' => $productos,
            'email_merchant' => (string) config('mail.from.address'),
            'remito' => $order->order_number,
        ];

        $resultado = $this->crearOrden($body);
        if ($resultado === null) {
            return ['ok' => false, 'message' => 'Andreani rechazó la orden de envío. Revisá storage/logs/andreani.log para el detalle.'];
        }

        // Cuentas pyme devuelven el identificador en "pedidoId" (no es todavía
        // el número de tracking público — ese se resuelve después contra
        // /api/v1/Shipments, ver consultarEnvio()).
        $numero = $resultado['response']['pedidoId'] ?? $resultado['pedidoId'] ?? null;
        if (! $numero) {
            Log::channel('andreani')->warning('Andreani: orden creada pero no se encontró el pedidoId en la respuesta.', [
                'response' => $resultado,
            ]);

            return ['ok' => false, 'message' => 'Andreani no devolvió un identificador de envío. Revisá storage/logs/andreani.log.'];
        }

        return ['ok' => true, 'numero' => (string) $numero, 'raw' => $resultado];
    }

    private function contratoEstandar(): ?array
    {
        $contratos = $this->config()['contratos'] ?? [];
        if (! is_array($contratos)) {
            return null;
        }

        foreach ($contratos as $contrato) {
            if (($contrato['modoDeEntregaNombre'] ?? null) === 'estándar') {
                return $contrato;
            }
        }

        return null;
    }

    /**
     * Separa "Nombre Apellido" en sus dos partes — Andreani exige ambas no
     * vacías. Si no hay un espacio, se usa el valor completo en las dos.
     *
     * @return array{0: string, 1: string}
     */
    private function separarNombre(string $nombreCompleto): array
    {
        $nombreCompleto = trim($nombreCompleto);
        if ($nombreCompleto === '') {
            return ['', ''];
        }

        $partes = explode(' ', $nombreCompleto, 2);

        return [$partes[0], $partes[1] ?? $partes[0]];
    }

    /**
     * Separa "Calle 1234" en calle + altura — mismo criterio que el plugin
     * oficial (número al final de la cadena). Si no encuentra un número, usa
     * "S/N" para no bloquear la orden por un dato de formato libre.
     *
     * @return array{calle: string, numero: string}
     */
    private function parsearDireccion(string $direccion): array
    {
        $direccion = trim($direccion);
        if ($direccion === '') {
            return ['calle' => '', 'numero' => 'S/N'];
        }

        // Número de calle exige 2+ dígitos — evita que "Piso 2" al final se
        // confunda con la altura (mismo criterio que el plugin oficial).
        if (preg_match('/^(.+)\s+(\d{2,}[\w\-\/]*)\b.*$/u', $direccion, $matches)) {
            return ['calle' => trim($matches[1], " \t\n\r\0\x0B,"), 'numero' => trim($matches[2])];
        }

        return ['calle' => $direccion, 'numero' => 'S/N'];
    }

    /**
     * Devuelve la etiqueta en PDF (bytes crudos) de una orden ya creada.
     * La API la sirve por POST con el/los identificador(es) en el body, no
     * por GET — confirmado leyendo el plugin oficial (get_etiqueta()).
     */
    public function getEtiqueta(string $numeroPedido): ?string
    {
        $token = $this->accessToken();
        if (! $token) {
            return null;
        }

        $response = Http::withHeaders([
            'X-Auth-Token' => $token,
            'Content-Type' => 'application/json',
        ])->post($this->endpoint('etiqueta'), [
            'trackingNumbers' => [$numeroPedido],
        ]);

        if (! $response->successful()) {
            Log::channel('andreani')->error('Andreani: error al obtener la etiqueta.', [
                'numero_pedido' => $numeroPedido,
                'status' => $response->status(),
            ]);

            return null;
        }

        return $response->body();
    }

    /**
     * Consulta el estado real de un envío ya creado contra
     * /api/v1/Shipments/{numero} — para cuentas pyme, el identificador que
     * devuelve la orden (pedidoId) recién se resuelve a un número de
     * tracking público una vez que Andreani procesa el envío.
     *
     * @return array{trackingNumber?: string, status?: string}|null
     */
    public function consultarEnvio(string $numeroPedido): ?array
    {
        $token = $this->accessToken();
        if (! $token) {
            return null;
        }

        $response = Http::withHeaders([
            'X-Auth-Token' => $token,
        ])->get($this->endpoint('shipments').'/'.rawurlencode($numeroPedido));

        if (! $response->successful()) {
            Log::channel('andreani')->error('Andreani: error al consultar el estado del envío.', [
                'numero_pedido' => $numeroPedido,
                'status' => $response->status(),
            ]);

            return null;
        }

        return $response->json('response') ?? $response->json();
    }

    /**
     * URL pública de tracking — no necesita autenticación, es la misma
     * que usa el plugin oficial de WooCommerce para el cliente final.
     */
    public function trackingUrl(string $numeroTracking): string
    {
        return 'https://www.andreani.com/envio/'.rawurlencode($numeroTracking);
    }
}
