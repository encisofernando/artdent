const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const COLORS = {
  blue: 0x397b9cff,
  teal: 0x49949cff,
  green: 0x5aad9cff,
  light: 0xdae6f0ff,
  text: 0x1a202cff,
  white: 0xffffffff,
};

const outputDir = path.resolve(__dirname, '..', 'build', 'installer');
const repoRoot = path.resolve(__dirname, '..', '..');
const colorLogoPath = path.join(repoRoot, 'artdent-crm', 'public', 'brand', 'logo-artdent-color.png');
const whiteLogoPath = path.join(repoRoot, 'artdent-crm', 'public', 'brand', 'logo-artdent-blanco.png');

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function channel(color, shift) {
  return (color >> shift) & 0xff;
}

function mix(a, b, t) {
  return Jimp.rgbaToInt(
    lerp(channel(a, 24), channel(b, 24), t),
    lerp(channel(a, 16), channel(b, 16), t),
    lerp(channel(a, 8), channel(b, 8), t),
    255,
  );
}

function paintGradient(image, x, y, width, height, from, to) {
  image.scan(x, y, width, height, function scan(px, py, idx) {
    const t = width <= 1 ? 0 : (px - x) / (width - 1);
    const color = mix(from, to, t);
    this.bitmap.data[idx] = channel(color, 24);
    this.bitmap.data[idx + 1] = channel(color, 16);
    this.bitmap.data[idx + 2] = channel(color, 8);
    this.bitmap.data[idx + 3] = 255;
  });
}

async function containLogo(sourcePath, width, height) {
  const logo = await Jimp.read(sourcePath);
  return logo.contain(width, height, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
}

async function buildDialog() {
  const dialog = new Jimp(493, 312, COLORS.white);
  const logo = await containLogo(whiteLogoPath, 128, 72);
  const fontTitle = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
  const fontSmall = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
  const fontTiny = await Jimp.loadFont(Jimp.FONT_SANS_8_WHITE);

  paintGradient(dialog, 0, 0, 168, 312, COLORS.blue, COLORS.teal);
  dialog.scan(0, 244, 168, 68, function scan(px, py, idx) {
    const t = (py - 244) / 68;
    const color = mix(COLORS.teal, COLORS.green, t);
    this.bitmap.data[idx] = channel(color, 24);
    this.bitmap.data[idx + 1] = channel(color, 16);
    this.bitmap.data[idx + 2] = channel(color, 8);
    this.bitmap.data[idx + 3] = 255;
  });

  dialog.composite(logo, 20, 38);
  dialog.print(fontTitle, 22, 130, 'Print Service', 124);
  dialog.print(fontSmall, 22, 158, 'Gestor de', 124);
  dialog.print(fontSmall, 22, 180, 'impresión', 124);
  dialog.print(fontTiny, 22, 218, 'ArtDent CRM', 124);

  dialog.scan(168, 0, 325, 312, function scan(px, py, idx) {
    const t = py / 311;
    const color = mix(0xffffffff, COLORS.light, t * 0.22);
    this.bitmap.data[idx] = channel(color, 24);
    this.bitmap.data[idx + 1] = channel(color, 16);
    this.bitmap.data[idx + 2] = channel(color, 8);
    this.bitmap.data[idx + 3] = 255;
  });

  dialog.print(await Jimp.loadFont(Jimp.FONT_SANS_12_BLACK), 354, 274, 'artdent.com.ar', 120);

  return dialog;
}

async function buildBanner() {
  const banner = new Jimp(493, 58, COLORS.white);
  const logo = await containLogo(colorLogoPath, 118, 42);

  paintGradient(banner, 0, 53, 493, 5, COLORS.blue, COLORS.green);
  banner.composite(logo, 360, 8);

  return banner;
}

(async () => {
  fs.mkdirSync(outputDir, { recursive: true });

  const dialog = await buildDialog();
  const banner = await buildBanner();

  await dialog.writeAsync(path.join(outputDir, 'dialog.bmp'));
  await banner.writeAsync(path.join(outputDir, 'banner.bmp'));

  console.log(`Generated ${path.join(outputDir, 'dialog.bmp')}`);
  console.log(`Generated ${path.join(outputDir, 'banner.bmp')}`);
})();
