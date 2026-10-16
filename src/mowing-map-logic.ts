import {
  readMapGeoreference, readMapProjection, type MapGeoreference, type MapProjection,
} from "./map-georeference-logic.ts";

/** Validated, bounded contract for independent map backgrounds and live overlays. */
export type MapPoint = { x: number; y: number };
export type MapViewport = MapPoint & { width: number; height: number };
export type MowingMapScene = {
  revision: string;
  map_index: number;
  map_id: number;
  name: string;
  width: number;
  height: number;
  background_path: string;
  /** Optional vendor photo layer drawn in the same canvas as the background. */
  real_scene_path: string | null;
  /** Native-to-pixel projection; null with integrations that do not send it. */
  projection: MapProjection | null;
  /** Saved GPS alignment; null until one is saved. */
  georeference: MapGeoreference | null;
  overlay: {
    position: (MapPoint & { heading: number | null }) | null;
    trail: number[][][];
    position_status: string;
    position_observed_at: string | null;
    docked: boolean;
    updated_at: string | null;
    max_age_seconds: number;
  };
};

export function mowingMapPath(value: unknown): string | undefined {
  return typeof value === "string" &&
    /^\/api\/dreame_lawn_mower\/mowing-map\/[A-Za-z0-9_-]+$/.test(value)
    ? value : undefined;
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function readMowingMapScene(value: unknown, path: string): MowingMapScene {
  const data = record(value);
  if (!mowingMapPath(path) || data.schema_version !== 1 ||
      typeof data.revision !== "string" || !/^[a-f0-9]{64}$/.test(data.revision) ||
      !finite(data.width) || !finite(data.height) ||
      data.width < 1 || data.height < 1 || data.width > 4096 || data.height > 4096 ||
      !Number.isInteger(data.map_index) || !Number.isInteger(data.map_id) ||
      data.background_path !== `${path}/background/${data.revision}`) {
    throw new Error("Invalid mowing map scene");
  }
  const width = data.width, height = data.height;
  const overlay = record(data.overlay);
  const position = record(overlay.position);
  const status = overlay.position_status;
  const observedAt = typeof overlay.position_observed_at === "string" ? overlay.position_observed_at : null;
  const retainedAge = Date.parse(String(overlay.updated_at)) - Date.parse(observedAt || "");
  const retained = (status === "last_known" || (status === "known_dock" && overlay.docked === true)) &&
    Number.isFinite(retainedAge) && retainedAge >= -5000 &&
    retainedAge <= (status === "known_dock" ? 7 : 1) * 86400_000;
  const validPoint = (point: Record<string, unknown>) =>
    finite(point.x) && finite(point.y) && point.x >= 0 && point.x <= width &&
    point.y >= 0 && point.y <= height;
  const trail: number[][][] = [];
  let pointCount = 0;
  if (Array.isArray(overlay.trail) && overlay.trail.length <= 128) {
    for (const segment of overlay.trail) {
      if (!Array.isArray(segment) || segment.length < 2 ||
          pointCount + segment.length > 4096) continue;
      if (!segment.every((point) => Array.isArray(point) && point.length === 2 &&
          validPoint({ x: point[0], y: point[1] }))) continue;
      trail.push(segment);
      pointCount += segment.length;
    }
  }
  return {
    revision: data.revision, width, height,
    map_index: data.map_index as number, map_id: data.map_id as number,
    name: typeof data.name === "string" ? data.name.slice(0, 256) : "",
    background_path: data.background_path as string,
    real_scene_path: typeof data.real_scene_path === "string" &&
      new RegExp(`^${path}/real-scene/${data.revision}/[a-f0-9]{64}$`).test(data.real_scene_path)
      ? data.real_scene_path : null,
    projection: readMapProjection(data.projection),
    georeference: readMapGeoreference(data.georeference),
    overlay: {
      position: (status === "current" || retained) && validPoint(position)
        ? { x: position.x as number, y: position.y as number,
            heading: status !== "last_known" && finite(position.heading) ? position.heading : null }
        : null,
      trail: status === "current" ? trail : [],
      position_status: typeof overlay.position_status === "string"
        ? overlay.position_status : "unavailable",
      position_observed_at: observedAt,
      docked: overlay.docked === true,
      updated_at: typeof overlay.updated_at === "string" ? overlay.updated_at : null,
      max_age_seconds: finite(overlay.max_age_seconds)
        ? Math.max(1, Math.min(90, overlay.max_age_seconds)) : 90,
    },
  };
}

export const MAP_BACKGROUNDS = ["standard", "real_scene", "map", "satellite"] as const;
export type MapBackground = (typeof MAP_BACKGROUNDS)[number];

/** Unknown values keep the standard background. */
export function normalizeMapBackground(value: unknown): MapBackground {
  return (MAP_BACKGROUNDS as readonly unknown[]).includes(value) ? value as MapBackground : "standard";
}

export function isWorldBackground(value: MapBackground): value is "map" | "satellite" {
  return value === "map" || value === "satellite";
}

/**
 * Backgrounds a scene can draw. Street map and satellite need the projection
 * and either a saved alignment or a home position to start aligning from.
 */
export function availableMapBackgrounds(
  scene: Pick<MowingMapScene, "real_scene_path" | "projection" | "georeference"> | undefined,
  hasHome: boolean,
): MapBackground[] {
  const choices: MapBackground[] = ["standard"];
  if (scene?.real_scene_path) choices.push("real_scene");
  if (scene?.projection && (scene.georeference || hasHome)) choices.push("map", "satellite");
  return choices;
}

/** The wanted background when the scene can draw it, otherwise standard. */
export function effectiveMapBackground(wanted: MapBackground, available: readonly MapBackground[]): MapBackground {
  return available.includes(wanted) ? wanted : "standard";
}

/**
 * How far the view may leave the map: maximum view width in map widths and
 * the overscroll in view sizes. Geographic backgrounds let the view roam
 * further so the garden can be found and aligned.
 */
export type ViewLimits = { maxWidth: number; slack: number; maxZoom: number };
export const MAP_VIEW_LIMITS: ViewLimits = Object.freeze({ maxWidth: 1, slack: 0.5, maxZoom: 12 });
export const WORLD_VIEW_LIMITS: ViewLimits = Object.freeze({ maxWidth: 4, slack: 1.5, maxZoom: 32 });

/**
 * With a known map scale the view may zoom deeper (32x) so the real-size
 * mower can be seen up close; geographic backgrounds also roam further.
 */
export function viewLimits(world: boolean, projected: boolean): ViewLimits {
  if (world) return WORLD_VIEW_LIMITS;
  return projected ? { ...MAP_VIEW_LIMITS, maxZoom: WORLD_VIEW_LIMITS.maxZoom } : MAP_VIEW_LIMITS;
}

export function overlayIsFresh(scene: MowingMapScene, now = Date.now()): boolean {
  const updated = Date.parse(scene.overlay.updated_at || "");
  const age = now - updated;
  return Number.isFinite(updated) && age >= -5000 &&
    age <= scene.overlay.max_age_seconds * 1000;
}

export function positionStatusKey(scene: MowingMapScene | undefined, visible: boolean) {
  if (!visible) return scene?.overlay.docked ? "mowingMap.dockedNoPosition" : "mowingMap.noPosition";
  if (scene?.overlay.position_status === "known_dock") return "mowingMap.atDock";
  if (scene?.overlay.position_status === "last_known") return "mowingMap.lastKnown";
  return "mowingMap.mowerNow";
}

export function fitMap(width: number, height: number): MapViewport {
  return { x: 0, y: 0, width, height };
}

export function constrainViewport(
  view: MapViewport, width: number, height: number, limits: ViewLimits = MAP_VIEW_LIMITS,
): MapViewport {
  const slackX = view.width * limits.slack, slackY = view.height * limits.slack;
  return { ...view,
    x: Math.max(-slackX, Math.min(width - view.width + slackX, view.x)),
    y: Math.max(-slackY, Math.min(height - view.height + slackY, view.y)),
  };
}

export function zoomMap(
  view: MapViewport, factor: number, anchor: MapPoint, width: number, height: number,
  limits: ViewLimits = MAP_VIEW_LIMITS,
): MapViewport {
  if (!finite(factor) || factor <= 0) return view;
  const nextWidth = Math.max(width / limits.maxZoom, Math.min(width * limits.maxWidth, view.width / factor));
  const ratio = nextWidth / view.width;
  return constrainViewport({
    x: anchor.x - (anchor.x - view.x) * ratio,
    y: anchor.y - (anchor.y - view.y) * ratio,
    width: nextWidth, height: height * nextWidth / width,
  }, width, height, limits);
}

/** Real mower footprint in millimetres. */
export type MowerSize = { length: number; width: number };

/** MOVA LiDAX Ultra 1000 (659 × 439 mm); the AWD variant is 740 × 532 mm. */
export const DEFAULT_MOWER_SIZE: MowerSize = Object.freeze({ length: 659, width: 439 });

function centimetres(value: unknown): number | undefined {
  const number = typeof value === "number" ? value
    : typeof value === "string" && value.trim() ? Number(value.trim().replace(",", ".")) : NaN;
  return Number.isFinite(number) && number >= 10 && number <= 300 ? number * 10 : undefined;
}

/**
 * Footprint for the real-size marker, or null for the fixed icon.
 * Lengths are configured in centimetres; out-of-range values use the default.
 */
export function mowerMarkerSize(options: {
  mower_marker?: unknown; mower_length?: unknown; mower_width?: unknown;
}): MowerSize | null {
  if (options.mower_marker === "fixed") return null;
  return {
    length: centimetres(options.mower_length) ?? DEFAULT_MOWER_SIZE.length,
    width: centimetres(options.mower_width) ?? DEFAULT_MOWER_SIZE.width,
  };
}

/** Body of the marker artwork in its own units (nose to tail, wheel to wheel). */
export const MARKER_BODY: MowerSize = Object.freeze({ length: 1.89, width: 1.66 });
/** Screen pixels per marker unit for the fixed icon. */
export const FIXED_MARKER_PIXELS = 20;

/**
 * How to draw the mower marker: an outer uniform `scale` in map pixels and an
 * inner `x`/`y` stretch applied along the mower's own axes (after heading).
 * Real size needs the projection scale (map pixels per millimetre); below the
 * fixed icon's on-screen length the fixed icon is kept so it stays visible.
 */
export function mowerMarkerTransform(
  unitsPerScreenPixel: number, pixelsPerMillimetre: number | undefined, size: MowerSize | null,
): { scale: number; x: number; y: number; realSize: boolean } {
  const fixed = { scale: unitsPerScreenPixel * FIXED_MARKER_PIXELS, x: 1, y: 1, realSize: false };
  if (!size || !finite(pixelsPerMillimetre) || pixelsPerMillimetre <= 0 ||
      !finite(unitsPerScreenPixel) || unitsPerScreenPixel <= 0) return fixed;
  const length = size.length * pixelsPerMillimetre, width = size.width * pixelsPerMillimetre;
  if (length / unitsPerScreenPixel < MARKER_BODY.length * FIXED_MARKER_PIXELS) return fixed;
  return { scale: 1, x: width / MARKER_BODY.width, y: length / MARKER_BODY.length, realSize: true };
}
