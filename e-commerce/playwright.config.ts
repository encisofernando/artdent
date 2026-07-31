import { defineConfig, devices } from '@playwright/test'

// El backend (artdent-crm, php artisan serve en :8000) tiene que estar
// corriendo aparte antes de `npm run test:e2e` — orquestar una app Laravel
// completa (DB, migraciones, seeders) desde acá sería más frágil que útil.
// El frontend sí lo levanta Playwright solo (webServer, abajo).
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'https://localhost:8080',
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'https://localhost:8080',
    ignoreHTTPSErrors: true,
    reuseExistingServer: true,
    timeout: 30_000,
  },
})
