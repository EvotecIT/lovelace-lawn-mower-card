import assert from "node:assert/strict";
import test from "node:test";
import { forecastByDay, rainLikely, weekPlan, ForecastSubscription } from "../src/week-plan.ts";
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
