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
/** Persisted restart pixels must never be labelled as a live mower position. */
export function mapIsLive(attributes: Record<string, unknown>, mowerState: string): boolean {
  if (attributes.restart_preview === true || attributes.map_placeholder === true) return false;
  return Boolean(attributes.map_has_live_path ?? attributes.has_live_path) ||
    ["mowing", "paused", "returning"].includes(mowerState.toLowerCase());
}
