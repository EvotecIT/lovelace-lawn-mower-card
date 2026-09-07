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

export function constrainViewport(view: MapViewport, width: number, height: number): MapViewport {
  return { ...view,
    x: Math.max(-view.width / 2, Math.min(width - view.width / 2, view.x)),
    y: Math.max(-view.height / 2, Math.min(height - view.height / 2, view.y)),
  };
}

export function zoomMap(
  view: MapViewport, factor: number, anchor: MapPoint, width: number, height: number,
): MapViewport {
  if (!finite(factor) || factor <= 0) return view;
  const nextWidth = Math.max(width / 12, Math.min(width, view.width / factor));
  const ratio = nextWidth / view.width;
  return constrainViewport({
    x: anchor.x - (anchor.x - view.x) * ratio,
    y: anchor.y - (anchor.y - view.y) * ratio,
    width: nextWidth, height: height * nextWidth / width,
  }, width, height);
}
