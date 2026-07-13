export type MinimalHassEntity = {
  state: string;
};

export type HelperEntity = {
  entityId: string;
  label: string;
  icon: string;
};

type HassStates = Record<string, MinimalHassEntity>;

function mowerObjectId(entityId: string): string | undefined {
  return entityId.split(".", 2)[1] || undefined;
}

export function autoDetectedControlEntities(
  states: HassStates,
  mowerEntityId: string,
): string[] {
  return contextualControlEntities(states, mowerEntityId);
}

export function contextualControlEntities(
  states: HassStates,
  mowerEntityId: string,
  configured?: string[],
): string[] {
  const objectId = mowerObjectId(mowerEntityId);
  if (!objectId) {
    return [];
  }

  const companion = (suffix: string): string | undefined => {
    const entityId = `select.${objectId}_${suffix}`;
    return states[entityId] ? entityId : undefined;
  };
  const companions = {
    map: companion("map"),
    mowing_action: companion("mowing_action"),
    edge: companion("edge"),
    zone: companion("zone"),
    spot: companion("spot"),
  };
  const controls = configured?.filter(Boolean) ||
    Object.values(companions).filter((value): value is string => Boolean(value));
  const actionEntityId = companion("mowing_action");
  const action = actionEntityId ? states[actionEntityId]?.state.trim().toLowerCase() : "";
  const targetSuffix = action.includes("zone")
    ? "zone"
    : action.includes("spot")
      ? "spot"
      : action.includes("edge") || action.includes("border")
        ? "edge"
        : undefined;
  const targetEntities = new Set(
    [companions.edge, companions.zone, companions.spot].filter(
      (value): value is string => Boolean(value),
    ),
  );
  const activeTarget = targetSuffix ? companions[targetSuffix] : undefined;
  return controls.filter(
    (entityId) => !targetEntities.has(entityId) || entityId === activeTarget,
  );
}

export function headerSummaryEntities(
  configured: string[] | undefined,
  autoDetected: string[] | undefined,
  showAdvanced: boolean,
): string[] {
  const cleaned = configured?.filter(Boolean) || [];
  const automatic = autoDetected?.filter(Boolean) || [];
  const isEditorAutofill =
    cleaned.length === automatic.length &&
    cleaned.every((entityId, index) => entityId === automatic[index]);
  return !showAdvanced && isEditorAutofill ? [] : cleaned;
}

export function autoDetectedSummaryEntities(
  states: HassStates,
  mowerEntityId: string,
): string[] {
  const objectId = mowerObjectId(mowerEntityId);
  if (!objectId) {
    return [];
  }

  const companion = (suffix: string): string | undefined => {
    const entityId = `sensor.${objectId}_${suffix}`;
    return states[entityId] ? entityId : undefined;
  };
  const first = (...values: Array<string | undefined>): string | undefined =>
    values.find((value) => Boolean(value));

  return [
    companion("runtime_mission_progress"),
    companion("runtime_current_area"),
    companion("runtime_total_area"),
    companion("current_zone"),
    companion("current_cleaned_area"),
    companion("current_cleaning_time"),
    companion("active_segment_count"),
    first(
      companion("current_app_map_trajectory_length"),
      companion("current_app_map_mow_path_length"),
      companion("current_app_map_trajectory_point_count"),
    ),
  ].filter((value): value is string => Boolean(value));
}

export function defaultHelperEntities(
  states: HassStates,
  mowerEntityId: string,
): HelperEntity[] {
  const objectId = mowerObjectId(mowerEntityId);
  if (!objectId) {
    return [];
  }

  const resolveCompanion = (domain: string, suffix: string): string | undefined => {
    const exact = `${domain}.${objectId}_${suffix}`;
    if (states[exact]) {
      return exact;
    }

    const areaPrefixedSuffix = `_${objectId}_${suffix}`;
    const matches = Object.keys(states).filter(
      (entityId) =>
        entityId.startsWith(`${domain}.`) && entityId.endsWith(areaPrefixedSuffix),
    );
    return matches.length === 1 ? matches[0] : undefined;
  };

  const candidates: Array<Omit<HelperEntity, "entityId"> & { entityId?: string }> = [
    {
      entityId: resolveCompanion("camera", "live_video"),
      label: "Live Video",
      icon: "mdi:video-wireless-outline",
    },
    {
      entityId: resolveCompanion("calendar", "schedule"),
      label: "Schedule",
      icon: "mdi:calendar",
    },
    {
      entityId: resolveCompanion("camera", "live_path_map"),
      label: "Live Map",
      icon: "mdi:map-marker-path",
    },
    {
      entityId: resolveCompanion("camera", "all_maps"),
      label: "All Maps",
      icon: "mdi:map-multiple-outline",
    },
  ];
  return candidates.filter(
    (candidate): candidate is HelperEntity => Boolean(candidate.entityId),
  );
}
