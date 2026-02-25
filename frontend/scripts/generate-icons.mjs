// scripts/generate-icons.mjs
// Genera todos los íconos PWA necesarios a partir del logo original.
//
// Uso:
//   npm install -D sharp          ← solo una vez
//   node scripts/generate-icons.mjs
//
// Entrada: public/logo_ART_DENT__blanco_trans_.png (el logo que ya tenés)
// Salida:  public/icons/*.png

import sharp from "sharp";
import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");

const INPUT  = join(ROOT, "public", "logo_ART_DENT__blanco_trans_.png");
const OUTDIR = join(ROOT, "public", "icons");

if (!existsSync(OUTDIR)) mkdirSync(OUTDIR, { recursive: true });

// Color de fondo para los íconos con relleno (azul ArtDent)
const BG_COLOR = { r: 57, g: 123, b: 156, alpha: 1 }; // #397B9C

const ICONS = [
  // ── Ícono estándar (transparent bg) ──────────────────────────────────────
  { file: "icon-192.png",           size: 192, bg: null     },
  { file: "icon-512.png",           size: 512, bg: null     },

  // ── Maskable (fondo sólido, logo centrado al 80%) ─────────────────────────
  // El área "safe zone" de los íconos maskable es el círculo interior al 80%.
  { file: "icon-512-maskable.png",  size: 512, bg: BG_COLOR, paddingPct: 0.18 },

  // ── Apple Touch Icon (fondo blanco, logo al 80%) ──────────────────────────
  { file: "apple-touch-icon.png",   size: 180, bg: { r: 255, g: 255, b: 255, alpha: 1 }, paddingPct: 0.15 },

  // ── Shortcuts ────────────────────────────────────────────────────────────
  { file: "shortcut-pos.png",       size: 96,  bg: BG_COLOR, paddingPct: 0.2 },
  { file: "shortcut-products.png",  size: 96,  bg: BG_COLOR, paddingPct: 0.2 },

  // ── Favicon (navegadores modernos) ────────────────────────────────────────
  { file: "favicon-32.png",         size: 32,  bg: null     },
];

for (const icon of ICONS) {
  const outPath = join(OUTDIR, icon.file);
  const { size, bg, paddingPct = 0 } = icon;

  let pipeline = sharp(INPUT);

  if (bg) {
    const pad = Math.round(size * paddingPct);
    const innerSize = size - pad * 2;

    // Redimensionar el logo al tamaño interior
    const logoBuffer = await sharp(INPUT)
      .resize(innerSize, innerSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    // Crear canvas con fondo y superponer el logo centrado
    pipeline = sharp({
      create: {
        width:    size,
        height:   size,
        channels: 4,
        background: bg,
      },
    }).composite([{ input: logoBuffer, gravity: "center" }]);
  } else {
    pipeline = pipeline.resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }

  await pipeline.png().toFile(outPath);
  console.log(`✅  ${icon.file} (${size}×${size})`);
}

console.log("\n🎉  Íconos generados en public/icons/");
console.log("     Acordate de copiar uno de ellos como public/favicon.ico");
