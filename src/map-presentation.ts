export const MAP_FITS = ["contain", "cover"] as const;

export type MapFit = (typeof MAP_FITS)[number];

export const MAP_POSITIONS = [
  "center",
  "top",
  "bottom",
  "left",
  "right",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
] as const;

export type MapPosition = (typeof MAP_POSITIONS)[number];

export function normalizeMapFit(value?: string): MapFit {
  return MAP_FITS.includes(value as MapFit) ? (value as MapFit) : "contain";
}

export function normalizeMapPosition(value?: string): MapPosition {
  return MAP_POSITIONS.includes(value as MapPosition)
    ? (value as MapPosition)
    : "center";
}

export function mapPresentationClasses(
  fit?: string,
  position?: string,
): string {
  return `map-fit-${normalizeMapFit(fit)} map-position-${normalizeMapPosition(position)}`;
}
