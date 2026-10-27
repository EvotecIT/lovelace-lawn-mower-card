import assert from "node:assert/strict";
import test from "node:test";
import { actionRowCapacity, helpersInMenu } from "../src/hero-actions.ts";
import { clockOptions, formatNextRun } from "../src/next-run.ts";

test("helpers stay on the action row while everything fits in five buttons", () => {
  assert.equal(helpersInMenu(2, 2), false);
  assert.equal(helpersInMenu(1, 3), false);
  assert.equal(helpersInMenu(2, 3), true);
  assert.equal(helpersInMenu(5, 0), false);
});

test("the row holds as many readable buttons as the card's width allows", () => {
  assert.equal(actionRowCapacity(296), 3);
  assert.equal(actionRowCapacity(388), 4);
  assert.equal(actionRowCapacity(456), 5);
  assert.equal(actionRowCapacity(560), 6);
  assert.equal(actionRowCapacity(200), 3);
  // A docked mower with three helpers keeps them on a wide card and moves them on a narrow one.
  assert.equal(helpersInMenu(1, 3, actionRowCapacity(456)), false);
  assert.equal(helpersInMenu(1, 3, actionRowCapacity(388)), true);
});

test("times follow the Home Assistant time format", () => {
  const now = new Date(2026, 9, 27, 10, 0);
  const run = new Date(2026, 9, 28, 8, 15);
  // ICU builds differ on the space before AM (U+0020 or U+202F).
  assert.match(formatNextRun(run, "en-US", now), /^Wed 8:15\s?AM$/);
  assert.equal(formatNextRun(run, "en-US", now, clockOptions("24")), "Wed 08:15");
  assert.match(formatNextRun(new Date(2026, 9, 28, 17, 5), "en-GB", now, clockOptions("12")), /^Wed 5:05\s?pm$/i);
  assert.deepEqual(clockOptions("language"), {});
  assert.deepEqual(clockOptions(undefined), {});
});
