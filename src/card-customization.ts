import type { ContentMode, DisplayCondition, HassEntity, HomeAssistant, LawnMowerCardConfig, LawnMowerTileConfig } from "./card-config.ts";
import { isPreferenceControlEntity } from "./card-logic.ts";
import { isDeviceSettingControlEntity } from "./device-settings-controls.ts";

export const HERO_SECTIONS = ["controls", "tiles", "actions", "details"] as const;
export type HeroSection = typeof HERO_SECTIONS[number];

/** Omitted modes preserve existing dashboards, including automatic discovery. */
export function contentMode(value: unknown, fallback: ContentMode): ContentMode {
  return value === "auto" || value === "append" || value === "custom" || value === "hidden" ? value : fallback;
}

export function selectContent<T>(mode: ContentMode, configured: T[], automatic: T[]): T[] {
  return mode === "hidden" ? [] : mode === "custom" ? configured : mode === "auto" ? automatic : [...configured, ...automatic];
}

export function summaryConfig(item: string | LawnMowerTileConfig): LawnMowerTileConfig {
  return typeof item === "string" ? { entity: item } : item;
}

export function conditionMatches(condition: DisplayCondition | undefined, states: Record<string, HassEntity>): boolean {
  if (!condition) return true;
  const state = states[condition.entity]?.state;
  return state !== undefined && state !== "unavailable" && state !== "unknown" && state === condition.state;
}

export function heroSections(configured: LawnMowerCardConfig["hero_sections"]): HeroSection[] {
  return configured === undefined ? [...HERO_SECTIONS] : [...new Set(configured.filter(item => HERO_SECTIONS.includes(item)))];
}

/** Clamp untrusted YAML without introducing CSS values from configuration. */
export function tileColumns(value: unknown): number | undefined {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 4 ? value : undefined;
}

export type DisplayTile = { label: string; value: string; icon?: string; unavailable?: boolean };
export type DisplayAction = { label: string; icon?: string; disabled: boolean; handler: () => Promise<void> | void };

/** Keep all configured chips, deduplicate repeated text, and retain the legacy automatic cap. */
export function summaryItems(configured: DisplayTile[], automatic: DisplayTile[], mode: ContentMode, limitAutomatic = false): DisplayTile[] {
  const seen = new Set<string>();
  const items = selectContent(mode, configured, automatic).filter(item => {
    const text = `${item.label} ${item.value}`.trim();
    if (seen.has(text)) return false;
    seen.add(text);
    return true;
  });
  return limitAutomatic ? items.slice(0,4) : items;
}

/** Explicit modes preserve list order, including controls normally grouped by discovery. */
export function controlGroups(
  entityIds: string[],
  config: LawnMowerCardConfig,
  metadata?: HomeAssistant["entities"],
) {
  const explicit = config.controls_mode === "custom" || config.controls_mode === "append"
    ? new Set(config.control_entities || []) : new Set<string>();
  const isDeviceSetting = (entityId: string) =>
    isDeviceSettingControlEntity(entityId, metadata?.[entityId]);
  return {
    inline: entityIds.filter(id => explicit.has(id) || (!isPreferenceControlEntity(id) && !isDeviceSetting(id))),
    preferences: entityIds.filter(id => !explicit.has(id) && isPreferenceControlEntity(id)),
    settings: entityIds.filter(id => !explicit.has(id) && isDeviceSetting(id)),
  };
}

/** Read state/attributes once for all layouts; never display objects as [object Object]. */
export function configuredTile(
  config: LawnMowerTileConfig,
  states: Record<string, HassEntity>,
  friendlyState: (entity: HassEntity) => string,
  unavailableLabel: string,
  friendlyAttribute?: (
    entity: HassEntity,
    attribute: string,
    value: unknown,
  ) => string,
): DisplayTile | undefined {
  if (!conditionMatches(config.visibility, states)) return undefined;
  const entity = states[config.entity];
  const raw = config.attribute ? entity?.attributes[config.attribute] : entity?.state;
  const unavailable = !entity || ["unknown", "unavailable"].includes(entity.state) || raw === undefined || raw === null || typeof raw === "object";
  if (unavailable && !config.show_unavailable) return undefined;
  const label = config.label || (typeof entity?.attributes.friendly_name === "string" ? entity.attributes.friendly_name : config.entity);
  const icon = config.icon || (typeof entity?.attributes.icon === "string" ? entity.attributes.icon : undefined);
  const value = unavailable
    ? unavailableLabel
    : config.attribute
      ? config.unit !== undefined
        ? `${String(raw)}${config.unit ? ` ${config.unit}` : ""}`
        : friendlyAttribute?.(entity!, config.attribute, raw) ?? String(raw)
      : config.unit !== undefined
        ? `${String(raw)}${config.unit ? ` ${config.unit}` : ""}`
        : friendlyState(entity!);
  return { label, icon, value, unavailable };
}
