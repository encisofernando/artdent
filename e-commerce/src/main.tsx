import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { initSentry } from './lib/sentry'
import { registerPwa } from './lib/registerPwa'
import { ensureCsrfCookie } from './api/http'
import { fetchRemoteConfig } from './api/config'
import { ConfigProvider } from './contexts/ConfigContext'
import { analytics } from './api/analytics'
import './styles.css'
import './styles/expansive-display.css'

initSentry()
registerPwa()

// No se espera — solo necesita estar lista para cuando el usuario haga login/
// registro/checkout, mucho antes de eso ya se resolvió.
ensureCsrfCookie()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      staleTime: 30_000,
    }
  }
})

// Fetch config antes de montar la app
const remoteConfig = await fetchRemoteConfig()

// Almacena IDs — los scripts se cargan solo tras consentimiento (ver CookieConsent)
analytics.storeRemoteIds(remoteConfig.analytics)

const rootEl = document.getElementById('root')!
const app = (
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <BrowserRouter>
            <ConfigProvider config={remoteConfig}>
              <App />
            </ConfigProvider>
          </BrowserRouter>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
)

// Las rutas prerenderizadas (ver scripts/prerender.mjs) llegan con #root ya
// lleno de HTML real, que sirve para SEO y para el primer paint. No se
// hidrata: ese HTML es una foto de un render de cliente (createRoot), no de
// un SSR, así que nunca coincide con la hidratación (ids de useId, sesión,
// carrito) — React tiraba #418/#423 en cada visita y lo descartaba igual.
// createRoot mantiene ese contenido visible hasta su primer commit.
ReactDOM.createRoot(rootEl).render(app)

// Splash de arranque definido inline en index.html.
;(window as Window & { hideAppSplash?: () => void }).hideAppSplash?.()
