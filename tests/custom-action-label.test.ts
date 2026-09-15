import assert from "node:assert/strict";
import test from "node:test";

import { visibleCustomActionTitle } from "../src/customization-view.ts";

test("custom action heading remains visible unless explicitly disabled", () => {
  assert.equal(visibleCustomActionTitle("Custom"), "Custom");
  assert.equal(visibleCustomActionTitle("Custom", true), "Custom");
  assert.equal(visibleCustomActionTitle("Custom", false), undefined);
});
