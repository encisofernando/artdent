import { test, expect } from '@playwright/test'

// Flujo completo de compra como invitado: catálogo → carrito → checkout
// (4 pasos) → pedido creado. Es la única funcionalidad del sitio que genera
// ingresos, así que es el E2E de mayor prioridad.
//
// Corre contra el backend local real (no un mock) — cada corrida crea un
// pedido real en la base de dev. No hay limpieza automática acá: como
// cualquier E2E contra un backend real sin base de datos efímera dedicada,
// conviene limpiar los pedidos de prueba (código con prefijo visible en el
// nombre "E2E Test") de tanto en tanto a mano.

test('agregar al carrito, completar checkout y llegar a "pedido creado"', async ({ page }) => {
  await page.goto('/productos')

  // Elegimos el primer producto SIN variantes (tiene botón directo
  // "Agregar al carrito" en la card; los que tienen variantes muestran
  // "Ver opciones" y llevan a la ficha) para no depender de qué atributos
  // tenga cargados ese producto en la base de dev.
  const addButton = page.getByRole('button', { name: 'Agregar al carrito' }).first()
  await expect(addButton).toBeVisible({ timeout: 15_000 })
  await addButton.click()

  await page.goto('/carrito')
  await expect(page.getByRole('heading', { name: 'Carrito' })).toBeVisible()
  await page.getByRole('button', { name: 'Ir a pagar' }).click()

  // ── Paso 1: datos del comprador ──────────────────────────────────────
  await expect(page.getByRole('heading', { name: 'Datos del comprador' })).toBeVisible()
  await page.fill('#checkout-name', 'E2E Test Playwright')
  await page.fill('#checkout-email', `e2e-test-${Date.now()}@example.com`)
  await page.fill('#checkout-dni', '20304050')
  await page.getByPlaceholder('Cód (11)').fill('370')
  await page.getByPlaceholder('Número (12345678)').fill('4000000')
  await page.getByRole('button', { name: 'Continuar' }).click()

  // ── Paso 2: envío — retiro en punto (evita tener que cargar dirección) ──
  await expect(page.getByRole('heading', { name: 'Método de entrega' })).toBeVisible()
  await page.getByText('Retiro en punto de entrega').click()
  // Elegimos el primer punto de retiro real de la lista que aparece debajo
  // de "Elegí un punto de retiro" — acotado a esa sección para no matchear
  // por accidente la card (deshabilitada) de "Moto Mandados", cuya
  // descripción también menciona una ciudad ("Solo disponible en Formosa
  // Capital").
  const pickupSection = page.locator('h3', { hasText: 'Elegí un punto de retiro' }).locator('..')
  await pickupSection.getByRole('button').first().click()
  await page.getByRole('button', { name: 'Continuar' }).click()

  // ── Paso 3: pago — efectivo en sucursal (no redirige a un gateway externo) ──
  await expect(page.getByRole('heading', { name: 'Método de pago' })).toBeVisible()
  await page.getByText('Efectivo en sucursal').click()
  await page.getByRole('button', { name: 'Continuar' }).click()

  // ── Paso 4: confirmar ────────────────────────────────────────────────
  await expect(page.getByRole('heading', { name: 'Confirmar pedido' })).toBeVisible()
  await page.getByRole('button', { name: 'Confirmar pedido' }).click()

  // ── Resultado: pantalla de pedido creado con el código real ──────────
  await expect(page.getByRole('heading', { name: '¡Pedido creado!' })).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText(/Pedido #/)).toBeVisible()
})
