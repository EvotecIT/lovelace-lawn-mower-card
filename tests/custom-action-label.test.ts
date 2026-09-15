import assert from "node:assert/strict";
import test from "node:test";

import { customActionLabels } from "../src/customization-view.ts";

test("custom action heading can be hidden without removing its accessible label", () => {
  assert.deepEqual(customActionLabels("Custom"), {
    accessibleTitle: "Custom",
    visibleTitle: "Custom",
  });
  assert.deepEqual(customActionLabels("Custom", true), {
    accessibleTitle: "Custom",
    visibleTitle: "Custom",
  });
  assert.deepEqual(customActionLabels("Custom", false), {
    accessibleTitle: "Custom",
    visibleTitle: undefined,
  });
});
