import { entityIndex } from "./entity-index.ts";

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

export type EntityRegistryEntry = {
  platform?: string;
  device_id?: string;
  name?: string;
  translation_key?: string;
};

export type EntityRegistryEntries = Record<
  string,
  EntityRegistryEntry | undefined
>;

const CAMERA_RECONNECT_BASE_DELAY_MS = 3_000;
const CAMERA_RECONNECT_MAX_DELAY_MS = 30_000;

export function heroViewRestorationAllowed(
  layout: string | undefined,
): boolean {
  return layout === "hero";
}

const PREFERENCE_CONTROL_SUFFIXES = [
  "_selected_map_preference_mode",
  "_selected_map_mowing_height",
  "_selected_zone_mowing_height",
  "_selected_mowing_efficiency",
  "_selected_efficient_mode",
  "_selected_mowing_direction_mode",
  "_selected_mowing_direction",
  "_selected_mowing_direction_degrees",
  "_selected_turning_method",
  "_selected_edge_cutting_style",
  "_selected_edge_mowing_walk_mode",
  "_selected_automatic_edge_cutting",
  "_selected_edge_mowing_auto",
  "_selected_safe_edge_cutting",
  "_selected_edge_mowing_safe",
  "_selected_edgemaster",
  "_selected_edge_cutting_attachment",
  "_selected_edge_obstacle_avoidance",
  "_selected_edge_mowing_obstacle_avoidance",
  "_selected_lidar_obstacle_recognition",
  "_selected_obstacle_avoidance_enabled",
  "_selected_obstacle_height",
  "_selected_obstacle_avoidance_height_cm",
  "_selected_obstacle_distance",
  "_selected_obstacle_avoidance_distance_cm",
  "_selected_avoid_people",
  "_selected_people",
  "_selected_avoid_animals",
  "_selected_animals",
  "_selected_avoid_objects",
  "_selected_objects",
] as const;

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

export function cameraBlockReason(
  entity: MinimalHassEntity,
): string | undefined {
  const value = entity.attributes?.video_block_reason;
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized ? normalized.slice(0, 280) : undefined;
}

export function cameraReconnectDelayMs(attempt: number): number {
  const boundedAttempt = Math.max(0, Math.min(Math.floor(attempt), 4));
  return Math.min(
    CAMERA_RECONNECT_MAX_DELAY_MS,
    CAMERA_RECONNECT_BASE_DELAY_MS * 2 ** boundedAttempt,
  );
}

export function cameraRecoveryMarker(
  entity: MinimalHassEntity,
): string | undefined {
  const attributes = entity.attributes;
  if (
    !attributes ||
    attributes.video_recovery_pending !== true ||
    (typeof attributes.video_block_reason === "string" &&
      attributes.video_block_reason.trim())
  ) {
    return undefined;
  }
  const failureCount = attributes.video_recovery_failure_count;
  const errorAt = attributes.last_stream_error_at;
  if (
    typeof failureCount !== "number" ||
    !Number.isFinite(failureCount) ||
    failureCount < 1
  ) {
    return undefined;
  }
  return `${Math.floor(failureCount)}:${
    typeof errorAt === "string" ? errorAt : ""
  }`;
}

export function cameraRecoveryVerified(entity: MinimalHassEntity): boolean {
  const health = entity.attributes?.last_stream_health;
  return Boolean(
    entity.attributes?.video_recovery_pending !== true &&
      health &&
      typeof health === "object" &&
      !Array.isArray(health) &&
      (health as Record<string, unknown>).playback_session_verified === true,
  );
}

export function cameraCanRecoverWhileUnavailable(
  entity: MinimalHassEntity,
): boolean {
  const attributes = entity.attributes;
  return Boolean(
    attributes &&
      !(
        typeof attributes.video_block_reason === "string" &&
        attributes.video_block_reason.trim()
      ) &&
      (attributes.video_recovery_pending === true ||
        attributes.xp2p_provisioning_cached === true ||
        attributes.lan_video_endpoint_cached === true),
  );
}

export function cameraCanBePresented(
  entity: MinimalHassEntity,
  recoveryPlayerMounted: boolean,
): boolean {
  const state = entity.state.trim().toLowerCase();
  return Boolean(
    cameraBlockReason(entity) ||
      !["unknown", "unavailable", ""].includes(state) ||
      (recoveryPlayerMounted &&
        cameraCanRecoverWhileUnavailable(entity)),
  );
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

function normalizedEntityRole(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function registryOwnersMatch(
  mowerEntry: EntityRegistryEntry | undefined,
  candidateEntry: EntityRegistryEntry | undefined,
): boolean {
  if (!mowerEntry?.device_id || !candidateEntry?.device_id) {
    return false;
  }
  return (
    mowerEntry.device_id === candidateEntry.device_id &&
    Boolean(mowerEntry.platform) &&
    mowerEntry.platform === candidateEntry.platform
  );
}

function resolveMowerCompanionEntity(
  states: HassStates,
  mowerEntityId: string,
  entities: EntityRegistryEntries | undefined,
  requireRegistryOwnership: boolean,
  domain: string,
  ...suffixes: readonly string[]
): string | undefined {
  const objectId = mowerObjectId(mowerEntityId);
  if (!objectId) {
    return undefined;
  }

  const entityIds = entityIndex(states).ids;
  for (const suffix of suffixes) {
    const entityId = `${domain}.${objectId}_${suffix}`;
    if (states[entityId]) {
      const mowerEntry = entities?.[mowerEntityId];
      const candidateEntry = entities?.[entityId];
      if (
        !requireRegistryOwnership ||
        registryOwnersMatch(mowerEntry, candidateEntry)
      ) {
        return entityId;
      }
    }

    const registrySuffix = `_${objectId}_${suffix}`;
    const normalizedSuffix = normalizedEntityRole(suffix);
    const mowerEntry = entities?.[mowerEntityId];
    const ownedMatches = entityIds.filter(
      (candidate) => {
        if (!candidate.startsWith(`${domain}.`)) {
          return false;
        }
        const candidateEntry = entities?.[candidate];
        if (!registryOwnersMatch(mowerEntry, candidateEntry)) {
          return false;
        }
        if (candidate.slice(domain.length + 1).endsWith(registrySuffix)) {
          return true;
        }
        const roles = [
          candidateEntry?.translation_key,
          candidateEntry?.name,
          states[candidate]?.attributes?.friendly_name,
        ]
          .map(normalizedEntityRole)
          .filter((value): value is string => Boolean(value));
        return Boolean(
          normalizedSuffix &&
          roles.some(
            (role) =>
              role === normalizedSuffix ||
              role.endsWith(`_${normalizedSuffix}`),
          ),
        );
      },
    );
    if (ownedMatches.length === 1) {
      return ownedMatches[0];
    }
    if (ownedMatches.length > 1) {
      return undefined;
    }
    if (requireRegistryOwnership) {
      continue;
    }

    const namedMatches = entityIds.filter(
      (candidate) =>
        candidate.startsWith(`${domain}.`) &&
        candidate.slice(domain.length + 1).endsWith(registrySuffix),
    );
    if (namedMatches.length === 1) {
      return namedMatches[0];
    }
    if (namedMatches.length > 1) {
      return undefined;
    }
  }
  return undefined;
}

export function resolvedMowerCompanionEntity(
  states: HassStates,
  mowerEntityId: string,
  entities: EntityRegistryEntries | undefined,
  domain: string,
  ...suffixes: readonly string[]
): string | undefined {
  return resolveMowerCompanionEntity(
    states,
    mowerEntityId,
    entities,
    false,
    domain,
    ...suffixes,
  );
}

export function resolvedOwnedMowerCompanionEntity(
  states: HassStates,
  mowerEntityId: string,
  entities: EntityRegistryEntries | undefined,
  domain: string,
  ...suffixes: readonly string[]
): string | undefined {
  return resolveMowerCompanionEntity(
    states,
    mowerEntityId,
    entities,
    true,
    domain,
    ...suffixes,
  );
}

export function autoDetectedControlEntities(
  states: HassStates,
  mowerEntityId: string,
  entities?: EntityRegistryEntries,
): string[] {
  if (!mowerObjectId(mowerEntityId)) {
    return [];
  }

  const companion = (
    domain: string,
    ...suffixes: readonly string[]
  ): string | undefined =>
    resolvedMowerCompanionEntity(
      states,
      mowerEntityId,
      entities,
      domain,
      ...suffixes,
    );
  const companions = {
    map: companion("select", "map"),
    mowing_action: companion("select", "mowing_action"),
    edge: companion("select", "edge"),
    zone: companion("select", "zone"),
    spot: companion("select", "spot"),
    maintenance_point: companion("select", "maintenance_point"),
    preference_mode: companion("select", "selected_map_preference_mode"),
    map_rotation: companion(
      "select",
      "selected_map_display_rotation",
      "selected_map_rotation",
    ),
    global_mowing_height: companion("number", "selected_map_mowing_height"),
    zone_mowing_height: companion("number", "selected_zone_mowing_height"),
    efficiency: companion(
      "select",
      "selected_mowing_efficiency",
      "selected_efficient_mode",
    ),
    direction_mode: companion("select", "selected_mowing_direction_mode"),
    direction_degrees: companion(
      "number",
      "selected_mowing_direction",
      "selected_mowing_direction_degrees",
    ),
    obstacle_height: companion(
      "select",
      "selected_obstacle_height",
      "selected_obstacle_avoidance_height_cm",
    ),
    obstacle_distance: companion(
      "select",
      "selected_obstacle_distance",
      "selected_obstacle_avoidance_distance_cm",
    ),
    turning_method: companion(
      "select",
      "selected_turning_method",
      "selected_edge_cutting_style",
      "selected_edge_mowing_walk_mode",
    ),
    automatic_edge: companion(
      "switch",
      "selected_automatic_edge_cutting",
      "selected_edge_mowing_auto",
    ),
    safe_edge: companion(
      "switch",
      "selected_safe_edge_cutting",
      "selected_edge_mowing_safe",
    ),
    edgemaster: companion(
      "switch",
      "selected_edgemaster",
      "selected_edge_cutting_attachment",
    ),
    edge_avoidance: companion(
      "switch",
      "selected_edge_obstacle_avoidance",
      "selected_edge_mowing_obstacle_avoidance",
    ),
    lidar_avoidance: companion(
      "switch",
      "selected_lidar_obstacle_recognition",
      "selected_obstacle_avoidance_enabled",
    ),
    avoid_people: companion("switch", "selected_avoid_people", "selected_people"),
    avoid_animals: companion(
      "switch",
      "selected_avoid_animals",
      "selected_animals",
    ),
    avoid_objects: companion(
      "switch",
      "selected_avoid_objects",
      "selected_objects",
    ),
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
    companions.direction_mode,
    companions.direction_degrees,
    companions.turning_method,
    companions.automatic_edge,
    companions.safe_edge,
    companions.edgemaster,
    companions.edge_avoidance,
    companions.lidar_avoidance,
    companions.obstacle_height,
    companions.obstacle_distance,
    companions.avoid_people,
    companions.avoid_animals,
    companions.avoid_objects,
  ].filter((value): value is string => Boolean(value));
}

export function isPreferenceControlEntity(entityId: string): boolean {
  return PREFERENCE_CONTROL_SUFFIXES.some((suffix) =>
    entityId.endsWith(suffix),
  );
}

export function resolvedControlEntities(
  states: HassStates,
  mowerEntityId: string,
  configured: string[] | undefined,
  entities?: EntityRegistryEntries,
): string[] {
  const cleaned = configured?.filter(Boolean) || [];
  return cleaned.length
    ? cleaned
    : autoDetectedControlEntities(states, mowerEntityId, entities);
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
    const matches = entityIndex(states).byDomain(domain).filter(
      (entityId) =>
        entityId.endsWith(areaPrefixedSuffix),
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
