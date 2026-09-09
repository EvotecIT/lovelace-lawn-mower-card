import { createTranslator, type Translator } from "./localization.ts";
import {
  entityMatchesDreameRole,
  type EntityRegistryPresentationMetadata,
} from "./entity-presentation.ts";

export type DeviceSettingControlGroup = "charging" | "rain" | "anti_theft";

export type DeviceSettingEntity = {
  state: string;
  attributes?: Record<string, unknown>;
};

export type DeviceSettingStatePresenter = (
  entityId: string,
  state: string,
) => string | undefined;

export type DeviceSettingEntityMetadata = Record<
  string,
  EntityRegistryPresentationMetadata | undefined
>;

const CHARGING_CONTROL_ROLES = [
  "charging_period",
  "charging_period_start",
  "charging_period_end",
] as const;

const RAIN_CONTROL_ROLES = [
  "rain_protection",
  "rain_delay",
] as const;

const ANTI_THEFT_CONTROL_ROLES = [
  "lift_alarm",
  "lift_alarm_enabled",
  "off_map_alarm",
  "off_map_alarm_enabled",
  "real_time_location",
  "real_time_location_enabled",
  "pin_check_before_power_off",
  "pin_check_before_power_off_enabled",
] as const;

const unavailableStates = new Set(["", "unknown", "unavailable"]);
const timePattern =
  /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.(\d{1,6}))?)?$/;

export function deviceSettingControlGroup(
  entityId: string,
  metadata?: EntityRegistryPresentationMetadata,
): DeviceSettingControlGroup | undefined {
  if (
    CHARGING_CONTROL_ROLES.some((role) =>
      entityMatchesDreameRole(entityId, metadata, role),
    )
  ) {
    return "charging";
  }
  if (
    RAIN_CONTROL_ROLES.some((role) =>
      entityMatchesDreameRole(entityId, metadata, role),
    )
  ) {
    return "rain";
  }
  if (
    ANTI_THEFT_CONTROL_ROLES.some((role) =>
      entityMatchesDreameRole(entityId, metadata, role),
    )
  ) {
    return "anti_theft";
  }
  return undefined;
}

export function isDeviceSettingControlEntity(
  entityId: string,
  metadata?: EntityRegistryPresentationMetadata,
): boolean {
  return deviceSettingControlGroup(entityId, metadata) !== undefined;
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
  role: string,
  metadata?: DeviceSettingEntityMetadata,
): string | undefined {
  const entityId = entityIds.find((candidate) =>
    entityMatchesDreameRole(candidate, metadata?.[candidate], role),
  );
  const state = entityId ? entities[entityId]?.state.trim() : undefined;
  return state && !unavailableStates.has(state.toLowerCase()) ? state : undefined;
}

export function deviceSettingsSummary(
  entities: Record<string, DeviceSettingEntity | undefined>,
  entityIds: readonly string[],
  t: Translator = createTranslator("en"),
  metadata?: DeviceSettingEntityMetadata,
  presentState?: DeviceSettingStatePresenter,
): string | undefined {
  const summary: string[] = [];
  const chargingEnabled = entityState(
    entities,
    entityIds,
    "charging_period",
    metadata,
  );
  const chargingStart = timeInputValue(
    entityState(entities, entityIds, "charging_period_start", metadata),
  );
  const chargingEnd = timeInputValue(
    entityState(entities, entityIds, "charging_period_end", metadata),
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

  const rainEnabled = entityState(
    entities,
    entityIds,
    "rain_protection",
    metadata,
  );
  const rainDelayEntityId = entityIds.find((candidate) =>
    entityMatchesDreameRole(candidate, metadata?.[candidate], "rain_delay"),
  );
  const rawRainDelay = entityState(
    entities,
    entityIds,
    "rain_delay",
    metadata,
  );
  const rainDelay =
    rawRainDelay && rainDelayEntityId
      ? presentState?.(rainDelayEntityId, rawRainDelay) ?? rawRainDelay
      : rawRainDelay;
  if (rainEnabled === "on") {
    summary.push(rainDelay ? t("settings.rainDelay", { delay: rainDelay }) : t("settings.rainOn"));
  } else if (rainEnabled === "off") {
    summary.push(t("settings.rainOff"));
  } else if (rainDelay) {
    summary.push(t("settings.rainDelay", { delay: rainDelay }));
  }

  const antiTheftIds = entityIds.filter(
    (entityId) =>
      deviceSettingControlGroup(entityId, metadata?.[entityId]) ===
      "anti_theft",
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
