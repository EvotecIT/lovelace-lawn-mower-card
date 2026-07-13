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
  const controls = Object.values(companions).filter(
    (value): value is string => Boolean(value),
  );
  const actionEntityId = companion("mowing_action");
  if (!actionEntityId) {
    return controls;
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
  return controls.filter(
    (entityId) => !targetEntities.has(entityId) || entityId === activeTarget,
  );
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
  ];
  return candidates.filter(
    (candidate): candidate is HelperEntity => Boolean(candidate.entityId),
  );
}
