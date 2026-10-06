import { entityIndex } from "./entity-index.ts";
import { matchingMowerObjectId } from "./schedule-controls.ts";

export type AreaEntity = {
  state: string;
  attributes?: Record<string, unknown>;
};

export type AreaStartControl = {
  /** select entity whose options are the mower's areas. */
  selectEntityId: string;
  /** button entity that starts the area currently picked on the select. */
  startEntityId: string;
  areas: string[];
};

/**
 * Finds the area picker an integration marks with `area_control: true`, the
 * same way schedule switches are found. Only an area list the mower can
 * actually start one by one (more than one area, a live start button) counts.
 */
export function discoverAreaStartControl(
  states: Record<string, AreaEntity>,
  mowerEntityId: string,
): AreaStartControl | undefined {
  const objectId = mowerEntityId.split(".", 2)[1];
  if (!objectId) {
    return undefined;
  }
  const index = entityIndex(states);
  const mowerObjectIds = index
    .byDomain("lawn_mower")
    .map((entityId) => entityId.split(".", 2)[1])
    .filter((candidate): candidate is string => Boolean(candidate))
    .sort((left, right) => right.length - left.length);
  for (const entityId of index.byDomain("select")) {
    const entity = states[entityId];
    if (entity?.attributes?.area_control !== true) {
      continue;
    }
    const selectObjectId = entityId.split(".", 2)[1] || "";
    if (matchingMowerObjectId(selectObjectId, mowerObjectIds) !== objectId) {
      continue;
    }
    const control = areaStartControl(entityId, entity, states);
    if (control) {
      return control;
    }
  }
  return undefined;
}

function areaStartControl(
  selectEntityId: string,
  entity: AreaEntity,
  states: Record<string, AreaEntity>,
): AreaStartControl | undefined {
  if (isUnavailable(entity)) {
    return undefined;
  }
  const startEntityId = entity.attributes?.start_entity;
  if (
    typeof startEntityId !== "string" ||
    !startEntityId.startsWith("button.") ||
    !states[startEntityId] ||
    isUnavailable(states[startEntityId])
  ) {
    return undefined;
  }
  const options = entity.attributes?.options;
  const areas = Array.isArray(options)
    ? options.filter(
        (option): option is string =>
          typeof option === "string" && Boolean(option.trim()),
      )
    : [];
  if (new Set(areas).size < 2) {
    return undefined;
  }
  return { selectEntityId, startEntityId, areas: Array.from(new Set(areas)) };
}

function isUnavailable(entity: AreaEntity): boolean {
  return entity.state.trim().toLowerCase() === "unavailable";
}
