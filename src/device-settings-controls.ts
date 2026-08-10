export type DeviceSettingControlGroup = "charging" | "rain";

export type DeviceSettingEntity = {
  state: string;
  attributes?: Record<string, unknown>;
};

const CHARGING_CONTROL_SUFFIXES = [
  "_charging_period",
  "_charging_period_start",
  "_charging_period_end",
] as const;

const RAIN_CONTROL_SUFFIXES = [
  "_rain_protection",
  "_rain_delay",
] as const;

const unavailableStates = new Set(["", "unknown", "unavailable"]);
const timePattern =
  /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.(\d{1,6}))?)?$/;

export function deviceSettingControlGroup(
  entityId: string,
): DeviceSettingControlGroup | undefined {
  if (CHARGING_CONTROL_SUFFIXES.some((suffix) => entityId.endsWith(suffix))) {
    return "charging";
  }
  if (RAIN_CONTROL_SUFFIXES.some((suffix) => entityId.endsWith(suffix))) {
    return "rain";
  }
  return undefined;
}

export function isDeviceSettingControlEntity(entityId: string): boolean {
  return deviceSettingControlGroup(entityId) !== undefined;
}

function normalizedTimeValue(
  value: unknown,
  maxFractionDigits: number,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const match = value.trim().match(timePattern);
  if (!match) {
    return undefined;
  }
  const [, hours, minutes, seconds, rawFraction] = match;
  const fraction = rawFraction?.replace(/0+$/, "");
  if (fraction && fraction.length > maxFractionDigits) {
    return undefined;
  }
  if (!seconds || (seconds === "00" && !fraction)) {
    return `${hours}:${minutes}`;
  }
  return `${hours}:${minutes}:${seconds}${fraction ? `.${fraction}` : ""}`;
}

export function timeInputValue(value: unknown): string | undefined {
  return normalizedTimeValue(value, 3);
}

export function timeInputStep(value: string): string {
  if (value.includes(".")) {
    return "any";
  }
  return value.split(":").length === 3 ? "1" : "60";
}

export function timeServiceValue(value: unknown): string | undefined {
  const normalized = normalizedTimeValue(value, 6);
  if (!normalized) {
    return undefined;
  }
  return normalized.split(":").length === 2
    ? `${normalized}:00`
    : normalized;
}

function entityState(
  entities: Record<string, DeviceSettingEntity | undefined>,
  entityIds: readonly string[],
  suffix: string,
): string | undefined {
  const entityId = entityIds.find((candidate) => candidate.endsWith(suffix));
  const state = entityId ? entities[entityId]?.state.trim() : undefined;
  return state && !unavailableStates.has(state.toLowerCase()) ? state : undefined;
}

export function deviceSettingsSummary(
  entities: Record<string, DeviceSettingEntity | undefined>,
  entityIds: readonly string[],
): string | undefined {
  const summary: string[] = [];
  const chargingEnabled = entityState(
    entities,
    entityIds,
    "_charging_period",
  );
  const chargingStart = timeInputValue(
    entityState(entities, entityIds, "_charging_period_start"),
  );
  const chargingEnd = timeInputValue(
    entityState(entities, entityIds, "_charging_period_end"),
  );
  if (chargingEnabled === "on") {
    summary.push(
      chargingStart && chargingEnd
        ? `Charging ${chargingStart}–${chargingEnd}`
        : "Charging on",
    );
  } else if (chargingEnabled === "off") {
    summary.push("Charging off");
  } else if (chargingStart && chargingEnd) {
    summary.push(`Charging ${chargingStart}–${chargingEnd}`);
  }

  const rainEnabled = entityState(entities, entityIds, "_rain_protection");
  const rainDelay = entityState(entities, entityIds, "_rain_delay");
  if (rainEnabled === "on") {
    summary.push(rainDelay ? `Rain ${rainDelay}` : "Rain protection on");
  } else if (rainEnabled === "off") {
    summary.push("Rain protection off");
  } else if (rainDelay) {
    summary.push(`Rain ${rainDelay}`);
  }

  return summary.length ? summary.join(" · ") : undefined;
}
