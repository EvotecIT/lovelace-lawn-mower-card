export type ZoneChoice = {
  id: number;
  label: string;
};

type ZoneEntity = {
  state: string;
  attributes?: Record<string, unknown>;
};

type EntityRegistryEntries = Record<
  string,
  { platform?: string } | undefined
>;

type HassServices = Record<
  string,
  Record<string, unknown> | undefined
>;

function isPositiveInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0
  );
}

function mapIndexToken(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return String(value);
  }
  return undefined;
}

function mapLabelToken(value: unknown): string | undefined {
  if (typeof value === "string") {
    const label = value.trim();
    if (
      label &&
      !["unknown", "unavailable"].includes(label.toLowerCase())
    ) {
      return label;
    }
  }
  return undefined;
}

export function supportsDreameMultiZoneMowing(
  mowerEntityId: string,
  entities: EntityRegistryEntries | undefined,
  services: HassServices | undefined,
): boolean {
  return (
    entities?.[mowerEntityId]?.platform === "dreame_lawn_mower" &&
    Boolean(services?.lawn_mower?.start_zone_mowing)
  );
}

export function selectedMapIsCurrent(
  mower: ZoneEntity | undefined,
  mapEntity?: ZoneEntity,
): boolean {
  const attributes = mower?.attributes;
  if (attributes?.selected_map_matches_active_app_map === false) {
    return false;
  }
  const selectedIndex = mapIndexToken(attributes?.selected_map_index);
  const activeIndex = mapIndexToken(attributes?.app_current_map_index);
  if (
    selectedIndex !== undefined &&
    activeIndex !== undefined &&
    selectedIndex !== activeIndex
  ) {
    return false;
  }
  const labels = [
    mapLabelToken(attributes?.selected_map_label),
    mapLabelToken(attributes?.app_current_map_label),
    mapLabelToken(mapEntity?.state),
  ].filter((value): value is string => Boolean(value));
  return new Set(labels).size <= 1;
}

export function zoneChoices(
  mower: ZoneEntity | undefined,
  zoneEntity: ZoneEntity | undefined,
): ZoneChoice[] {
  if (
    !zoneEntity ||
    ["", "unknown", "unavailable"].includes(
      zoneEntity.state.trim().toLowerCase(),
    )
  ) {
    return [];
  }
  const rawIds = mower?.attributes?.available_zone_ids;
  const rawLabels = zoneEntity?.attributes?.options;
  if (
    !Array.isArray(rawIds) ||
    !Array.isArray(rawLabels) ||
    rawIds.length === 0 ||
    rawIds.length !== rawLabels.length
  ) {
    return [];
  }

  if (
    rawIds.some((value) => !isPositiveInteger(value)) ||
    rawLabels.some(
      (value) => typeof value !== "string" || value.trim().length === 0,
    )
  ) {
    return [];
  }

  const ids = rawIds as number[];
  const labels = rawLabels as string[];
  if (
    new Set(ids).size !== ids.length ||
    new Set(labels).size !== labels.length
  ) {
    return [];
  }

  return ids.map((id, index) => ({
    id,
    label: labels[index],
  }));
}

export function normalizedZoneSelection(
  choices: readonly ZoneChoice[],
  selectedIds: readonly number[] | undefined,
  fallbackId?: number,
): number[] {
  const availableIds = new Set(choices.map(({ id }) => id));
  if (selectedIds !== undefined) {
    const selected = new Set(
      selectedIds.filter((id) => availableIds.has(id)),
    );
    return choices
      .filter(({ id }) => selected.has(id))
      .map(({ id }) => id);
  }

  if (fallbackId !== undefined && availableIds.has(fallbackId)) {
    return [fallbackId];
  }
  return [];
}

export function zoneSelectionFallbackId(
  choices: readonly ZoneChoice[],
  selectedZoneId: number | undefined,
  currentLabel: string | undefined,
): number | undefined {
  if (
    selectedZoneId !== undefined &&
    choices.some(({ id }) => id === selectedZoneId)
  ) {
    return selectedZoneId;
  }
  return choices.find(({ label }) => label === currentLabel)?.id;
}

export function zoneSelectionLabels(
  choices: readonly ZoneChoice[],
  selectedIds: readonly number[],
): string[] {
  const selected = new Set(selectedIds);
  return choices
    .filter(({ id }) => selected.has(id))
    .map(({ label }) => label);
}

export function zonePreferenceChoice(
  choices: readonly ZoneChoice[],
  selectedIds: readonly number[],
  currentLabel: string | undefined,
  preferredId?: number,
): ZoneChoice | undefined {
  const selected = new Set(selectedIds);
  if (preferredId !== undefined) {
    const preferred = choices.find(
      ({ id }) => id === preferredId && selected.has(id),
    );
    if (preferred) {
      return preferred;
    }
  }

  const current = choices.find(
    ({ id, label }) => label === currentLabel && selected.has(id),
  );
  return current || choices.find(({ id }) => selected.has(id));
}

export function zoneSelectionKey(
  mowerEntityId: string,
  zoneEntityId: string,
  mower: ZoneEntity | undefined,
  mapEntity: ZoneEntity | undefined,
  choices: readonly ZoneChoice[],
): string | undefined {
  const attributes = mower?.attributes;
  if (!selectedMapIsCurrent(mower, mapEntity)) {
    return undefined;
  }
  const selectorLabel = mapLabelToken(mapEntity?.state);
  const mapIndex =
    mapIndexToken(attributes?.selected_map_index) ??
    mapIndexToken(attributes?.app_current_map_index);
  const mapLabel =
    selectorLabel ??
    mapLabelToken(attributes?.selected_map_label) ??
    mapLabelToken(attributes?.app_current_map_label);
  let mapIdentity: string | undefined;
  if (mapIndex !== undefined) {
    mapIdentity = `index:${mapIndex}`;
  } else if (mapLabel) {
    mapIdentity = `label:${encodeURIComponent(mapLabel)}`;
  }
  if (!mapIdentity) {
    return undefined;
  }

  const choiceIdentity = choices
    .map(({ id, label }) => `${id}:${encodeURIComponent(label)}`)
    .join(",");
  return [
    mowerEntityId,
    zoneEntityId,
    mapIdentity,
    choiceIdentity,
  ].join("|");
}

export function zoneMowingServiceData(
  mowerEntityId: string,
  selectedIds: readonly number[],
): { entity_id: string; zone_ids: number[] } | undefined {
  const entityId = mowerEntityId.trim();
  if (!entityId || !selectedIds.length) {
    return undefined;
  }
  const normalized = Array.from(new Set(selectedIds));
  if (normalized.some((id) => !isPositiveInteger(id))) {
    return undefined;
  }
  return {
    entity_id: entityId,
    zone_ids: normalized,
  };
}
