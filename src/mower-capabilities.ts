import type { HassEntity } from "./card-config";

export const LawnMowerFeature = {
  START_MOWING: 1,
  PAUSE: 2,
  DOCK: 4,
  STOP: 8,
} as const;

export type LawnMowerFeatureValue =
  (typeof LawnMowerFeature)[keyof typeof LawnMowerFeature];

function supportedFeatures(entity: HassEntity): number | undefined {
  const raw = entity.attributes.supported_features;
  if (raw === undefined || raw === null) {
    return undefined;
  }
  const value = typeof raw === "number" ? raw : Number(raw);
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

/**
 * Reads Home Assistant's standard lawn_mower feature bitmask. Missing metadata
 * keeps legacy custom entities working; an explicit bitmask is authoritative.
 */
export function mowerSupportsFeature(
  entity: HassEntity,
  feature: LawnMowerFeatureValue,
): boolean {
  const features = supportedFeatures(entity);
  return features === undefined || (features & feature) === feature;
}

/**
 * Stop is newer than the bitmask itself, so an entity without metadata never gets it;
 * only an integration that advertises it does.
 */
export function mowerAdvertisesFeature(
  entity: HassEntity,
  feature: LawnMowerFeatureValue,
): boolean {
  const features = supportedFeatures(entity);
  return features !== undefined && (features & feature) === feature;
}
