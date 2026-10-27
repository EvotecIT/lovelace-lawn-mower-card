const separator = /^[\s:·|\-–—]+/;

/**
 * Removes the mower's own name from the front of a related entity's name, so
 * "Dreame A2 Bodzio Mowing action" reads "Mowing action" on the card.
 */
export function withoutDevicePrefix(name: string, deviceNames: ReadonlyArray<string | undefined>): string {
  const trimmed = name.trim();
  for (const device of deviceNames) {
    const prefix = device?.trim();
    if (!prefix || !trimmed.toLowerCase().startsWith(prefix.toLowerCase())) continue;
    const remainder = trimmed.slice(prefix.length);
    if (!separator.test(remainder)) continue;
    const rest = remainder.replace(separator, "");
    if (rest) return rest[0].toLocaleUpperCase() + rest.slice(1);
  }
  return trimmed;
}
