import type { ScheduleControl } from "./schedule-controls.ts";

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
    for (const weekday of control.weekdays) {
      const day = WEEKDAYS.indexOf(weekday.trim().slice(0, 3).toLowerCase());
      if (day < 0) continue;
      for (const time of control.startTimes) {
        const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
        if (!match) continue;
        const run = new Date(now);
        run.setHours(Number(match[1]), Number(match[2]), 0, 0);
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

/** "Wed 08:15" in the card's locale; a run more than six days away also names its date. */
export function formatNextRun(run: Date, locale: string, now: Date): string {
  const soon = run.getTime() - now.getTime() < 6 * 24 * 60 * 60 * 1000;
  return new Intl.DateTimeFormat(locale, {
    weekday: "short", hour: "2-digit", minute: "2-digit",
    ...(soon ? {} : { day: "numeric", month: "short" }),
  }).format(run);
}
