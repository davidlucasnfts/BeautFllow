// Processa a logo ORIGINAL (docs/brand/logo-original.png, export da IA)
// em assets prontos pro app: lockup e símbolo com fundo transparente,
// mais versão do símbolo sobre fundo escuro (para ícones de app).
// Uso: node scripts/process-brand-logo.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const src = join(root, "docs", "brand", "logo-original.png");
const brandDir = join(root, "app", "public", "brand");
mkdirSync(brandDir, { recursive: true });

// origem 1248x832 — região do logo medida na imagem original
const LOCKUP_CROP = { left: 385, top: 330, width: 490, height: 150 };
const ICON_CROP = { left: 390, top: 335, width: 90, height: 140 };
const BRAND_BG = { r: 20, g: 18, b: 16 }; // #141210

/** converte fundo branco em transparência (com leve pena de 1px) */
async function whiteToTransparent(input) {
  const { data, info } = await input
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.max(data[i], data[i + 1], data[i + 2]);
    if (lum > 248) data[i + 3] = 0;
    else if (lum > 232) data[i + 3] = Math.round(((248 - lum) / 16) * 255);
  }
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
}

/** pinta os brancos (área ao redor dos fios) com a cor de fundo escuro */
async function whiteToDark(input) {
  const { data, info } = await input
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.max(data[i], data[i + 1], data[i + 2]);
    if (lum > 228) {
      data[i] = BRAND_BG.r;
      data[i + 1] = BRAND_BG.g;
      data[i + 2] = BRAND_BG.b;
      data[i + 3] = 255;
    }
  }
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
}

// 1) lockup completo (fios + wordmark), transparente
// (sharp aplica trim antes de extract internamente — por isso o crop vai
// num sharp separado e o trim em seguida, em cima da área já recortada)
const lockupCropped = await sharp(src).extract(LOCKUP_CROP).png().toBuffer();
const lockup = await whiteToTransparent(
  sharp(lockupCropped).trim({ threshold: 8 })
);
await lockup.clone().png().toFile(join(brandDir, "logo.png"));
console.log("lockup:", await lockup.metadata().then(m => `${m.width}x${m.height}`));

// 2) símbolo só (fios), transparente — favicon e uso em fundos claros
const iconCropped = await sharp(src).extract(ICON_CROP).png().toBuffer();
const icon = await whiteToTransparent(
  sharp(iconCropped).trim({ threshold: 8 })
);
await icon.clone().png().toFile(join(brandDir, "logo-icon.png"));
console.log("ícone:", await icon.metadata().then(m => `${m.width}x${m.height}`));

// 3) símbolo sobre fundo escuro — base dos ícones de app (PWA/apple)
const iconDark = await whiteToDark(sharp(iconCropped).trim({ threshold: 8 }));
await iconDark.clone().png().toFile(join(brandDir, "logo-icon-dark.png"));
console.log("ícone escuro ok");
