/**
 * Season totals come from Home Assistant's long-term statistics of the mower's
 * own lifetime counters, so they reach back further than the recent task list.
 */
export type SeasonMetric = "area" | "minutes" | "sessions";
export type SeasonSources = Partial<Record<SeasonMetric, string>>;
export type SeasonMonth = Record<SeasonMetric, number | null>;
export type Season = {
  year: number;
  /** The metric the month bars show: the first one that has any data. */
  chart: SeasonMetric;
  /** Twelve months of the current and previous year; null means not measured. */
  months: SeasonMonth[];
  previous: SeasonMonth[];
  total: SeasonMonth;
  previousTotal: SeasonMonth;
};

/** Dreame's names first; Husqvarna's lifetime cutting time is the same measure of mowing time. */
const SUFFIXES: Record<SeasonMetric, readonly string[]> = {
  area: ["total_mowed_area"], minutes: ["total_mowing_time", "total_cutting_time"], sessions: ["total_mowing_sessions"],
};
const COUNTER_CLASSES = ["total_increasing", "total"];
const METRICS: SeasonMetric[] = ["area", "minutes", "sessions"];

type Resolver = (domain: string, suffix: string) => string | undefined;

/** Only lifetime counters qualify; a measurement sensor has no meaningful monthly change. */
export function seasonSources(
  states: Record<string, { attributes?: Record<string, unknown> } | undefined>,
  resolve: Resolver,
): SeasonSources {
  const sources: SeasonSources = {};
  for (const metric of METRICS) {
    for (const suffix of SUFFIXES[metric]) {
      const entityId = resolve("sensor", suffix);
      if (entityId && COUNTER_CLASSES.includes(String(states[entityId]?.attributes?.state_class))) {
        sources[metric] = entityId;
        break;
      }
    }
  }
  return sources;
}

export function hasSeasonSources(sources: SeasonSources): boolean {
  return Object.values(sources).some(Boolean);
}

/** Midnight on 1 January of the previous year, so last season can be compared. */
export function seasonStart(now: Date): Date {
  return new Date(now.getFullYear() - 1, 0, 1);
}

const AREA_SQM: Record<string, number> = {
  "m²": 1, "km²": 1e6, "ha": 1e4, "cm²": 1e-4, "ft²": 0.09290304, "yd²": 0.83612736, "ac": 4046.8564224, "in²": 0.00064516,
};
const DURATION_MIN: Record<string, number> = { "ms": 1 / 60000, "s": 1 / 60, "min": 1, "h": 60, "d": 1440 };

/** Factor to the card's units (m², minutes, count), or undefined for a unit the card can't trust. */
export function seasonUnitFactor(metric: SeasonMetric, unit: unknown): number | undefined {
  if (metric === "sessions") return unit === null || unit === undefined || unit === "" ? 1 : undefined;
  return typeof unit === "string" ? (metric === "area" ? AREA_SQM : DURATION_MIN)[unit] : undefined;
}

const empty = (): SeasonMonth => ({ area: null, minutes: null, sessions: null });

/** Shape a `recorder/statistics_during_period` month response; undefined when nothing was mowed in either year. */
export function readSeason(
  statistics: unknown,
  units: Partial<Record<SeasonMetric, unknown>>,
  sources: SeasonSources,
  now: Date,
): Season | undefined {
  const year = now.getFullYear();
  const months = Array.from({ length: 12 }, empty), previous = Array.from({ length: 12 }, empty);
  const data = statistics !== null && typeof statistics === "object" ? statistics as Record<string, unknown> : {};
  for (const metric of METRICS) {
    const entityId = sources[metric], factor = seasonUnitFactor(metric, units[metric]);
    const rows = entityId ? data[entityId] : undefined;
    if (!factor || !Array.isArray(rows)) continue;
    for (const row of rows.slice(0, 48)) {
      const entry = row !== null && typeof row === "object" ? row as Record<string, unknown> : {};
      const start = typeof entry.start === "number" ? entry.start : Date.parse(String(entry.start));
      const change = entry.change;
      if (!Number.isFinite(start) || typeof change !== "number" || !Number.isFinite(change)) continue;
      // Months follow the server's time zone; mid-month keeps a browser in another zone on the right one.
      const at = new Date(start + 15 * 86_400_000), target = at.getFullYear() === year ? months : at.getFullYear() === year - 1 ? previous : undefined;
      if (!target || (target === months && at.getMonth() > now.getMonth())) continue;
      const month = target[at.getMonth()];
      // A counter reset is not negative mowing.
      month[metric] = (month[metric] ?? 0) + Math.max(0, change) * factor;
    }
  }
  const sum = (list: SeasonMonth[]): SeasonMonth => {
    const total = empty();
    for (const metric of METRICS) {
      const known = list.map((month) => month[metric]).filter((value): value is number => value !== null);
      total[metric] = known.length ? known.reduce((left, right) => left + right, 0) : null;
    }
    return total;
  };
  const total = sum(months), previousTotal = sum(previous);
  const chart = METRICS.find((metric) => (total[metric] ?? 0) > 0 || (previousTotal[metric] ?? 0) > 0);
  return chart ? { year, chart, months, previous, total, previousTotal } : undefined;
}
