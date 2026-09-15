import assert from "node:assert/strict";
import test from "node:test";

import { resolveHeroLabel } from "../src/hero-label.ts";

test("Hero label keeps the translated default when no override is configured", () => {
  assert.equal(resolveHeroLabel(undefined, undefined, "Garden mower"), "Garden mower");
  assert.equal(resolveHeroLabel("   ", true, "Garden mower"), "Garden mower");
  assert.equal(resolveHeroLabel(false, true, "Garden mower"), "Garden mower");
});

test("Hero label can be renamed or hidden without changing the card title", () => {
  assert.equal(resolveHeroLabel("  Robot mower  ", true, "Garden mower"), "Robot mower");
  assert.equal(resolveHeroLabel("Robot mower", false, "Garden mower"), undefined);
});
