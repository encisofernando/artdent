import { useEffect, useState, useCallback } from 'react';

/**
 * Subscribe to company-scoped Reverb channels and accumulate
 * real-time notifications in a queue (toast-style).
 *
 * @param {number|null} companyId
 */
export default function useRealtimeNotifications(companyId) {
    const [notifications, setNotifications] = useState([]);

    const dismiss = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const dismissAll = useCallback(() => setNotifications([]), []);

    useEffect(() => {
        if (!companyId || !window.Echo) { return; }

        const channel = window.Echo.channel(`company.${companyId}`);

        channel.listen('.new-order', (data) => {
            setNotifications((prev) => [
                {
                    id: Date.now(),
                    type: 'new-order',
                    title: 'Nuevo pedido e-commerce',
                    body: `#${data.order_number} · $${Number(data.total).toLocaleString('es-AR')} · ${data.customer}`,
                    url: `/ecommerce-orders/${data.id}`,
                },
                ...prev,
            ].slice(0, 10));
        });

        channel.listen('.low-stock', (data) => {
            setNotifications((prev) => [
                {
                    id: Date.now(),
                    type: 'low-stock',
                    title: 'Stock bajo',
                    body: `${data.product_name} — ${data.quantity} unidades (mín ${data.min_quantity})`,
                    url: null,
                },
                ...prev,
            ].slice(0, 10));
        });

        return () => {
            window.Echo.leaveChannel(`company.${companyId}`);
        };
    }, [companyId]);

    return { notifications, dismiss, dismissAll };
}
