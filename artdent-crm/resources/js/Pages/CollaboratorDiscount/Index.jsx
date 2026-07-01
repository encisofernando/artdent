import React from 'react';
import AdjustmentIndex from '@/Pages/CollaboratorCompensation/AdjustmentIndex';
import { BadgeMinus } from 'lucide-react';

export default function Index(props) {
    return (
        <AdjustmentIndex
            {...props}
            config={{
                routeBase: 'collaborator-discounts',
                pageTitle: 'Descuentos',
                title: 'Descuentos',
                subtitle: 'Retenciones y descuentos aplicados a colaboradores',
                createLabel: 'Nuevo Descuento',
                emptyTitle: 'Sin descuentos',
                emptyText: 'No hay descuentos registrados con los filtros aplicados.',
                amountLabel: 'Total descontado',
                isDiscount: true,
                icon: BadgeMinus,
            }}
        />
    );
}
