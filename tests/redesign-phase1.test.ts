import assert from "node:assert/strict";
import test from "node:test";
import { commandPlan } from "../src/command-plan.ts";
import { withoutDevicePrefix } from "../src/display-names.ts";
import { nextScheduledRun } from "../src/next-run.ts";
import type { ScheduleControl } from "../src/schedule-controls.ts";

test("a mowing mower offers Pause first and hides Start", () => {
  const plan = commandPlan({ start: false, pause: true, cancel: true, dock: true });
  assert.equal(plan.primary, "pause");
  assert.deepEqual([...plan.visible], ["pause", "cancel", "dock"]);
});

test("a docked mower offers only Start", () => {
  const plan = commandPlan({ start: true, pause: false, cancel: false, dock: false });
  assert.equal(plan.primary, "start");
  assert.deepEqual([...plan.visible], ["start"]);
});

test("an unavailable mower has no built-in commands", () => {
  const plan = commandPlan({ start: false, pause: false, cancel: false, dock: false });
  assert.equal(plan.primary, undefined);
  assert.equal(plan.visible.size, 0);
});

test("the mower name is removed from related entity names", () => {
  assert.equal(withoutDevicePrefix("Dreame A2 Bodzio Mowing action", ["Dreame A2 Bodzio"]), "Mowing action");
  assert.equal(withoutDevicePrefix("DREAME A2 BODZIO map rotation", ["Dreame A2 Bodzio"]), "Map rotation");
  assert.equal(withoutDevicePrefix("Backyard mower: Cutting height", [undefined, "Backyard mower"]), "Cutting height");
});

test("names are kept when the prefix is only part of a word or the whole name", () => {
  assert.equal(withoutDevicePrefix("Mowerbot zone", ["Mower"]), "Mowerbot zone");
  assert.equal(withoutDevicePrefix("Backyard mower", ["Backyard mower"]), "Backyard mower");
});

const control = (overrides: Partial<ScheduleControl>): ScheduleControl => ({
  entityId: "switch.mower_schedule", label: "Schedule", enabled: true, available: true,
  weekdays: ["mon", "wed", "fri"], startTimes: ["08:15"], ...overrides,
});

test("the next run is the earliest enabled schedule start after now", () => {
  const tuesday = new Date(2026, 9, 27, 12, 0);
  const run = nextScheduledRun([control({}), control({ weekdays: ["sat"], startTimes: ["10:00"] })], tuesday);
  assert.deepEqual(run, new Date(2026, 9, 28, 8, 15));
});

test("a start later today counts, an earlier one moves to next week", () => {
  const monday = new Date(2026, 9, 26, 9, 0);
  assert.deepEqual(nextScheduledRun([control({ weekdays: ["monday"], startTimes: ["17:30"] })], monday), new Date(2026, 9, 26, 17, 30));
  assert.deepEqual(nextScheduledRun([control({ weekdays: ["mon"], startTimes: ["08:00"] })], monday), new Date(2026, 10, 2, 8, 0));
});

test("disabled schedules are ignored and a calendar event can be sooner", () => {
  const tuesday = new Date(2026, 9, 27, 12, 0);
  assert.equal(nextScheduledRun([control({ enabled: false })], tuesday), undefined);
  assert.deepEqual(nextScheduledRun([control({})], tuesday, "2026-10-27 18:00:00"), new Date(2026, 9, 27, 18, 0));
});
