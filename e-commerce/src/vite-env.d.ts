/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_STORAGE_URL?: string

  readonly VITE_GA4_ID?: string
  readonly VITE_FB_PIXEL_ID?: string
  readonly VITE_HOTJAR_ID?: string
  readonly VITE_HOTJAR_SV?: string

  readonly VITE_TAWK_PROPERTY_ID?: string
  readonly VITE_TAWK_WIDGET_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
