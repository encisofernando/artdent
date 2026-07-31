// Prerender estático post-build: levanta el build real con `vite preview`,
// visita cada ruta pública con Chromium (playwright-chromium) y guarda el
// HTML ya renderizado — así los crawlers que no ejecutan JS (y las vistas
// previas de WhatsApp/redes) ven contenido real en vez de <div id="root">.
//
// Alcance actual: solo rutas 100% estáticas (sin datos del catálogo, que
// dependerían de que este build tenga acceso de red al backend). /productos
// y /productos/:slug quedan como trabajo a futuro documentado, no cubierto acá.
import { preview } from 'vite'
import { chromium } from 'playwright-chromium'
import { mkdir, copyFile, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')

const ROUTES = [
  '/',
  '/nosotros',
  '/contacto',
  '/defensa-consumidor',
  '/privacidad',
  '/terminos',
  '/cookies',
  '/devoluciones',
  '/preguntas-frecuentes',
  '/ayuda',
  '/politicas',
]

async function outputPathFor(route) {
  if (route === '/') return path.join(distDir, 'index.html')
  return path.join(distDir, route.replace(/^\//, ''), 'index.html')
}

async function main() {
  // Preserva el shell CSR vacío original (antes de pisar dist/index.html
  // con el contenido prerenderizado de home) — es el fallback para
  // cualquier ruta que no esté en la lista de arriba.
  await copyFile(path.join(distDir, 'index.html'), path.join(distDir, 'shell.html'))

  const server = await preview({
    root,
    preview: { port: 4185, strictPort: true },
  })
  const url = server.resolvedUrls?.local?.[0]
  if (!url) throw new Error('No se pudo levantar el preview server.')

  const browser = await chromium.launch()
  // El preview server local usa el cert autofirmado de @vitejs/plugin-basic-ssl
  // (mismo que el dev server) — solo importa para este script, nunca se
  // expone a un usuario real.
  const page = await browser.newPage({ ignoreHTTPSErrors: true })

  const results = []
  for (const route of ROUTES) {
    await page.goto(new URL(route, url).toString(), { waitUntil: 'networkidle' })
    // El home tiene un carrusel/skeletons que resuelven poco después del
    // primer paint — un margen chico evita capturar un estado a medio cargar.
    await page.waitForTimeout(400)
    const html = await page.content()
    const outPath = await outputPathFor(route)
    await mkdir(path.dirname(outPath), { recursive: true })
    await writeFile(outPath, html, 'utf-8')
    const title = await page.title()
    results.push({ route, outPath: path.relative(distDir, outPath), title })
  }

  await browser.close()
  await server.httpServer.close()

  console.log('\nPrerender completo:')
  for (const r of results) {
    console.log(`  ${r.route.padEnd(24)} -> dist/${r.outPath}  (<title>${r.title}</title>)`)
  }
}

main().catch((err) => {
  console.error('Prerender falló:', err)
  process.exit(1)
})
