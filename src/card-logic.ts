export type MinimalHassEntity = {
  state: string;
  attributes?: Record<string, unknown>;
  last_changed?: string;
  last_updated?: string;
};

export type HelperEntity = {
  entityId: string;
  label: string;
  icon: string;
  action?: "more-info" | "press";
};

export type CoverageEntityIds = {
  current?: string;
  total?: string;
};

export type NumberControlSettings = {
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
};

type HassStates = Record<string, MinimalHassEntity>;

export function cameraImageUrl(entityId: string, entity: MinimalHassEntity): string {
  const entityPicture = entity.attributes?.entity_picture;
  const base =
    typeof entityPicture === "string" && entityPicture
      ? entityPicture
      : `/api/camera_proxy/${entityId}`;
  const revision = entity.last_updated || entity.last_changed;
  if (!revision) {
    return base;
  }
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}v=${encodeURIComponent(revision)}`;
}

export function firstAvailableEntity<T extends MinimalHassEntity>(
  entities: readonly (T | undefined)[],
): T | undefined {
  return entities.find(
    (candidate): candidate is T =>
      Boolean(
        candidate &&
          !["unknown", "unavailable", ""].includes(candidate.state.trim().toLowerCase()),
      ),
  );
}

function mowerObjectId(entityId: string): string | undefined {
  return entityId.split(".", 2)[1] || undefined;
}

export function autoDetectedControlEntities(
  states: HassStates,
  mowerEntityId: string,
): string[] {
  const objectId = mowerObjectId(mowerEntityId);
  if (!objectId) {
    return [];
  }

  const companion = (domain: string, suffix: string): string | undefined => {
    const entityId = `${domain}.${objectId}_${suffix}`;
    return states[entityId] ? entityId : undefined;
  };
  const companions = {
    map: companion("select", "map"),
    mowing_action: companion("select", "mowing_action"),
    edge: companion("select", "edge"),
    zone: companion("select", "zone"),
    spot: companion("select", "spot"),
    maintenance_point: companion("select", "maintenance_point"),
    preference_mode: companion("select", "selected_map_preference_mode"),
    map_rotation: companion("select", "selected_map_rotation"),
    global_mowing_height: companion("number", "selected_map_mowing_height"),
    zone_mowing_height: companion("number", "selected_zone_mowing_height"),
    efficiency: companion("select", "selected_efficient_mode"),
    obstacle_height: companion("select", "selected_obstacle_avoidance_height_cm"),
    obstacle_distance: companion(
      "select",
      "selected_obstacle_avoidance_distance_cm",
    ),
    edge_style: companion("select", "selected_edge_mowing_walk_mode"),
    automatic_edge: companion("switch", "selected_edge_mowing_auto"),
    safe_edge: companion("switch", "selected_edge_mowing_safe"),
    edge_avoidance: companion(
      "switch",
      "selected_edge_mowing_obstacle_avoidance",
    ),
    lidar_avoidance: companion(
      "switch",
      "selected_obstacle_avoidance_enabled",
    ),
    avoid_people: companion("switch", "selected_people"),
    avoid_animals: companion("switch", "selected_animals"),
    avoid_objects: companion("switch", "selected_objects"),
  };
  const targetControls = [
    companions.map,
    companions.mowing_action,
    companions.edge,
    companions.zone,
    companions.spot,
    companions.map_rotation,
    companions.maintenance_point &&
    !["unknown", "unavailable", ""].includes(
      states[companions.maintenance_point]?.state.trim().toLowerCase() || "",
    )
      ? companions.maintenance_point
      : undefined,
  ].filter(
    (value): value is string => Boolean(value),
  );
  const actionEntityId = companions.mowing_action;
  if (!actionEntityId) {
    return [
      ...targetControls,
      ...activePreferenceControls(states, companions),
    ];
  }
  const action = states[actionEntityId]?.state.trim().toLowerCase() || "";
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
  const controls = targetControls.filter(
    (entityId) => !targetEntities.has(entityId) || entityId === activeTarget,
  );
  return [...controls, ...activePreferenceControls(states, companions)];
}

function activePreferenceControls(
  states: HassStates,
  companions: Record<string, string | undefined>,
): string[] {
  const modeEntityId = companions.preference_mode;
  const mode = modeEntityId
    ? states[modeEntityId]?.state.trim().toLowerCase()
    : undefined;
  const height =
    mode === "global"
      ? companions.global_mowing_height
      : mode === "custom"
        ? companions.zone_mowing_height
        : undefined;
  return [
    modeEntityId,
    height,
    companions.efficiency,
    companions.obstacle_height,
    companions.obstacle_distance,
    companions.edge_style,
    companions.automatic_edge,
    companions.safe_edge,
    companions.edge_avoidance,
    companions.lidar_avoidance,
    companions.avoid_people,
    companions.avoid_animals,
    companions.avoid_objects,
  ].filter((value): value is string => Boolean(value));
}

export function isPreferenceControlEntity(entityId: string): boolean {
  return [
    "_selected_map_preference_mode",
    "_selected_map_mowing_height",
    "_selected_zone_mowing_height",
    "_selected_efficient_mode",
    "_selected_obstacle_avoidance_height_cm",
    "_selected_obstacle_avoidance_distance_cm",
    "_selected_edge_mowing_walk_mode",
    "_selected_edge_mowing_auto",
    "_selected_edge_mowing_safe",
    "_selected_edge_mowing_obstacle_avoidance",
    "_selected_obstacle_avoidance_enabled",
    "_selected_people",
    "_selected_animals",
    "_selected_objects",
  ].some((suffix) => entityId.endsWith(suffix));
}

export function resolvedControlEntities(
  states: HassStates,
  mowerEntityId: string,
  configured: string[] | undefined,
): string[] {
  const cleaned = configured?.filter(Boolean) || [];
  return cleaned.length
    ? cleaned
    : autoDetectedControlEntities(states, mowerEntityId);
}

export function resolvedCoverageEntityIds(
  states: HassStates,
  mowerEntityId: string,
  configuredCurrent?: string,
  configuredTotal?: string,
): CoverageEntityIds {
  const objectId = mowerObjectId(mowerEntityId);
  if (!objectId) {
    return {};
  }

  const firstAvailableId = (
    candidates: readonly (string | undefined)[],
  ): string | undefined =>
    candidates.find((entityId) =>
      entityId ? Boolean(firstAvailableEntity([states[entityId]])) : false,
    );
  const companion = (suffix: string): string =>
    `sensor.${objectId}_${suffix}`;

  return {
    current: firstAvailableId([
      configuredCurrent,
      companion("runtime_current_area"),
      companion("current_cleaned_area"),
    ]),
    total: firstAvailableId([
      configuredTotal,
      companion("runtime_total_area"),
    ]),
  };
}

export function numberControlSettings(
  entity: MinimalHassEntity,
): NumberControlSettings | undefined {
  const value = Number(entity.state);
  const min = Number(entity.attributes?.min);
  const max = Number(entity.attributes?.max);
  const step = Number(entity.attributes?.step);
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    !Number.isFinite(step) ||
    step <= 0 ||
    min >= max
  ) {
    return undefined;
  }
  const unit = entity.attributes?.unit_of_measurement;
  return {
    value,
    min,
    max,
    step,
    unit: typeof unit === "string" && unit ? unit : undefined,
  };
}

export function configuredHeaderSummaryEntities(
  configured: string[] | undefined,
): string[] {
  return configured?.filter(Boolean) || [];
}

export function entitySummaryLabel(
  entityId: string,
  entity: MinimalHassEntity,
  preferredLabel?: string,
): string {
  const friendlyName = entity.attributes?.friendly_name;
  if (typeof friendlyName === "string" && friendlyName.trim()) {
    return friendlyName.trim();
  }
  if (preferredLabel) {
    return preferredLabel;
  }
  return entityId.split(".")[1]?.replace(/_/g, " ") || entityId;
}

export function prioritizedHeaderSummary(
  configured: string[],
  automatic: string[],
  limit = 4,
): string[] {
  return [...new Set([...configured, ...automatic])].slice(0, limit);
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
    {
      entityId: resolveCompanion("button", "go_to_maintenance_point"),
      label: "Maintenance Point",
      icon: "mdi:map-marker-wrench",
      action: "press",
    },
  ];
  return candidates.filter(
    (candidate): candidate is HelperEntity => Boolean(candidate.entityId),
  );
}
