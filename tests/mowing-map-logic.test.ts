import assert from "node:assert/strict";
import test from "node:test";
import {
  fitMap, mowingMapPath, overlayIsFresh, readMowingMapScene, zoomMap,
} from "../src/mowing-map-logic.ts";

const path = "/api/dreame_lawn_mower/mowing-map/entry";
function payload() {
  return { schema_version: 1, revision: "a".repeat(64), map_index: 0, map_id: 7,
    name: "Garden", width: 1000, height: 600,
    background_path: `${path}/background/${"a".repeat(64)}`,
    overlay: { position: { x: 200, y: 100, heading: 90 }, trail: [[[10, 10], [20, 20]]],
      position_status: "current", updated_at: "2026-09-06T12:00:00Z", max_age_seconds: 90 },
  };
}

test("map delivery cannot redirect a signed request outside its exact entry", () => {
  assert.equal(mowingMapPath(path), path);
  for (const invalid of ["https://example.com", "//example.com", `${path}?token=secret`, `${path}/../other`]) {
    assert.equal(mowingMapPath(invalid), undefined);
  }
  for (const background_path of ["https://example.com/map.png", "/api/other", `${path}/background/b`]) {
    assert.throws(() => readMowingMapScene({ ...payload(), background_path }, path));
  }
});

test("scene validates dimensions, revision and schema before accepting pixels", () => {
  assert.equal(readMowingMapScene(payload(), path).width, 1000);
  for (const change of [{ width: Infinity }, { height: 0 }, { width: 999999 },
    { revision: "old-map" }, { schema_version: 2 }]) {
    assert.throws(() => readMowingMapScene({ ...payload(), ...change }, path));
  }
});

test("bad coordinates never become a marker or a cross-map trail", () => {
  const data = payload();
  const scene = readMowingMapScene({ ...data, overlay: { ...data.overlay,
    position: { x: -1, y: 100, heading: 90 },
    trail: [[[0, 0], [Infinity, 20]], [[0, 0], [10, 20]]],
  } }, path);
  assert.equal(scene.overlay.position, null);
  assert.deepEqual(scene.overlay.trail, [[[0, 0], [10, 20]]]);
});

test("client expires a live overlay even if the last response remains cached", () => {
  const scene = readMowingMapScene(payload(), path);
  const now = Date.parse("2026-09-06T12:00:00Z");
  assert.equal(overlayIsFresh(scene, now + 89_000), true);
  assert.equal(overlayIsFresh(scene, now + 91_000), false);
  assert.equal(overlayIsFresh(scene, now - 6000), false);
});

test("zoom preserves an anchor and has a bounded twelve-fold range", () => {
  const fit = fitMap(1000, 600);
  const anchor = { x: 400, y: 200 };
  const zoomed = zoomMap(fit, 2, anchor, 1000, 600);
  assert.equal((anchor.x - zoomed.x) / zoomed.width, (anchor.x - fit.x) / fit.width);
  assert.equal((anchor.y - zoomed.y) / zoomed.height, (anchor.y - fit.y) / fit.height);
  assert.equal(zoomMap(fit, 10000, anchor, 1000, 600).width, 1000 / 12);
  assert.equal(zoomMap(fit, 0.00001, anchor, 1000, 600).width, 1000);
  assert.deepEqual(zoomMap(fit, NaN, anchor, 1000, 600), fit);
});
