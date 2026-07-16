import React from 'react';

const FALLBACK_LOGOS = {
    general: {
        color: '/assets/artcode-horizontal-color.png',
        thermal: '/assets/artcode-horizontal-color.png',
        icon: '/assets/artcode-icon-color.svg',
        white: '/assets/artcode-horizontal-white.png',
    },
    lab: {
        color: '/assets/artcode-horizontal-color.png',
        thermal: '/assets/artcode-horizontal-color.png',
        icon: '/assets/artcode-icon-color.svg',
        white: '/assets/artcode-horizontal-white.png',
    },
};

export function normalizeBrandScope(scope = 'general') {
    return scope === 'lab' ? 'lab' : 'general';
}

export function getCompanyLogoUrl(company, scope = 'general') {
    const normalizedScope = normalizeBrandScope(scope);

    if (!company) {
        return null;
    }

    if (normalizedScope === 'lab') {
        return company.lab_logo_url || company.logo_url || null;
    }

    return company.logo_url || null;
}

export function getCompanyLogoSrc(
    company,
    { scope = 'general', variant = 'color', thermal = false } = {},
) {
    const normalizedScope = normalizeBrandScope(scope);
    const storedLogo = getCompanyLogoUrl(company, normalizedScope);

    if (storedLogo) {
        return storedLogo;
    }

    if (thermal) {
        return FALLBACK_LOGOS[normalizedScope].thermal;
    }

    if (variant === 'icon') {
        return FALLBACK_LOGOS[normalizedScope].icon;
    }

    if (variant === 'white' || variant === 'blanco') {
        return FALLBACK_LOGOS[normalizedScope].white;
    }

    return FALLBACK_LOGOS[normalizedScope].color;
}

export function getCompanyDisplayName(company, { preferFantasy = true } = {}) {
    if (!company) {
        return 'ArtCode';
    }

    const primary = preferFantasy
        ? (company.fantasy_name || company.name)
        : (company.name || company.fantasy_name);

    return primary || 'ArtCode';
}

export function CompanyLogo({
    company,
    scope = 'general',
    variant = 'color',
    thermal = false,
    height = 50,
    maxWidth = 180,
    alt,
    style = {},
    className,
}) {
    const src = getCompanyLogoSrc(company, { scope, variant, thermal });

    if (!src) {
        return null;
    }

    return (
        <img
            src={src}
            alt={alt || getCompanyDisplayName(company)}
            className={className}
            style={{
                height,
                maxWidth,
                objectFit: 'contain',
                display: 'block',
                ...(thermal
                    ? { filter: 'grayscale(1) contrast(1.35) brightness(0.55)' }
                    : {}),
                ...style,
            }}
        />
    );
}
