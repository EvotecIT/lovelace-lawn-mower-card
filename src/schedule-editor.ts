/** Weekly blocks of a Home Assistant Schedule helper, edited as a draft. */

export const WEEKDAYS = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
] as const;
export type Weekday = typeof WEEKDAYS[number];

export type ScheduleBlock = {
  /** "HH:MM:SS"; `to` may be "24:00:00" (end of day), as Home Assistant allows. */
  from: string;
  to: string;
  /** Optional block data Home Assistant stores; kept untouched on save. */
  data?: unknown;
};

export type ScheduleDraft = {
  id: string;
  name: string;
  icon?: string;
  days: Record<Weekday, ScheduleBlock[]>;
};

export type ScheduleProblem = { day: Weekday; index: number };

const TIME = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$|^24:00(:00)?$/;

function seconds(value: string): number {
  const [hours, minutes, secs = "0"] = value.split(":");
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(secs);
}

function fullTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

/** "10:45:00" → "10:45" for a time input. */
export function shortTime(value: string): string {
  return value.slice(0, 5);
}

/** Read one item of `schedule/list`; anything unexpected yields no draft. */
export function scheduleDraft(item: unknown): ScheduleDraft | undefined {
  if (!item || typeof item !== "object" || Array.isArray(item)) return undefined;
  const value = item as Record<string, unknown>;
  if (typeof value.id !== "string" || !value.id || typeof value.name !== "string") return undefined;
  const days = {} as Record<Weekday, ScheduleBlock[]>;
  for (const day of WEEKDAYS) {
    const blocks = value[day] ?? [];
    if (!Array.isArray(blocks)) return undefined;
    days[day] = [];
    for (const block of blocks) {
      if (!block || typeof block !== "object") return undefined;
      const { from, to, data } = block as Record<string, unknown>;
      if (typeof from !== "string" || typeof to !== "string" || !TIME.test(from) || !TIME.test(to)) {
        return undefined;
      }
      days[day].push({ from: fullTime(from), to: fullTime(to), ...(data === undefined ? {} : { data }) });
    }
  }
  return {
    id: value.id, name: value.name,
    ...(typeof value.icon === "string" && value.icon ? { icon: value.icon } : {}),
    days,
  };
}

function withDay(draft: ScheduleDraft, day: Weekday, blocks: ScheduleBlock[]): ScheduleDraft {
  return { ...draft, days: { ...draft.days, [day]: blocks } };
}

/** Add a block after the day's last one (or 09:00–12:00), bounded by midnight. */
export function withBlock(draft: ScheduleDraft, day: Weekday): ScheduleDraft {
  const blocks = draft.days[day];
  const last = blocks.length ? seconds(blocks[blocks.length - 1].to) : 9 * 3600 - 3600;
  const start = Math.min(last + 3600, 23 * 3600);
  const end = Math.min(start + 3 * 3600, 24 * 3600);
  const clock = (value: number) => value >= 24 * 3600 ? "24:00:00"
    : `${String(Math.floor(value / 3600)).padStart(2, "0")}:${String(Math.floor(value / 60) % 60).padStart(2, "0")}:00`;
  return withDay(draft, day, [...blocks, { from: clock(start), to: clock(end) }]);
}

export function withoutBlock(draft: ScheduleDraft, day: Weekday, index: number): ScheduleDraft {
  return withDay(draft, day, draft.days[day].filter((_, position) => position !== index));
}

/** Change one end of a block from a time input ("HH:MM"); invalid text is ignored. */
export function withBlockTime(
  draft: ScheduleDraft, day: Weekday, index: number, end: "from" | "to", value: string,
): ScheduleDraft {
  if (!TIME.test(value) || !draft.days[day][index]) return draft;
  const time = end === "to" && (value === "00:00" || value === "00:00:00") ? "24:00:00" : fullTime(value);
  return withDay(draft, day, draft.days[day].map((block, position) =>
    position === index ? { ...block, [end]: time } : block));
}

/** Blocks Home Assistant would reject: empty or reversed, or overlapping another. */
export function scheduleProblems(draft: ScheduleDraft): ScheduleProblem[] {
  const problems: ScheduleProblem[] = [];
  for (const day of WEEKDAYS) {
    const blocks = draft.days[day];
    blocks.forEach((block, index) => {
      const start = seconds(block.from);
      const end = seconds(block.to);
      const overlaps = blocks.some((other, position) => position !== index &&
        start < seconds(other.to) && seconds(other.from) < end);
      if (start >= end || overlaps) problems.push({ day, index });
    });
  }
  return problems;
}

/** The `schedule/update` message for this draft, blocks sorted by start. */
export function scheduleUpdateMessage(draft: ScheduleDraft): Record<string, unknown> {
  const message: Record<string, unknown> = {
    type: "schedule/update", schedule_id: draft.id, name: draft.name,
  };
  if (draft.icon) message.icon = draft.icon;
  for (const day of WEEKDAYS) {
    message[day] = [...draft.days[day]]
      .sort((first, second) => seconds(first.from) - seconds(second.from))
      .map(block => ({ ...block }));
  }
  return message;
}

export function sameSchedule(first: ScheduleDraft, second: ScheduleDraft): boolean {
  return JSON.stringify(scheduleUpdateMessage(first)) === JSON.stringify(scheduleUpdateMessage(second));
}
