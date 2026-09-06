import test from "node:test";
import assert from "node:assert/strict";

import {
  mapPresentationClasses,
  mapIsLive,
  normalizeMapFit,
  normalizeMapPosition,
} from "../src/map-presentation.ts";

test("saved restart previews cannot claim live position while mower is active", () => {
  assert.equal(mapIsLive({ restart_preview: true, map_has_live_path: true }, "mowing"), false);
  assert.equal(mapIsLive({ map_placeholder: true }, "mowing"), false);
  assert.equal(mapIsLive({}, "mowing"), true);
  assert.equal(mapIsLive({}, "docked"), false);
});

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
