import assert from "node:assert/strict";
import test from "node:test";

import { actionErrorDetail } from "../src/action-error.ts";

test("action feedback retains Home Assistant's WebSocket rejection reason", () => {
  const message =
    "Finish the current mower task before editing schedules. A paused or docked task can still be unfinished.";
  assert.equal(actionErrorDetail({ code: "unknown_error", message }), message);
  assert.equal(actionErrorDetail(new Error(message)), message);
});

test("action feedback keeps error messages bounded and readable", () => {
  assert.equal(actionErrorDetail({ message: "  Finish\r\nthe\ttask.  " }), "Finish the task.");
  assert.equal(actionErrorDetail(new Error("x".repeat(300))), "x".repeat(240));
});

test("unusable rejection messages retain the generic confirmation fallback", () => {
  for (const error of [null, undefined, "failure", {}, { message: 42 }, { message: " \t\n" }]) {
    assert.equal(actionErrorDetail(error), undefined);
  }
});
