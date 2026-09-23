import assert from "node:assert/strict";
import test from "node:test";

import {
  availableHeroViews,
  initialHeroView,
  isHeroViewAvailable,
  resolveHeroView,
  showHeroViewTabs,
} from "../src/hero-views.ts";

test("mower-only Hero cards keep the overview and hide the redundant tab strip", () => {
  const views = availableHeroViews({
    map: false,
    pointCloud: false,
    camera: false,
  });

  assert.deepEqual(views, ["overview"]);
  assert.equal(showHeroViewTabs(views), false);
  assert.equal(isHeroViewAvailable("map", views), false);
  assert.equal(isHeroViewAvailable("point-cloud", views), false);
  assert.equal(isHeroViewAvailable("camera", views), false);
});

test("Hero views follow the optional companion capabilities", () => {
  const views = availableHeroViews({
    map: true,
    pointCloud: false,
    camera: true,
  });

  assert.deepEqual(views, ["overview", "map", "camera"]);
  assert.equal(showHeroViewTabs(views), true);
  assert.equal(isHeroViewAvailable("map", views), true);
  assert.equal(isHeroViewAvailable("point-cloud", views), false);
  assert.equal(isHeroViewAvailable("camera", views), true);
});

test("a disappearing companion returns Hero to overview", () => {
  assert.equal(resolveHeroView("camera", ["overview", "map"]), "overview");
  assert.equal(resolveHeroView("map", ["overview", "map"]), "map");
});

test("Hero starting tab honors configuration and available map content", () => {
  const withMap = ["overview", "map"] as const;
  assert.equal(initialHeroView(undefined, true, true, withMap), "map");
  assert.equal(initialHeroView(undefined, false, true, withMap), "overview");
  assert.equal(initialHeroView("overview", true, true, withMap), "overview");
  assert.equal(initialHeroView("map", false, false, withMap), "map");
  assert.equal(initialHeroView("map", false, false, ["overview"]), "overview");
});
