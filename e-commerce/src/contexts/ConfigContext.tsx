import React, { createContext, useContext } from 'react'
import type { RemoteConfig } from '../api/config'

const ConfigContext = createContext<RemoteConfig | null>(null)

export function ConfigProvider({ config, children }: { config: RemoteConfig; children: React.ReactNode }) {
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
}

export function useConfig(): RemoteConfig {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used inside ConfigProvider')
  return ctx
}
