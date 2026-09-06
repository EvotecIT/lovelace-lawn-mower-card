import type { HomeAssistant, LawnMowerCardConfig } from "./card-config";

function configuredEntities(config: LawnMowerCardConfig): Set<string> {
  return new Set([
    config.entity, config.map_entity, config.camera_entity, config.status_entity,
    config.battery_entity, config.progress_entity, config.coverage_entity,
    config.coverage_total_entity, ...(config.control_entities || []),
    ...(config.summary_entities || []),
    ...(config.tiles || []).map((tile) => tile.entity),
    ...(config.actions || []).map((action) => action.entity),
  ].filter((value): value is string => Boolean(value)));
}

/** Ignore unrelated state updates without freezing discovery or renamed helpers. */
export function mowerHassChanged(
  previous: HomeAssistant | undefined,
  next: HomeAssistant | undefined,
  config: LawnMowerCardConfig | undefined,
): boolean {
  if (!previous || !next || !config) return true;
  if (
    previous.language !== next.language || previous.locale !== next.locale ||
    previous.entities !== next.entities || previous.services !== next.services
  ) return true;
  if (previous.states === next.states) return false;

  const explicit = configuredEntities(config);
  const objectId = config.entity.split(".", 2)[1];
  const owner = next.entities?.[config.entity]?.device_id;
  const ids = new Set([...Object.keys(previous.states), ...Object.keys(next.states)]);
  for (const id of ids) {
    if (previous.states[id] === next.states[id]) continue;
    // Mower additions/removals can change longest-name companion ownership.
    if (id.startsWith("lawn_mower.") && (!previous.states[id] || !next.states[id])) {
      return true;
    }
    if (explicit.has(id)) return true;
    if (owner && next.entities?.[id]?.device_id === owner) return true;
    const candidate = id.split(".", 2)[1];
    // Mirrors legacy prefix and integration-prefixed helper discovery. This
    // deliberately over-includes ambiguous names rather than missing an update.
    if (objectId && candidate && (
      candidate === objectId || candidate.startsWith(`${objectId}_`) ||
      candidate.includes(`_${objectId}_`)
    )) return true;
  }
  return false;
}
