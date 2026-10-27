import type { HassEntity, HomeAssistant, LawnMowerCardConfig } from "./card-config";
import { resolvedMowerCompanionEntity } from "./card-logic.ts";
import type { TranslationKey, Translator } from "./localization";
import type { MowerAlert } from "./mower-alerts.ts";

/** The mower's config entry as HA's config_entries/get reports it. */
export type IntegrationStatus = {
  entryId: string;
  domain: string;
  state: string;
  reason?: string;
  disabledBy?: string;
};

const ENTRY_STATES = new Set(["not_loaded", "setup_error", "setup_retry", "migration_error", "failed_unload", "setup_in_progress"]);
const GONE = new Set(["unavailable", "unknown"]);

/** Picks the mower's entry from config_entries/get, via its device when HA shares devices. */
export function integrationStatus(
  entries: unknown, hass: Pick<HomeAssistant, "entities" | "devices">, mowerId: string,
): IntegrationStatus | undefined {
  if (!Array.isArray(entries)) return undefined;
  const valid = entries.filter((entry): entry is Record<string, unknown> =>
    Boolean(entry) && typeof entry === "object" && typeof (entry as Record<string, unknown>).entry_id === "string");
  const deviceId = hass.entities?.[mowerId]?.device_id;
  const deviceEntries = deviceId ? hass.devices?.[deviceId]?.config_entries : undefined;
  const entry = (deviceEntries && valid.find(item => deviceEntries.includes(item.entry_id as string))) ??
    (valid.length === 1 ? valid[0] : undefined);
  if (!entry) return undefined;
  return {
    entryId: entry.entry_id as string,
    domain: typeof entry.domain === "string" ? entry.domain : "",
    state: typeof entry.state === "string" ? entry.state : "",
    reason: typeof entry.reason === "string" && entry.reason.trim() ? entry.reason.trim() : undefined,
    disabledBy: typeof entry.disabled_by === "string" ? entry.disabled_by : undefined,
  };
}

/** "5 minutes ago", "2 hours ago", "3 days ago" in the card's language. */
export function lastSeen(value: unknown, locale: string, now: Date): string | undefined {
  if (typeof value !== "string") return undefined;
  const at = Date.parse(value);
  if (!Number.isFinite(at)) return undefined;
  const minutes = Math.round((at - now.getTime()) / 60000);
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (Math.abs(minutes) < 60) return format.format(Math.min(minutes, 0), "minute");
  const hours = Math.round(minutes / 60);
  return Math.abs(hours) < 48 ? format.format(hours, "hour") : format.format(Math.round(hours / 24), "day");
}

/**
 * Why the card has nothing to show when the mower is unreachable: the integration
 * isn't running (with HA's own reason when the entry could be read), or it runs but the
 * mower or the cloud is offline. Returns the one line that explains it, or nothing.
 */
export function availabilityAlert(
  hass: Pick<HomeAssistant, "states" | "entities">,
  config: LawnMowerCardConfig,
  t: Translator,
  locale: string,
  now: Date,
  integration?: IntegrationStatus,
): MowerAlert | undefined {
  const mower = hass.states[config.entity];
  if (!mower) return undefined;
  const companion = (suffix: string): HassEntity | undefined => {
    const id = resolvedMowerCompanionEntity(hass.states, config.entity, hass.entities, "binary_sensor", suffix);
    return id ? hass.states[id] : undefined;
  };
  const integrationPage = integration
    ? `/config/integrations/integration/${encodeURIComponent(integration.domain)}#config_entry=${encodeURIComponent(integration.entryId)}`
    : undefined;

  if (GONE.has(mower.state)) {
    const down = integration ? integration.state !== "loaded" : mower.attributes.restored === true;
    if (down) {
      const status = integration?.disabledBy ? t("alerts.entryDisabled")
        : integration && ENTRY_STATES.has(integration.state) ? t(`alerts.entry.${integration.state}` as TranslationKey) : undefined;
      return {
        key: "integration", severity: "error", icon: "mdi:connection",
        title: t("alerts.integrationDown"),
        detail: [status, integration?.reason].filter(Boolean).join(" · ") || t("alerts.integrationRestored"),
        entityId: config.entity, path: integrationPage,
      };
    }
    const seen = lastSeen(mower.last_changed ?? mower.last_updated, locale, now);
    return {
      key: "offline", severity: "error", icon: "mdi:wifi-off", title: t("alerts.offline"),
      detail: seen ? t("alerts.lastSeen", { time: seen }) : t("alerts.offlineDetail"),
      entityId: config.entity,
    };
  }

  // The integration is running, but reports the mower or the cloud unreachable.
  const cloud = companion("cloud_connected");
  if (cloud?.state === "off") {
    return {
      key: "offline", severity: "warning", icon: "mdi:cloud-off-outline", title: t("alerts.cloudOffline"),
      detail: t("alerts.cloudOfflineDetail"), entityId: cloud.entity_id,
    };
  }
  // The first connection sensor with a usable state; an unavailable one says nothing.
  const online = [companion("device_connected"), companion("online")]
    .find(sensor => sensor && !GONE.has(sensor.state));
  if (online?.state === "off") {
    const seen = lastSeen(online.last_changed ?? online.last_updated, locale, now);
    return {
      key: "offline", severity: "warning", icon: "mdi:wifi-off", title: t("alerts.offline"),
      detail: seen ? t("alerts.lastSeen", { time: seen }) : t("alerts.offlineDetail"), entityId: online.entity_id,
    };
  }
  return undefined;
}
