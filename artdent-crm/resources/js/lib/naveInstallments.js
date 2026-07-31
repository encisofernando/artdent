/**
 * Cálculo de cuotas Nave — PTF = monto × (1 + tasa/100), cuota = PTF / n.
 * Verificado contra los montos reales publicados por Nave (ej. 3 cuotas al
 * 7.64% sobre $109.000 da PTF $117.327,60 y cuota $39.109,20).
 */
export function computeInstallment(amount, ratePct, installments) {
    const ptf = Number(amount) * (1 + Number(ratePct) / 100);
    const cuota = ptf / Number(installments);
    return { ptf, cuota };
}

export const BANK_LABELS = {
    galicia: 'Galicia',
    naranja: 'Naranja',
    otros_bancos: 'Otros Bancos',
};

export const CARD_BRAND_LABELS = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    naranja: 'Naranja',
};

export const CARD_TYPE_LABELS = {
    credit: 'Crédito',
    debit: 'Débito',
};

export function cardLabel(rate) {
    return `Tarjeta ${CARD_BRAND_LABELS[rate.card_brand] ?? rate.card_brand} ${CARD_TYPE_LABELS[rate.card_type] ?? rate.card_type}`;
}

/**
 * Agrupa una lista plana de tasas en { banco: { tarjeta: [tasas...] } },
 * mismo shape que consumen tanto la página del CRM como el modal de
 * e-commerce.
 */
export function groupRates(rates) {
    const groups = {};
    for (const rate of rates) {
        const bankKey = rate.bank;
        const cardKey = `${rate.card_brand}__${rate.card_type}`;
        groups[bankKey] ??= {};
        groups[bankKey][cardKey] ??= [];
        groups[bankKey][cardKey].push(rate);
    }
    return groups;
}
