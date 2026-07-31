import { useCallback, useEffect, useRef, useState } from 'react'
import { http } from '../api/http'

export type AppNotification = {
  id: string
  type: 'order_status' | 'order_payment' | 'stock' | 'offer'
  title: string
  body: string
  orderCode?: string
  createdAt: string
  read: boolean
}

const STORAGE_KEY = 'artdent_notif_read'

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'pendiente',
  confirmed: 'confirmado',
  processing: 'en preparación',
  ready: 'listo para envío',
  shipped: 'enviado',
  delivered: 'entregado',
  cancelled: 'cancelado',
  refunded: 'reembolsado',
}

function getReadIds(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

function buildUnreadNotifications(
  orders: Array<{ code: string; status: string; payment_status: string; created_at: string }>,
): AppNotification[] {
  const readIds = getReadIds()
  const notifs: AppNotification[] = []

  for (const order of orders) {
    const relevantStatuses = ['confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled']
    if (relevantStatuses.includes(order.status)) {
      const id = `order_${order.code}_${order.status}`
      if (!readIds.has(id)) {
        notifs.push({
          id,
          type: 'order_status',
          title: `Pedido ${order.code}`,
          body: `Tu pedido está ${ORDER_STATUS_LABELS[order.status] ?? order.status}`,
          orderCode: order.code,
          createdAt: order.created_at,
          read: false,
        })
      }
    }

    if (order.payment_status === 'paid') {
      const id = `payment_${order.code}_paid`
      if (!readIds.has(id)) {
        notifs.push({
          id,
          type: 'order_payment',
          title: 'Pago acreditado',
          body: `El pago del pedido ${order.code} fue confirmado`,
          orderCode: order.code,
          createdAt: order.created_at,
          read: false,
        })
      }
    }

    if (order.payment_status === 'refunded') {
      const id = `refund_${order.code}_refunded`
      if (!readIds.has(id)) {
        notifs.push({
          id,
          type: 'order_payment',
          title: 'Reembolso procesado',
          body: `El reembolso del pedido ${order.code} fue acreditado`,
          orderCode: order.code,
          createdAt: order.created_at,
          read: false,
        })
      }
    }
  }

  return notifs.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function useNotifications(isAuthenticated: boolean) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [toastNotif, setToastNotif] = useState<AppNotification | null>(null)
  const [loading, setLoading] = useState(false)
  const seenIds = useRef<Set<string> | null>(null) // null = first fetch pending
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const unread = notifications.length

  const showToast = useCallback((notif: AppNotification) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastNotif(notif)
    toastTimer.current = setTimeout(() => setToastNotif(null), 5000)
  }, [])

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastNotif(null)
  }, [])

  const fetch = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([])
      return
    }
    try {
      setLoading(true)
      const { data } = await http.get('/customer/orders')
      const unread = buildUnreadNotifications(data)

      // First fetch: seed seen IDs without toasting
      if (seenIds.current === null) {
        seenIds.current = new Set(unread.map((n) => n.id))
        setNotifications(unread)
        return
      }

      // Subsequent fetches: detect new notifications
      const newOnes = unread.filter((n) => !seenIds.current!.has(n.id))
      unread.forEach((n) => seenIds.current!.add(n.id))

      setNotifications(unread)

      if (newOnes.length > 0) {
        showToast(newOnes[0])
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, showToast])

  // Initial fetch + polling — esto corre a nivel layout en TODAS las páginas
  // mientras el usuario está logueado, no solo en pedidos: es un badge de
  // notificaciones, no tracking en tiempo real, así que 60s alcanza.
  useEffect(() => {
    fetch()
    if (!isAuthenticated) return
    const id = setInterval(fetch, 60_000)
    return () => clearInterval(id)
  }, [fetch, isAuthenticated])

  // Refetch when window regains focus
  useEffect(() => {
    const handler = () => { if (isAuthenticated) fetch() }
    window.addEventListener('focus', handler)
    return () => window.removeEventListener('focus', handler)
  }, [isAuthenticated, fetch])

  const markOneRead = useCallback((id: string) => {
    const readIds = getReadIds()
    readIds.add(id)
    saveReadIds(readIds)
    if (seenIds.current) seenIds.current.delete(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const readIds = getReadIds()
      prev.forEach((n) => readIds.add(n.id))
      saveReadIds(readIds)
      return []
    })
    seenIds.current = new Set()
  }, [])

  return { notifications, unread, loading, markOneRead, markAllRead, toastNotif, dismissToast, refetch: fetch }
}
