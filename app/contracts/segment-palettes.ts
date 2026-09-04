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

export const segmentPalettes: Record<SalonSegment, SegmentPalette> = {
  beauty_salon: {
    primary: "#E8A0BF",
    secondary: "#D4AF37",
    accent: "#F472B6",
    background: "#FAFAFA",
    text: "#1E293B",
    primaryHsl: hexToHsl("#E8A0BF"),
    secondaryHsl: hexToHsl("#D4AF37"),
    accentHsl: hexToHsl("#F472B6"),
  },
  barbershop: {
    primary: "#1F1F1F",
    secondary: "#C9A227",
    accent: "#A16207",
    background: "#F5F5F4",
    text: "#1C1917",
    primaryHsl: hexToHsl("#1F1F1F"),
    secondaryHsl: hexToHsl("#C9A227"),
    accentHsl: hexToHsl("#A16207"),
  },
  aesthetic_clinic: {
    primary: "#10B981",
    secondary: "#34D399",
    accent: "#059669",
    background: "#F8FAFC",
    text: "#0F172A",
    primaryHsl: hexToHsl("#10B981"),
    secondaryHsl: hexToHsl("#34D399"),
    accentHsl: hexToHsl("#059669"),
  },
};

export function getSegmentPalette(segment: SalonSegment): SegmentPalette {
  return segmentPalettes[segment];
}

export function getSegmentCssVars(
  segment: SalonSegment
): Record<string, string> {
  const palette = getSegmentPalette(segment);
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
