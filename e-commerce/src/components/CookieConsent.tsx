import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, ChevronDown, ChevronUp, Check, Shield } from 'lucide-react'

const STORAGE_KEY = 'artdent_cookie_consent'

type ConsentState = {
  accepted: boolean
  necessary: true
  analytics: boolean
  marketing: boolean
  timestamp: number
}

function getStoredConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ConsentState) : null
  } catch {
    return null
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const stored = getStoredConsent()
    if (!stored) {
      // Pequeño delay para que no aparezca durante el primer render
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  if (!visible) return null

  function save(analyticsVal: boolean, marketingVal: boolean) {
    const consent: ConsentState = {
      accepted: true,
      necessary: true,
      analytics: analyticsVal,
      marketing: marketingVal,
      timestamp: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
    setVisible(false)
  }

  const acceptAll = () => save(true, true)
  const rejectOptional = () => save(false, false)
  const saveCustom = () => save(analytics, marketing)

  return (
    <>
      {/* Overlay difuminado en mobile */}
      <div className="fixed inset-0 bg-black/20 z-[9998] md:hidden" />

      <div
        className="fixed bottom-0 left-0 right-0 z-[9999] md:bottom-6 md:left-6 md:right-auto md:max-w-md"
        role="dialog"
        aria-label="Aviso de cookies"
        aria-modal="true"
      >
        <div className="bg-white border border-gray-200 shadow-2xl md:rounded-2xl">

          {/* Header */}
          <div className="flex items-start gap-3 p-5 pb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary)]/10">
              <Cookie size={20} className="text-[var(--brand-primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm leading-snug">
                Usamos cookies
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Utilizamos cookies propias y de terceros para mejorar tu experiencia,
                analizar el tráfico y mostrarte publicidad personalizada.
                Podés aceptar todo, rechazar las opcionales o personalizarlas.
              </p>
            </div>
          </div>

          {/* Personalización (expandible) */}
          {expanded && (
            <div className="px-5 pb-3 space-y-2.5 border-t border-gray-100 pt-3">
              {/* Necesarias */}
              <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-gray-800">Necesarias</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Sesión, carrito y seguridad. No se pueden deshabilitar.</p>
                </div>
                <div className="flex items-center justify-center w-9 h-5 rounded-full bg-gray-300 shrink-0 cursor-not-allowed">
                  <Check size={11} className="text-white" />
                </div>
              </div>

              {/* Analíticas */}
              <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-gray-800">Analíticas</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Google Analytics — tráfico y comportamiento (datos anonimizados).</p>
                </div>
                <button
                  role="switch"
                  aria-checked={analytics}
                  onClick={() => setAnalytics(v => !v)}
                  className={`relative flex items-center w-9 h-5 rounded-full transition-colors shrink-0 ${analytics ? 'bg-[var(--brand-primary)]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${analytics ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                </button>
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-gray-800">Marketing</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Meta Pixel — efectividad de anuncios en Facebook/Instagram.</p>
                </div>
                <button
                  role="switch"
                  aria-checked={marketing}
                  onClick={() => setMarketing(v => !v)}
                  className={`relative flex items-center w-9 h-5 rounded-full transition-colors shrink-0 ${marketing ? 'bg-[var(--brand-primary)]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${marketing ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-5 pb-5 pt-3 space-y-2">

            {/* Botones acción */}
            <div className="flex gap-2">
              {expanded ? (
                <>
                  <button
                    onClick={saveCustom}
                    className="flex-1 btn btn-outline text-xs py-2.5"
                  >
                    Guardar selección
                  </button>
                  <button
                    onClick={acceptAll}
                    className="flex-1 btn btn-primary text-xs py-2.5"
                  >
                    Aceptar todo
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={rejectOptional}
                    className="flex-1 btn btn-outline text-xs py-2.5"
                  >
                    Solo necesarias
                  </button>
                  <button
                    onClick={acceptAll}
                    className="flex-1 btn btn-primary text-xs py-2.5"
                  >
                    Aceptar todo
                  </button>
                </>
              )}
            </div>

            {/* Personalizar + links */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1 text-[11px] text-[var(--brand-primary)] font-semibold hover:underline"
              >
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {expanded ? 'Ocultar opciones' : 'Personalizar'}
              </button>
              <div className="flex items-center gap-3 text-[11px] text-gray-400">
                <Link to="/cookies" className="hover:text-[var(--brand-primary)] hover:underline flex items-center gap-0.5">
                  <Shield size={10} />
                  Política de cookies
                </Link>
                <Link to="/privacidad" className="hover:text-[var(--brand-primary)] hover:underline">
                  Privacidad
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
