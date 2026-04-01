import { router } from '@inertiajs/react';

const DESTINATIONS = {
    jobs: { routeName: 'jobs.index', label: 'Laboratorio > Órdenes > Consultar' },
    sales: { routeName: 'sales.index', label: 'Gestión > Ventas > Lista de Ventas' },
    stock: { routeName: 'products.index', label: 'Gestión > Ventas > Artículos' },
    debt: { routeName: 'lab-account-moves.index', label: 'Laboratorio > Clientes / Odont. > Cuentas Corrientes y Pagos' },
    customers: { routeName: 'customers.index', label: 'Gestión > Clientes > Lista de Clientes' },
    accounting: { routeName: 'accounting.index', label: 'Contable > Panel contable' },
};

export const artieCrmAdapter = {
    destinations: DESTINATIONS,

    getDestination(action) {
        if (!action) return null;

        if (typeof action === 'object' && typeof action.id === 'string') {
            return DESTINATIONS[action.id] || null;
        }

        const normalized = String(action).trim().toLowerCase();

        if (normalized.includes('trabajo')) return DESTINATIONS.jobs;
        if (normalized.includes('venta')) return DESTINATIONS.sales;
        if (normalized.includes('stock') || normalized.includes('insumo')) return DESTINATIONS.stock;
        if (normalized.includes('deuda') || normalized.includes('cuenta')) return DESTINATIONS.debt;
        if (normalized.includes('cliente')) return DESTINATIONS.customers;
        if (normalized.includes('contable') || normalized.includes('iva')) return DESTINATIONS.accounting;

        return null;
    },

    navigate(action) {
        const destination = this.getDestination(action);

        if (!destination) {
            return false;
        }

        router.visit(route(destination.routeName));

        return true;
    },
};
