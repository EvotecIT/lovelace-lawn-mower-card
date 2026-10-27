import assert from "node:assert/strict";
import test from "node:test";
import { forecastByDay, planStarts, rainLikely, weekPlan, ForecastSubscription } from "../src/week-plan.ts";
import type { ScheduleControl } from "../src/schedule-controls.ts";

// Tuesday 27 October 2026, 09:00 local time.
const now = new Date(2026, 9, 27, 9, 0);
const plan = (overrides: Partial<ScheduleControl>): ScheduleControl => ({
  entityId: "switch.mower_schedule", label: "Morning", enabled: true, available: true,
  weekdays: ["mon", "wed", "fri"], startTimes: ["08:15"], ...overrides,
});

test("the week lists each enabled plan's starts for seven days from today", () => {
  const days = weekPlan([plan({}), plan({ label: "Weekend", weekdays: ["Saturday"], startTimes: ["10:00"] })], now);
  assert.equal(days.length, 7);
  assert.equal(days[0].date, "2026-10-27");
  assert.deepEqual(days.map(day => day.runs.map(run => `${run.time} ${run.label}`)), [
    [], ["08:15 Morning"], [], ["08:15 Morning"], ["10:00 Weekend"], [], ["08:15 Morning"],
  ]);
});

test("start times are placed only where the integration's flattened lists allow it", () => {
  const starts = (weekdays: string[], startTimes: string[]) =>
    Object.fromEntries(planStarts({ weekdays, startTimes }));
  // One task a day: the lists line up in order.
  assert.deepEqual(starts(["monday", "wednesday"], ["08:00", "17:00"]), { mon: ["08:00"], wed: ["17:00"] });
  // The same 08:15 task on three days is repeated three times, not three runs a day.
  assert.deepEqual(starts(["mon", "wed", "fri"], ["08:15", "08:15", "08:15"]), { mon: ["08:15"], wed: ["08:15"], fri: ["08:15"] });
  assert.deepEqual(starts(["mon", "wed", "fri"], ["08:15"]), { mon: ["08:15"], wed: ["08:15"], fri: ["08:15"] });
  // One day keeps all its times.
  assert.deepEqual(starts(["tue"], ["08:00", "17:30"]), { tue: ["08:00", "17:30"] });
  // Two days, three different times: the days are known, the times are not.
  assert.deepEqual(starts(["mon", "wed"], ["08:00", "12:00", "17:00"]), { mon: [undefined], wed: [undefined] });
});

test("a day whose time can't be placed still shows the plan, after timed runs", () => {
  const days = weekPlan([
    plan({ label: "Split", weekdays: ["wed", "thu"], startTimes: ["07:00", "12:00", "18:00"] }),
    plan({ label: "Morning", weekdays: ["wed"], startTimes: ["08:15"] }),
  ], now);
  assert.deepEqual(days[1].runs, [{ time: "08:15", label: "Morning" }, { time: undefined, label: "Split" }]);
});

test("disabled plans and today's passed starts are left out", () => {
  const days = weekPlan([
    plan({ weekdays: ["tue"], startTimes: ["08:00", "17:30"] }),
    plan({ label: "Off", enabled: false, weekdays: ["tue"], startTimes: ["12:00"] }),
  ], now);
  assert.deepEqual(days[0].runs, [{ time: "17:30", label: "Morning" }]);
});

test("the automation's next start joins its day in time order", () => {
  const days = weekPlan([plan({})], now, {
    automationStart: new Date(2026, 9, 28, 7, 30).toISOString(), automationLabel: "Garden rotation",
  });
  assert.deepEqual(days[1].runs.map(run => run.time), ["07:30", "08:15"]);
  assert.equal(weekPlan([], now, { automationStart: "not a date" }).every(day => !day.runs.length), true);
});

test("a rainy forecast marks only days with runs as likely skipped", () => {
  const forecast = forecastByDay([
    { datetime: new Date(2026, 9, 28, 12).toISOString(), precipitation_probability: 70, condition: "cloudy" },
    { datetime: new Date(2026, 9, 29, 12).toISOString(), precipitation_probability: 80 },
    { datetime: new Date(2026, 9, 30, 12).toISOString(), precipitation_probability: 10, condition: "pouring" },
    { datetime: "nonsense" },
  ]);
  const days = weekPlan([plan({})], now, { forecast });
  assert.equal(days[1].rainLikely, true);
  assert.equal(days[2].rainLikely, false, "no run that day, so nothing to skip");
  assert.equal(days[3].rainLikely, true, "a pouring forecast counts whatever the probability");
  assert.equal(rainLikely({ probability: 59 }), false);
  assert.equal(rainLikely(undefined), false);
});

test("a reply from an earlier subscription never replaces the current forecast", async () => {
  const pending: Array<{ entity: string; send: (probability: number) => void; fail: () => void }> = [];
  const connection = {
    subscribeMessage(callback: (message: { forecast?: unknown }) => void, message: Record<string, unknown>) {
      return new Promise<() => void>((resolve, reject) => pending.push({
        entity: String(message.entity_id),
        send: probability => { callback({ forecast: [{ datetime: new Date(2026, 9, 28, 12).toISOString(), precipitation_probability: probability }] }); resolve(() => {}); },
        fail: () => reject(new Error("no daily forecast")),
      }));
    },
  };
  const seen: Array<number | undefined> = [];
  const subscription = new ForecastSubscription(days => seen.push(days ? [...days.values()][0].probability : undefined));
  subscription.update(connection, "weather.old");
  subscription.update(connection, "weather.new");
  pending[1].send(10);
  pending[0].send(90);
  pending[0].fail();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(seen.at(-1), 10, "the old entity's 90% and its failure are ignored");
  subscription.close();
  pending[1].send(50);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(seen.at(-1), undefined, "nothing arrives after close");
});

test("the forecast subscription follows the weather entity and cleans up", async () => {
  const received: unknown[] = [];
  const stopped: string[] = [];
  const connection = {
    subscribeMessage(callback: (message: { forecast?: unknown }) => void, message: Record<string, unknown>) {
      callback({ forecast: [{ datetime: new Date(2026, 9, 28, 12).toISOString(), precipitation_probability: 90 }] });
      return Promise.resolve(() => { stopped.push(String(message.entity_id)); });
    },
  };
  const subscription = new ForecastSubscription(days => received.push(days?.size));
  subscription.update(connection, "weather.home");
  subscription.update(connection, "weather.home");
  subscription.update(connection, "weather.garden");
  subscription.close();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.deepEqual(stopped, ["weather.home", "weather.garden"]);
  assert.ok(received.includes(1));
});
