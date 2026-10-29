import { css, html, nothing, type TemplateResult } from "lit";
import type { ScheduleControl } from "./schedule-controls.ts";
import type { Translator } from "./localization";

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
/** Daily forecast conditions in which a mower with rain protection won't start. */
const WET = new Set(["rainy", "pouring", "lightning-rainy", "snowy-rainy", "hail"]);
/** From this chance of precipitation a run is shown as likely skipped. */
export const RAIN_LIKELY = 60;

export type DayForecast = { probability?: number; condition?: string };

export type PlanRun = {
  /** HH:MM, or undefined when the plan runs that day but its time can't be placed. */
  time?: string;
  label: string;
};

export type PlanDay = {
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  runs: PlanRun[];
  forecast?: DayForecast;
  rainLikely: boolean;
};

const localDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** Daily forecasts by local date; HA sends each day's datetime as an ISO timestamp. */
export function forecastByDay(items: unknown): Map<string, DayForecast> {
  const days = new Map<string, DayForecast>();
  if (!Array.isArray(items)) return days;
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const entry = item as Record<string, unknown>;
    const at = typeof entry.datetime === "string" ? new Date(entry.datetime) : undefined;
    if (!at || Number.isNaN(at.getTime())) continue;
    const probability = typeof entry.precipitation_probability === "number" &&
      Number.isFinite(entry.precipitation_probability) ? entry.precipitation_probability : undefined;
    const condition = typeof entry.condition === "string" ? entry.condition : undefined;
    days.set(localDate(at), { probability, condition });
  }
  return days;
}

export function rainLikely(forecast?: DayForecast): boolean {
  if (!forecast) return false;
  return (forecast.probability ?? 0) >= RAIN_LIKELY || (forecast.condition !== undefined && WET.has(forecast.condition));
}

const weekdayKey = (value: string) => value.trim().slice(0, 3).toLowerCase();
const hhmm = (value: string): string | undefined => {
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : undefined;
};

/**
 * Which start times belong to which weekday. Newer integration switches supply exact
 * task pairs. Older switches only supply flattened days and times, which can be placed
 * when the relationship is unambiguous; otherwise the day has no known time.
 */
export function planStarts(control: Pick<ScheduleControl, "weekdays" | "startTimes" | "tasks">): Map<string, Array<string | undefined>> {
  if (control.tasks !== undefined) {
    const starts = new Map<string, Array<string | undefined>>();
    for (const task of control.tasks) {
      const day = weekdayKey(task.weekday);
      const time = hhmm(task.startTime);
      if (!WEEKDAYS.includes(day) || !time) continue;
      starts.set(day, [...(starts.get(day) ?? []), time]);
    }
    return starts;
  }
  const days = control.weekdays.map(weekdayKey).filter(day => WEEKDAYS.includes(day));
  const times = control.startTimes.map(hhmm).filter((time): time is string => Boolean(time));
  const starts = new Map<string, Array<string | undefined>>();
  const distinct = [...new Set(times)];
  if (days.length === 1) {
    // One day: every start time is that day's.
    starts.set(days[0], times.length ? times : [undefined]);
    return starts;
  }
  days.forEach((day, index) => {
    const time = times.length === days.length ? times[index]
      : distinct.length === 1 ? distinct[0] : undefined;
    starts.set(day, [...(starts.get(day) ?? []), time]);
  });
  return starts;
}

/**
 * The next seven days of planned starts from the enabled schedule plans, plus the
 * mowing automation's next start, with each day's forecast when there is one.
 * It answers "will it mow tomorrow?" without opening the mower's app.
 */
export function weekPlan(
  controls: ReadonlyArray<ScheduleControl>,
  now: Date,
  options: { automationStart?: string; automationLabel?: string; forecast?: Map<string, DayForecast> } = {},
): PlanDay[] {
  return Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() + offset);
    const date = localDate(day);
    const weekday = WEEKDAYS[day.getDay()];
    const runs: PlanRun[] = [];
    for (const control of controls) {
      if (!control.enabled || !control.available) continue;
      for (const time of planStarts(control).get(weekday) ?? []) {
        // Today's starts that have already passed are not part of the plan any more.
        if (offset === 0 && time) {
          const at = new Date(day);
          at.setHours(Number(time.slice(0, 2)), Number(time.slice(3)));
          if (at <= now) continue;
        }
        runs.push({ time, label: control.label });
      }
    }
    if (options.automationStart) {
      const start = new Date(options.automationStart);
      if (!Number.isNaN(start.getTime()) && start > now && localDate(start) === date) {
        runs.push({
          time: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
          label: options.automationLabel ?? "",
        });
      }
    }
    // Timed runs in order; runs without a known time come last.
    runs.sort((left, right) => (left.time ?? "99").localeCompare(right.time ?? "99"));
    const forecast = options.forecast?.get(date);
    return { date, runs, forecast, rainLikely: runs.length > 0 && rainLikely(forecast) };
  });
}

export const weekPlanStyles = css`
  .week-plan {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .week-day {
    display: grid;
    align-content: start;
    justify-items: center;
    gap: 3px;
    min-width: 0;
    padding: 8px 2px;
    border-radius: var(--mower-radius-control);
    color: var(--mower-muted);
    background: var(--mower-fill);
    font-size: 0.75rem;
    line-height: 1.2;
    text-align: center;
  }

  .week-day.today {
    box-shadow: inset 0 0 0 1px var(--mower-accent);
  }

  .week-day.has-run {
    color: var(--mower-text);
  }

  .week-date {
    font-size: 0.95rem;
    font-weight: 600;
  }

  .week-run {
    max-width: 100%;
    overflow: hidden;
    font-variant-numeric: tabular-nums;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .week-none {
    color: var(--mower-muted);
  }

  .week-rain {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    color: var(--mower-info);
    font-size: 0.7rem;
  }

  .week-rain ha-icon {
    --mdc-icon-size: 14px;
  }

  .week-day.rain-likely .week-run {
    color: var(--mower-muted);
    text-decoration: line-through;
  }

  .week-plan-note {
    margin: 2px 0 0;
    color: var(--mower-muted);
    font-size: 0.75rem;
  }
`;

export function renderWeekPlan(
  days: readonly PlanDay[], t: Translator, locale: string, today: Date, clock: Intl.DateTimeFormatOptions = {},
): TemplateResult | typeof nothing {
  if (!days.some(day => day.runs.length)) return nothing;
  // Run times follow the user's HA time format, like Next run on the card.
  const timeFormat = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", ...clock });
  // A plan whose time on this day can't be placed shows as planned, without a time.
  const runTime = (date: string, time?: string) => time ? timeFormat.format(new Date(`${date}T${time}:00`)) : t("week.planned");
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const dayNumber = new Intl.DateTimeFormat(locale, { day: "numeric" });
  const spokenDay = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" });
  const percent = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 });
  const todayKey = localDate(today);
  return html`
    <ol class="week-plan" id="week-plan" aria-label=${t("week.title")}>
      ${days.map(day => {
        const at = new Date(`${day.date}T12:00:00`);
        const rain = day.forecast?.probability !== undefined ? percent.format(day.forecast.probability / 100) : undefined;
        const spoken = [
          spokenDay.format(at),
          day.runs.length ? day.runs.map(run => [runTime(day.date, run.time), run.label].filter(Boolean).join(" ")).join(", ") : t("week.none"),
          day.rainLikely ? t("week.rainLikely", { chance: rain ?? "" }).trim() : undefined,
        ].filter(Boolean).join(". ");
        return html`
          <li class=${`week-day${day.date === todayKey ? " today" : ""}${day.runs.length ? " has-run" : ""}${day.rainLikely ? " rain-likely" : ""}`}
            aria-label=${spoken}>
            <span aria-hidden="true">${weekday.format(at)}</span>
            <span class="week-date" aria-hidden="true">${dayNumber.format(at)}</span>
            ${day.runs.length
              ? day.runs.slice(0, 2).map(run => html`<span class="week-run" aria-hidden="true">${runTime(day.date, run.time)}</span>`)
              : html`<span class="week-none" aria-hidden="true">–</span>`}
            ${day.runs.length > 2 ? html`<span aria-hidden="true">+${day.runs.length - 2}</span>` : nothing}
            ${day.rainLikely ? html`<span class="week-rain" aria-hidden="true"><ha-icon icon="mdi:weather-pouring"></ha-icon>${rain ?? ""}</span>` : nothing}
          </li>`;
      })}
    </ol>
    ${days.some(day => day.rainLikely) ? html`<p class="week-plan-note">${t("week.rainNote")}</p>` : nothing}
  `;
}

type ForecastConnection = {
  subscribeMessage(callback: (message: { forecast?: unknown }) => void, message: Record<string, unknown>): Promise<() => void>;
};

/** Keeps one daily-forecast subscription for the configured weather entity. */
export class ForecastSubscription {
  private entityId?: string;
  private connection?: object;
  private unsubscribe?: Promise<(() => void) | undefined>;
  private readonly onForecast: (days: Map<string, DayForecast> | undefined) => void;

  constructor(onForecast: (days: Map<string, DayForecast> | undefined) => void) {
    this.onForecast = onForecast;
  }

  /** Bumped on every change, so replies from an earlier subscription are ignored. */
  private generation = 0;

  update(connection: object | undefined, entityId: string | undefined): void {
    if (connection === this.connection && entityId === this.entityId) return;
    this.close();
    this.connection = connection;
    this.entityId = entityId;
    const socket = connection as Partial<ForecastConnection> | undefined;
    if (!entityId || typeof socket?.subscribeMessage !== "function") return;
    const generation = this.generation;
    const current = () => generation === this.generation;
    this.unsubscribe = socket.subscribeMessage(
      message => { if (current()) this.onForecast(forecastByDay(message.forecast)); },
      { type: "weather/subscribe_forecast", forecast_type: "daily", entity_id: entityId },
    ).catch(() => {
      // A weather entity without daily forecasts simply leaves the plan without rain.
      if (current()) this.onForecast(undefined);
      return undefined;
    });
  }

  close(): void {
    this.generation += 1;
    const pending = this.unsubscribe;
    const hadForecast = Boolean(this.entityId);
    this.unsubscribe = undefined;
    this.connection = undefined;
    this.entityId = undefined;
    void pending?.then(stop => stop?.()).catch(() => undefined);
    if (hadForecast) this.onForecast(undefined);
  }
}
