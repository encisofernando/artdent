// Analytics Service — GA4, Meta Pixel, Hotjar, GTM
// Scripts se cargan solo tras consentimiento explícito del usuario.

const CONSENT_KEY = 'artdent_cookie_consent'

type StoredConsent = { accepted: boolean; analytics: boolean; marketing: boolean }

function getStoredConsent(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    return raw ? (JSON.parse(raw) as StoredConsent) : null
  } catch {
    return null
  }
}

class AnalyticsService {
  private gaInitialized = false
  private pixelInitialized = false
  private hotjarInitialized = false
  private gtmInitialized = false

  private config = {
    ga4MeasurementId: undefined as string | undefined,
    metaPixelId: undefined as string | undefined,
    hotjarId: undefined as string | undefined,
    gtmId: undefined as string | undefined,
    hotjarSnippetVersion: 6,
  }

  // ── ID storage ────────────────────────────────────────────────────────────

  /** Solo almacena IDs — NO carga scripts. Llamar desde main.tsx */
  storeRemoteIds(ids: {
    ga4_id?: string | null
    meta_pixel_id?: string | null
    hotjar_id?: string | null
    gtm_id?: string | null
  }) {
    if (ids.ga4_id) this.config.ga4MeasurementId = ids.ga4_id
    if (ids.meta_pixel_id) this.config.metaPixelId = ids.meta_pixel_id
    if (ids.hotjar_id) this.config.hotjarId = ids.hotjar_id
    if (ids.gtm_id) this.config.gtmId = ids.gtm_id
  }

  /** @deprecated Usar storeRemoteIds() + initWithConsent(). Mantenido por compatibilidad. */
  initFromRemote(ids: {
    ga4_id?: string | null
    meta_pixel_id?: string | null
    hotjar_id?: string | null
    gtm_id?: string | null
  }) {
    this.storeRemoteIds(ids)
    this.reinitIfConsented()
  }

  // ── Consent ───────────────────────────────────────────────────────────────

  /** Inicializa scripts según el consentimiento guardado en localStorage */
  reinitIfConsented() {
    const consent = getStoredConsent()
    if (consent?.accepted) {
      this.initWithConsent({ analytics: consent.analytics, marketing: consent.marketing })
    }
  }

  /** Activa scripts según consentimiento explícito (llamar desde CookieConsent) */
  initWithConsent(consent: { analytics: boolean; marketing: boolean }) {
    if (consent.analytics) {
      this.initGTM()
      this.initGoogleAnalytics()
      this.initHotjar()
    }
    if (consent.marketing) {
      this.initMetaPixel()
    }
  }

  /** @deprecated Usar reinitIfConsented() o initWithConsent() */
  init() {
    this.reinitIfConsented()
  }

  // ── Script loaders ────────────────────────────────────────────────────────

  private initGTM() {
    if (this.gtmInitialized || typeof window === 'undefined') return
    const id = this.config.gtmId
    if (!id) return

    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`
    document.head.appendChild(script)

    // noscript iframe
    const noscript = document.createElement('noscript')
    const iframe = document.createElement('iframe')
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${id}`
    iframe.height = '0'
    iframe.width = '0'
    iframe.style.display = 'none'
    iframe.style.visibility = 'hidden'
    noscript.appendChild(iframe)
    document.body.prepend(noscript)

    this.gtmInitialized = true
  }

  private initGoogleAnalytics() {
    if (this.gaInitialized || typeof window === 'undefined') return
    const id = this.config.ga4MeasurementId
    if (!id) return

    // Si GTM ya está activo, GA4 se configura a través de él
    if (this.gtmInitialized) {
      this.gaInitialized = true
      return
    }

    if (typeof window.gtag === 'function') {
      this.gaInitialized = true
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
    document.head.appendChild(script)

    const dataLayer = (window.dataLayer = window.dataLayer || [])
    function gtag(...args: any[]) { dataLayer.push(args) }
    window.gtag = gtag

    gtag('js', new Date())
    gtag('config', id, {
      send_page_view: false,
      cookie_flags: window.location.protocol === 'https:' ? 'SameSite=None;Secure' : undefined,
    })

    this.gaInitialized = true
  }

  private initMetaPixel() {
    if (this.pixelInitialized || typeof window === 'undefined') return
    const id = this.config.metaPixelId
    if (!id) return

    // Snippet oficial de Meta Pixel, calcado tal cual lo publica Meta —
    // se deja intacto (no reescrito a spread/rest) para poder diffearlo
    // contra la fuente si Meta lo actualiza.
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-expressions, prefer-rest-params, prefer-spread */
    ;(function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      }
      if (!f._fbq) f._fbq = n
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []
      t = b.createElement(e); t.async = !0; t.src = v
      s = b.getElementsByTagName(e)[0]
      s.parentNode.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-expressions, prefer-rest-params, prefer-spread */

    window.fbq('init', id)
    window.fbq('track', 'PageView')

    this.pixelInitialized = true
  }

  private initHotjar() {
    if (this.hotjarInitialized || typeof window === 'undefined') return
    if (window.location.protocol !== 'https:') return
    const hjid = this.config.hotjarId
    if (!hjid) return

    const hjidNum = Number(hjid)
    const hjsv = this.config.hotjarSnippetVersion

    ;(function (h: any, o: any, t: any, j: any, a?: any, r?: any) {
      h.hj = h.hj || function (...args: any[]) { ;(h.hj.q = h.hj.q || []).push(args) }
      h._hjSettings = { hjid: hjidNum, hjsv }
      a = o.getElementsByTagName('head')[0]
      r = o.createElement('script'); r.async = 1
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv
      a.appendChild(r)
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=')

    this.hotjarInitialized = true
  }

  // ── Page views ────────────────────────────────────────────────────────────

  pageView(path: string, title?: string) {
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title,
        page_location: window.location.href,
      })
    }
    if (this.gtmInitialized) {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({ event: 'spa_page_view', page_path: path, page_title: title || document.title })
    }
    if (this.pixelInitialized && window.fbq) {
      window.fbq('track', 'PageView')
    }
  }

  // ── E-commerce events ─────────────────────────────────────────────────────

  viewProduct(product: { id: number | string; name: string; price: number; category?: string; brand?: string }) {
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'ARS',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          item_brand: product.brand || 'ArtDent',
          price: product.price,
        }],
      })
    }
    if (this.pixelInitialized && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.price,
        currency: 'ARS',
      })
    }
  }

  addToCart(product: { id: number | string; name: string; price: number; quantity: number; category?: string }) {
    const value = product.price * product.quantity
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'ARS',
        value,
        items: [{
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: product.quantity,
        }],
      })
    }
    if (this.pixelInitialized && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value,
        currency: 'ARS',
      })
    }
  }

  beginCheckout(items: Array<{ product_id: number | string; name: string; unit_price: number; qty: number }>, value: number) {
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'ARS',
        value,
        items: items.map((item) => ({
          item_id: item.product_id,
          item_name: item.name,
          price: item.unit_price,
          quantity: item.qty,
        })),
      })
    }
    if (this.pixelInitialized && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: items.map((i) => i.product_id),
        value,
        currency: 'ARS',
        num_items: items.length,
      })
    }
  }

  purchase(order: { id: string; value: number; tax?: number; shipping?: number; items: Array<{ product_id: number | string; name: string; unit_price: number; qty: number }> }) {
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: order.id,
        value: order.value,
        tax: order.tax || 0,
        shipping: order.shipping || 0,
        currency: 'ARS',
        items: order.items.map((item) => ({
          item_id: item.product_id,
          item_name: item.name,
          price: item.unit_price,
          quantity: item.qty,
        })),
      })
    }
    if (this.pixelInitialized && window.fbq) {
      window.fbq('track', 'Purchase', {
        content_ids: order.items.map((i) => i.product_id),
        content_type: 'product',
        value: order.value,
        currency: 'ARS',
        num_items: order.items.length,
      })
    }
  }

  // ── Other events ──────────────────────────────────────────────────────────

  search(query: string) {
    if (!query.trim()) return
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', 'search', { search_term: query.trim() })
    }
    if (this.pixelInitialized && window.fbq) {
      window.fbq('track', 'Search', { search_string: query.trim() })
    }
  }

  signup(method = 'email') {
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', 'sign_up', { method })
    }
    if (this.pixelInitialized && window.fbq) {
      window.fbq('track', 'CompleteRegistration')
    }
  }

  login(method = 'email') {
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', 'login', { method })
    }
  }

  event(eventName: string, parameters?: Record<string, any>) {
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', eventName, parameters)
    }
  }

  custom(eventName: string, data?: Record<string, any>) {
    this.event(eventName, data)
  }
}

export const analytics = new AnalyticsService()

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
    fbq: (...args: any[]) => void
    _fbq: any
    hj: (...args: any[]) => void
    _hjSettings: { hjid: number; hjsv: number }
  }
}
