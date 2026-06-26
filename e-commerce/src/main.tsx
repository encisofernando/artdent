import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { registerPwa } from './lib/registerPwa'
import { fetchRemoteConfig } from './api/config'
import { ConfigProvider } from './contexts/ConfigContext'
import { analytics } from './api/analytics'
import './styles.css'
import './styles/expansive-display.css'

registerPwa()

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
          }}
        >
          <ConfigProvider config={remoteConfig}>
            <App />
          </ConfigProvider>
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
