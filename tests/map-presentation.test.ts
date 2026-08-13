import test from "node:test";
import assert from "node:assert/strict";

import {
  mapPresentationClasses,
  normalizeMapFit,
  normalizeMapPosition,
} from "../src/map-presentation.ts";

test("map presentation defaults preserve the complete centered map", () => {
  assert.equal(normalizeMapFit(), "contain");
  assert.equal(normalizeMapFit("stretch"), "contain");
  assert.equal(normalizeMapPosition(), "center");
  assert.equal(normalizeMapPosition("diagonal"), "center");
  assert.equal(
    mapPresentationClasses(),
    "map-fit-contain map-position-center",
  );
});

test("map presentation accepts cropping and directional focus", () => {
  assert.equal(normalizeMapFit("cover"), "cover");
  for (const position of [
    "center",
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ] as const) {
    assert.equal(normalizeMapPosition(position), position);
  }
  assert.equal(
    mapPresentationClasses("cover", "bottom-right"),
    "map-fit-cover map-position-bottom-right",
  );
});
