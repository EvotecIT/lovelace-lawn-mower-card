/** What to mow, as one draft saved with the dialog's other changes. */
import type { Translator } from "./localization";
import type { MowingAutomationStatus } from "./mowing-automation";

export type RotationDraft = {
  target: "all" | "rotation";
  /** Default rest days: 0 mows every day, 1 every other day. */
  restDays: number;
  /** Square metres per start; 0 = no limit. */
  maxArea: number;
  /** A zone's own rest days; zones absent use the default. */
  zoneRestDays: Record<number, number>;
};

export type ServiceCall = {
  domain: string;
  service: string;
  data: Record<string, unknown>;
  /** Saved baseline once this individual service call is acknowledged. */
  applied: RotationDraft;
};

export const MAX_REST_DAYS = 30;

/** The current settings, when the integration advertises their controls. */
export function rotationDraft(model: MowingAutomationStatus): RotationDraft | undefined {
  if (!model.targetEntity || !model.restDaysEntity || !model.maxAreaEntity ||
    model.defaultRestDays === undefined || model.rotationMaxArea === undefined) return undefined;
  return {
    target: model.rotation ? "rotation" : "all",
    restDays: model.defaultRestDays,
    maxArea: model.rotationMaxArea,
    zoneRestDays: Object.fromEntries(model.rotationZones
      .filter(zone => zone.customRestDays).map(zone => [zone.zoneId, zone.restDays])),
  };
}

export function sameRotation(first?: RotationDraft, second?: RotationDraft): boolean {
  if (!first || !second) return first === second;
  const zones = (draft: RotationDraft) => JSON.stringify(Object.entries(draft.zoneRestDays)
    .map(([zone, days]) => [Number(zone), days]).sort((a, b) => a[0] - b[0]));
  return first.target === second.target && first.restDays === second.restDays &&
    first.maxArea === second.maxArea && zones(first) === zones(second);
}

/** The service calls that turn ``original`` into ``draft``; none apply a reload. */
export function rotationServiceCalls(
  model: MowingAutomationStatus, entityId: string, original: RotationDraft, draft: RotationDraft,
): ServiceCall[] {
  if ((draft.target !== original.target && !model.targetEntity) ||
    (draft.restDays !== original.restDays && !model.restDaysEntity) ||
    (draft.maxArea !== original.maxArea && !model.maxAreaEntity)) {
    throw new Error("Mowing controls are unavailable. Reopen the dialog and try again.");
  }
  const calls: ServiceCall[] = [];
  let applied = original;
  if (draft.target !== original.target && model.targetEntity) {
    applied = { ...applied, target: draft.target };
    calls.push({
      domain: "select", service: "select_option", data: { entity_id: model.targetEntity, option: draft.target },
      applied,
    });
  }
  if (draft.restDays !== original.restDays && model.restDaysEntity) {
    applied = { ...applied, restDays: draft.restDays };
    calls.push({
      domain: "number", service: "set_value", data: { entity_id: model.restDaysEntity, value: draft.restDays },
      applied,
    });
  }
  if (draft.maxArea !== original.maxArea && model.maxAreaEntity) {
    applied = { ...applied, maxArea: draft.maxArea };
    calls.push({
      domain: "number", service: "set_value", data: { entity_id: model.maxAreaEntity, value: draft.maxArea },
      applied,
    });
  }
  const zones = new Set([...Object.keys(original.zoneRestDays), ...Object.keys(draft.zoneRestDays)].map(Number));
  for (const zoneId of [...zones].sort((a, b) => a - b)) {
    const before = original.zoneRestDays[zoneId];
    const after = draft.zoneRestDays[zoneId];
    if (before === after) continue;
    applied = withZoneRestDays(applied, zoneId, after);
    calls.push({
      domain: "dreame_lawn_mower", service: "set_rotation_zone_rest_days",
      data: { entity_id: entityId, zone_id: zoneId,
        ...(model.rotationMapIndex === undefined ? {} : { map_index: model.rotationMapIndex }),
        ...(after === undefined ? {} : { rest_days: after }) },
      applied,
    });
  }
  return calls;
}

/** A zone's own rest days, or undefined to use the default again. */
export function withZoneRestDays(draft: RotationDraft, zoneId: number, restDays: number | undefined): RotationDraft {
  const zoneRestDays = { ...draft.zoneRestDays };
  if (restDays === undefined) delete zoneRestDays[zoneId];
  else zoneRestDays[zoneId] = restDays;
  return { ...draft, zoneRestDays };
}

/** Rest days read as a frequency: 0 = every day, 1 = every 2 days. */
export function frequencyLabel(restDays: number, t: Translator): string {
  return restDays === 0 ? t("automation.everyDay") : t("automation.everyNDays", { count: restDays + 1 });
}
