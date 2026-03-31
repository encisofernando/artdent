import React from 'react';
import AdjustmentIndex from '@/Pages/CollaboratorCompensation/AdjustmentIndex';

export default function Index(props) {
    return (
        <AdjustmentIndex
            {...props}
            config={{
                routeBase: 'collaborator-extras',
                pageTitle: 'Extras',
                title: 'Extras',
                subtitle: 'Adicionales y conceptos extra para colaboradores',
                createLabel: 'Nuevo Extra',
                emptyTitle: 'Sin extras',
                emptyText: 'No hay extras registrados con los filtros aplicados.',
                amountLabel: 'Total adicional',
                isDiscount: false,
            }}
        />
    );
}
