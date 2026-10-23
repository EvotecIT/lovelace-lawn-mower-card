import type { HassEntity } from "./card-config";

export type MowingAutomationStatus = {
  configured: boolean;
  entryId: string;
  enabled: boolean;
  enableEntity?: string;
  canToggle: boolean;
  permitted: boolean;
  reason?: string;
  phase?: string;
  lastOutcome?: string;
};

/** Presentation of the integration-owned contract; never evaluate garden rules. */
export function mowingAutomationStatus(
  states: Record<string, HassEntity>, mowerId: string,
): MowingAutomationStatus | undefined {
  const mower = states[mowerId];
  const raw = mower?.attributes.mowing_automation;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const value = raw as Record<string, unknown>;
  if (value.version !== 1 || typeof value.entry_id !== "string" ||
      !/^[A-Za-z0-9_-]{1,128}$/.test(value.entry_id)) return undefined;
  const configured = value.configured === true;
  const enableEntity = typeof value.enable_entity === "string" &&
    /^switch\.[a-z0-9_]+$/.test(value.enable_entity) ? value.enable_entity : undefined;
  const enabledState = enableEntity ? states[enableEntity]?.state : undefined;
  const permission = typeof value.permission_entity === "string" &&
    value.permission_entity.startsWith("binary_sensor.") ? states[value.permission_entity] : undefined;
  const managed = mower.attributes.scheduled_automation;
  const ownManaged = managed && typeof managed === "object" && !Array.isArray(managed) &&
    (managed as Record<string, unknown>).permission_entity === value.permission_entity
    ? managed as Record<string, unknown> : undefined;
  const outcome = value.last_outcome && typeof value.last_outcome === "object" && !Array.isArray(value.last_outcome)
    ? value.last_outcome as Record<string, unknown> : undefined;
  const lastOutcome = outcome && typeof outcome.status === "string" && typeof outcome.reason === "string"
    ? `${outcome.status}: ${outcome.reason.replaceAll("_", " ")}${typeof outcome.detail === "string" ? ` — ${outcome.detail}` : ""}`
    : undefined;
  return {
    configured, entryId: value.entry_id,
    enabled: enabledState === "on", enableEntity,
    canToggle: configured && (enabledState === "on" || enabledState === "off"),
    permitted: permission?.state === "on",
    reason: typeof permission?.attributes.reason === "string" ? permission.attributes.reason
      : typeof value.reason === "string" ? value.reason : undefined,
    phase: typeof ownManaged?.phase === "string" ? ownManaged.phase : undefined,
    lastOutcome,
  };
}

export function mowingAutomationSetupPath(entryId: string): string {
  return `/config/integrations/integration/dreame_lawn_mower#config_entry=${encodeURIComponent(entryId)}`;
}
