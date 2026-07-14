export const HERO_IMAGE_POSITIONS = [
  "center",
  "left",
  "right",
  "top",
  "bottom",
] as const;

export type HeroImagePosition = (typeof HERO_IMAGE_POSITIONS)[number];

export function normalizeHeroImage(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

export function normalizeHeroImagePosition(value?: string): HeroImagePosition {
  return HERO_IMAGE_POSITIONS.includes(value as HeroImagePosition)
    ? (value as HeroImagePosition)
    : "center";
}
