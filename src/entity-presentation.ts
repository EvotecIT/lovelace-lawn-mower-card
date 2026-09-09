import type { HassEntity, HomeAssistant } from "./card-config";
import {
  normalizeLocale,
  type SupportedLocale,
  type TranslationKey,
  type Translator,
} from "./localization.ts";

const MOWER_STATES: Readonly<Record<string, TranslationKey>> = {
  unknown: "common.unknown",
  mowing: "state.mowing",
  idle: "state.idle",
  paused: "state.paused",
  error: "common.error",
  returning: "state.returning",
  charging: "state.charging",
  building: "state.building",
  "charging completed": "state.chargingCompleted",
  upgrading: "state.upgrading",
  "mow summon": "state.mowSummon",
  "station reset": "state.stationReset",
  "remote control": "state.remoteControl",
  "smart charging": "state.smartCharging",
  "second mowing": "state.secondMowing",
  "human following": "state.humanFollowing",
  "spot mowing": "state.spotMowing",
  "waiting for task": "state.waitingForTask",
  "station cleaning": "state.stationCleaning",
  shortcut: "state.shortcut",
  monitoring: "state.monitoring",
  "monitoring paused": "state.monitoringPaused",
};

const MOWING_ACTIONS: Readonly<Record<string, TranslationKey>> = {
  "all area": "option.allArea",
  edge: "option.edgeMowing",
  zone: "option.zoneMowing",
  spot: "option.spotMowing",
};

const PREFERENCE_MODES: Readonly<Record<string, TranslationKey>> = {
  global: "option.global",
  custom: "option.custom",
};

const EFFICIENCY_MODES: Readonly<Record<string, TranslationKey>> = {
  standard: "option.standard",
  efficient: "option.efficient",
};

const DIRECTION_MODES: Readonly<Record<string, TranslationKey>> = {
  none: "option.none",
  "mow at angle": "option.mowAtAngle",
  checkerboard: "option.checkerboard",
};

const EDGE_STYLES: Readonly<Record<string, TranslationKey>> = {
  "lawn care": "option.lawnCare",
  efficient: "option.efficient",
};

const VOICE_LANGUAGE_CODES: Readonly<Record<string, string>> = {
  english: "en",
  chinese: "zh",
  german: "de",
  french: "fr",
  italian: "it",
  spanish: "es",
  portuguese: "pt",
  norwegian: "no",
  swedish: "sv",
  danish: "da",
  finnish: "fi",
  dutch: "nl",
  turkish: "tr",
  polish: "pl",
  russian: "ru",
  lithuanian: "lt",
};

function normalizedValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function translatedOption(
  options: Readonly<Record<string, TranslationKey>>,
  value: string,
  t: Translator,
): string | undefined {
  const key = options[value];
  return key ? t(key) : undefined;
}

/** True only when Home Assistant's formatter uses the card's effective locale. */
export function homeAssistantLocaleMatches(
  hass: HomeAssistant,
  locale: SupportedLocale,
): boolean {
  const homeAssistantLocale =
    normalizeLocale(hass.locale?.language) ?? normalizeLocale(hass.language);
  return homeAssistantLocale !== undefined && homeAssistantLocale === locale;
}

/** Use Home Assistant's own locale-aware state formatter when the host provides it. */
export function homeAssistantState(
  hass: HomeAssistant,
  entity: HassEntity,
  state?: string,
): string | undefined {
  if (typeof hass.formatEntityState !== "function") return undefined;
  try {
    const formatted = hass.formatEntityState(entity, state);
    return typeof formatted === "string" && formatted.trim()
      ? formatted
      : undefined;
  } catch {
    return undefined;
  }
}

/** Use Home Assistant's translated state-attribute formatter when available. */
export function homeAssistantAttributeValue(
  hass: HomeAssistant,
  entity: HassEntity,
  attribute: string,
  value: unknown,
): string | undefined {
  if (typeof hass.formatEntityAttributeValue !== "function") return undefined;
  try {
    const formatted = hass.formatEntityAttributeValue(entity, attribute, value);
    return typeof formatted === "string" && formatted.trim()
      ? formatted
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Translate fixed Dreame select values that predate Home Assistant's entity-state
 * translation contract. Dynamic map, zone, spot, and maintenance-point names are
 * intentionally returned unchanged because they are user or mower supplied.
 */
export function translatedDreameEntityValue(
  entityId: string,
  rawValue: string,
  locale: SupportedLocale,
  t: Translator,
): string | undefined {
  const value = normalizedValue(rawValue);

  if (entityId.endsWith("_state_name")) {
    return translatedOption(MOWER_STATES, value, t);
  }

  if (
    entityId.endsWith("_mowing_action") ||
    entityId.endsWith("_selected_mowing_action")
  ) {
    return translatedOption(MOWING_ACTIONS, value, t);
  }

  if (
    entityId.endsWith("_selected_map_display_rotation") ||
    entityId.endsWith("_selected_map_rotation")
  ) {
    const rotation = value.match(/^(0|90|180|270)(?: degrees?)?( clockwise)?$/);
    if (rotation) {
      const degrees = rotation[1];
      return rotation[2]
        ? t("option.rotationClockwise", { degrees })
        : `${degrees}°`;
    }
  }

  if (entityId.endsWith("_selected_map_preference_mode")) {
    return translatedOption(PREFERENCE_MODES, value, t);
  }

  if (
    entityId.endsWith("_selected_mowing_efficiency") ||
    entityId.endsWith("_selected_efficient_mode") ||
    entityId.endsWith("_selected_zone_efficiency_mode")
  ) {
    return translatedOption(EFFICIENCY_MODES, value, t);
  }

  if (
    entityId.endsWith("_selected_mowing_direction_mode") ||
    entityId.endsWith("_selected_zone_direction_mode")
  ) {
    return translatedOption(DIRECTION_MODES, value, t);
  }

  if (
    entityId.endsWith("_selected_turning_method") ||
    entityId.endsWith("_selected_edge_cutting_style") ||
    entityId.endsWith("_selected_edge_mowing_walk_mode")
  ) {
    return translatedOption(EDGE_STYLES, value, t);
  }

  if (entityId.endsWith("_rain_delay")) {
    if (value === "until manually started") {
      return t("option.untilManuallyStarted");
    }
    const duration = value.match(/^(\d+) hours?$/);
    if (duration) {
      return t("option.hours", { count: Number(duration[1]) });
    }
  }

  if (entityId.endsWith("_voice_language")) {
    const language = VOICE_LANGUAGE_CODES[value];
    if (!language) return undefined;
    try {
      return new Intl.DisplayNames(locale, { type: "language" }).of(language);
    } catch {
      return undefined;
    }
  }

  return entityId.startsWith("select.") ? rawValue : undefined;
}
