<?php

namespace App\Services;

use Illuminate\Support\Str;

/**
 * Base de conocimiento estática de ArtDent CRM.
 *
 * search() devuelve la respuesta pre-escrita si la consulta del usuario
 * coincide con uno de los patrones definidos, evitando llamadas a la API.
 * Si no hay coincidencia, devuelve null → el chatbot llama a Claude.
 *
 * Cada entrada tiene:
 *   triggers: array de "grupos AND" — un grupo coincide si TODAS sus palabras
 *             aparecen en el mensaje normalizado.
 *   answer:   respuesta en Markdown lista para mostrar al usuario.
 */
class ChatbotKnowledgeBase
{
    /** @var array<int, array{triggers: array<int, array<int, string>>, answer: string}> */
    private static array $entries = [];

    private static bool $initialized = false;

    public static function search(string $userMessage): ?string
    {
        self::init();

        $normalized = self::normalize($userMessage);

        if ($normalized === '') {
            return null;
        }

        foreach (self::$entries as $entry) {
            foreach ($entry['triggers'] as $group) {
                $allMatch = true;
                foreach ($group as $word) {
                    if (! str_contains($normalized, $word)) {
                        $allMatch = false;
                        break;
                    }
                }
                if ($allMatch) {
                    return $entry['answer'];
                }
            }
        }

        return null;
    }

    /**
     * Glosario argentino → español estándar.
     * Se aplica sobre el mensaje ya normalizado (lowercase, sin tildes, sin puntuación)
     * antes de comparar con los triggers de la KB.
     *
     * Criterio: solo se mapean palabras que en contexto de CRM odontológico tienen
     * un significado inequívoco, para no generar falsos positivos.
     *
     * @var array<string, string>
     */
    private static array $argSlang = [
        // ── Acciones (se mapean al infinitivo para coincidir con los triggers) ──
        'cargo' => 'agregar',     // "cómo cargo una venta" → "cómo agregar una venta"
        'cargamos' => 'agregar',
        'cargar' => 'agregar',
        'cargue' => 'agregar',
        'meter' => 'agregar',
        'meto' => 'agregar',
        'metemos' => 'agregar',
        'pongo' => 'agregar',
        'ponemos' => 'agregar',
        'poner' => 'agregar',
        'arranco' => 'iniciar',
        'arrancamos' => 'iniciar',
        'arrancar' => 'iniciar',
        'arranque' => 'iniciar',
        'sacar' => 'obtener',
        'saco' => 'obtener',
        'tiro' => 'imprimir',    // "tiro la factura" → "imprimir la factura"
        'tiramos' => 'imprimir',
        'tirar' => 'imprimir',
        'mandar' => 'enviar',
        'mando' => 'enviar',
        'mandamos' => 'enviar',
        'borrar' => 'eliminar',
        'borro' => 'eliminar',
        'borramos' => 'eliminar',
        'bochar' => 'cancelar',
        'bochamos' => 'cancelar',
        'anular' => 'cancelar',
        'anulo' => 'cancelar',

        // ── Trabajo / Órdenes ──────────────────────────────────────────────────
        'laburo' => 'trabajo',
        'laburos' => 'trabajos',
        'laburar' => 'trabajar',
        'laburando' => 'trabajando',
        'laburamos' => 'trabajamos',
        'pedido' => 'orden',       // contexto lab: "pedido del odonto" = orden
        'pedidos' => 'ordenes',
        'encargo' => 'orden',
        'encargos' => 'ordenes',

        // ── Dinero / Finanzas ──────────────────────────────────────────────────
        'guita' => 'plata',
        'mosca' => 'plata',
        'mango' => 'peso',
        'mangos' => 'pesos',
        'luca' => 'mil pesos',
        'lucas' => 'pesos',
        'palo' => 'millon',
        'palos' => 'millones',
        'billete' => 'efectivo',
        'billetes' => 'efectivo',
        'boleta' => 'factura',     // "la boleta" = factura en lunfardo coloquial
        'boletas' => 'facturas',
        'abono' => 'pago',
        'abonamos' => 'pagamos',
        'abonar' => 'pagar',
        'cobrar' => 'cobrar',      // ya en triggers; lo dejamos por claridad
        'cobranza' => 'cobro',
        'fiado' => 'cuenta corriente',
        'fiados' => 'cuentas corrientes',
        'deudor' => 'debe',
        'deudores' => 'deben',

        // ── Clientes / Personas ────────────────────────────────────────────────
        'odonto' => 'odontologo',
        'odontologa' => 'odontologo',
        'doc' => 'doctor',
        'profe' => 'doctor',
        'pibe' => 'persona',
        'piba' => 'persona',
        'tipo' => 'persona',
        'mina' => 'persona',
        'chabón' => 'persona',
        'chabon' => 'persona',

        // ── Navegación / Ubicación ─────────────────────────────────────────────
        'entrar' => 'ir',
        'entro' => 'voy',
        'entramos' => 'vamos',
        'acceder' => 'ir',
        'accedo' => 'voy',
        'encontrar' => 'ver',
        'encuentro' => 'veo',
        'busco' => 'ver',
        'parte' => 'seccion',     // "en qué parte está" → "en qué seccion está"
        'lugar' => 'seccion',
        'pantalla' => 'seccion',
        'menu' => 'seccion',
        'opcion' => 'seccion',

        // ── Problemas / Estado ─────────────────────────────────────────────────
        'quilombo' => 'problema',
        'macana' => 'problema',
        'cagada' => 'error',
        'trucho' => 'falso',

        // ── Expresiones / Muletillas (se eliminan) ─────────────────────────────
        'che' => '',
        'dale' => '',
        'onda' => '',            // "qué onda con X" → "qué con X" → X es el tema
        'posta' => '',
        'igual' => '',
        'o sea' => '',
        'viste' => '',
        'boludo' => '',
        'bolu' => '',
    ];

    private static function normalize(string $message): string
    {
        $normalized = Str::lower(Str::ascii($message));
        $normalized = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $normalized) ?? $normalized;
        $normalized = preg_replace('/\s+/', ' ', trim($normalized)) ?? '';

        // Aplicar glosario argentino: reemplaza palabras enteras (word boundary)
        foreach (self::$argSlang as $slang => $standard) {
            $normalized = preg_replace(
                '/\b'.preg_quote($slang, '/').'\b/',
                $standard,
                $normalized
            ) ?? $normalized;
        }

        // Normalizar espacios nuevamente (el reemplazo puede dejar dobles espacios)
        return preg_replace('/\s+/', ' ', trim($normalized)) ?? '';
    }

    private static function init(): void
    {
        if (self::$initialized) {
            return;
        }

        self::$initialized = true;

        self::$entries = [

            // ── SALUDO / PRESENTACIÓN ──────────────────────────────────────────────
            [
                'triggers' => [
                    ['hola'],
                    ['buenos dias'],
                    ['buenas tardes'],
                    ['buenas noches'],
                    ['como estas'],
                    ['quien eres'],
                    ['que eres'],
                    ['que puedes hacer'],
                    ['que podes hacer'],
                    ['ayudame'],
                    ['ayuda'],
                ],
                'answer' => '¡Hola! Soy **Artie**, el asistente de **ArtDent CRM**. Puedo ayudarte con:

- **Navegación**: encontrar cualquier módulo del sistema
- **Laboratorio**: consultar órdenes, estados y trabajos
- **Ventas**: reportes, caja, tickets del día
- **Stock**: alertas de inventario bajo
- **Clientes y odontólogos**: saldos y movimientos
- **Facturación AFIP**: comprobantes y estado

¿Qué necesitás saber?',
            ],

            // ── NAVEGACIÓN VENTAS ──────────────────────────────────────────────────
            [
                'triggers' => [
                    ['donde', 'ventas'],
                    ['ir', 'ventas'],
                    ['modulo', 'ventas'],
                    ['seccion', 'ventas'],
                    ['lista', 'ventas'],
                    ['ver', 'ventas'],
                    ['abrir', 'ventas'],
                    ['donde', 'venta'],
                    ['ver', 'venta'],
                ],
                'answer' => 'Para acceder a **Ventas**, en el menú lateral hacé clic en **Ventas** y luego elegí **Ventas** de la lista que se despliega.

Desde ahí podés:
- Ver el listado completo de ventas y filtrar por fecha, cliente o estado
- Crear una venta nueva con el botón **Nueva Venta**
- Ver presupuestos entrando a **Ventas** → **Presupuestos**',
            ],

            [
                'triggers' => [
                    ['nueva', 'venta'],
                    ['crear', 'venta'],
                    ['agregar', 'venta'],
                    ['registrar', 'venta'],
                    ['como', 'vender'],
                    ['como', 'hacer', 'venta'],
                    ['como', 'hago', 'venta'],
                    ['hago', 'venta'],
                    ['hacer', 'venta'],
                    ['como', 'vendo'],
                    ['quiero', 'vender'],
                    ['quiero', 'venta'],
                    ['ingresar', 'venta'],
                ],
                'answer' => 'Para crear una **nueva venta**:

1. En el menú lateral, hacé clic en **Ventas** y luego en **Nueva Venta**
2. Elegí o buscá el cliente (o dejalo como Consumidor Final)
3. Agregá los artículos con cantidad y precio usando el buscador de productos
4. Seleccioná la forma de pago
5. Presioná **Guardar** para confirmar

Si tenés AFIP configurado, la factura se emite automáticamente al confirmar la venta.',
            ],

            // ── NAVEGACIÓN LABORATORIO / ÓRDENES ──────────────────────────────────
            [
                'triggers' => [
                    ['donde', 'ordenes'],
                    ['donde', 'laboratorio'],
                    ['ir', 'laboratorio'],
                    ['modulo', 'laboratorio'],
                    ['seccion', 'laboratorio'],
                    ['ver', 'ordenes'],
                    ['lista', 'ordenes'],
                    ['buscar', 'orden'],
                    ['ver', 'trabajos'],
                    ['donde', 'trabajos'],
                    ['trabajos', 'pendientes'],
                    ['ordenes', 'pendientes'],
                    ['laburos', 'pendientes'],
                    ['ver', 'laburos'],
                ],
                'answer' => 'Para ver las **órdenes de laboratorio**, en el menú lateral expandí **Órdenes** (dentro de la sección **Laboratorio**) y hacé clic en **Consultar**.

Desde ahí podés:
- Ver todas las órdenes y filtrar por estado, odontólogo o fecha
- Acceder al detalle de cada trabajo con sus fases de producción
- Crear un nuevo trabajo con el botón **Nueva Orden**
- Ver los rehacimientos desde **Órdenes** → **Rehacimientos**',
            ],

            [
                'triggers' => [
                    ['nueva', 'orden'],
                    ['crear', 'orden'],
                    ['agregar', 'orden'],
                    ['registrar', 'orden'],
                    ['nuevo', 'trabajo'],
                    ['crear', 'trabajo'],
                    ['como', 'ingresar', 'orden'],
                    ['como', 'hago', 'orden'],
                    ['hago', 'orden'],
                    ['como', 'cargo', 'orden'],
                    ['ingresar', 'trabajo'],
                    ['como', 'ingreso', 'trabajo'],
                    ['como', 'ingreso', 'orden'],
                    ['quiero', 'orden'],
                    ['iniciar', 'orden'],
                    ['iniciar', 'trabajo'],
                    ['como', 'arranco', 'orden'],
                ],
                'answer' => 'Para crear una **nueva orden de laboratorio**:

1. En el menú lateral, expandí **Órdenes** (sección **Laboratorio**) y hacé clic en **Nueva Orden**
2. Completá: odontólogo, paciente, tipo de trabajo y descripción
3. Asigná la fecha de entrega prometida
4. Confirmá — el trabajo queda en estado **Pendiente**

Los técnicos verán la orden en el kiosk de producción y podrán tomar las fases asignadas.',
            ],

            // ── ESTADOS DE ÓRDENES ─────────────────────────────────────────────────
            [
                'triggers' => [
                    ['estados', 'orden'],
                    ['que', 'estados', 'existen'],
                    ['estados', 'trabajo'],
                    ['estado', 'laboratorio'],
                    ['significado', 'estado'],
                ],
                'answer' => 'Los **estados de una orden** de laboratorio son:

| Estado | Descripción |
|---|---|
| **Pendiente** | Recibida, sin asignar |
| **En proceso** | Técnico tomó alguna fase |
| **Listo** | Todas las fases completadas |
| **Finalizado** | Revisado y aprobado |
| **Entregado** | Entregado al odontólogo |
| **Cancelado** | Anulado |

Podés filtrar por estado desde la lista de órdenes.',
            ],

            // ── REHACIMIENTOS ──────────────────────────────────────────────────────
            [
                'triggers' => [
                    ['rehacimiento'],
                    ['rehecho'],
                    ['rehacer'],
                    ['remake'],
                    ['trabajo rehacer'],
                ],
                'answer' => 'Los **rehacimientos** se gestionan desde el menú lateral en **Órdenes** → **Rehacimientos** (sección **Laboratorio**).

Un rehacimiento se crea cuando un trabajo necesita corregirse. Podés:
- Ver el historial de rehacimientos por orden
- Asignar el motivo y el técnico responsable
- Llevar estadísticas de calidad',
            ],

            // ── CLIENTES ──────────────────────────────────────────────────────────
            [
                'triggers' => [
                    ['donde', 'clientes'],
                    ['ir', 'clientes'],
                    ['ver', 'clientes'],
                    ['lista', 'clientes'],
                    ['modulo', 'clientes'],
                ],
                'answer' => 'Los **clientes** están en el menú lateral, sección **Ventas** → **Clientes** → **Clientes**.

Desde ahí podés:
- Ver el directorio completo de clientes
- Crear un nuevo cliente con el botón **Nuevo Cliente**
- Ver las cuentas corrientes en **Clientes** → **Cuentas Corrientes**
- Consultar el historial de compras de cada cliente',
            ],

            [
                'triggers' => [
                    ['nuevo', 'cliente'],
                    ['crear', 'cliente'],
                    ['agregar', 'cliente'],
                    ['registrar', 'cliente'],
                    ['como', 'hago', 'cliente'],
                    ['como', 'cargo', 'cliente'],
                    ['como', 'agrego', 'cliente'],
                    ['como', 'creo', 'cliente'],
                    ['quiero', 'cliente'],
                ],
                'answer' => 'Para agregar un **nuevo cliente**:

1. En el menú lateral, expandí **Clientes** (sección **Ventas**) y hacé clic en **Clientes**
2. Presioná el botón **Nuevo Cliente**
3. Completá: nombre, documento (DNI/CUIT), teléfono y email
4. Guardá — el cliente ya queda disponible para seleccionar en las ventas',
            ],

            // ── ODONTÓLOGOS ────────────────────────────────────────────────────────
            [
                'triggers' => [
                    ['donde', 'odontologos'],
                    ['ver', 'odontologos'],
                    ['lista', 'odontologos'],
                    ['ir', 'odontologos'],
                    ['dentistas'],
                    ['busco', 'odontologo'],
                    ['buscar', 'odontologo'],
                    ['donde', 'odontologo'],
                    ['ver', 'odontologo'],
                    ['busco', 'dentista'],
                    ['donde', 'dentistas'],
                ],
                'answer' => 'Los **odontólogos** están en el menú lateral, sección **Laboratorio** → **Odontólogos** → **Odontólogos**.

Desde ahí podés:
- Ver el directorio de odontólogos clientes del laboratorio
- Crear nuevos odontólogos con el botón **Nuevo Odontólogo**
- Acceder a la cuenta corriente desde **Odontólogos** → **Cuentas Corrientes**',
            ],

            // ── PACIENTES ──────────────────────────────────────────────────────────
            [
                'triggers' => [
                    ['donde', 'pacientes'],
                    ['ver', 'pacientes'],
                    ['lista', 'pacientes'],
                    ['ir', 'pacientes'],
                    ['historia', 'clinica'],
                    ['odontograma'],
                ],
                'answer' => 'Los **pacientes** están en el menú lateral, sección **Laboratorio** → **Odontólogos** → **Pacientes**.

Desde ahí podés:
- Ver el listado de todos los pacientes
- Acceder a la historia clínica y odontograma de cada uno
- Registrar un nuevo paciente con el botón **Nuevo Paciente**',
            ],

            // ── PROVEEDORES ────────────────────────────────────────────────────────
            [
                'triggers' => [
                    ['donde', 'proveedores'],
                    ['ver', 'proveedores'],
                    ['ir', 'proveedores'],
                    ['lista', 'proveedores'],
                    ['modulo', 'proveedores'],
                ],
                'answer' => 'Los **proveedores** están en el menú lateral, sección **Ventas** → **Proveedores**.

Desde ahí podés acceder a:
- **Proveedores**: directorio de proveedores
- **Comprobantes**: facturas de compra recibidas
- **Pagos**: registros de pagos a proveedores
- **Cuenta Corriente**: saldo y movimientos por proveedor',
            ],

            // ── STOCK / INVENTARIO ─────────────────────────────────────────────────
            [
                'triggers' => [
                    ['donde', 'stock'],
                    ['ver', 'stock'],
                    ['ir', 'stock'],
                    ['inventario'],
                    ['donde', 'inventario'],
                    ['modulo', 'stock'],
                    ['como', 'stock'],
                    ['stock', 'productos'],
                    ['stock', 'disponible'],
                    ['stock', 'actual'],
                    ['cuanto', 'stock'],
                    ['ver', 'existencias'],
                    ['existencias'],
                ],
                'answer' => 'El **stock e inventario** se gestiona desde el menú lateral, sección **Ventas** → **Inventario**:

- **Stock**: ver existencias actuales por depósito
- **Movimientos**: historial completo de entradas y salidas
- **Depósitos**: gestionar almacenes
- **Retiros de Insumos**: insumos retirados por colaboradores

Los artículos y sus precios se administran desde **Ventas** → **Artículos**.
Las alertas de stock bajo se configuran con el campo **Stock mínimo** en cada artículo.',
            ],

            [
                'triggers' => [
                    ['producto', 'nuevo'],
                    ['nuevo', 'producto'],
                    ['agregar', 'producto'],
                    ['crear', 'producto'],
                    ['registrar', 'producto'],
                    ['como', 'hago', 'producto'],
                    ['como', 'agrego', 'producto'],
                    ['como', 'creo', 'producto'],
                    ['como', 'cargo', 'producto'],
                    ['quiero', 'producto'],
                ],
                'answer' => 'Para agregar un **nuevo artículo/producto**:

1. En el menú lateral, expandí **Ventas** y hacé clic en **Artículos**
2. Presioná el botón **Nuevo Artículo**
3. Completá: nombre, categoría, precio de venta, costo y código de barras (opcional)
4. Si tiene variantes (talles, colores), agregalas desde la pestaña de variantes
5. Asigná el stock inicial en el depósito correspondiente',
            ],

            // ── ECOMMERCE ──────────────────────────────────────────────────────────
            [
                'triggers' => [
                    ['donde', 'ecommerce'],
                    ['ver', 'pedidos'],
                    ['pedidos', 'online'],
                    ['tienda', 'online'],
                    ['tienda', 'web'],
                    ['ir', 'ecommerce'],
                ],
                'answer' => 'El **E-commerce** se gestiona desde el menú lateral, sección **E-Commerce** → **Tienda Online**:

- **Pedidos**: ver y gestionar los pedidos que llegan de la tienda web
- **Cupones**: descuentos y promociones
- **Ofertas**: artículos en oferta
- **Reportes MP**: reportes de MercadoPago

Los pedidos online llegan automáticamente al CRM. Podés cambiar el estado (pendiente → enviado → entregado) desde el detalle de cada pedido.',
            ],

            // ── FACTURACIÓN AFIP ───────────────────────────────────────────────────
            [
                'triggers' => [
                    ['afip'],
                    ['factura', 'electronica'],
                    ['facturacion', 'afip'],
                    ['arca'],
                    ['comprobante', 'afip'],
                    ['facturar'],
                    ['imprimir', 'factura'],
                    ['como', 'factura'],
                    ['generar', 'factura'],
                    ['crear', 'factura'],
                    ['nota', 'credito'],
                    ['comprobante'],
                ],
                'answer' => 'La **facturación electrónica AFIP/ARCA** está integrada al CRM.

Al confirmar una venta o una orden, si la empresa tiene AFIP configurado, se emite el comprobante automáticamente.

**Tipos disponibles:**
- Factura A, B y C
- Nota de Crédito A y B

**Para configurar AFIP**, andá al menú lateral → **Sistema** → **Administración** → **Empresa** y buscá la sección **AFIP**:
- Punto de venta
- Certificado digital
- Modo: producción o homologación

Los comprobantes se pueden reimprimir desde el detalle de cada venta.',
            ],

            // ── CAJA ───────────────────────────────────────────────────────────────
            [
                'triggers' => [
                    ['donde', 'caja'],
                    ['abrir', 'caja'],
                    ['cerrar', 'caja'],
                    ['sesion', 'caja'],
                    ['modulo', 'caja'],
                    ['ir', 'caja'],
                ],
                'answer' => 'La gestión de caja está integrada en el flujo de ventas del CRM.

Para registrar movimientos de efectivo y ventas:
- Entrá a **Ventas** → **Ventas** en el menú lateral
- Desde ahí podés registrar cobros en efectivo, débito o crédito al confirmar cada venta

Para ver el detalle financiero del laboratorio (ingresos y egresos) andá a **Laboratorio** → **Odontólogos** → **Ingresos y Egresos**.',
            ],

            // ── CUENTAS CORRIENTES ─────────────────────────────────────────────────
            [
                'triggers' => [
                    ['cuenta', 'corriente', 'odontologo'],
                    ['cuenta', 'corriente', 'dentista'],
                    ['saldo', 'odontologo'],
                    ['cuanto', 'debe', 'odontologo'],
                    ['lab', 'account'],
                    ['deuda', 'odontologo'],
                ],
                'answer' => 'Las **cuentas corrientes de odontólogos** están en el menú lateral:

**Laboratorio** → **Odontólogos** → **Cuentas Corrientes**

Desde ahí podés:
- Ver el saldo actual de cada odontólogo
- Registrar pagos y abonos
- Ver el historial de movimientos

El saldo se actualiza automáticamente con cada factura emitida.',
            ],

            [
                'triggers' => [
                    ['cuenta', 'corriente', 'cliente'],
                    ['saldo', 'cliente'],
                    ['cuanto', 'debe', 'cliente'],
                    ['deuda', 'cliente'],
                    ['customers', 'account'],
                ],
                'answer' => 'Las **cuentas corrientes de clientes** están en el menú lateral:

**Ventas** → **Clientes** → **Cuentas Corrientes**

Desde ahí podés ver el saldo pendiente, registrar pagos y revisar el historial de movimientos de cada cliente.',
            ],

            // ── FINANZAS / LAB FINANCE ─────────────────────────────────────────────
            [
                'triggers' => [
                    ['lab', 'finance'],
                    ['ingresos', 'egresos'],
                    ['finanzas', 'laboratorio'],
                    ['donde', 'finanzas'],
                    ['modulo', 'finanzas'],
                ],
                'answer' => 'Las **finanzas del laboratorio** están en el menú lateral:

**Laboratorio** → **Odontólogos** → **Ingresos y Egresos**

Desde ahí podés registrar y ver:
- Ingresos (pagos de odontólogos)
- Egresos (gastos del laboratorio)
- Balance del período',
            ],

            // ── COLABORADORES / TÉCNICOS ───────────────────────────────────────────
            [
                'triggers' => [
                    ['colaborador'],
                    ['colaboradores'],
                    ['tecnico'],
                    ['tecnicos'],
                    ['asistencia'],
                    ['portal', 'colaborador'],
                    ['recibo', 'colaborador'],
                ],
                'answer' => 'Los **colaboradores y técnicos** se gestionan en el menú lateral, sección **Personal** → **Colaboradores**:

- **Colaboradores**: lista completa y legajo de cada técnico
- **Asistencias**: registro de entrada/salida (biometría o PIN)
- **Extras** y **Descuentos**: conceptos adicionales de liquidación
- **Recibos**: liquidaciones de pagos
- **Kiosk de Producción**: portal donde los técnicos toman fases de trabajo

El acceso al kiosk es por PIN de 6 dígitos o reconocimiento facial.',
            ],

            // ── CONTABILIDAD / REPORTES ────────────────────────────────────────────
            [
                'triggers' => [
                    ['donde', 'contabilidad'],
                    ['ir', 'contabilidad'],
                    ['modulo', 'contable'],
                    ['panel', 'contable'],
                    ['libro', 'iva'],
                    ['estado', 'resultados'],
                ],
                'answer' => 'El área **Contable** está en el menú lateral, sección **Finanzas** → **Contable**:

- **Panel**: resumen financiero general
- **Libro IVA Ventas**: exportación para AFIP
- **Libro IVA Compras**: exportación para AFIP
- **Estado de Resultados**: ingresos vs. egresos del período',
            ],

            [
                'triggers' => [
                    ['donde', 'reportes'],
                    ['ir', 'reportes'],
                    ['ver', 'reportes'],
                    ['analisis'],
                    ['estadisticas'],
                ],
                'answer' => 'Los **reportes y análisis** están en el menú lateral, sección **Análisis**:

- **Analítica Lab**: métricas y gráficos del laboratorio
- **Estadísticas**: resúmenes por período
- **Reportes**: reportes generales del sistema
- **Operaciones**: detalle operativo

También podés ver interacciones con clientes en **CRM** → **Interacciones**, y exportar listados desde cada módulo con el botón de exportación.',
            ],

            // ── CONFIGURACIÓN ──────────────────────────────────────────────────────
            [
                'triggers' => [
                    ['donde', 'configuracion'],
                    ['ir', 'ajustes'],
                    ['ir', 'configuracion'],
                    ['settings'],
                    ['modulo', 'configuracion'],
                    ['ajustes', 'empresa'],
                ],
                'answer' => 'La configuración de la empresa se encuentra en el menú lateral → **Sistema** → **Administración** → **Empresa**.

Desde ahí podés configurar:
- **Datos fiscales**: razón social, CUIT, logo, moneda
- **AFIP**: certificado, punto de venta y modo (producción/homologación)
- **WhatsApp**: token y número para mensajes automáticos
- **Chatbot**: habilitar y configurar el asistente IA (Artie)
- **Integraciones**: API keys de servicios externos

También podés gestionar **Usuarios** y **Roles y Permisos** desde la misma sección **Administración**.',
            ],

            [
                'triggers' => [
                    ['agregar', 'usuario'],
                    ['nuevo', 'usuario'],
                    ['crear', 'usuario'],
                    ['invitar', 'usuario'],
                    ['registrar', 'usuario'],
                ],
                'answer' => 'Para agregar un **nuevo usuario** al sistema:

1. En el menú lateral, andá a **Sistema** → **Administración** → **Usuarios**
2. Presioná el botón **Nuevo Usuario**
3. Completá nombre, email y asigná un rol (admin, operador, etc.)
4. El usuario recibirá un email para establecer su contraseña

Solo los administradores pueden crear usuarios. El registro público está deshabilitado.',
            ],

            // ── WHATSAPP ───────────────────────────────────────────────────────────
            [
                'triggers' => [
                    ['whatsapp'],
                    ['configurar', 'whatsapp'],
                    ['mensaje', 'automatico'],
                    ['notificacion', 'whatsapp'],
                ],
                'answer' => 'La integración con **WhatsApp Business** se configura en el menú lateral → **Sistema** → **Administración** → **Empresa**, sección **WhatsApp**.

Necesitás:
- **Phone Number ID**: ID del número en Meta Business Suite
- **Access Token**: token de acceso de la API de WhatsApp Cloud

Los mensajes automáticos se envían al registrar una orden nueva o al actualizar su estado. La plantilla de mensaje se puede personalizar desde esa misma sección.',
            ],

            // ── MERCADOPAGO ────────────────────────────────────────────────────────
            [
                'triggers' => [
                    ['mercadopago'],
                    ['cobro', 'online'],
                    ['pago', 'online'],
                    ['link', 'pago'],
                ],
                'answer' => 'La integración con **MercadoPago** permite:
- Generar links de pago para ventas y pedidos del e-commerce
- Recibir notificaciones automáticas de pagos aprobados

Los reportes de MercadoPago están en el menú lateral: **E-Commerce** → **Tienda Online** → **Reportes MP**.',
            ],

            // ── PREGUNTAS GENERALES ────────────────────────────────────────────────
            [
                'triggers' => [
                    ['como', 'funciona'],
                    ['para', 'que', 'sirve'],
                    ['que', 'hace'],
                    ['explicame'],
                ],
                'answer' => '**ArtDent CRM** es un sistema de gestión integral para laboratorios odontológicos y venta de insumos.

**Módulos principales:**

- **Laboratorio**: órdenes de trabajo, fases de producción, odontólogos, pacientes
- **Ventas**: punto de venta, presupuestos, caja, facturación AFIP
- **Inventario**: stock, productos, movimientos, depósitos
- **E-commerce**: tienda online con integración a MercadoPago
- **RRHH**: asistencia de técnicos, recibos, portal colaboradores
- **Contabilidad**: libros IVA, estado de resultados, cuentas corrientes
- **Comunicaciones**: WhatsApp automático, chatbot IA

¿Sobre qué módulo querés saber más?',
            ],

            [
                'triggers' => [
                    ['gracias'],
                    ['muchas gracias'],
                    ['perfecto'],
                    ['listo'],
                    ['entendido'],
                ],
                'answer' => '¡De nada! Estoy por aquí si necesitás más ayuda. 😊',
            ],

        ];
    }
}
