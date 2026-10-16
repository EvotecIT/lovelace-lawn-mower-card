/**
 * Pure geometry that places Web Mercator tiles under the mower map.
 *
 * Chain: map pixel <-> native (mm, MapProjection) <-> GPS (MapGeoreference)
 * <-> Web Mercator tile. Over a garden, each tile is placed with one affine
 * transform computed from three of its corners.
 */
import type { MapPoint, MapViewport } from "./mowing-map-logic";

export type MapRotation = 0 | 90 | 180 | 270;

/** Integration MapProjection: native millimetres to background pixels. */
export type MapProjection = {
  max_x: number;
  min_y: number;
  scale: number;
  padding: number;
  native_width: number;
  native_height: number;
  rotation: MapRotation;
};

/** One native point pinned to GPS, plus the compass heading of native +Y. */
export type MapGeoreference = {
  anchor_x: number;
  anchor_y: number;
  latitude: number;
  longitude: number;
  heading: number;
  /** Metres per native unit. */
  scale: number;
};

export type GeoPoint = { latitude: number; longitude: number };

/** Similarity applied to the mower map around its centre while aligning. */
export type MapAdjustment = {
  /** Translation in map pixels. */
  dx: number;
  dy: number;
  /** Degrees, clockwise on screen. */
  rotation: number;
  /** Size factor; above 1 makes the mower map larger on the ground. */
  scale: number;
};

export const IDENTITY_ADJUSTMENT: MapAdjustment = Object.freeze({ dx: 0, dy: 0, rotation: 0, scale: 1 });
export const DEFAULT_GEOREFERENCE_SCALE = 0.001;
export const TILE_SIZE = 256;
export const MIN_ADJUSTMENT_SCALE = 0.25;
export const MAX_ADJUSTMENT_SCALE = 4;

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown> : undefined;
}

const RAD = Math.PI / 180;

export function normalizeHeading(value: number): number {
  const heading = value % 360;
  return heading < 0 ? heading + 360 : heading;
}

/** A missing or malformed projection disables geographic backgrounds. */
export function readMapProjection(value: unknown): MapProjection | null {
  const data = record(value);
  if (!data) return null;
  const { max_x, min_y, scale, padding, native_width, native_height, rotation } = data;
  if (!finite(max_x) || !finite(min_y) || !finite(scale) || scale <= 0 ||
      !finite(padding) || padding < 0 || !finite(native_width) || native_width <= 0 ||
      !finite(native_height) || native_height <= 0 ||
      !(rotation === 0 || rotation === 90 || rotation === 180 || rotation === 270)) return null;
  return { max_x, min_y, scale, padding, native_width, native_height, rotation };
}

export function readMapGeoreference(value: unknown): MapGeoreference | null {
  const data = record(value);
  if (!data) return null;
  const { anchor_x, anchor_y, latitude, longitude, heading } = data;
  const scale = data.scale === undefined || data.scale === null ? DEFAULT_GEOREFERENCE_SCALE : data.scale;
  if (!finite(anchor_x) || !finite(anchor_y) || !finite(latitude) || !finite(longitude) ||
      !finite(heading) || !finite(scale) || scale <= 0 || scale > 1 ||
      Math.abs(latitude) > 85 || Math.abs(longitude) > 180) return null;
  return { anchor_x, anchor_y, latitude, longitude, heading: normalizeHeading(heading), scale };
}

/**
 * Native point to background pixel, then the clockwise display rotation of
 * the integration (map_geometry.rotate_canvas_point_exact): native_width and
 * native_height are the canvas size before rotation, in pixel indices.
 */
export function nativeToPixel(projection: MapProjection, native: MapPoint): MapPoint {
  const u = (projection.max_x - native.x) * projection.scale + projection.padding;
  const v = (native.y - projection.min_y) * projection.scale + projection.padding;
  const w = projection.native_width, h = projection.native_height;
  switch (projection.rotation) {
    case 90: return { x: h - 1 - v, y: u };
    case 180: return { x: w - 1 - u, y: h - 1 - v };
    case 270: return { x: v, y: w - 1 - u };
    default: return { x: u, y: v };
  }
}

export function pixelToNative(projection: MapProjection, pixel: MapPoint): MapPoint {
  const w = projection.native_width, h = projection.native_height;
  let u: number, v: number;
  switch (projection.rotation) {
    case 90: u = pixel.y; v = h - 1 - pixel.x; break;
    case 180: u = w - 1 - pixel.x; v = h - 1 - pixel.y; break;
    case 270: u = w - 1 - pixel.y; v = pixel.x; break;
    default: u = pixel.x; v = pixel.y;
  }
  return {
    x: projection.max_x - (u - projection.padding) / projection.scale,
    y: projection.min_y + (v - projection.padding) / projection.scale,
  };
}

/** Metres per degree of latitude and longitude at a latitude. */
export function metresPerDegree(latitude: number): { latitude: number; longitude: number } {
  const phi = latitude * RAD;
  return {
    latitude: 111132.954 - 559.822 * Math.cos(2 * phi) + 1.175 * Math.cos(4 * phi),
    longitude: 111412.84 * Math.cos(phi) - 93.5 * Math.cos(3 * phi),
  };
}

/** Native offset from the anchor, in metres east and north. */
function nativeToLocal(reference: MapGeoreference, native: MapPoint): { east: number; north: number } {
  const dx = (native.x - reference.anchor_x) * reference.scale;
  const dy = (native.y - reference.anchor_y) * reference.scale;
  const c = Math.cos(reference.heading * RAD), s = Math.sin(reference.heading * RAD);
  return { east: dx * c + dy * s, north: -dx * s + dy * c };
}

export function nativeToGeo(reference: MapGeoreference, native: MapPoint): GeoPoint {
  const { east, north } = nativeToLocal(reference, native);
  const metres = metresPerDegree(reference.latitude);
  return {
    latitude: reference.latitude + north / metres.latitude,
    longitude: reference.longitude + east / metres.longitude,
  };
}

export function geoToNative(reference: MapGeoreference, point: GeoPoint): MapPoint {
  const metres = metresPerDegree(reference.latitude);
  const east = (point.longitude - reference.longitude) * metres.longitude;
  const north = (point.latitude - reference.latitude) * metres.latitude;
  const c = Math.cos(reference.heading * RAD), s = Math.sin(reference.heading * RAD);
  return {
    x: reference.anchor_x + (east * c - north * s) / reference.scale,
    y: reference.anchor_y + (east * s + north * c) / reference.scale,
  };
}

export function pixelToGeo(projection: MapProjection, reference: MapGeoreference, pixel: MapPoint): GeoPoint {
  return nativeToGeo(reference, pixelToNative(projection, pixel));
}

export function geoToPixel(projection: MapProjection, reference: MapGeoreference, point: GeoPoint): MapPoint {
  return nativeToPixel(projection, geoToNative(reference, point));
}

/** Fractional Web Mercator tile coordinates of a GPS point. */
export function geoToTile(point: GeoPoint, zoom: number): MapPoint {
  const n = 2 ** zoom;
  const phi = point.latitude * RAD;
  return {
    x: (point.longitude + 180) / 360 * n,
    y: (1 - Math.asinh(Math.tan(phi)) / Math.PI) / 2 * n,
  };
}

export function tileToGeo(tile: MapPoint, zoom: number): GeoPoint {
  const n = 2 ** zoom;
  return {
    latitude: Math.atan(Math.sinh(Math.PI * (1 - 2 * tile.y / n))) / RAD,
    longitude: tile.x / n * 360 - 180,
  };
}

/** Ground metres per map pixel. */
export function metresPerMapPixel(projection: MapProjection, reference: MapGeoreference): number {
  return reference.scale / projection.scale;
}

/** Smallest tile level at least as sharp as the screen, within the source limits. */
export function tileZoomFor(
  metresPerScreenPixel: number, latitude: number, maxZoom: number, minZoom = 1,
): number {
  if (!finite(metresPerScreenPixel) || metresPerScreenPixel <= 0) return minZoom;
  const ideal = Math.ceil(Math.log2(156543.03392804097 * Math.cos(latitude * RAD) / metresPerScreenPixel));
  return Math.max(minZoom, Math.min(maxZoom, ideal));
}

export type PlacedTile = {
  z: number;
  x: number;
  y: number;
  /** SVG matrix(a b c d e f) from tile pixels to map pixels. */
  matrix: [number, number, number, number, number, number];
};

/** Affine transform from three corners of one tile into map pixels. */
export function tileMatrix(
  projection: MapProjection, reference: MapGeoreference, x: number, y: number, z: number,
): PlacedTile["matrix"] {
  const corner = (tx: number, ty: number) => geoToPixel(projection, reference, tileToGeo({ x: tx, y: ty }, z));
  const origin = corner(x, y), right = corner(x + 1, y), down = corner(x, y + 1);
  return [
    (right.x - origin.x) / TILE_SIZE, (right.y - origin.y) / TILE_SIZE,
    (down.x - origin.x) / TILE_SIZE, (down.y - origin.y) / TILE_SIZE,
    origin.x, origin.y,
  ];
}

/** Tiles covering a viewport; lowers the level until the count fits. */
export function visibleTiles(
  projection: MapProjection, reference: MapGeoreference, view: MapViewport,
  zoom: number, maxTiles = 48,
): PlacedTile[] {
  const corners = [
    { x: view.x, y: view.y }, { x: view.x + view.width, y: view.y },
    { x: view.x, y: view.y + view.height }, { x: view.x + view.width, y: view.y + view.height },
  ].map((point) => pixelToGeo(projection, reference, point));
  for (let z = Math.round(zoom); z >= 0; z -= 1) {
    const tiles = corners.map((point) => geoToTile(point, z));
    const n = 2 ** z;
    const minX = Math.floor(Math.min(...tiles.map((tile) => tile.x)));
    const maxX = Math.floor(Math.max(...tiles.map((tile) => tile.x)));
    const minY = Math.max(0, Math.floor(Math.min(...tiles.map((tile) => tile.y))));
    const maxY = Math.min(n - 1, Math.floor(Math.max(...tiles.map((tile) => tile.y))));
    if ((maxX - minX + 1) * (maxY - minY + 1) > maxTiles) continue;
    const placed: PlacedTile[] = [];
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        placed.push({ z, x, y, matrix: tileMatrix(projection, reference, x, y, z) });
      }
    }
    return placed;
  }
  return [];
}

/** Only http(s) or same-origin templates with {z}, {x} and {y}. */
export function tileTemplate(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const template = value.trim();
  return /^(https?:\/\/|\/(?!\/))/i.test(template) && /\{z\}/.test(template) &&
    /\{x\}/.test(template) && /\{y\}/.test(template) && !/[\s"'<>]/.test(template)
    ? template : fallback;
}

/** Tile URL; longitude wraps, latitude outside the world has no tile. */
export function tileUrl(template: string, z: number, x: number, y: number): string | undefined {
  const n = 2 ** z;
  if (y < 0 || y >= n) return undefined;
  const wrapped = ((x % n) + n) % n;
  return template.replace(/\{z\}/g, String(z)).replace(/\{x\}/g, String(wrapped)).replace(/\{y\}/g, String(y));
}

/** Where a map pixel is drawn while an adjustment is applied around `centre`. */
export function adjustPoint(adjustment: MapAdjustment, centre: MapPoint, point: MapPoint): MapPoint {
  const c = Math.cos(adjustment.rotation * RAD), s = Math.sin(adjustment.rotation * RAD);
  const x = point.x - centre.x, y = point.y - centre.y;
  return {
    x: centre.x + adjustment.scale * (x * c - y * s) + adjustment.dx,
    y: centre.y + adjustment.scale * (x * s + y * c) + adjustment.dy,
  };
}

/** SVG matrix(a b c d e f) for adjustPoint. */
export function adjustmentMatrix(adjustment: MapAdjustment, centre: MapPoint): PlacedTile["matrix"] {
  const origin = adjustPoint(adjustment, centre, { x: 0, y: 0 });
  const c = Math.cos(adjustment.rotation * RAD) * adjustment.scale;
  const s = Math.sin(adjustment.rotation * RAD) * adjustment.scale;
  return [c, s, -s, c, origin.x, origin.y];
}

/**
 * Apply a further rotation/scale about `pivot` (drawn coordinates) after an
 * adjustment. Size stays within MIN/MAX_ADJUSTMENT_SCALE.
 */
export function composeAdjustment(
  adjustment: MapAdjustment, centre: MapPoint, pivot: MapPoint, factor: number, rotation: number,
): MapAdjustment {
  if (!finite(factor) || factor <= 0 || !finite(rotation)) return adjustment;
  const scale = Math.max(MIN_ADJUSTMENT_SCALE, Math.min(MAX_ADJUSTMENT_SCALE, adjustment.scale * factor));
  const k = scale / adjustment.scale;
  const c = Math.cos(rotation * RAD), s = Math.sin(rotation * RAD);
  const x = centre.x + adjustment.dx - pivot.x, y = centre.y + adjustment.dy - pivot.y;
  let next = adjustment.rotation + rotation;
  next = ((next + 180) % 360 + 360) % 360 - 180;
  return {
    dx: pivot.x + k * (x * c - y * s) - centre.x,
    dy: pivot.y + k * (x * s + y * c) - centre.y,
    rotation: next,
    scale,
  };
}

export function mapCentre(width: number, height: number): MapPoint {
  return { x: width / 2, y: height / 2 };
}

/**
 * Heading that shows north at the top of the screen: the native direction of
 * "up" in the picture gets bearing 0. Without it, the integration's +Y-down
 * picture would show the ground upside down at heading 0.
 */
export function northUpHeading(projection: MapProjection): number {
  const centre = pixelToNative(projection, { x: 0, y: 1 });
  const up = pixelToNative(projection, { x: 0, y: 0 });
  const nx = up.x - centre.x, ny = up.y - centre.y;
  return round(normalizeHeading(Math.atan2(-nx, ny) / RAD), 6) % 360;
}

/**
 * Starting point without a saved alignment: the map centre at the HA home,
 * one millimetre per native unit, north at the top of the screen.
 */
export function defaultGeoreference(
  projection: MapProjection, width: number, height: number, home: GeoPoint,
): MapGeoreference | null {
  if (!finite(home.latitude) || !finite(home.longitude) || Math.abs(home.latitude) > 85 ||
      Math.abs(home.longitude) > 180) return null;
  const anchor = pixelToNative(projection, mapCentre(width, height));
  return {
    anchor_x: Math.round(anchor.x), anchor_y: Math.round(anchor.y),
    latitude: home.latitude, longitude: home.longitude,
    heading: northUpHeading(projection), scale: DEFAULT_GEOREFERENCE_SCALE,
  };
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/**
 * Georeference after an adjustment drawn over tiles placed with `base`.
 * The anchor is the native point at the map centre; heading and scale follow
 * the native +Y axis through the whole chain.
 */
export function alignedGeoreference(
  projection: MapProjection, base: MapGeoreference, adjustment: MapAdjustment,
  width: number, height: number,
): MapGeoreference {
  const centre = mapCentre(width, height);
  const native = pixelToNative(projection, centre);
  const anchor = { x: Math.round(native.x), y: Math.round(native.y) };
  const step = 1000;
  const placed = (point: MapPoint) =>
    pixelToNative(projection, adjustPoint(adjustment, centre, nativeToPixel(projection, point)));
  const origin = placed(anchor);
  const ahead = placed({ x: anchor.x, y: anchor.y + step });
  const from = nativeToLocal(base, origin), to = nativeToLocal(base, ahead);
  const east = to.east - from.east, north = to.north - from.north;
  const geo = nativeToGeo(base, origin);
  return {
    anchor_x: anchor.x,
    anchor_y: anchor.y,
    latitude: round(geo.latitude, 8),
    longitude: round(geo.longitude, 8),
    heading: round(normalizeHeading(Math.atan2(east, north) / RAD), 4) % 360,
    scale: Number((Math.hypot(east, north) / step).toPrecision(7)),
  };
}

/** Service data for dreame_lawn_mower.set_georeference. */
export function georeferenceServiceData(
  entityId: string, reference: MapGeoreference,
): Record<string, unknown> {
  return {
    entity_id: entityId,
    anchor_x: reference.anchor_x,
    anchor_y: reference.anchor_y,
    latitude: reference.latitude,
    longitude: reference.longitude,
    heading: reference.heading,
    scale: reference.scale,
  };
}

/** Whether two georeferences place the map at the same spot (within ~1 cm). */
export function sameGeoreference(
  a: MapGeoreference | null | undefined, b: MapGeoreference | null | undefined,
): boolean {
  if (!a || !b) return false;
  const angle = Math.abs(((a.heading - b.heading) % 360 + 540) % 360 - 180);
  const where = nativeToGeo(a, { x: b.anchor_x, y: b.anchor_y });
  const metres = metresPerDegree(b.latitude);
  return angle < 0.01 && Math.abs(a.scale - b.scale) <= b.scale * 1e-4 &&
    Math.hypot((where.latitude - b.latitude) * metres.latitude,
      (where.longitude - b.longitude) * metres.longitude) < 0.01;
}

export type WorldBackground = "map" | "satellite";

export type WorldTileSource = {
  template: string;
  attribution: string;
  attributionUrl?: string;
  maxZoom: number;
};

/**
 * Free, keyless defaults. Esri answers 404 (blankTile=false) where it has no
 * imagery at a level, so the viewer can step down instead of showing
 * "Map data not yet available" placeholders.
 */
export const DEFAULT_WORLD_TILES: Readonly<Record<WorldBackground, WorldTileSource>> = Object.freeze({
  map: {
    template: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    attributionUrl: "https://www.openstreetmap.org/copyright",
    maxZoom: 19,
  },
  satellite: {
    template: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?blankTile=false",
    attribution: "Powered by Esri · Esri, Maxar, Earthstar Geographics",
    maxZoom: 21,
  },
});

export type WorldTileOptions = { url?: unknown; attribution?: unknown; maxZoom?: unknown };

/** A custom URL keeps its own attribution; the default keeps the provider's. */
export function worldTileSource(kind: WorldBackground, options: WorldTileOptions = {}): WorldTileSource {
  const fallback = DEFAULT_WORLD_TILES[kind];
  const template = tileTemplate(options.url, fallback.template);
  const custom = template !== fallback.template;
  const attribution = typeof options.attribution === "string" && options.attribution.trim()
    ? options.attribution.trim().slice(0, 200) : custom ? "" : fallback.attribution;
  const maxZoom = finite(options.maxZoom) && Number.isInteger(options.maxZoom) &&
    options.maxZoom >= 1 && options.maxZoom <= 23 ? options.maxZoom : custom ? 22 : fallback.maxZoom;
  return { template, attribution, attributionUrl: custom ? undefined : fallback.attributionUrl, maxZoom };
}
