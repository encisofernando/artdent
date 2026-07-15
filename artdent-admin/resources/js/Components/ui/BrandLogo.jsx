/**
 * Isotipo "ArtCode" (imagen provista en el manual de identidad — la
 * tipografía del logo, Ryker Black, es exclusiva y no está disponible como
 * webfont, así que se usa el archivo oficial en vez de recrearlo en texto).
 */
export default function BrandLogo({ variant = 'color', className = '', height = 28 }) {
    const src = variant === 'white' ? '/branding/artcode-horizontal-white.png' : '/branding/artcode-horizontal-color.png';

    return (
        <img
            src={src}
            alt="ArtCode"
            className={className}
            style={{ height, width: 'auto' }}
        />
    );
}
