/** The card consumes only versioned HA data, never vendor paths or packets. */
export type HistoryTask = {
  id: string; mode: number | null; started_at: number | null; reported_at: number | null;
  duration_minutes: number | null; area_sqm: number | null; result: number | null;
  detail_path: string;
};
export type HistoryPoint = [number, number];
export type HistoryFeature = { kind: number | null; zone_id: number | null; points: HistoryPoint[]; tracks: HistoryPoint[][] };
export type HistorySample = { at: number; level: number; charging: boolean; active: boolean; continuous: boolean };
export type HistorySettings = { map_index: number | null; mode: 0 | 1 | null; zones: Record<string, number | boolean>[] };
export type HistoryBattery = {
  source: "observed" | "recorder"; coverage: "partial" | "complete";
  percentage_points: number | null; percentage_points_per_sqm: number | null;
  samples: HistorySample[]; settings: HistorySettings;
  settings_observed_at: number | null; settings_timing: "at_start" | "first_observed" | "unavailable";
};
export type HistoryDetail = {
  id: string; started_at: number | null; ended_at: number | null; duration_minutes: number | null;
  area_sqm: number | null; mode: number | null; result: number | null;
  features: HistoryFeature[]; faults: [number | null, number][]; zone_results: [number, number][];
  recorded_settings: Record<string, number>; per_zone_settings: boolean;
  battery: HistoryBattery | null; photo_paths: string[]; stale: boolean;
};

export function historyPath(value: unknown): string | undefined {
  return typeof value === "string" && /^\/api\/dreame_lawn_mower\/task-history\/[A-Za-z0-9_-]+$/.test(value)
    ? value : undefined;
}
function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function number(value: unknown, min = 0, max = 1e9): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : null;
}
function epoch(value: unknown): number | null { return number(value, 1, 253402300799); }
function integer(value: unknown): number | null { const n = number(value, -1e6, 1e6); return n !== null && Number.isInteger(n) ? n : null; }
function identifier(value: unknown): value is string { return typeof value === "string" && /^[a-f0-9]{32}$/.test(value); }

export function readHistoryList(value: unknown, path: string): { tasks: HistoryTask[]; stale: boolean } {
  const data = record(value);
  if (!historyPath(path) || data.schema_version !== 1 || !Array.isArray(data.tasks) || data.tasks.length > 30) throw new Error("Invalid task history");
  const seen = new Set<string>();
  const tasks = data.tasks.map((row) => {
    const task = record(row), id = task.id;
    if (!identifier(id) || seen.has(id) || task.detail_path !== `${path}/${id}`) throw new Error("Invalid task reference");
    seen.add(id);
    return { id, mode: integer(task.mode), started_at: epoch(task.started_at), reported_at: epoch(task.reported_at),
      duration_minutes: number(task.duration_minutes), area_sqm: number(task.area_sqm), result: integer(task.result), detail_path: `${path}/${id}` };
  });
  return { tasks, stale: data.stale === true };
}

export function readHistoryDetail(value: unknown, path: string, id: string): HistoryDetail {
  const data = record(value);
  if (!historyPath(path) || !identifier(id) || data.id !== id || data.schema_version !== 1) throw new Error("Invalid task detail");
  let pointCount = 0;
  const points = (input: unknown): HistoryPoint[] => {
    if (!Array.isArray(input) || pointCount + input.length > 12000) return [];
    if (!input.every((point) => Array.isArray(point) && point.length === 2 &&
      number(point[0], -1e7, 1e7) !== null && number(point[1], -1e7, 1e7) !== null)) return [];
    pointCount += input.length;
    return input as HistoryPoint[];
  };
  const features: HistoryFeature[] = [];
  for (const row of Array.isArray(data.features) ? data.features.slice(0, 200) : []) {
    const feature = record(row);
    features.push({ kind: integer(feature.kind), zone_id: integer(feature.zone_id), points: points(feature.points),
      tracks: Array.isArray(feature.tracks) ? feature.tracks.slice(0, 200).map(points).filter((run) => run.length > 1) : [] });
  }
  const pairs = (input: unknown): [number, number][] => Array.isArray(input) ? input.slice(0, 200)
    .filter((pair) => Array.isArray(pair) && pair.length === 2 && integer(pair[0]) !== null && integer(pair[1]) !== null) : [];
  const faults: [number | null, number][] = Array.isArray(data.faults) ? data.faults.slice(0, 100)
    .filter((pair) => Array.isArray(pair) && pair.length === 2 && integer(pair[1]) !== null)
    .map((pair) => [epoch(pair[0]), pair[1]]) : [];
  const photos = Array.isArray(data.photo_paths) ? data.photo_paths : [];
  if (photos.length > 100 || photos.some((photo, index) => photo !== `${path}/${id}/photo/${index}`)) throw new Error("Invalid task photo reference");
  const pref = record(data.recorded_settings), settings: Record<string, number> = {};
  for (const key of ["mowing_height_cm", "efficient_mode"]) if (number(pref[key]) !== null) settings[key] = pref[key] as number;
  return {
    id, started_at: epoch(data.started_at), ended_at: epoch(data.ended_at), duration_minutes: number(data.duration_minutes),
    area_sqm: number(data.area_sqm), mode: integer(data.mode), result: integer(data.result), features, faults,
    zone_results: pairs(data.zone_results), recorded_settings: settings, per_zone_settings: data.per_zone_settings === true,
    battery: readBattery(data.battery), photo_paths: photos as string[], stale: data.stale === true,
  };
}

function readBattery(value: unknown): HistoryBattery | null {
  const data = record(value);
  if ((data.source !== "observed" && data.source !== "recorder") || !Array.isArray(data.samples) || data.samples.length > 500) return null;
  let last = 0;
  const samples: HistorySample[] = [];
  for (const row of data.samples) {
    const sample = record(row), at = epoch(sample.at), level = number(sample.level, 0, 100);
    if (at === null || at <= last || level === null || typeof sample.charging !== "boolean" || typeof sample.active !== "boolean" || typeof sample.continuous !== "boolean") return null;
    samples.push({ at, level, charging: sample.charging, active: sample.active, continuous: sample.continuous }); last = at;
  }
  const settings = record(data.settings), zones: Record<string, number | boolean>[] = [];
  for (const row of Array.isArray(settings.zones) ? settings.zones.slice(0, 200) : []) {
    const zone = record(row), entry: Record<string, number | boolean> = {};
    for (const key of ["area_id", "mowing_height_cm", "efficient_mode", "edge_mowing_walk_mode", "mowing_direction_mode", "mowing_direction_degrees"]) {
      if (typeof zone[key] === "boolean" || number(zone[key], -1e6, 1e6) !== null) entry[key] = zone[key] as number | boolean;
    }
    if (Object.keys(entry).length) zones.push(entry);
  }
  return { source: data.source, coverage: data.coverage === "complete" ? "complete" : "partial",
    percentage_points: number(data.percentage_points), percentage_points_per_sqm: number(data.percentage_points_per_sqm),
    samples, settings: { map_index: integer(settings.map_index), mode: settings.mode === 0 || settings.mode === 1 ? settings.mode : null, zones }, settings_observed_at: epoch(data.settings_observed_at),
    settings_timing: data.settings_timing === "at_start" || data.settings_timing === "first_observed" ? data.settings_timing : "unavailable" };
}

/** An angle retained by the app has meaning only with its captured mode. */
export function historyDirection(settings: Record<string, number | boolean>): { mode: 0 | 1 | 2 | null; degrees: number | null } {
  const raw = settings.mowing_direction_mode;
  const mode = raw === 0 || raw === 1 || raw === 2 ? raw : null;
  return { mode, degrees: mode === 1 || mode === 2 ? number(settings.mowing_direction_degrees, -360, 360) : null };
}

/** Global mode uses the global row; stored zone overrides are not active. */
export function historyPreferenceRows(settings: HistorySettings): Record<string, number | boolean>[] {
  return settings.mode === 0 ? settings.zones.filter((zone) => zone.area_id === 0) : settings.zones;
}

/** Mirror the native X axis, using only this run's stored geometry. */
export function historyMapBounds(features: HistoryFeature[]): [number, number, number, number] | undefined {
  const points = features.flatMap((feature) => [...feature.points, ...feature.tracks.flat()]);
  if (!points.length) return undefined;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of points) { minX = Math.min(minX, -x); maxX = Math.max(maxX, -x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  const padding = Math.max(50, Math.max(maxX - minX, maxY - minY) * .06);
  return [minX - padding, minY - padding, Math.max(100, maxX - minX) + padding * 2, Math.max(100, maxY - minY) + padding * 2];
}
