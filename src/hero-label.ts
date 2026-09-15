/** Resolve the optional text shown above the Cinematic Hero title. */
export function resolveHeroLabel(
  configuredLabel: unknown,
  showLabel: unknown,
  fallback: string,
): string | undefined {
  if (showLabel === false) {
    return undefined;
  }
  if (typeof configuredLabel !== "string") {
    return fallback;
  }
  return configuredLabel.trim() || fallback;
}
