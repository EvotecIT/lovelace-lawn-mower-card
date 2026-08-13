import { createTranslator, type Translator } from "./localization.ts";

export type DeviceSettingControlGroup = "charging" | "rain" | "anti_theft";

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

const ANTI_THEFT_CONTROL_SUFFIXES = [
  "_lift_alarm",
  "_lift_alarm_enabled",
  "_off_map_alarm",
  "_off_map_alarm_enabled",
  "_real_time_location",
  "_real_time_location_enabled",
  "_pin_check_before_power_off",
  "_pin_check_before_power_off_enabled",
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
  if (ANTI_THEFT_CONTROL_SUFFIXES.some((suffix) => entityId.endsWith(suffix))) {
    return "anti_theft";
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
  t: Translator = createTranslator("en"),
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
        ? t("settings.chargingPeriod", { start: chargingStart, end: chargingEnd })
        : t("settings.chargingOn"),
    );
  } else if (chargingEnabled === "off") {
    summary.push(t("settings.chargingOff"));
  } else if (chargingStart && chargingEnd) {
    summary.push(t("settings.chargingPeriod", { start: chargingStart, end: chargingEnd }));
  }

  const rainEnabled = entityState(entities, entityIds, "_rain_protection");
  const rainDelay = entityState(entities, entityIds, "_rain_delay");
  if (rainEnabled === "on") {
    summary.push(rainDelay ? t("settings.rainDelay", { delay: rainDelay }) : t("settings.rainOn"));
  } else if (rainEnabled === "off") {
    summary.push(t("settings.rainOff"));
  } else if (rainDelay) {
    summary.push(t("settings.rainDelay", { delay: rainDelay }));
  }

  const antiTheftIds = entityIds.filter(
    (entityId) => deviceSettingControlGroup(entityId) === "anti_theft",
  );
  const antiTheftStates = antiTheftIds
    .map((entityId) => entities[entityId]?.state.trim().toLowerCase())
    .filter(
      (state): state is string =>
        Boolean(state && !unavailableStates.has(state)),
    );
  if (antiTheftStates.length) {
    const enabled = antiTheftStates.filter((state) => state === "on").length;
    summary.push(t("settings.antiTheftSummary", { enabled, total: antiTheftStates.length }));
  }

  return summary.length ? summary.join(" · ") : undefined;
}
