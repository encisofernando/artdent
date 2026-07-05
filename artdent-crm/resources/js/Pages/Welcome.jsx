import { Head, Link } from '@inertiajs/react';

// ─── Paleta ArtDent ───────────────────────────────────────────────────────────
const C = {
    blue: '#397B9C',
    green: '#5AAD9C',
    teal: '#49949C',
    mint: '#ACD6CE',
    light: '#DAE6F0',
    pale: '#DAEEE3',
    soft: '#7CA5C3',
};

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="ArtDent — Laboratorio Odontológico" />

            <link
                href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap"
                rel="stylesheet"
            />

            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }
                body { font-family: 'Montserrat', sans-serif; background: #f0f5f8; color: #1a2a35; overflow-x: hidden; }

                /* ── Animaciones ── */
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(28px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes floatBubble {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50%      { transform: translateY(-18px) scale(1.04); }
                }
                @keyframes rotateSlow {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes slideRight {
                    from { transform: scaleX(0); }
                    to   { transform: scaleX(1); }
                }

                .anim-fadeup   { animation: fadeUp  0.7s ease both; }
                .anim-fadein   { animation: fadeIn  1.2s ease both; }
                .anim-d1 { animation-delay: 0.1s; }
                .anim-d2 { animation-delay: 0.25s; }
                .anim-d3 { animation-delay: 0.4s; }
                .anim-d4 { animation-delay: 0.55s; }
                .anim-d5 { animation-delay: 0.7s; }

                /* ── Hero ── */
                .hero {
                    min-height: 100vh;
                    background: linear-gradient(145deg, #e8f2f8 0%, #f0f5f8 35%, #eaf5f2 70%, #f5fafd 100%);
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }

                /* Formas decorativas de fondo */
                .hero::before {
                    content: '';
                    position: absolute;
                    top: -180px; right: -180px;
                    width: 520px; height: 520px;
                    border-radius: 50%;
                    background: radial-gradient(circle, ${C.mint}55 0%, transparent 70%);
                    pointer-events: none;
                }
                .hero::after {
                    content: '';
                    position: absolute;
                    bottom: -120px; left: -120px;
                    width: 400px; height: 400px;
                    border-radius: 50%;
                    background: radial-gradient(circle, ${C.light}80 0%, transparent 70%);
                    pointer-events: none;
                }

                /* Símbolo flotante decorativo */
                .deco-symbol {
                    position: absolute;
                    opacity: 0.06;
                    animation: floatBubble 7s ease-in-out infinite;
                }

                /* ── Navbar ── */
                .navbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 60px;
                    position: relative;
                    z-index: 10;
                }
                .nav-links {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                .btn-login {
                    padding: 9px 22px;
                    border-radius: 50px;
                    font-family: 'Montserrat', sans-serif;
                    font-weight: 600;
                    font-size: 13px;
                    cursor: pointer;
                    text-decoration: none;
                    transition: all 0.22s;
                    border: 2px solid ${C.blue};
                    color: ${C.blue};
                    background: transparent;
                }
                .btn-login:hover {
                    background: ${C.blue};
                    color: #fff;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px ${C.blue}40;
                }
                .btn-dashboard {
                    padding: 9px 22px;
                    border-radius: 50px;
                    font-family: 'Montserrat', sans-serif;
                    font-weight: 700;
                    font-size: 13px;
                    cursor: pointer;
                    text-decoration: none;
                    transition: all 0.22s;
                    background: linear-gradient(135deg, ${C.green}, ${C.teal});
                    color: #fff;
                    border: none;
                    box-shadow: 0 4px 16px ${C.green}35;
                }
                .btn-dashboard:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 28px ${C.green}50;
                }

                /* ── Hero Content ── */
                .hero-body {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 60px 80px;
                    position: relative;
                    z-index: 2;
                }
                .hero-inner {
                    max-width: 900px;
                    width: 100%;
                    text-align: center;
                }
                .hero-logo {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 32px;
                }
                .hero-logo img {
                    height: 90px;
                    object-fit: contain;
                    filter: drop-shadow(0 8px 24px ${C.blue}25);
                }
                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: ${C.pale};
                    border: 1px solid ${C.mint};
                    border-radius: 50px;
                    padding: 5px 16px;
                    font-size: 11px;
                    font-weight: 700;
                    color: ${C.teal};
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    margin-bottom: 24px;
                }
                .hero-badge-dot {
                    width: 7px; height: 7px;
                    border-radius: 50%;
                    background: ${C.green};
                    animation: fadeIn 0.5s ease 1s both;
                    box-shadow: 0 0 0 3px ${C.green}30;
                }
                .hero-title {
                    font-size: clamp(36px, 5vw, 62px);
                    font-weight: 900;
                    line-height: 1.1;
                    color: #0e1f2b;
                    margin-bottom: 20px;
                    letter-spacing: -1.5px;
                }
                .hero-title span {
                    background: linear-gradient(135deg, ${C.blue} 0%, ${C.teal} 50%, ${C.green} 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .hero-sub {
                    font-size: 17px;
                    font-weight: 400;
                    color: #4a6070;
                    max-width: 540px;
                    margin: 0 auto 36px;
                    line-height: 1.65;
                }
                .hero-ctas {
                    display: flex;
                    gap: 14px;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-bottom: 64px;
                }
                .cta-primary {
                    padding: 14px 36px;
                    border-radius: 50px;
                    font-family: 'Montserrat', sans-serif;
                    font-weight: 800;
                    font-size: 14px;
                    cursor: pointer;
                    text-decoration: none;
                    transition: all 0.25s;
                    background: linear-gradient(135deg, ${C.blue} 0%, ${C.teal} 100%);
                    color: #fff;
                    border: none;
                    box-shadow: 0 6px 28px ${C.blue}45;
                    letter-spacing: 0.3px;
                }
                .cta-primary:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 36px ${C.blue}55;
                }

                /* ── Stats strip ── */
                .stats-strip {
                    display: flex;
                    justify-content: center;
                    gap: 48px;
                    flex-wrap: wrap;
                }
                .stat-item {
                    text-align: center;
                }
                .stat-num {
                    font-size: 28px;
                    font-weight: 900;
                    color: ${C.blue};
                    line-height: 1;
                }
                .stat-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: #7a9aaa;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-top: 4px;
                }
                .stat-divider {
                    width: 1px;
                    background: ${C.light};
                    align-self: stretch;
                }

                /* ── Separador diagonal ── */
                .diagonal-sep {
                    height: 70px;
                    background: #f0f5f8;
                    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 40%);
                }

                /* ── Módulos ── */
                .modules-section {
                    background: #fff;
                    padding: 80px 60px;
                }
                .section-header {
                    text-align: center;
                    margin-bottom: 56px;
                }
                .section-tag {
                    display: inline-block;
                    font-size: 11px;
                    font-weight: 800;
                    color: ${C.teal};
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 14px;
                }
                .section-title {
                    font-size: clamp(26px, 3.5vw, 40px);
                    font-weight: 900;
                    color: #0e1f2b;
                    letter-spacing: -0.8px;
                    line-height: 1.15;
                }
                .section-line {
                    width: 48px; height: 4px;
                    background: linear-gradient(90deg, ${C.blue}, ${C.green});
                    border-radius: 2px;
                    margin: 16px auto 0;
                    transform-origin: left;
                    animation: slideRight 0.8s ease 0.5s both;
                }
                .modules-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 24px;
                    max-width: 1100px;
                    margin: 0 auto;
                }
                .module-card {
                    background: #f8fbfd;
                    border: 1px solid ${C.light};
                    border-radius: 20px;
                    padding: 32px 28px;
                    transition: all 0.28s;
                    cursor: default;
                    position: relative;
                    overflow: hidden;
                }
                .module-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, var(--c1), var(--c2));
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.3s ease;
                }
                .module-card:hover::before { transform: scaleX(1); }
                .module-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 16px 48px rgba(57,123,156,0.14);
                    border-color: ${C.mint};
                    background: #fff;
                }
                .module-icon {
                    width: 52px; height: 52px;
                    border-radius: 14px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 24px;
                    margin-bottom: 20px;
                }
                .module-name {
                    font-size: 17px;
                    font-weight: 800;
                    color: #0e1f2b;
                    margin-bottom: 10px;
                    letter-spacing: -0.3px;
                }
                .module-desc {
                    font-size: 13px;
                    font-weight: 400;
                    color: #5a7585;
                    line-height: 1.65;
                    margin-bottom: 20px;
                }
                .module-features {
                    list-style: none;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .module-features li {
                    font-size: 12px;
                    font-weight: 500;
                    color: #4a6575;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .module-features li::before {
                    content: '';
                    width: 6px; height: 6px;
                    border-radius: 50%;
                    background: var(--c1);
                    flex-shrink: 0;
                }

                /* ── Tagline section ── */
                .tagline-section {
                    background: linear-gradient(135deg, ${C.blue} 0%, #2d6882 30%, ${C.teal} 65%, ${C.green} 100%);
                    padding: 80px 60px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                .tagline-section::before {
                    content: '';
                    position: absolute;
                    top: -60px; left: 50%;
                    transform: translateX(-50%);
                    width: 600px; height: 600px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.04);
                    pointer-events: none;
                }
                .tagline-quote {
                    font-size: clamp(28px, 4vw, 50px);
                    font-weight: 900;
                    color: #fff;
                    letter-spacing: -1px;
                    line-height: 1.2;
                    max-width: 700px;
                    margin: 0 auto 20px;
                    position: relative;
                    z-index: 1;
                }
                .tagline-quote .quote-mark {
                    font-size: 1.3em;
                    opacity: 0.35;
                    line-height: 0;
                    vertical-align: -0.2em;
                }
                .tagline-sub {
                    font-size: 15px;
                    font-weight: 500;
                    color: rgba(255,255,255,0.75);
                    position: relative;
                    z-index: 1;
                    letter-spacing: 0.3px;
                }
                .tagline-logo {
                    margin-top: 40px;
                    position: relative;
                    z-index: 1;
                }
                .tagline-logo img {
                    height: 52px;
                    object-fit: contain;
                    opacity: 0.92;
                }

                /* ── Footer ── */
                .footer {
                    background: #0e1f2b;
                    padding: 32px 60px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .footer-brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .footer-brand img {
                    height: 30px;
                    object-fit: contain;
                    opacity: 0.85;
                }
                .footer-copy {
                    font-size: 11px;
                    font-weight: 500;
                    color: rgba(255,255,255,0.35);
                    text-align: right;
                    line-height: 1.7;
                }

                /* ── Responsive ── */
                @media (max-width: 768px) {
                    .navbar { padding: 16px 24px; }
                    .hero-body { padding: 24px 24px 60px; }
                    .modules-section { padding: 60px 24px; }
                    .tagline-section { padding: 60px 24px; }
                    .footer { padding: 24px; }
                    .stats-strip { gap: 28px; }
                    .stat-divider { display: none; }
                }
            `}</style>

            {/* ══════════════ HERO ══════════════ */}
            <section className="hero">

                {/* Símbolos decorativos flotantes */}
                <div className="deco-symbol" style={{ top: '15%', right: '8%', animationDelay: '0s' }}>
                    <img src="/assets/logo-artdent-icon.png" alt="" width="160" style={{ opacity: 1 }} />
                </div>
                <div className="deco-symbol" style={{ top: '55%', left: '4%', animationDelay: '2.5s', animationDuration: '9s' }}>
                    <img src="/assets/logo-artdent-icon.png" alt="" width="90" style={{ opacity: 1 }} />
                </div>

                {/* Navbar */}
                <nav className="navbar anim-fadein">
                    <img src="/assets/logo-artdent-color.png" alt="ArtDent" style={{ height: 44 }} />
                    <div className="nav-links">
                        {auth?.user ? (
                            <a href={route('dashboard')} className="btn-dashboard">
                                Ir al Dashboard →
                            </a>
                        ) : (
                            <a href={route('login')} className="btn-login">Iniciar sesión</a>
                        )}
                    </div>
                </nav>

                {/* Body */}
                <div className="hero-body">
                    <div className="hero-inner">

                        <div className="hero-logo anim-fadeup anim-d1">
                            <img src="/assets/logo-artdent-color.png" alt="ArtDent Laboratorio Odontológico" />
                        </div>

                        <div className="hero-badge anim-fadeup anim-d2">
                            <span className="hero-badge-dot" />
                            Sistema de Gestión Odontológica
                        </div>

                        <h1 className="hero-title anim-fadeup anim-d2">
                            El arte de crear<br />
                            <span>para toda la vida.</span>
                        </h1>

                        <p className="hero-sub anim-fadeup anim-d3">
                            Plataforma integral para laboratorios odontológicos.
                            Gestioná órdenes, clientes, stock y facturación
                            desde un solo lugar.
                        </p>

                        <div className="hero-ctas anim-fadeup anim-d4">
                            {auth?.user ? (
                                <a href={route('dashboard')} className="cta-primary">
                                    Ir al Dashboard →
                                </a>
                            ) : (
                                <a href={route('login')} className="cta-primary">
                                    Iniciar sesión
                                </a>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="stats-strip anim-fadeup anim-d5">
                            {[
                                { num: 'CRM', label: 'Gestión de clientes' },
                                { num: 'POS', label: 'Punto de venta' },
                                { num: 'LAB', label: 'Módulo laboratorio' },
                                { num: '24/7', label: 'Acceso online' },
                            ].map((s, i) => (
                                <div key={i} className="stat-item">
                                    <div className="stat-num">{s.num}</div>
                                    <div className="stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </section>

            {/* ══════════════ MÓDULOS ══════════════ */}
            <section className="modules-section">
                <div className="section-header">
                    <div className="section-tag">Módulos del sistema</div>
                    <h2 className="section-title">Todo lo que necesita<br />tu laboratorio</h2>
                    <div className="section-line" />
                </div>

                <div className="modules-grid">
                    {[
                        {
                            icon: '👥',
                            name: 'CRM',
                            desc: 'Gestión integral de dentistas, clínicas y pacientes con seguimiento completo.',
                            features: ['Dentistas y clínicas', 'Historial de órdenes', 'Cuentas corrientes', 'Comunicaciones'],
                            c1: '#397B9C', c2: '#49949C',
                            bg: '#eaf3f8',
                        },
                        {
                            icon: '🦷',
                            name: 'Laboratorio',
                            desc: 'Control total de órdenes de trabajo, estados, prótesis y tiempos de producción.',
                            features: ['Órdenes de trabajo', 'Estados y seguimiento', 'Aranceles y costos', 'Pagos a técnicos'],
                            c1: '#5AAD9C', c2: '#49949C',
                            bg: '#eaf6f3',
                        },
                        {
                            icon: '🛒',
                            name: 'Punto de Venta',
                            desc: 'Ventas rápidas con stock en tiempo real, facturación y múltiples métodos de pago.',
                            features: ['Caja y sesiones', 'Stock en tiempo real', 'Tickets y comprobantes', 'Métodos de pago'],
                            c1: '#49949C', c2: '#ACD6CE',
                            bg: '#eef6f7',
                        },
                        {
                            icon: '📦',
                            name: 'Stock',
                            desc: 'Control de inventario por depósito, movimientos, variantes y alertas de stock mínimo.',
                            features: ['Múltiples depósitos', 'Variantes de productos', 'Movimientos trazables', 'Alertas automáticas'],
                            c1: '#7CA5C3', c2: '#397B9C',
                            bg: '#edf2f7',
                        },
                        {
                            icon: '💳',
                            name: 'Finanzas',
                            desc: 'Control de ingresos, egresos, cuentas corrientes y balance del laboratorio.',
                            features: ['Ingresos y egresos', 'Cuentas corrientes', 'Balance general', 'Reportes'],
                            c1: '#5AAD9C', c2: '#397B9C',
                            bg: '#eaf5f0',
                        },
                        {
                            icon: '🌐',
                            name: 'E-Commerce',
                            desc: 'Tienda online integrada para la venta de insumos y productos del laboratorio.',
                            features: ['Catálogo online', 'Pedidos digitales', 'Integración de stock', 'Panel de órdenes'],
                            c1: '#ACD6CE', c2: '#5AAD9C',
                            bg: '#f0f9f7',
                        },
                    ].map((mod, i) => (
                        <div
                            key={i}
                            className="module-card anim-fadeup"
                            style={{
                                '--c1': mod.c1,
                                '--c2': mod.c2,
                                animationDelay: `${0.1 + i * 0.1}s`,
                            }}
                        >
                            <div
                                className="module-icon"
                                style={{ background: mod.bg }}
                            >
                                {mod.icon}
                            </div>
                            <div className="module-name">{mod.name}</div>
                            <div className="module-desc">{mod.desc}</div>
                            <ul className="module-features">
                                {mod.features.map((f, j) => (
                                    <li key={j}>{f}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════ TAGLINE ══════════════ */}
            <section className="tagline-section">
                <div className="tagline-quote anim-fadeup">
                    <span className="quote-mark">"</span>
                    Tu sonrisa,<br />es nuestra prioridad.
                    <span className="quote-mark">"</span>
                </div>
                <p className="tagline-sub anim-fadeup anim-d2">
                    ArtDent Laboratorio Odontológico — Tecnología al servicio del arte dental.
                </p>
                <div className="tagline-logo anim-fadeup anim-d3">
                    <img src="/assets/logo-artdent-blanco.png" alt="ArtDent" />
                </div>
            </section>

            {/* ══════════════ FOOTER ══════════════ */}
            <footer className="footer">
                <div className="footer-brand">
                    <img src="/assets/logo-artdent-blanco.png" alt="ArtDent" />
                </div>
                <div className="footer-copy">
                    <div>ArtDent Laboratorio Odontológico</div>
                    <div>Sistema de Gestión v2 — {new Date().getFullYear()}</div>
                </div>
            </footer>
        </>
    );
}