import assert from "node:assert/strict";
import test from "node:test";
import {
  availableMapBackgrounds, constrainViewport, effectiveMapBackground, fitMap, mowingMapPath,
  DEFAULT_MOWER_SIZE, MARKER_BODY, mowerMarkerSize, mowerMarkerTransform,
  normalizeMapBackground, viewLimits, WORLD_VIEW_LIMITS, overlayIsFresh, positionStatusKey, readMowingMapScene, zoomMap,
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

test("retained positions keep their provenance and never relabel a route as live", () => {
  for (const status of ["last_known", "known_dock"]) {
    const data = payload();
    const scene = readMowingMapScene({ ...data, overlay: { ...data.overlay,
      position_status: status, docked: true, position_observed_at: "2026-09-06T11:00:00Z",
    } }, path);
    assert.ok(scene.overlay.position);
    assert.deepEqual(scene.overlay.trail, []);
    assert.equal(positionStatusKey(scene, true), status === "known_dock" ? "mowingMap.atDock" : "mowingMap.lastKnown");
    if (status === "last_known") assert.equal(scene.overlay.position.heading, null);
    assert.equal(overlayIsFresh(scene, Date.parse("2026-09-06T12:02:00Z")), false);
  }
});

test("charging without coordinates is displayed as docked, not an invented marker", () => {
  const data = payload();
  const scene = readMowingMapScene({ ...data, overlay: { ...data.overlay,
    position: null, position_status: "unavailable", docked: true,
  } }, path);
  assert.equal(scene.overlay.position, null);
  assert.equal(positionStatusKey(scene, false), "mowingMap.dockedNoPosition");
});

test("retained marker requires bounded timestamp and dock-state evidence", () => {
  const data = payload();
  for (const extra of [
    { position_status: "last_known", position_observed_at: null },
    { position_status: "last_known", position_observed_at: "2026-09-04T12:00:00Z" },
    { position_status: "known_dock", docked: false, position_observed_at: "2026-09-06T11:00:00Z" },
    { position_status: "known_dock", docked: true, position_observed_at: "2026-09-07T12:00:00Z" },
  ]) {
    const scene = readMowingMapScene({ ...data, overlay: { ...data.overlay, ...extra } }, path);
    assert.equal(scene.overlay.position, null);
  }
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

test("a real-scene layer is accepted only for the same entry and revision", () => {
  const revision = "a".repeat(64), digest = "b".repeat(64);
  const own = `${path}/real-scene/${revision}/${digest}`;
  assert.equal(readMowingMapScene({ ...payload(), real_scene_path: own }, path).real_scene_path, own);
  assert.equal(readMowingMapScene(payload(), path).real_scene_path, null);
  for (const other of [
    `${path}/real-scene/${"c".repeat(64)}/${digest}`,
    `/api/dreame_lawn_mower/mowing-map/other/real-scene/${revision}/${digest}`,
    `${own}?token=secret`, `${path}/real-scene/${revision}/../x`, 42,
  ]) {
    assert.equal(readMowingMapScene({ ...payload(), real_scene_path: other }, path).real_scene_path, null);
  }
});

test("map backgrounds accept the four known choices and keep standard otherwise", () => {
  for (const value of ["real_scene", "map", "satellite", "standard"]) {
    assert.equal(normalizeMapBackground(value), value);
  }
  for (const value of [undefined, "photo", "Satellite", 1]) {
    assert.equal(normalizeMapBackground(value), "standard");
  }
});

const projection = { max_x: 20000, min_y: -30000, scale: 0.05, padding: 10,
  native_width: 1520, native_height: 1020, rotation: 0 };
const georeference = { anchor_x: 1160, anchor_y: -20, latitude: 45.317421,
  longitude: -73.837131, heading: 227.33, scale: 0.001 };

test("geographic backgrounds need a projection and an alignment or a home", () => {
  const scene = readMowingMapScene(payload(), path);
  assert.equal(scene.projection, null);
  assert.equal(scene.georeference, null);
  assert.deepEqual(availableMapBackgrounds(scene, true), ["standard"]);
  const projected = readMowingMapScene({ ...payload(), projection, georeference: null }, path);
  assert.deepEqual(projected.projection, projection);
  assert.deepEqual(availableMapBackgrounds(projected, false), ["standard"]);
  assert.deepEqual(availableMapBackgrounds(projected, true), ["standard", "map", "satellite"]);
  const aligned = readMowingMapScene({ ...payload(), projection, georeference }, path);
  assert.deepEqual(aligned.georeference, georeference);
  assert.deepEqual(availableMapBackgrounds(aligned, false), ["standard", "map", "satellite"]);
  assert.equal(effectiveMapBackground("satellite", ["standard"]), "standard");
  assert.equal(effectiveMapBackground("map", availableMapBackgrounds(aligned, false)), "map");
  for (const broken of [{ ...projection, rotation: 45 }, { ...projection, scale: 0 }, "x"]) {
    assert.equal(readMowingMapScene({ ...payload(), projection: broken }, path).projection, null);
  }
  assert.equal(readMowingMapScene({ ...payload(), projection,
    georeference: { ...georeference, latitude: 95 } }, path).georeference, null);
});

test("geographic views may zoom out and roam further than the map alone", () => {
  const fit = fitMap(1000, 600);
  const anchor = { x: 500, y: 300 };
  assert.equal(zoomMap(fit, 0.00001, anchor, 1000, 600, WORLD_VIEW_LIMITS).width, 4000);
  assert.equal(constrainViewport({ ...fit, x: -5000 }, 1000, 600).x, -500);
  assert.equal(constrainViewport({ ...fit, x: -5000 }, 1000, 600, WORLD_VIEW_LIMITS).x, -1500);
  // A known map scale allows a deeper zoom, to see the real-size mower up close.
  assert.equal(zoomMap(fit, 10000, anchor, 1000, 600, viewLimits(false, false)).width, 1000 / 12);
  assert.equal(zoomMap(fit, 10000, anchor, 1000, 600, viewLimits(false, true)).width, 1000 / 32);
  assert.equal(zoomMap(fit, 0.00001, anchor, 1000, 600, viewLimits(false, true)).width, 1000);
  assert.equal(viewLimits(true, true), WORLD_VIEW_LIMITS);
});

test("the mower marker is drawn at real size when the scale is known", () => {
  assert.deepEqual(mowerMarkerSize({}), DEFAULT_MOWER_SIZE);
  assert.deepEqual(mowerMarkerSize({ mower_length: 74, mower_width: "53,2" }), { length: 740, width: 532 });
  assert.deepEqual(mowerMarkerSize({ mower_length: 5, mower_width: "wide" }), DEFAULT_MOWER_SIZE);
  assert.equal(mowerMarkerSize({ mower_marker: "fixed" }), null);
  // 0.05 map px per mm: a 659 mm mower is 32.95 map px long.
  const zoomedIn = mowerMarkerTransform(0.25, 0.05, DEFAULT_MOWER_SIZE);
  assert.equal(zoomedIn.realSize, true);
  assert.equal(zoomedIn.scale, 1);
  assert.ok(Math.abs(zoomedIn.y * MARKER_BODY.length - 659 * 0.05) < 1e-9);
  assert.ok(Math.abs(zoomedIn.x * MARKER_BODY.width - 439 * 0.05) < 1e-9);
  // On screen that is 131.8 px; zooming in twice doubles it.
  const closer = mowerMarkerTransform(0.125, 0.05, DEFAULT_MOWER_SIZE);
  assert.equal(closer.y, zoomedIn.y);
  // Below the fixed icon's 37.8 px the fixed icon stays, so it remains visible.
  assert.deepEqual(mowerMarkerTransform(2, 0.05, DEFAULT_MOWER_SIZE), { scale: 40, x: 1, y: 1, realSize: false });
  assert.equal(mowerMarkerTransform(0.8716, 0.05, DEFAULT_MOWER_SIZE).realSize, true);
  assert.equal(mowerMarkerTransform(0.8718, 0.05, DEFAULT_MOWER_SIZE).realSize, false);
  // Without a projection or with the fixed option, the icon is unchanged.
  assert.equal(mowerMarkerTransform(0.25, undefined, DEFAULT_MOWER_SIZE).realSize, false);
  assert.equal(mowerMarkerTransform(0.25, 0.05, null).realSize, false);
});
