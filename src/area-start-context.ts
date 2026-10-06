import type { HassEntity, LawnMowerActionConfig, LawnMowerCardConfig } from "./card-config.ts";
import { configuredActionStillAvailable } from "./card-customization.ts";
import type { AreaStartControl } from "./area-controls.ts";

/** The mower, controls and optional configured action that opened an area menu. */
export type AreaStartContext = {
  mowerEntityId: string;
  selectEntityId: string;
  startEntityId: string;
  action?: LawnMowerActionConfig;
};

/** A menu cannot outlive its mower, control pair or configured Start action. */
export function areaStartContextMatches(
  context: AreaStartContext,
  config: LawnMowerCardConfig | undefined,
  states: Record<string, HassEntity>,
  control: AreaStartControl | undefined,
): boolean {
  return Boolean(
    config?.entity === context.mowerEntityId &&
    control?.selectEntityId === context.selectEntityId &&
    control?.startEntityId === context.startEntityId &&
    (!context.action || configuredActionStillAvailable(context.action, config, states)),
  );
}
