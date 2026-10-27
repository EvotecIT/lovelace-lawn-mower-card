import assert from "node:assert/strict";
import test from "node:test";
import { helpersInMenu } from "../src/hero-actions.ts";
import { clockOptions, formatNextRun } from "../src/next-run.ts";

test("helpers stay on the action row while everything fits in five buttons", () => {
  assert.equal(helpersInMenu(2, 2), false);
  assert.equal(helpersInMenu(1, 3), false);
  assert.equal(helpersInMenu(2, 3), true);
  assert.equal(helpersInMenu(5, 0), false);
});

test("times follow the Home Assistant time format", () => {
  const now = new Date(2026, 9, 27, 10, 0);
  const run = new Date(2026, 9, 28, 8, 15);
  assert.equal(formatNextRun(run, "en-US", now), "Wed 8:15 AM");
  assert.equal(formatNextRun(run, "en-US", now, clockOptions("24")), "Wed 08:15");
  assert.match(formatNextRun(new Date(2026, 9, 28, 17, 5), "en-GB", now, clockOptions("12")), /^Wed 5:05\s?pm$/i);
  assert.deepEqual(clockOptions("language"), {});
  assert.deepEqual(clockOptions(undefined), {});
});
