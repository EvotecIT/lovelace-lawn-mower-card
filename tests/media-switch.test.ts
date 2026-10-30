import assert from "node:assert/strict";
import test from "node:test";
import { resolveStandardMedia, standardMediaViews } from "../src/media-switch.ts";

test("map and 3D share one media area when both are shown", () => {
  assert.deepEqual(standardMediaViews(true, true), ["map", "point-cloud"]);
  assert.deepEqual(standardMediaViews(true, false), ["map"]);
  assert.deepEqual(standardMediaViews(false, true), ["point-cloud"]);
  assert.deepEqual(standardMediaViews(false, false), []);
});

test("the camera joins the same switch after map and 3D", () => {
  assert.deepEqual(standardMediaViews(true, true, true), ["map", "point-cloud", "camera"]);
  assert.deepEqual(standardMediaViews(false, false, true), ["camera"]);
  assert.equal(resolveStandardMedia("camera", ["map"]), "map");
});

test("the chosen view stays while it exists and falls back to the first", () => {
  assert.equal(resolveStandardMedia("point-cloud", ["map", "point-cloud"]), "point-cloud");
  assert.equal(resolveStandardMedia("map", ["point-cloud"]), "point-cloud");
  assert.equal(resolveStandardMedia("point-cloud", ["map"]), "map");
  assert.equal(resolveStandardMedia("map", []), undefined);
});
