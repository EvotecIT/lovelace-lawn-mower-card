export type ScheduleEntity = {
  state: string;
  attributes?: Record<string, unknown>;
};

export type ScheduleControl = {
  entityId: string;
  label: string;
  mapLabel?: string;
  enabled: boolean;
  available: boolean;
  weekdays: string[];
  startTimes: string[];
  taskCount?: number;
};

export function discoverScheduleControls(
  states: Record<string, ScheduleEntity>,
  mowerEntityId: string,
): ScheduleControl[] {
  const objectId = mowerEntityId.split(".", 2)[1];
  if (!objectId) {
    return [];
  }
  const mowerObjectIds = Object.keys(states)
    .filter((entityId) => entityId.startsWith("lawn_mower."))
    .map((entityId) => entityId.split(".", 2)[1])
    .filter((candidate): candidate is string => Boolean(candidate))
    .sort((left, right) => right.length - left.length);
  return Object.entries(states)
    .filter(([entityId, entity]) => {
      if (!entityId.startsWith("switch.")) {
        return false;
      }
      if (entity.attributes?.schedule_control !== true) {
        return false;
      }
      const switchObjectId = entityId.split(".", 2)[1] || "";
      return matchingMowerObjectId(switchObjectId, mowerObjectIds) === objectId;
    })
    .map(([entityId, entity]) => scheduleControl(entityId, entity))
    .sort((left, right) => {
      const mapOrder = (left.mapLabel || "").localeCompare(right.mapLabel || "");
      return mapOrder || left.label.localeCompare(right.label);
    });
}

function matchingMowerObjectId(
  switchObjectId: string,
  mowerObjectIds: string[],
): string | undefined {
  return mowerObjectIds.find((candidate) =>
    switchObjectId.startsWith(`${candidate}_`) ||
    switchObjectId.includes(`_${candidate}_`)
  );
}

function scheduleControl(
  entityId: string,
  entity: ScheduleEntity,
): ScheduleControl {
  const attributes = entity.attributes || {};
  const state = entity.state.trim().toLowerCase();
  return {
    entityId,
    label: text(attributes.name) || text(attributes.friendly_name) || fallbackLabel(entityId),
    mapLabel: text(attributes.map_label),
    enabled: state === "on",
    available: !["unavailable", "unknown", ""].includes(state),
    weekdays: textArray(attributes.weekdays),
    startTimes: textArray(attributes.start_times),
    taskCount: finiteNumber(attributes.task_count),
  };
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function textArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && Boolean(item))
    : [];
}

function finiteNumber(value: unknown): number | undefined {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function fallbackLabel(entityId: string): string {
  return (entityId.split(".", 2)[1] || entityId)
    .split("_")
    .map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : part)
    .join(" ");
}
