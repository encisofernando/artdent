import React from 'react';
import { ArtieTokens as B } from '../../config/artieConfig';

export default function ArtieQuickActions({ onActionClick, disabled }) {
    const actions = [
        { id: 'jobs', label: 'Trabajos de hoy' },
        { id: 'sales', label: 'Ventas del día' },
        { id: 'stock', label: 'Stock bajo' },
        { id: 'debt', label: 'Clientes con deuda' }
    ];

    return (
        <div className="w-full px-4 py-2 bg-slate-50/80 border-t border-slate-100/50 flex flex-wrap gap-2 justify-start items-center">
            {actions.map((action) => (
                <button
                    key={action.id}
                    onClick={() => onActionClick(action.label)}
                    disabled={disabled}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-full transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                        background: 'white',
                        color: B.blueDark,
                        border: `1px solid ${B.light}`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        opacity: disabled ? 0.6 : 1,
                        cursor: disabled ? 'default' : 'pointer'
                    }}
                    onMouseEnter={(e) => { 
                        if(!disabled) {
                            e.currentTarget.style.borderColor = B.teal;
                            e.currentTarget.style.color = B.teal;
                        }
                    }}
                    onMouseLeave={(e) => { 
                        if(!disabled) {
                            e.currentTarget.style.borderColor = B.light;
                            e.currentTarget.style.color = B.blueDark;
                        }
                    }}
                >
                    {action.label}
                </button>
            ))}
        </div>
    );
}
