import type { HomeAssistant, LawnMowerCardConfig } from "./card-config";
import { resolvedOwnedMowerCompanionEntity } from "./card-logic.ts";

export type RecentCondition = {
  message: string;
  severity: "error" | "warning";
  active: boolean | undefined;
  observedAt?: string;
};

/** Read the integration's bounded history; never infer clearance from mower activity. */
export function recentMowerConditions(
  hass: HomeAssistant, config: LawnMowerCardConfig,
): RecentCondition[] {
  if (config.show_recent_conditions === false) return [];
  const id = config.notification_entity || resolvedOwnedMowerCompanionEntity(
    hass.states, config.entity, hass.entities, "sensor", "last_mower_notification",
  );
  const recent = id ? hass.states[id]?.attributes.recent : undefined;
  if (!Array.isArray(recent)) return [];
  return recent.flatMap((entry): RecentCondition[] => {
    if (!entry || typeof entry !== "object" || typeof entry.message !== "string" ||
      !entry.message.trim() || !["error", "warning"].includes(entry.severity)) return [];
    const observedAt = typeof entry.observed_at === "string" &&
      Number.isFinite(Date.parse(entry.observed_at)) ? entry.observed_at : undefined;
    return [{ message: entry.message.trim().slice(0, 255), severity: entry.severity,
      active: typeof entry.active === "boolean" ? entry.active : undefined, observedAt }];
  }).slice(0, 5);
}
