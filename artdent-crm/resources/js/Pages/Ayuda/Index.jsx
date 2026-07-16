import React, { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import {
    LifeBuoy, Search, ChevronDown, ArrowRight, Rocket, Banknote, Users, ClipboardList,
    ShoppingCart, UserCheck, Fingerprint, Landmark, Bot, BarChart3, Settings, HelpCircle,
    MessagesSquare, BookOpen,
} from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C', green: '#5AAD9C' };

const CATEGORIES = [
    {
        key: 'primeros-pasos',
        title: 'Primeros Pasos',
        icon: Rocket,
        articles: [
            {
                title: '¿Cómo inicio sesión y qué es mi empresa dentro de ArtCode?',
                body: 'Cada laboratorio o clínica que usa ArtCode tiene su propia empresa (lo llamamos "tenant"): tus datos, ventas, clientes y personal están completamente separados de los de cualquier otra empresa que use el sistema. Iniciás sesión con el usuario y contraseña que te dio el administrador de tu empresa. ArtCode no tiene un formulario público de "Registrarse": las cuentas de usuario solo las crea un administrador desde Administración → Usuarios.',
            },
            {
                title: '¿Cómo funcionan los roles y permisos?',
                body: 'Cada usuario tiene un rol (por ejemplo Administrador, RRHH Admin, Vendedor) y cada rol agrupa permisos puntuales (ver ventas, editar productos, aprobar licencias, etc.). Si un módulo del menú no te aparece, es porque tu rol no tiene el permiso correspondiente — no es un error, hablá con tu administrador si necesitás acceso. Los superadministradores ven todo el sistema sin restricciones.',
                link: { href: '/roles', label: 'Ir a Roles y Permisos' },
            },
            {
                title: 'Estructura general del menú lateral',
                body: 'El menú de la izquierda agrupa los módulos por área: Ventas (ventas, clientes), Compras e Insumos (proveedores, inventario), E-Commerce (tienda online), Laboratorio (órdenes y odontólogos), RRHH (colaboradores, empleados, liquidación de sueldos, asistencia, capacitación), Finanzas, CRM, Análisis, Accesos y Kiosks y Sistema. Podés colapsar el menú con la flecha junto al logo para ganar espacio de pantalla; al pasar el mouse por los íconos colapsados se despliega un mini menú con las mismas opciones.',
            },
            {
                title: '¿ArtCode maneja varias sucursales?',
                body: 'Sí. Cada empresa puede tener varias sucursales (branches), y empleados, colaboradores y ventas quedan asociados a la sucursal que corresponda. La sucursal activa determina qué caja, stock y personal ves por defecto en varias pantallas.',
            },
        ],
    },
    {
        key: 'ventas-inventario',
        title: 'Ventas e Inventario',
        icon: Banknote,
        articles: [
            {
                title: 'Cargar una venta nueva',
                body: 'Desde Ventas → Nueva Venta elegís el cliente, agregás artículos (por búsqueda o escaneando el código de barras) y confirmás la forma de pago. La venta queda registrada en Ventas → Ventas, donde podés reimprimir el comprobante o anularla si tenés el permiso correspondiente.',
                link: { href: '/sales/create', label: 'Nueva Venta' },
            },
            {
                title: 'Presupuestos vs. Ventas',
                body: 'Un Presupuesto es una cotización que todavía no descuenta stock ni genera un comprobante fiscal: sirve para enviarle un precio a un cliente antes de confirmar la operación. Cuando el cliente acepta, el presupuesto se convierte en una venta real.',
            },
            {
                title: 'Etiquetas y códigos de barra',
                body: 'En Ventas → Etiquetas / Códigos podés generar e imprimir hojas de etiquetas con código de barra para tus artículos, en varios formatos de hoja A4 (desde 14 hasta 80 etiquetas por hoja). Usa el mismo motor de impresión que el resto del sistema, así que funciona tanto con una impresora convencional como con el ArtCode Print Service en equipos con impresora térmica.',
                link: { href: '/barcode-labels', label: 'Ir a Etiquetas / Códigos' },
            },
            {
                title: 'Stock, depósitos y movimientos',
                body: 'Inventario → Stock muestra las existencias actuales por artículo y depósito. Inventario → Depósitos te deja crear más de un depósito físico (por ejemplo, depósito general y laboratorio). Inventario → Movimientos es el historial de entradas y salidas de stock, y Retiros de Insumos registra específicamente lo que se consume en el laboratorio para una orden de trabajo.',
            },
            {
                title: '¿Dónde administro las categorías de productos?',
                body: 'Las categorías de artículos viven dentro de Ventas → Inventario → Categorías (se movieron ahí porque son un concepto de inventario, no de configuración general de la empresa). Sirven para ordenar el catálogo y para filtrar reportes por rubro.',
                link: { href: '/categorys', label: 'Ir a Categorías' },
            },
            {
                title: 'Importar o exportar artículos por CSV',
                body: 'Desde Ventas → Artículos podés importar una planilla CSV para dar de alta o actualizar productos en lote, en lugar de cargarlos uno por uno. Revisá que las columnas de tu archivo coincidan con el formato que pide el modal de importación antes de subirlo.',
                link: { href: '/products', label: 'Ir a Artículos' },
            },
        ],
    },
    {
        key: 'clientes-proveedores',
        title: 'Clientes y Proveedores',
        icon: Users,
        articles: [
            {
                title: 'Cuentas corrientes de clientes',
                body: 'Si un cliente no paga de contado, sus ventas quedan registradas en su Cuenta Corriente (Clientes → Cuentas Corrientes), donde ves saldo pendiente e histórico de pagos parciales.',
                link: { href: '/customers-accounts', label: 'Ir a Cuentas Corrientes' },
            },
            {
                title: 'Gestión de proveedores',
                body: 'Proveedores agrupa la ficha de cada proveedor, sus Comprobantes (facturas de compra recibidas), Pagos realizados y la Cuenta Corriente con el saldo que le debés a cada uno.',
                link: { href: '/vendors', label: 'Ir a Proveedores' },
            },
        ],
    },
    {
        key: 'laboratorio',
        title: 'Laboratorio',
        icon: ClipboardList,
        articles: [
            {
                title: 'Órdenes de trabajo',
                body: 'Laboratorio → Órdenes → Nueva Orden es el flujo central del laboratorio: se carga el trabajo pedido por el odontólogo, el paciente, los materiales y el arancel. Desde Consultar seguís el estado de cada orden, y Rehacimientos registra los trabajos que hubo que rehacer (con su motivo), separado del conteo de producción normal.',
                link: { href: '/jobs', label: 'Ir a Órdenes' },
            },
            {
                title: 'Odontólogos y pacientes',
                body: 'Cada orden de trabajo se asocia a un Odontólogo (tu cliente institucional) y opcionalmente a un Paciente. Rutas de Entrega organiza qué órdenes salen a repartir juntas, e Ingresos y Egresos lleva la cuenta corriente y el detalle financiero de cada odontólogo con el laboratorio.',
                link: { href: '/dentists', label: 'Ir a Odontólogos' },
            },
            {
                title: 'Aranceles y costos',
                body: 'Aranceles y Costos define el precio de cada tipo de trabajo de laboratorio. Podés tener una tarifa general y precios personalizados por odontólogo (por ejemplo, un convenio especial con un cliente grande) sin tocar la tarifa general del resto.',
                link: { href: '/tariffs', label: 'Ir a Aranceles y Costos' },
            },
        ],
    },
    {
        key: 'ecommerce',
        title: 'Tienda Online (E-Commerce)',
        icon: ShoppingCart,
        articles: [
            {
                title: 'Pedidos de la tienda',
                body: 'Los pedidos que entran por tu tienda online aparecen en E-Commerce → Pedidos, con su estado (pendiente, en preparación, entregado, etc.) y el detalle de pago.',
                link: { href: '/ecommerce-orders', label: 'Ir a Pedidos' },
            },
            {
                title: 'Cupones, ofertas y contenido de la tienda',
                body: 'Cupones y Ofertas te dejan crear descuentos y promociones puntuales. Carrusel Hero y Banners controlan las imágenes destacadas de la portada de tu tienda. Todo esto es contenido propio de tu tienda ArtCode — no es una sincronización con una tienda externa de WooCommerce ni Mercado Libre, sino el catálogo y las promociones que administrás vos mismo desde acá.',
            },
            {
                title: 'Envíos: puntos de retiro y moto mandados',
                body: 'Puntos de Retiro define las direcciones donde un cliente puede retirar su pedido en persona. Moto Mandados administra las empresas de envío que usás para entregas a domicilio.',
            },
            {
                title: 'Métodos de pago y reportes de Mercado Pago',
                body: 'Métodos de Pago configura qué formas de pago acepta la tienda (incluida la integración con Mercado Pago como pasarela de cobro online). Reportes MP muestra la conciliación de esos cobros. Importante: esto es Mercado Pago (cobros), no tiene relación con el marketplace Mercado Libre.',
                link: { href: '/ecommerce-payment-configs', label: 'Ir a Métodos de Pago' },
            },
        ],
    },
    {
        key: 'personal-rrhh',
        title: 'Personal y RRHH',
        icon: UserCheck,
        articles: [
            {
                title: '¿Cuál es la diferencia entre Colaboradores y Empleados?',
                body: 'Colaboradores es para personal que factura por hora o por trabajo (prestadores, no están en relación de dependencia): tienen tarifa por hora, fichaje simple y un recibo básico. Empleados es para personal en relación de dependencia (bajo la Ley de Contrato de Trabajo): tienen legajo completo, convenio colectivo, motor de liquidación con fórmulas, SAC/aguinaldo, vacaciones legales y recibo de sueldo formal. Si dudás en qué categoría cargar a alguien, es una decisión legal/impositiva — consultalo con tu contador antes de cargarlo.',
            },
            {
                title: 'Legajo, organigrama y convenios colectivos',
                body: 'Empleados → Empleados tiene la ficha completa de cada persona (datos personales, categoría, convenio, ART). Organigrama muestra la jerarquía de departamentos y puestos. Convenios Colectivos administra los convenios (CCT) y sus categorías/escalas salariales, que después alimentan automáticamente el cálculo de sueldos.',
                link: { href: '/employees', label: 'Ir a Empleados' },
            },
            {
                title: 'Motor de Fórmulas: cómo se arma un recibo de sueldo',
                body: 'El sistema no tiene el cálculo de sueldos "hardcodeado": cada concepto del recibo (Sueldo Básico, Antigüedad, SAC, aportes, ART, etc.) es una fórmula configurable en Liquidación de Sueldos → Motor de Fórmulas. Esto permite ajustar porcentajes o agregar conceptos nuevos sin tocar código, y mantiene una liquidación en dos pasadas: primero se calculan los conceptos remunerativos, y luego los descuentos/aportes se calculan sobre esos totales — igual que en un recibo real.',
                link: { href: '/conceptos', label: 'Ir al Motor de Fórmulas' },
            },
            {
                title: 'Generar una liquidación y los recibos',
                body: 'Liquidaciones agrupa el cálculo de sueldos de todos los empleados para un período. Una vez calculada y aprobada, cada empleado tiene su Recibo individual en PDF con el detalle legal (Rem. Asignada, conceptos, deducciones, neto a cobrar, firma). Extras y Descuentos son líneas manuales adicionales (premios, adelantos, faltantes) que se suman a la liquidación automática de ese período.',
                link: { href: '/payroll-runs', label: 'Ir a Liquidaciones' },
            },
            {
                title: 'Asistencia, vacaciones y licencias',
                body: 'Asistencias registra el fichaje diario de cada empleado (entrada/salida), ya sea manual o vía el Kiosk de Fichaje / terminal HikVision. Vacaciones y Licencias calcula automáticamente los días de vacaciones según la antigüedad (Art. 150 LCT) y gestiona el pedido y aprobación de licencias (vacaciones, enfermedad, exámenes, etc.).',
                link: { href: '/vacaciones', label: 'Ir a Vacaciones y Licencias' },
            },
            {
                title: 'Medicina laboral',
                body: 'Medicina Laboral lleva el control de la ART de cada empleado, sus exámenes médicos (preocupacional, periódico, egreso) con alerta cuando están por vencer, y el registro de accidentes laborales.',
                link: { href: '/medicina-laboral', label: 'Ir a Medicina Laboral' },
            },
            {
                title: 'Evaluaciones y capacitaciones',
                body: 'Evaluaciones te deja definir ciclos de evaluación de desempeño con criterios ponderados y objetivos por empleado. Capacitaciones administra cursos, sus sesiones y quiénes se inscribieron o completaron cada uno.',
                link: { href: '/evaluaciones', label: 'Ir a Evaluaciones' },
            },
            {
                title: 'Reportes RRHH y Libro de Sueldos Digital',
                body: 'Reportes RRHH muestra KPIs de dotación, rotación, ausentismo y masa salarial de los últimos meses. Libro de Sueldos Digital es, por ahora, una funcionalidad de arquitectura: guarda localmente el detalle de cada liquidación pero todavía NO envía nada a AFIP/ARCA — la pantalla lo indica explícitamente hasta que se confirme el detalle técnico-legal exacto del envío oficial.',
                link: { href: '/reportes-rrhh', label: 'Ir a Reportes RRHH' },
            },
        ],
    },
    {
        key: 'accesos-kiosks',
        title: 'Accesos y Kiosks',
        icon: Fingerprint,
        articles: [
            {
                title: 'Mi Portal (autogestión del empleado)',
                body: 'Cualquier usuario que tenga un Empleado asociado ve Mi Portal, donde puede consultar sus propios recibos de sueldo, pedir una licencia y ver su legajo — sin necesitar ningún permiso especial de RRHH.',
                link: { href: '/portal', label: 'Ir a Mi Portal' },
            },
            {
                title: 'Kiosk de Fichaje y Kiosk de Producción',
                body: 'Estas dos pantallas están pensadas para correr en una pantalla o tablet fija (por ejemplo, en la entrada del laboratorio) y se abren en una pestaña aparte, no dentro del menú normal. El Kiosk de Fichaje registra entradas/salidas por reconocimiento facial o PIN. El Kiosk de Producción, además de imprimir tickets de trabajo (compatible con impresora térmica vía ArtCode Print Service), muestra en tiempo real un cartel de bienvenida cuando alguien ficha en la terminal HikVision conectada.',
            },
            {
                title: 'Terminales HikVision y Eventos Biométricos',
                body: 'Terminales HikVision administra los dispositivos biométricos conectados al sistema. Eventos Biométricos es el historial crudo de cada fichaje que reportan esas terminales, útil para auditar o resolver un reclamo de asistencia.',
                link: { href: '/hikvision/devices', label: 'Ir a Terminales HikVision' },
            },
        ],
    },
    {
        key: 'finanzas',
        title: 'Finanzas y Facturación',
        icon: Landmark,
        articles: [
            {
                title: 'Panel Contable',
                body: 'Contable → Panel resume el estado financiero de la empresa. Desde ahí también podés exportar el Libro IVA Ventas, el Libro IVA Compras y el Estado de Resultados en el formato que necesite tu contador.',
                link: { href: '/contable', label: 'Ir al Panel Contable' },
            },
            {
                title: 'Facturación electrónica (AFIP/ARCA)',
                body: 'ArtCode emite comprobantes electrónicos autorizados directamente contra AFIP/ARCA al confirmar una venta o factura, usando el punto de venta y el certificado configurados para tu empresa. Si un comprobante rechaza, el mensaje de error que devuelve AFIP se muestra tal cual para poder diagnosticarlo (por ejemplo, datos de un cliente inválidos ante el padrón).',
            },
        ],
    },
    {
        key: 'crm',
        title: 'CRM',
        icon: Bot,
        articles: [
            {
                title: 'Artie, el asistente conversacional',
                body: 'Artie es el chatbot de ArtCode: responde preguntas frecuentes de tus clientes usando una base de conocimiento propia de tu empresa (no se conecta a servicios externos de IA de terceros más allá de lo que tengas configurado). Interacciones guarda el historial de conversaciones para que puedas revisar qué te están preguntando los clientes.',
                link: { href: '/crm/chatbot', label: 'Ir a Artie' },
            },
        ],
    },
    {
        key: 'analisis',
        title: 'Análisis y Reportes',
        icon: BarChart3,
        articles: [
            {
                title: 'Analítica de laboratorio y estadísticas',
                body: 'Analítica Lab se enfoca en indicadores propios del laboratorio (volumen de órdenes, tiempos, rehacimientos). Estadísticas y Reportes cubren ventas, stock y desempeño general del negocio. Operaciones te deja auditar acciones puntuales registradas en el sistema.',
                link: { href: '/estadisticas', label: 'Ir a Estadísticas' },
            },
        ],
    },
    {
        key: 'sistema',
        title: 'Configuración y Administración',
        icon: Settings,
        articles: [
            {
                title: 'Usuarios, roles y permisos',
                body: 'Administración → Usuarios es el único lugar para dar de alta un usuario nuevo (no existe una pantalla pública de registro). Roles y Permisos define qué puede ver y hacer cada rol dentro de la empresa.',
                link: { href: '/users', label: 'Ir a Usuarios' },
            },
            {
                title: 'Datos de la empresa e impresión',
                body: 'Datos de la Empresa guarda los datos fiscales y de contacto de tu empresa, y Compañías te deja administrar más de una empresa dentro del mismo tenant. Impresión configura cómo se imprimen los comprobantes (impresora convencional o térmica, tamaño de ticket) y qué backend de impresión usa cada equipo — por ejemplo el ArtCode Print Service para una impresora térmica conectada por USB.',
                link: { href: '/settings', label: 'Ir a Empresa' },
            },
            {
                title: 'Acceso Kiosk',
                body: 'Acceso Kiosk controla qué equipos/IPs tienen permitido abrir las pantallas de kiosk (fichaje y producción) sin pedir el login normal de un usuario administrativo.',
                link: { href: '/admin/kiosk-access', label: 'Ir a Acceso Kiosk' },
            },
        ],
    },
];

const FAQ = [
    {
        q: '¿Cómo doy de alta un usuario nuevo?',
        a: 'Solo un administrador puede hacerlo, desde Administración → Usuarios. ArtCode no tiene un formulario público de autorregistro por diseño, para que el acceso al sistema quede siempre bajo control del administrador de la empresa.',
    },
    {
        q: 'No veo un módulo que debería tener disponible, ¿qué hago?',
        a: 'Revisá con tu administrador qué rol tenés asignado y qué permisos incluye ese rol en Roles y Permisos. La mayoría de los módulos ocultos son por permisos, no por un error del sistema.',
    },
    {
        q: 'Un empleado cargó mal un dato en su Portal, ¿puede corregirlo él mismo?',
        a: 'Mi Portal permite ver recibos, pedir licencias y consultar el legajo propio, pero los datos de fondo del legajo y las liquidaciones ya aprobadas los edita un administrador de RRHH.',
    },
    {
        q: '¿Por qué un colaborador no tiene "recibo de sueldo" con SAC como un empleado?',
        a: 'Porque Colaboradores no está en relación de dependencia (no aplica LCT/convenio colectivo) — su circuito de pago es más simple a propósito. Si una persona realmente trabaja en relación de dependencia, debe estar cargada como Empleado, no como Colaborador.',
    },
    {
        q: 'Quiero imprimir tickets en una impresora térmica conectada a una notebook o Raspberry Pi, ¿cómo lo configuro?',
        a: 'Instalá el ArtCode Print Service en ese equipo y elegí ese backend de impresión desde Sistema → Administración → Impresión. Una vez configurado, los tickets de Ventas y del Kiosk de Producción se envían directamente a la impresora térmica sin pasar por el diálogo de impresión del navegador.',
    },
];

export default function Index({ kbArticles = [] }) {
    const { isDark } = useTheme();
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].key);
    const [openArticle, setOpenArticle] = useState(null);
    const [openFaq, setOpenFaq] = useState(null);
    const [openKb, setOpenKb] = useState(null);

    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`;

    const searchResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return null;
        const results = [];
        CATEGORIES.forEach((cat) => {
            cat.articles.forEach((art) => {
                if (art.title.toLowerCase().includes(q) || art.body.toLowerCase().includes(q)) {
                    results.push({ ...art, category: cat.title, categoryKey: cat.key });
                }
            });
        });
        return results;
    }, [query]);

    const currentCategory = CATEGORIES.find((c) => c.key === activeCategory);

    return (
        <AuthenticatedLayout>
            <Head title="Ayuda" />

            <div className="flex flex-col gap-6 font-sans max-w-6xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <LifeBuoy size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Centro de Ayuda</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Guías por módulo y preguntas frecuentes de ArtCode</p>
                    </div>
                </div>

                <div className={`${card} p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${B.blue}18`, color: B.blue }}>
                            <MessagesSquare size={20} />
                        </div>
                        <div>
                            <p className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>¿No encontrás la respuesta acá?</p>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Escribile al equipo de soporte de ArtCode y te respondemos por ticket.</p>
                        </div>
                    </div>
                    <Link
                        href="/soporte"
                        className="inline-flex items-center justify-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90 shrink-0"
                        style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                    >
                        <LifeBuoy size={16} /> Ir a Soporte
                    </Link>
                </div>

                <div className={`${card} p-3 flex items-center gap-2`}>
                    <Search size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar en la ayuda (ej: recibo de sueldo, código de barra, cupones...)"
                        className={`w-full bg-transparent outline-none text-sm ${isDark ? 'text-slate-200 placeholder:text-slate-600' : 'text-slate-800 placeholder:text-slate-400'}`}
                    />
                </div>

                {searchResults ? (
                    <div className={`${card} overflow-hidden`}>
                        <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} para "{query}"
                            </h2>
                        </div>
                        {searchResults.length === 0 ? (
                            <p className={`p-5 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No encontramos artículos que coincidan. Probá con otra palabra.</p>
                        ) : (
                            <div className="divide-y divide-slate-800/20">
                                {searchResults.map((art, i) => (
                                    <div key={i} className="p-5">
                                        <p className={`text-xs font-semibold uppercase tracking-wide mb-1`} style={{ color: B.teal }}>{art.category}</p>
                                        <p className={`font-bold text-sm mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{art.title}</p>
                                        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{art.body}</p>
                                        {art.link && (
                                            <Link href={art.link.href} className="inline-flex items-center gap-1 text-xs font-semibold mt-2" style={{ color: B.blue }}>
                                                {art.link.label} <ArrowRight size={12} />
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Category nav */}
                        <div className={`${card} p-2 lg:col-span-1 h-fit`}>
                            <ul className="space-y-1">
                                {CATEGORIES.map((cat) => {
                                    const active = cat.key === activeCategory;
                                    return (
                                        <li key={cat.key}>
                                            <button
                                                onClick={() => { setActiveCategory(cat.key); setOpenArticle(null); }}
                                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors
                                                    ${active
                                                        ? (isDark ? 'bg-slate-800 text-white' : 'text-white')
                                                        : (isDark ? 'text-slate-400 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100')}`}
                                                style={active && !isDark ? { background: B.blue } : undefined}
                                            >
                                                <cat.icon size={16} className="shrink-0" />
                                                <span className="truncate">{cat.title}</span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Articles */}
                        <div className={`${card} overflow-hidden lg:col-span-3`}>
                            <div className={`px-5 py-4 border-b flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                {currentCategory && <currentCategory.icon size={18} style={{ color: B.teal }} />}
                                <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{currentCategory?.title}</h2>
                            </div>
                            <div className="divide-y divide-slate-800/20">
                                {currentCategory?.articles.map((art, i) => {
                                    const open = openArticle === i;
                                    return (
                                        <div key={i}>
                                            <button
                                                onClick={() => setOpenArticle(open ? null : i)}
                                                className={`w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}
                                            >
                                                <span className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{art.title}</span>
                                                <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''} ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                            </button>
                                            {open && (
                                                <div className="px-5 pb-4">
                                                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{art.body}</p>
                                                    {art.link && (
                                                        <Link href={art.link.href} className="inline-flex items-center gap-1 text-xs font-semibold mt-3" style={{ color: B.blue }}>
                                                            {art.link.label} <ArrowRight size={12} />
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Artículos de ArtCode (base de conocimiento) */}
                {kbArticles.length > 0 && (
                    <div className={`${card} overflow-hidden`}>
                        <div className={`px-5 py-4 border-b flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <BookOpen size={18} style={{ color: B.teal }} />
                            <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Artículos de ArtCode</h2>
                        </div>
                        <div className="divide-y divide-slate-800/20">
                            {kbArticles.map((art) => {
                                const open = openKb === art.id;
                                return (
                                    <div key={art.id}>
                                        <button
                                            onClick={() => setOpenKb(open ? null : art.id)}
                                            className={`w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}
                                        >
                                            <span className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {art.title}
                                                {art.category && (
                                                    <span className={`ml-2 text-xs font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>· {art.category}</span>
                                                )}
                                            </span>
                                            <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''} ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                        </button>
                                        {open && (
                                            <div className="px-5 pb-4">
                                                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{art.body}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* FAQ */}
                <div className={`${card} overflow-hidden`}>
                    <div className={`px-5 py-4 border-b flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <HelpCircle size={18} style={{ color: B.teal }} />
                        <h2 className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Preguntas Frecuentes</h2>
                    </div>
                    <div className="divide-y divide-slate-800/20">
                        {FAQ.map((item, i) => {
                            const open = openFaq === i;
                            return (
                                <div key={i}>
                                    <button
                                        onClick={() => setOpenFaq(open ? null : i)}
                                        className={`w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}
                                    >
                                        <span className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.q}</span>
                                        <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''} ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                    </button>
                                    {open && (
                                        <div className="px-5 pb-4">
                                            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.a}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <p className={`text-xs text-center ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                    ¿No encontraste lo que buscabas? Abrí un ticket en{' '}
                    <Link href="/soporte" className="font-semibold" style={{ color: B.blue }}>Soporte</Link>{' '}
                    o consultá con el administrador de tu empresa dentro de ArtCode.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
