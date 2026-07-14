import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeHeroImage,
  normalizeHeroImagePosition,
} from "../src/hero-image.ts";

test("hero image paths are trimmed and blank values restore the built-in image", () => {
  assert.equal(normalizeHeroImage("  /local/mower/backyard.jpg  "), "/local/mower/backyard.jpg");
  assert.equal(normalizeHeroImage("   "), undefined);
  assert.equal(normalizeHeroImage(), undefined);
});

test("hero image focus accepts supported positions and safely defaults to center", () => {
  for (const position of ["center", "left", "right", "top", "bottom"] as const) {
    assert.equal(normalizeHeroImagePosition(position), position);
  }

  assert.equal(normalizeHeroImagePosition("diagonal"), "center");
  assert.equal(normalizeHeroImagePosition(), "center");
});
