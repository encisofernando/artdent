import { useCallback, useEffect, useState } from 'react'
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

function buildNotifications(orders: Array<{ code: string; status: string; payment_status: string; created_at: string }>): AppNotification[] {
  const readIds = getReadIds()
  const notifs: AppNotification[] = []

  for (const order of orders) {
    // Notification for relevant order statuses
    const relevantStatuses = ['confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled']
    if (relevantStatuses.includes(order.status)) {
      const id = `order_${order.code}_${order.status}`
      notifs.push({
        id,
        type: 'order_status',
        title: `Pedido ${order.code}`,
        body: `Tu pedido está ${ORDER_STATUS_LABELS[order.status] ?? order.status}`,
        orderCode: order.code,
        createdAt: order.created_at,
        read: readIds.has(id),
      })
    }

    // Notification for payment confirmed
    if (order.payment_status === 'paid') {
      const id = `payment_${order.code}_paid`
      notifs.push({
        id,
        type: 'order_payment',
        title: 'Pago acreditado',
        body: `El pago del pedido ${order.code} fue confirmado`,
        orderCode: order.code,
        createdAt: order.created_at,
        read: readIds.has(id),
      })
    }
  }

  // Sort: unread first, then by date desc
  return notifs.sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function useNotifications(isAuthenticated: boolean) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(false)

  const unread = notifications.filter((n) => !n.read).length

  const fetch = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([])
      return
    }
    try {
      setLoading(true)
      const { data } = await http.get('/customer/orders')
      setNotifications(buildNotifications(data))
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetch()
  }, [fetch])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const readIds = getReadIds()
      prev.forEach((n) => readIds.add(n.id))
      saveReadIds(readIds)
      return prev.map((n) => ({ ...n, read: true }))
    })
  }, [])

  return { notifications, unread, loading, markAllRead, refetch: fetch }
}
