// src/components/LiveChat.tsx

import { useEffect } from 'react'

// Declaración global para que TypeScript conozca los objetos de Tawk
declare global {
  interface Window {
    Tawk_API?: any
    Tawk_LoadStart?: Date
  }
}

// Definimos la interfaz de props para que TypeScript no se queje
// cuando se pasan propiedades desde App.tsx
interface LiveChatProps {
  useTawkTo?: boolean
  tawkToPropertyId?: string
  tawkToWidgetId?: string
}

/**
 * Componente que carga el widget de chat en vivo de Tawk.to mediante script nativo.
 * No renderiza nada en el DOM (el botón flotante lo inserta Tawk automáticamente).
 */
export default function LiveChat({
  useTawkTo = true,
  tawkToPropertyId,
  tawkToWidgetId,
}: LiveChatProps) {
  useEffect(() => {
    // Si useTawkTo es false → no cargar nada
    if (!useTawkTo) {
      console.log('[LiveChat] Chat desactivado por prop useTawkTo = false')
      return
    }

    // Priorizamos las props pasadas explícitamente, fallback a variables de entorno
    const propertyId = tawkToPropertyId?.trim() || import.meta.env.VITE_TAWK_PROPERTY_ID?.trim()
    const widgetId   = tawkToWidgetId?.trim()   || import.meta.env.VITE_TAWK_WIDGET_ID?.trim()

    if (!propertyId || !widgetId) {
      console.warn(
        '[LiveChat] Faltan credenciales de Tawk.to. Verifica:',
        'VITE_TAWK_PROPERTY_ID y VITE_TAWK_WIDGET_ID en .env o props pasadas'
      )
      return
    }

    // Evitamos cargar el script más de una vez
    if (document.getElementById('tawk-script')) {
      console.log('[LiveChat] Script de Tawk.to ya está cargado')
      return
    }

    console.log('[LiveChat] Cargando widget nativo de Tawk.to →', { propertyId, widgetId })

    const script = document.createElement('script')
    script.id = 'tawk-script'
    script.async = true
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`
    script.charset = 'UTF-8'
    script.crossOrigin = '*'

    script.onload = () => {
      console.log('[LiveChat] Script de Tawk.to cargado correctamente → botón debería aparecer')
    }

    script.onerror = (err) => {
      console.error('[LiveChat] Error al cargar el script de Tawk.to:', err)
    }

    document.body.appendChild(script)

    // Inicializamos los objetos globales que Tawk espera
    window.Tawk_API = window.Tawk_API || {}
    window.Tawk_LoadStart = new Date()

    // Limpieza (opcional, pero buena práctica)
    return () => {
      const existingScript = document.getElementById('tawk-script')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [useTawkTo, tawkToPropertyId, tawkToWidgetId]) // ← dependencias correctas

  // Este componente no renderiza nada visible
  return null
}