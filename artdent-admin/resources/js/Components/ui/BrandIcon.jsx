/**
 * Ícono de marca ArtCode (cápsula + corchetes de código), tal cual el
 * manual de identidad — nunca recrear a mano, esto es una copia fiel del
 * SVG provisto en docs/img/artcode-icon-color.svg.
 */
export default function BrandIcon({ size = 28, className = '' }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 240 340"
            width={size}
            height={(size * 340) / 240}
            className={className}
        >
            <rect x="24" y="22" width="192" height="296" rx="96" ry="96" fill="none" stroke="currentColor" strokeWidth="24" />
            <polyline points="104,134 81,171 104,208" fill="none" stroke="#17B3A3" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="136,134 159,171 136,208" fill="none" stroke="#17B3A3" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="131" y1="126" x2="109" y2="216" stroke="currentColor" strokeWidth="22" strokeLinecap="round" />
        </svg>
    );
}
