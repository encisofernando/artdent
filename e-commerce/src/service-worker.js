// Service Worker for ARTDENT PWA
const CACHE_VERSION = 'v1.0.0'
const CACHE_NAME = `artdent-ecommerce-${CACHE_VERSION}`
const OFFLINE_URL = '/offline.html'

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// Cache strategies
const CACHE_STRATEGIES = {
  images: 'cache-first',
  api: 'network-first',
  static: 'cache-first',
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    }).then(() => {
      return self.skipWaiting()
    })
  )
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle API requests - Network First
  if (url.origin === 'https://api.artdent.com.ar') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached version if offline
          return caches.match(request).then((cached) => {
            return cached || new Response(
              JSON.stringify({ error: 'Offline', message: 'No hay conexión a internet' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            )
          })
        })
    )
    return
  }

  // Handle images - Cache First
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
      })
    )
    return
  }

  // Handle navigation - Network First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(OFFLINE_URL)
        })
    )
    return
  }

  // Default strategy - Cache First
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
    })
  )
})

// Background sync for offline orders
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOfflineOrders())
  }
})

async function syncOfflineOrders() {
  // Get pending orders from IndexedDB
  const db = await openDB()
  const orders = await db.getAll('pending-orders')
  
  for (const order of orders) {
    try {
      const response = await fetch('https://api.artdent.com.ar/api/catalog/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })
      
      if (response.ok) {
        await db.delete('pending-orders', order.id)
        console.log('[SW] Order synced successfully:', order.id)
      }
    } catch (error) {
      console.error('[SW] Failed to sync order:', error)
    }
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')
  
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'ARTDENT'
  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [],
    tag: data.tag || 'general',
    requireInteraction: data.requireInteraction || false,
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag)
  
  event.notification.close()

  const urlToOpen = event.notification.data.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Helper: Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('artdent-db', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('pending-orders')) {
        db.createObjectStore('pending-orders', { keyPath: 'id' })
      }
    }
  })
}
