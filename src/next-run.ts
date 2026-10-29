import type { ScheduleControl } from "./schedule-controls.ts";
import { planStarts } from "./week-plan.ts";

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/**
 * The next scheduled start from the enabled schedule switches, or from a calendar's
 * next event. It answers "when will it mow?" while the mower is idle.
 */
export function nextScheduledRun(
  controls: ReadonlyArray<ScheduleControl>,
  now: Date,
  calendarStart?: unknown,
): Date | undefined {
  const candidates: Date[] = [];
  for (const control of controls) {
    if (!control.enabled || !control.available) continue;
    // Use the same exact task pairs or legacy placement as the week view.
    for (const [weekday, times] of planStarts(control)) {
      const day = WEEKDAYS.indexOf(weekday);
      for (const time of times) {
        if (day < 0 || !time) continue;
        const run = new Date(now);
        run.setHours(Number(time.slice(0, 2)), Number(time.slice(3)), 0, 0);
        run.setDate(run.getDate() + ((day - run.getDay() + 7) % 7));
        if (run <= now) run.setDate(run.getDate() + 7);
        candidates.push(run);
      }
    }
  }
  if (typeof calendarStart === "string") {
    const start = new Date(calendarStart.replace(" ", "T"));
    if (!Number.isNaN(start.getTime()) && start > now) candidates.push(start);
  }
  return candidates.sort((left, right) => left.getTime() - right.getTime())[0];
}

/**
 * Clock options from the user's Home Assistant time format: "12", "24", "system"
 * (the browser's clock) or "language" (the locale's own convention).
 */
export function clockOptions(timeFormat: unknown): Intl.DateTimeFormatOptions {
  if (timeFormat === "12") return { hour12: true };
  if (timeFormat === "24") return { hourCycle: "h23" };
  if (timeFormat === "system") {
    const cycle = new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions().hourCycle;
    return cycle ? { hourCycle: cycle } : {};
  }
  return {};
}

/** "Wed 8:15" in the card's locale; a run more than six days away also names its date. */
export function formatNextRun(run: Date, locale: string, now: Date, clock: Intl.DateTimeFormatOptions = {}): string {
  const soon = run.getTime() - now.getTime() < 6 * 24 * 60 * 60 * 1000;
  return new Intl.DateTimeFormat(locale, {
    weekday: "short", hour: "numeric", minute: "2-digit", ...clock,
    ...(soon ? {} : { day: "numeric", month: "short" }),
  }).format(run);
}
