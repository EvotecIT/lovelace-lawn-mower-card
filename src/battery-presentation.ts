/** Accept only a finite percentage, not a status label or a different unit. */
export function batteryPercent(value?: string): number | undefined {
  if (!value || !/^\s*\d+(?:[.,]\d+)?\s*%?\s*$/.test(value)) return undefined;
  const percent = Number(value.trim().replace(/\s*%$/, "").replace(",", "."));
  return Number.isFinite(percent) && percent >= 0 && percent <= 100 ? percent : undefined;
}
