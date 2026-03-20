// Analytics Service - Google Analytics, Meta Pixel, Hotjar
class AnalyticsService {
  private gaInitialized = false
  private pixelInitialized = false
  private hotjarInitialized = false

  // Configuration
  private config = {
    ga4MeasurementId: (import.meta as any).env?.VITE_GA4_ID as string | undefined,
    metaPixelId: (import.meta as any).env?.VITE_FB_PIXEL_ID as string | undefined,
    hotjarId: (import.meta as any).env?.VITE_HOTJAR_ID as string | undefined,
    hotjarSnippetVersion: Number((import.meta as any).env?.VITE_HOTJAR_SV || 6),
  }

  /**
   * Initialize all analytics services
   */
  init() {
    this.initGoogleAnalytics()
    this.initMetaPixel()
    this.initHotjar()
  }

  /**
   * Google Analytics 4
   */
  private initGoogleAnalytics() {
    if (this.gaInitialized || typeof window === 'undefined') return

    const id = this.config.ga4MeasurementId
    if (!id || id === 'G-XXXXXXXXXX') return

    // Load gtag script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
    document.head.appendChild(script)

    // Initialize gtag
    const dataLayer = (window.dataLayer = window.dataLayer || [])
    function gtag(...args: any[]) {
      dataLayer.push(args)
    }
    window.gtag = gtag

    gtag('js', new Date())
    gtag('config', id, {
      send_page_view: false, // We'll send manually
      // Only set Secure cookies when running on HTTPS.
      cookie_flags: window.location.protocol === 'https:' ? 'SameSite=None;Secure' : undefined,
    })

    this.gaInitialized = true
    console.log('[Analytics] Google Analytics initialized')
  }

  /**
   * Meta Pixel (Facebook)
   */
  private initMetaPixel() {
    if (this.pixelInitialized || typeof window === 'undefined') return

    const id = this.config.metaPixelId
    if (!id) return

    // Facebook Pixel Code
    ;(function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      }
      if (!f._fbq) f._fbq = n
      n.push = n
      n.loaded = !0
      n.version = '2.0'
      n.queue = []
      t = b.createElement(e)
      t.async = !0
      t.src = v
      s = b.getElementsByTagName(e)[0]
      s.parentNode.insertBefore(t, s)
    })(
      window,
      document,
      'script',
      'https://connect.facebook.net/en_US/fbevents.js'
    )

    window.fbq('init', id)
    window.fbq('track', 'PageView')

    this.pixelInitialized = true
    console.log('[Analytics] Meta Pixel initialized')
  }

  /**
   * Hotjar
   */
  private initHotjar() {
    if (this.hotjarInitialized || typeof window === 'undefined') return

    // Hotjar requires HTTPS.
    if (window.location.protocol !== 'https:') return

    const hjid = this.config.hotjarId
    if (!hjid) return

    const hjidNum = Number(hjid)
    const hjsv = this.config.hotjarSnippetVersion

    ;(function (h: any, o: any, t: any, j: any, a?: any, r?: any) {
      h.hj =
        h.hj ||
        function (...args: any[]) {
          ;(h.hj.q = h.hj.q || []).push(args)
        }
      h._hjSettings = { hjid: hjidNum, hjsv }
      a = o.getElementsByTagName('head')[0]
      r = o.createElement('script')
      r.async = 1
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv
      a.appendChild(r)
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=')

    this.hotjarInitialized = true
    console.log('[Analytics] Hotjar initialized')
  }

  /**
   * Track page view
   */
  pageView(path: string, title?: string) {
    // Google Analytics
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title,
      })
    }

    // Meta Pixel
    if (this.pixelInitialized && window.fbq) {
      window.fbq('track', 'PageView')
    }

    console.log('[Analytics] Page view:', path)
  }

  /**
   * Track event
   */
  event(eventName: string, parameters?: Record<string, any>) {
    // Google Analytics
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', eventName, parameters)
    }

    console.log('[Analytics] Event:', eventName, parameters)
  }

  /**
   * E-commerce: View product
   */
  viewProduct(product: {
    id: number | string
    name: string
    price: number
    category?: string
    brand?: string
  }) {
    // Google Analytics 4
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'ARS',
        value: product.price,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            item_brand: product.brand || 'ArtDent',
            price: product.price,
          },
        ],
      })
    }

    // Meta Pixel
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

  /**
   * E-commerce: Add to cart
   */
  addToCart(product: {
    id: number | string
    name: string
    price: number
    quantity: number
    category?: string
  }) {
    const value = product.price * product.quantity

    // Google Analytics 4
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'ARS',
        value: value,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: product.price,
            quantity: product.quantity,
          },
        ],
      })
    }

    // Meta Pixel
    if (this.pixelInitialized && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: value,
        currency: 'ARS',
      })
    }
  }

  /**
   * E-commerce: Begin checkout
   */
  beginCheckout(items: Array<any>, value: number) {
    // Google Analytics 4
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'ARS',
        value: value,
        items: items.map((item) => ({
          item_id: item.product_id,
          item_name: item.name,
          price: item.unit_price,
          quantity: item.qty,
        })),
      })
    }

    // Meta Pixel
    if (this.pixelInitialized && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: items.map((i) => i.product_id),
        value: value,
        currency: 'ARS',
        num_items: items.length,
      })
    }
  }

  /**
   * E-commerce: Purchase
   */
  purchase(order: {
    id: string
    value: number
    tax?: number
    shipping?: number
    items: Array<any>
  }) {
    // Google Analytics 4
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

    // Meta Pixel
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

  /**
   * Track search
   */
  search(query: string) {
    // Google Analytics
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', 'search', {
        search_term: query,
      })
    }

    // Meta Pixel
    if (this.pixelInitialized && window.fbq) {
      window.fbq('track', 'Search', {
        search_string: query,
      })
    }
  }

  /**
   * Track signup
   */
  signup(method: string = 'email') {
    // Google Analytics
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', 'sign_up', {
        method: method,
      })
    }

    // Meta Pixel
    if (this.pixelInitialized && window.fbq) {
      window.fbq('track', 'CompleteRegistration')
    }
  }

  /**
   * Track login
   */
  login(method: string = 'email') {
    // Google Analytics
    if (this.gaInitialized && window.gtag) {
      window.gtag('event', 'login', {
        method: method,
      })
    }
  }

  /**
   * Custom event
   */
  custom(eventName: string, data?: Record<string, any>) {
    this.event(eventName, data)
  }
}

// Export singleton instance
export const analytics = new AnalyticsService()

// Type declarations
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
