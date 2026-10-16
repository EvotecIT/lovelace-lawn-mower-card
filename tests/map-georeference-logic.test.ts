import assert from "node:assert/strict";
import test from "node:test";
import {
  adjustPoint, adjustmentMatrix, alignGesture, alignHandlePositions, dragHandle, pointOnMap, unadjustPoint, alignedGeoreference, composeAdjustment, DEFAULT_WORLD_TILES,
  defaultGeoreference, geoToNative, geoToPixel, geoToTile, georeferenceServiceData, IDENTITY_ADJUSTMENT,
  nativeToGeo, nativeToPixel, pixelToGeo, pixelToNative, readMapGeoreference, sameGeoreference, screenMatrix, colorSchemeFor,
  tileMatrix, tileTemplate, tileToGeo, tileUrl, tileZoomFor, visibleTiles, worldTileSource,
  type MapGeoreference, type MapProjection,
} from "../src/map-georeference-logic.ts";

const reference: MapGeoreference = {
  anchor_x: 1160, anchor_y: -20, latitude: 45.317421, longitude: -73.837131, heading: 227.33, scale: 0.001,
};
const projection: MapProjection = {
  max_x: 20000, min_y: -30000, scale: 0.05, padding: 10, native_width: 2520, native_height: 1520, rotation: 0,
};

function near(actual: number, expected: number, tolerance: number, label = "") {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label} ${actual} vs ${expected}`);
}

test("native to GPS matches the measured reference point", () => {
  const geo = nativeToGeo(reference, { x: -5676, y: -20165 });
  near(geo.latitude, 45.3174986, 1e-6, "latitude");
  near(geo.longitude, -73.836883, 1e-6, "longitude");
  const anchor = nativeToGeo(reference, { x: 1160, y: -20 });
  assert.deepEqual(anchor, { latitude: reference.latitude, longitude: reference.longitude });
});

test("native to GPS round-trips at garden scale", () => {
  for (const point of [{ x: -5676, y: -20165 }, { x: 30000, y: 12000 }, { x: 1160, y: -20 }]) {
    const back = geoToNative(reference, nativeToGeo(reference, point));
    near(back.x, point.x, 1e-6, "x");
    near(back.y, point.y, 1e-6, "y");
  }
});

test("missing georeference scale uses one millimetre per native unit", () => {
  const { scale: _scale, ...withoutScale } = reference;
  assert.equal(readMapGeoreference(withoutScale)?.scale, 0.001);
  assert.equal(readMapGeoreference({ ...reference, heading: -90 })?.heading, 270);
  assert.equal(readMapGeoreference(null), null);
  assert.equal(readMapGeoreference({ ...reference, scale: -1 }), null);
});

test("pixel and native follow the integration projection without rotation", () => {
  assert.deepEqual(nativeToPixel(projection, { x: 20000, y: -30000 }), { x: 10, y: 10 });
  assert.deepEqual(nativeToPixel(projection, { x: 10000, y: -10000 }), { x: 510, y: 1010 });
  const back = pixelToNative(projection, { x: 510, y: 1010 });
  near(back.x, 10000, 1e-9); near(back.y, -10000, 1e-9);
});

test("display rotation matches the integration's rotate_canvas_point_exact", () => {
  // Unrotated (u, v) = (510, 1010) for native (10000, -10000); W = 2520, H = 1520.
  const native = { x: 10000, y: -10000 };
  const expected = {
    0: { x: 510, y: 1010 },
    90: { x: 1520 - 1 - 1010, y: 510 },
    180: { x: 2520 - 1 - 510, y: 1520 - 1 - 1010 },
    270: { x: 1010, y: 2520 - 1 - 510 },
  } as const;
  for (const rotation of [0, 90, 180, 270] as const) {
    assert.deepEqual(nativeToPixel({ ...projection, rotation }, native), expected[rotation], `${rotation}`);
  }
  // At 90 degrees the top-left pixel index lands in the top-right column (H - 1).
  assert.deepEqual(nativeToPixel({ ...projection, rotation: 90 }, { x: 20200, y: -30200 }),
    { x: 1519, y: 0 });
  for (const rotation of [0, 90, 180, 270] as const) {
    const rotated = { ...projection, rotation };
    for (const point of [{ x: 0, y: 0 }, { x: 123.5, y: 987.25 }, { x: 1500, y: 40 }]) {
      const back = nativeToPixel(rotated, pixelToNative(rotated, point));
      near(back.x, point.x, 1e-9, `${rotation} x`); near(back.y, point.y, 1e-9, `${rotation} y`);
    }
  }
});

test("GPS and Web Mercator tiles round-trip and match known tiles", () => {
  const tile = geoToTile({ latitude: 45.317421, longitude: -73.837131 }, 19);
  assert.deepEqual([Math.floor(tile.x), Math.floor(tile.y)], [154610, 187943]);
  const back = tileToGeo(tile, 19);
  near(back.latitude, 45.317421, 1e-9); near(back.longitude, -73.837131, 1e-9);
  assert.deepEqual(geoToTile({ latitude: 0, longitude: 0 }, 1), { x: 1, y: 1 });
});

test("tiles are placed through pixel, native and GPS with one affine per tile", () => {
  const z = 20;
  const centre = geoToTile(pixelToGeo(projection, reference, { x: 1260, y: 760 }), z);
  const x = Math.floor(centre.x), y = Math.floor(centre.y);
  const [a, b, c, d, e, f] = tileMatrix(projection, reference, x, y, z);
  // The middle of the tile, through the affine, lands where the exact chain puts it.
  const exact = geoToPixel(projection, reference, tileToGeo({ x: x + 0.5, y: y + 0.5 }, z));
  near(a * 128 + c * 128 + e, exact.x, 0.01, "x");
  near(b * 128 + d * 128 + f, exact.y, 0.01, "y");
  // No mirror: the tile keeps its handedness on the map.
  assert.ok(a * d - b * c > 0);
  const tiles = visibleTiles(projection, reference, { x: 0, y: 0, width: 2520, height: 1520 }, 21, 48);
  assert.ok(tiles.length > 0 && tiles.length <= 48);
  assert.ok(tiles.every((tile) => tile.z <= 21));
});

test("tile matrices follow the letterboxed SVG into canvas pixels", () => {
  const view = { x: 100, y: 50, width: 400, height: 200 };
  const size = { width: 400, height: 400 }; // 1 px per unit, 100 px bands above and below
  const matrix = screenMatrix([2, 0, 0, 2, 150, 60], view, size);
  assert.deepEqual(matrix, [2, 0, 0, 2, 50, 110]);
  const half = screenMatrix([1, 0, 0, 1, 100, 50], view, { width: 200, height: 100 });
  assert.deepEqual(half, [0.5, 0, 0, 0.5, 0, 0]);
});

test("native controls follow a dark or light theme surface", () => {
  assert.equal(colorSchemeFor("rgb(28, 28, 28)"), "dark");
  assert.equal(colorSchemeFor("rgb(17 24 39 / 0.9)"), "dark");
  assert.equal(colorSchemeFor("rgb(255, 255, 255)"), "light");
  assert.equal(colorSchemeFor("rgba(244, 247, 244, 1)"), "light");
  assert.equal(colorSchemeFor("rgba(0, 0, 0, 0)"), undefined);
  assert.equal(colorSchemeFor("color(srgb 1 1 1)"), undefined);
});

test("tile level follows screen sharpness and the source limit", () => {
  near(tileZoomFor(0.3, 45.3, 25), 19, 0);
  assert.equal(tileZoomFor(0.01, 45.3, 19), 19);
  assert.equal(tileZoomFor(1e6, 45.3, 19, 3), 3);
  assert.equal(tileUrl("https://t/{z}/{x}/{y}.png", 2, -1, 3), "https://t/2/3/3.png");
  assert.equal(tileUrl("https://t/{z}/{x}/{y}.png", 2, 0, 4), undefined);
});

test("tile sources accept only templated http(s) URLs and keep attribution", () => {
  assert.equal(worldTileSource("map").maxZoom, 19);
  assert.match(worldTileSource("map").template, /World_Street_Map\/MapServer\/tile\/\{z\}\/\{y\}\/\{x\}\?blankTile=false$/);
  assert.match(worldTileSource("map").attribution, /^Powered by Esri .*OpenStreetMap contributors/);
  const osm = worldTileSource("map", { url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors", maxZoom: 19 });
  assert.equal(osm.template, "https://tile.openstreetmap.org/{z}/{x}/{y}.png");
  assert.equal(osm.attribution, "© OpenStreetMap contributors");
  assert.match(worldTileSource("satellite").template, /World_Imagery/);
  assert.match(worldTileSource("satellite").attribution, /Esri, Maxar, Earthstar Geographics/);
  for (const bad of ["javascript:alert(1)//{z}{x}{y}", "//evil/{z}/{x}/{y}", "https://t/{z}/{x}.png", 4]) {
    assert.equal(tileTemplate(bad, "fallback"), "fallback");
  }
  const custom = worldTileSource("satellite", { url: "https://tiles.example/{z}/{x}/{y}.jpg" });
  assert.equal(custom.attribution, "");
  assert.equal(custom.maxZoom, 22);
  assert.equal(worldTileSource("map", { url: DEFAULT_WORLD_TILES.map.template, maxZoom: 18 }).maxZoom, 18);
});

test("a null adjustment gives back the starting alignment", () => {
  for (const rotation of [0, 90] as const) {
    const rotated = { ...projection, rotation };
    const width = rotation === 90 ? 1520 : 2520, height = rotation === 90 ? 2520 : 1520;
    const next = alignedGeoreference(rotated, reference, IDENTITY_ADJUSTMENT, width, height);
    near(next.heading, reference.heading, 1e-6, "heading");
    near(next.scale, reference.scale, 1e-9, "scale");
    assert.ok(sameGeoreference(next, reference));
    for (const point of [{ x: -5676, y: -20165 }, { x: 15000, y: 9000 }]) {
      const before = nativeToGeo(reference, point), after = nativeToGeo(next, point);
      near(after.latitude, before.latitude, 2e-8, "latitude");
      near(after.longitude, before.longitude, 2e-8, "longitude");
    }
  }
});

test("adjustments move, turn and resize the saved alignment", () => {
  const width = 2520, height = 1520;
  const centre = { x: width / 2, y: height / 2 };
  const base = alignedGeoreference(projection, reference, IDENTITY_ADJUSTMENT, width, height);
  // 2x larger on screen means each native unit covers twice the ground.
  const larger = alignedGeoreference(projection, base, { ...IDENTITY_ADJUSTMENT, scale: 2 }, width, height);
  near(larger.scale, base.scale * 2, 1e-9);
  near(larger.latitude, base.latitude, 1e-8); near(larger.heading, base.heading, 1e-6);
  // Turning the drawn map clockwise turns its +Y axis clockwise: heading grows.
  const turned = alignedGeoreference(projection, base, { ...IDENTITY_ADJUSTMENT, rotation: 10 }, width, height);
  near(turned.heading, base.heading + 10, 1e-4);
  // Moving the map by 100 px moves its centre to what the base had 100 px away.
  const moved = alignedGeoreference(projection, base, { ...IDENTITY_ADJUSTMENT, dx: 100 }, width, height);
  const expected = pixelToGeo(projection, base, { x: centre.x + 100, y: centre.y });
  near(moved.latitude, expected.latitude, 1e-8); near(moved.longitude, expected.longitude, 1e-8);
  // Every drawn pixel ends up where the new alignment puts it.
  const adjustment = { dx: -40, dy: 75, rotation: -17, scale: 1.08 };
  const next = alignedGeoreference(projection, base, adjustment, width, height);
  for (const pixel of [{ x: 0, y: 0 }, { x: 2000, y: 300 }]) {
    const drawn = pixelToGeo(projection, base, adjustPoint(adjustment, centre, pixel));
    const saved = pixelToGeo(projection, next, pixel);
    near(saved.latitude, drawn.latitude, 3e-8); near(saved.longitude, drawn.longitude, 3e-8);
  }
  assert.deepEqual(georeferenceServiceData("lawn_mower.m", next), { entity_id: "lawn_mower.m", ...next });
});

test("gestures compose about a pivot and keep the size bounded", () => {
  const centre = { x: 500, y: 300 };
  const pivot = { x: 200, y: 100 };
  const start = { dx: 20, dy: -10, rotation: 5, scale: 1.1 };
  const next = composeAdjustment(start, centre, pivot, 1.5, 30);
  // The pivot stays fixed and other points turn and scale around it.
  const point = { x: 640, y: 410 };
  const before = adjustPoint(start, centre, point), after = adjustPoint(next, centre, point);
  const angle = (Math.atan2(after.y - pivot.y, after.x - pivot.x) -
    Math.atan2(before.y - pivot.y, before.x - pivot.x)) * 180 / Math.PI;
  near(angle, 30, 1e-9);
  near(Math.hypot(after.x - pivot.x, after.y - pivot.y) / Math.hypot(before.x - pivot.x, before.y - pivot.y), 1.5, 1e-9);
  // Buttons pivot on the drawn centre, which therefore does not move.
  const button = composeAdjustment(start, centre, adjustPoint(start, centre, centre), 1.01, 0.5);
  near(button.dx, start.dx, 1e-9); near(button.dy, start.dy, 1e-9);
  assert.equal(composeAdjustment(start, centre, pivot, 100, 0).scale, 4);
  assert.deepEqual(composeAdjustment(start, centre, pivot, NaN, 0), start);
  const [a, b, c, d, e, f] = adjustmentMatrix(start, centre);
  const drawn = adjustPoint(start, centre, point);
  near(a * point.x + c * point.y + e, drawn.x, 1e-9); near(b * point.x + d * point.y + f, drawn.y, 1e-9);
});

test("without an alignment the map centre starts at the Home Assistant home", () => {
  const start = defaultGeoreference(projection, 2520, 1520, { latitude: 45.3, longitude: -73.8 });
  assert.ok(start);
  assert.equal(start.scale, 0.001);
  // North sits at the top of the screen whatever the display rotation.
  for (const rotation of [0, 90, 180, 270] as const) {
    const turned = { ...projection, rotation };
    const reference = defaultGeoreference(turned, 2520, 1520, { latitude: 45.3, longitude: -73.8 });
    assert.ok(reference);
    const top = pixelToGeo(turned, reference, { x: 500, y: 100 });
    const bottom = pixelToGeo(turned, reference, { x: 500, y: 900 });
    assert.ok(top.latitude > bottom.latitude, `${rotation}`);
    near(top.longitude, bottom.longitude, 1e-9, `${rotation}`);
  }
  assert.equal(start.heading, 180);
  const centre = pixelToGeo(projection, start, { x: 1260, y: 760 });
  near(centre.latitude, 45.3, 1e-7); near(centre.longitude, -73.8, 1e-7);
  assert.equal(defaultGeoreference(projection, 2520, 1520, { latitude: NaN, longitude: 0 }), null);
});

test("aligning gestures: two fingers move the view, one finger the map or a handle", () => {
  assert.equal(alignGesture(2, undefined, true), "view");
  assert.equal(alignGesture(2, "scale", true), "view");
  assert.equal(alignGesture(1, undefined, true), "move-map");
  assert.equal(alignGesture(1, undefined, false), "view");
  assert.equal(alignGesture(1, "rotate", false), "rotate");
  assert.equal(alignGesture(1, "scale", true), "scale");
  const adjustment = { dx: 100, dy: 0, rotation: 30, scale: 0.5 };
  assert.equal(pointOnMap(adjustment, 1000, 600, { x: 600, y: 300 }), true);
  assert.equal(pointOnMap(adjustment, 1000, 600, { x: 50, y: 300 }), false);
  const point = { x: 123, y: 456 };
  const back = adjustPoint(adjustment, { x: 500, y: 300 }, unadjustPoint(adjustment, { x: 500, y: 300 }, point));
  near(back.x, point.x, 1e-9); near(back.y, point.y, 1e-9);
});

test("the corner handle resizes and the rotate handle turns about the drawn centre", () => {
  const centre = { x: 500, y: 300 };
  const start = { dx: 40, dy: -20, rotation: 10, scale: 1 };
  const middle = { x: 540, y: 280 };
  const { corners, rotate, top } = alignHandlePositions(start, 1000, 600, 36);
  // Dragging a corner twice as far from the centre doubles the size; the centre stays.
  const corner = corners[2];
  const bigger = dragHandle(start, centre, "scale", corner,
    { x: middle.x + 2 * (corner.x - middle.x), y: middle.y + 2 * (corner.y - middle.y) });
  near(bigger.scale, 2, 1e-9); near(bigger.rotation, 10, 1e-9);
  near(bigger.dx, start.dx, 1e-9); near(bigger.dy, start.dy, 1e-9);
  // The rotate knob sits 36 units out from the top edge, along the map's up direction.
  near(Math.hypot(rotate.x - top.x, rotate.y - top.y), 36, 1e-9);
  // Dragging it a quarter turn around the centre turns the map 90 degrees.
  const vector = { x: rotate.x - middle.x, y: rotate.y - middle.y };
  const turned = dragHandle(start, centre, "rotate", rotate, { x: middle.x - vector.y, y: middle.y + vector.x });
  near(turned.rotation, 100, 1e-9); near(turned.scale, 1, 1e-9);
  near(turned.dx, start.dx, 1e-9); near(turned.dy, start.dy, 1e-9);
  assert.deepEqual(dragHandle(start, centre, "scale", middle, corner), start);
});
