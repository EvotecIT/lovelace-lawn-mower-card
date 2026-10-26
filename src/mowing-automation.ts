import type { HassEntity } from "./card-config";
import type { TranslationKey, Translator } from "./localization";

export type MowingAutomationOutcome = {
  status: string;
  reason: string;
  observedAt?: string;
};

export type MowingAutomationPlan = {
  /** ISO time of the next Schedule block start, when one is known. */
  nextStart?: string;
  wholeLawn: boolean;
  zones: string[];
  areaM2?: number;
  /** Integration reason when no zone would be requested. */
  reason?: string;
};

export type MowingAutomationStatus = {
  configured: boolean;
  entryId: string;
  enabled: boolean;
  enableEntity?: string;
  canToggle: boolean;
  permitted: boolean;
  reason?: string;
  phase?: string;
  lastOutcome?: MowingAutomationOutcome;
  scheduleEntity?: string;
  scheduleName?: string;
  rotation: boolean;
  targetEntity?: string;
  restDaysEntity?: string;
  maxAreaEntity?: string;
  plan?: MowingAutomationPlan;
};

const OBJECT = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : undefined;

const entityIn = (value: unknown, domain: string): string | undefined =>
  typeof value === "string" && new RegExp(`^${domain}\\.[a-z0-9_]+$`).test(value)
    ? value : undefined;

function friendlyName(states: Record<string, HassEntity>, entityId: string): string | undefined {
  const name = states[entityId]?.attributes.friendly_name;
  return typeof name === "string" && name.trim() ? name : undefined;
}

/** Integration reasons name entities by ID; show the names people chose instead. */
export function readableReason(states: Record<string, HassEntity>, reason: string): string {
  return reason.replace(/\b[a-z_]+\.[a-z0-9_]+\b/g, id => friendlyName(states, id) ?? id);
}

export const OUTCOME_STATUSES = new Set([
  "skipped", "deferred", "submitted", "started", "paused", "cancelled", "expired", "finished", "failed",
]);
const KNOWN_REASONS = new Set([
  "no_zone_due", "zone_history_unavailable", "external_permission_blocked",
  "external_permission_unknown", "external_permission_stale", "low_battery",
]);

/** Integration reasons stay readable without the card guessing their meaning. */
export function automationReason(reason: string, t: Translator): string {
  return KNOWN_REASONS.has(reason)
    ? t(`automation.reason.${reason}` as TranslationKey) : reason.replaceAll("_", " ");
}

function planFrom(value: unknown): MowingAutomationPlan | undefined {
  const plan = OBJECT(value);
  if (!plan) return undefined;
  const zones = Array.isArray(plan.zones) ? plan.zones.flatMap(item => {
    const zone = OBJECT(item);
    const label = zone && typeof zone.label === "string" && zone.label ? zone.label
      : zone && typeof zone.zone_id === "number" ? `#${zone.zone_id}` : undefined;
    return label ? [label] : [];
  }) : [];
  const start = typeof plan.next_start === "string" && !Number.isNaN(Date.parse(plan.next_start))
    ? plan.next_start : undefined;
  return {
    nextStart: start,
    wholeLawn: plan.task_type === "all",
    zones,
    areaM2: typeof plan.area_m2 === "number" && Number.isFinite(plan.area_m2) ? plan.area_m2 : undefined,
    reason: typeof plan.reason === "string" && plan.reason ? plan.reason : undefined,
  };
}

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
  const outcome = OBJECT(value.last_outcome);
  const lastOutcome = outcome && typeof outcome.status === "string" && typeof outcome.reason === "string"
    ? { status: outcome.status, reason: outcome.reason,
      observedAt: typeof outcome.observed_at === "string" ? outcome.observed_at : undefined }
    : undefined;
  const scheduleEntity = entityIn(value.schedule_entity, "schedule");
  const reason = typeof permission?.attributes.reason === "string" ? permission.attributes.reason
    : typeof value.reason === "string" ? value.reason : undefined;
  return {
    configured, entryId: value.entry_id,
    enabled: enabledState === "on", enableEntity,
    canToggle: configured && (enabledState === "on" || enabledState === "off"),
    permitted: permission?.state === "on",
    reason: reason === undefined ? undefined : readableReason(states, reason),
    phase: typeof ownManaged?.phase === "string" ? ownManaged.phase : undefined,
    lastOutcome,
    scheduleEntity,
    scheduleName: scheduleEntity ? friendlyName(states, scheduleEntity) ?? scheduleEntity : undefined,
    rotation: value.mowing_target === "rotation",
    targetEntity: entityIn(value.target_entity, "select"),
    restDaysEntity: entityIn(value.rest_days_entity, "number"),
    maxAreaEntity: entityIn(value.max_area_entity, "number"),
    plan: planFrom(value.plan),
  };
}

export function mowingAutomationSetupPath(entryId: string): string {
  return `/config/integrations/integration/dreame_lawn_mower#config_entry=${encodeURIComponent(entryId)}`;
}
