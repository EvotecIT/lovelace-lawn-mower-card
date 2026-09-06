import type { HassEntity } from "./card-config";

export type MowingAreaProgress = {
  completed: number;
  remaining: number;
  total: number;
  percent: number;
  unit: string;
};

/** Compare only current, same-scope area measurements; never derive a spatial mask. */
export function mowingAreaProgress(
  current?: HassEntity, total?: HassEntity,
): MowingAreaProgress | undefined {
  if (!current || !total || current.attributes.cached === true || total.attributes.cached === true ||
      current.attributes.frame_valid === false || total.attributes.frame_valid === false ||
      !current.state.trim() || !total.state.trim()) return undefined;
  const unit = current.attributes.unit_of_measurement;
  if (typeof unit !== "string" || !unit.trim() || unit !== total.attributes.unit_of_measurement) return undefined;
  for (const key of ["task_id", "region_id", "map_index"]) {
    if (current.attributes[key] !== total.attributes[key]) return undefined;
  }
  const completed = Number(current.state), target = Number(total.state);
  if (!Number.isFinite(completed) || !Number.isFinite(target) ||
      completed < 0 || target <= 0 || completed > target) return undefined;
  return { completed, remaining: target - completed, total: target,
    percent: completed / target * 100, unit };
}
