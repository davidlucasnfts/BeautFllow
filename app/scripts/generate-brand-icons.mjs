// Gera os PNGs da marca (favicon, apple-touch-icon, ícones PWA)
// a partir do símbolo oficial em public/logo-icon.svg.
// Uso: node scripts/generate-brand-icons.mjs
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const iconSvg = readFileSync(join(publicDir, "logo-icon.svg"));

// fundo da marca para ícones de app (quadrado escuro quente)
const BRAND_BG = "#141210";

/** ícone dos fios sobre fundo opcional, com escala relativa ao canvas */
const iconBuffer = (size, { background = null, scale = 0.62 } = {}) => {
  const h = Math.round(size * scale);
  const w = Math.round(h * 0.75); // proporção 48:64 do viewBox
  const x = Math.round((size - w) / 2);
  const y = Math.round((size - h) / 2);
  const inner = iconSvg
    .toString()
    .replace('width="48" height="64"', `width="${w}" height="${h}"`);
  const bgRect = background
    ? `<rect width="${size}" height="${size}" fill="${background}"/>`
    : "";
  return sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${bgRect}<g transform="translate(${x} ${y})">${inner}</g></svg>`
    )
  ).png();
};

const jobs = [
  ["favicon-32.png", await iconBuffer(32, { scale: 0.92 })],
  [
    "apple-touch-icon.png",
    await iconBuffer(180, { background: BRAND_BG, scale: 0.68 }),
  ],
  ["icon-192.png", await iconBuffer(192, { background: BRAND_BG, scale: 0.68 })],
  ["icon-512.png", await iconBuffer(512, { background: BRAND_BG, scale: 0.68 })],
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
