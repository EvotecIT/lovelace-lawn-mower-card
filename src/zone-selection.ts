export type ZoneChoice = {
  id: number;
  label: string;
};

type ZoneEntity = {
  state: string;
  attributes?: Record<string, unknown>;
};

function isPositiveInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0
  );
}

export function zoneChoices(
  mower: ZoneEntity | undefined,
  zoneEntity: ZoneEntity | undefined,
): ZoneChoice[] {
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
  return choices.length ? [choices[0].id] : [];
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
