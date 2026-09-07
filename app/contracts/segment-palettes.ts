import type { SalonSegment } from "./segment-labels";

export type SegmentPalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  /** Valores HSL (sem hsl()) para as variáveis CSS do Tailwind */
  primaryHsl: string;
  secondaryHsl: string;
  accentHsl: string;
};

export type SegmentTheme = {
  id: string;
  segment: SalonSegment;
  name: string;
  palette: SegmentPalette;
};

function hexToHsl(hex: string): string {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.substring(0, 2), 16) / 255;
  const g = parseInt(normalized.substring(2, 4), 16) / 255;
  const b = parseInt(normalized.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d > 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function buildPalette(
  primary: string,
  secondary: string,
  accent: string,
  background: string,
  text: string
): SegmentPalette {
  return {
    primary,
    secondary,
    accent,
    background,
    text,
    primaryHsl: hexToHsl(primary),
    secondaryHsl: hexToHsl(secondary),
    accentHsl: hexToHsl(accent),
  };
}

/** Catálogo de temas: 3 opções por segmento (o primeiro é o padrão) */
export const themes: Record<string, SegmentTheme> = {
  "rosa-classico": {
    id: "rosa-classico",
    segment: "beauty_salon",
    name: "Doce",
    palette: buildPalette(
      "#E8A0BF",
      "#D4AF37",
      "#F472B6",
      "#FAFAFA",
      "#1E293B"
    ),
  },
  "rosa-choque": {
    id: "rosa-choque",
    segment: "beauty_salon",
    name: "Vibrante",
    palette: buildPalette(
      "#EC4899",
      "#D4AF37",
      "#BE185D",
      "#FAFAFA",
      "#1E293B"
    ),
  },
  "rose-gold": {
    id: "rose-gold",
    segment: "beauty_salon",
    name: "Elegante",
    palette: buildPalette(
      "#B76E79",
      "#D4AF37",
      "#E8B4B8",
      "#FAFAFA",
      "#1E293B"
    ),
  },
  "preto-dourado": {
    id: "preto-dourado",
    segment: "barbershop",
    name: "Clássico",
    palette: buildPalette(
      "#1F1F1F",
      "#C9A227",
      "#A16207",
      "#F5F5F4",
      "#1C1917"
    ),
  },
  "grafite-prata": {
    id: "grafite-prata",
    segment: "barbershop",
    name: "Moderno",
    palette: buildPalette(
      "#374151",
      "#9CA3AF",
      "#111827",
      "#F5F5F4",
      "#1C1917"
    ),
  },
  "preto-fosco-dourado": {
    id: "preto-fosco-dourado",
    segment: "barbershop",
    name: "Premium",
    palette: buildPalette(
      "#0A0A0A",
      "#D4AF37",
      "#B8860B",
      "#F5F5F4",
      "#1C1917"
    ),
  },
  "lilas-suave": {
    id: "lilas-suave",
    segment: "aesthetic_clinic",
    name: "Sereno",
    palette: buildPalette(
      "#A78BFA",
      "#D4AF37",
      "#C4B5FD",
      "#F8FAFC",
      "#0F172A"
    ),
  },
  "lavanda-profunda": {
    id: "lavanda-profunda",
    segment: "aesthetic_clinic",
    name: "Sofisticado",
    palette: buildPalette(
      "#7C3AED",
      "#D4AF37",
      "#A78BFA",
      "#F8FAFC",
      "#0F172A"
    ),
  },
  "lilas-luxo": {
    id: "lilas-luxo",
    segment: "aesthetic_clinic",
    name: "Luxo",
    palette: buildPalette(
      "#8B5CF6",
      "#D4AF37",
      "#6D28D9",
      "#F8FAFC",
      "#0F172A"
    ),
  },
};

export function getTheme(id: string): SegmentTheme | undefined {
  return themes[id];
}

export function themesForSegment(segment: SalonSegment): SegmentTheme[] {
  return Object.values(themes).filter(t => t.segment === segment);
}

/** Tema padrão do segmento (primeira opção do catálogo) */
export function defaultThemeForSegment(segment: SalonSegment): SegmentTheme {
  return themesForSegment(segment)[0];
}

/** Variáveis CSS (--primary etc.) de um tema, com fallback para o padrão */
export function getThemeCssVars(themeId: string): Record<string, string> {
  const theme = themes[themeId] ?? defaultThemeForSegment("beauty_salon");
  const { segment, palette } = theme;
  return {
    "--primary": palette.primaryHsl,
    "--primary-foreground":
      segment === "beauty_salon" ? "340 30% 15%" : "0 0% 100%",
    "--secondary": palette.secondaryHsl,
    "--secondary-foreground":
      segment === "barbershop" ? "46 30% 15%" : "0 0% 100%",
    "--accent": palette.accentHsl,
    "--accent-foreground":
      segment === "beauty_salon" ? "340 30% 15%" : "0 0% 100%",
    "--ring": palette.primaryHsl,
  };
}

// ---------------------------------------------------------------------------
// Aliases legados: mantidos para não quebrar call sites existentes.
// Usam sempre o tema padrão do segmento.
// ---------------------------------------------------------------------------

export const segmentPalettes: Record<SalonSegment, SegmentPalette> = {
  beauty_salon: defaultThemeForSegment("beauty_salon").palette,
  barbershop: defaultThemeForSegment("barbershop").palette,
  aesthetic_clinic: defaultThemeForSegment("aesthetic_clinic").palette,
};

export function getSegmentPalette(segment: SalonSegment): SegmentPalette {
  return defaultThemeForSegment(segment).palette;
}

export function getSegmentCssVars(
  segment: SalonSegment
): Record<string, string> {
  return getThemeCssVars(defaultThemeForSegment(segment).id);
}
