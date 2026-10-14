// Gera os PNGs da marca (favicon, apple-touch-icon, ícones PWA)
// a partir da imagem original da marca em public/brand/ (gerada por
// scripts/process-brand-logo.mjs a partir de docs/brand/logo-original.png).
// Uso: node scripts/generate-brand-icons.mjs
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const brandDir = join(publicDir, "brand");

// ícones sobre fundo escuro quente (fios já escuros da versão dark)
const iconDark = readFileSync(join(brandDir, "logo-icon-dark.png"));
// favicon transparente usa os fios dourados originais
const iconLight = readFileSync(join(brandDir, "logo-icon.png"));

// fundo da marca para ícones de app (quadrado escuro quente)
const BRAND_BG = "#141210";

/** ícone centralizado num canvas quadrado, com escala relativa ao canvas */
const iconBuffer = async (size, { background = null, scale = 0.62 } = {}) => {
  const source = background ? iconDark : iconLight;
  const meta = await sharp(source).metadata();
  const h = Math.round(size * scale);
  const w = Math.round(h * (meta.width / meta.height));
  const x = Math.round((size - w) / 2);
  const y = Math.round((size - h) / 2);
  const resized = await sharp(source)
    .resize(w, h, { fit: "fill" })
    .png()
    .toBuffer();
  const base = background
    ? sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background,
        },
      })
    : sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      });
  return base.composite([{ input: resized, left: x, top: y }]).png();
};

const jobs = [
  ["favicon-32.png", await iconBuffer(32, { scale: 0.92 })],
  [
    "apple-touch-icon.png",
    await iconBuffer(180, { background: BRAND_BG, scale: 0.68 }),
  ],
  [
    "icon-192.png",
    await iconBuffer(192, { background: BRAND_BG, scale: 0.68 }),
  ],
  [
    "icon-512.png",
    await iconBuffer(512, { background: BRAND_BG, scale: 0.68 }),
  ],
  // maskable: margem de segurança maior (zona de corte do Android)
  [
    "icon-512-maskable.png",
    await iconBuffer(512, { background: BRAND_BG, scale: 0.5 }),
  ],
];

for (const [name, pipeline] of jobs) {
  await pipeline.toFile(join(publicDir, name));
  console.log("gerado:", name);
}
