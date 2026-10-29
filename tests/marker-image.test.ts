import assert from "node:assert/strict";
import test from "node:test";
import { MarkerImageCheck, MARKER_RETRY_MS } from "../src/marker-image.ts";
import { markerImageUrl, readMowingMapScene } from "../src/mowing-map-logic.ts";

type FakeImage = { src: string; onload: ((event: Event) => void) | null; onerror: ((event: Event | string) => void) | null };

function setup() {
  const images: FakeImage[] = [];
  let clock = 0, updates = 0;
  const check = new MarkerImageCheck(() => { updates += 1; },
    () => { const image: FakeImage = { src: "", onload: null, onerror: null }; images.push(image); return image; }, () => clock);
  return { check, images, tick: (ms: number) => { clock += ms; }, updates: () => updates };
}
const fail = (image: FakeImage) => image.onerror?.("error");
const load = (image: FakeImage) => image.onload?.(new Event("load"));

test("encoded traversal, separators and controls never pass as a marker path", () => {
  for (const bad of ["/local/%2e%2e/private.png", "/local/.%2E/private.png", "/local/%2E./private.svg", "/local/%2e/m.png",
    "/local/%5c../private.png", "/local/%0a.png", "/local/a\u007f.png", "/local/%zz.png", "/local/%2f..%2fprivate.png"]) {
    assert.equal(markerImageUrl(bad), undefined, bad);
    assert.equal(readMowingMapScene({ schema_version: 1, revision: "a".repeat(64), map_index: 0, map_id: 7, name: "G", width: 10, height: 10,
      background_path: `/api/dreame_lawn_mower/mowing-map/entry/background/${"a".repeat(64)}`,
      overlay: { trail: [], position_status: "unavailable" }, marker_image_path: bad }, "/api/dreame_lawn_mower/mowing-map/entry").marker_image_path, null, bad);
  }
  assert.equal(markerImageUrl("/local/my%20mower.png"), "/local/my%20mower.png");
  assert.equal(markerImageUrl("/local/my mower.png"), "/local/my mower.png");
  for (const unicode of ["/local/mäher.png", "/local/kosiarka-żółta.png", "/local/机器人.png", "/local/m%C3%A4her.png"]) {
    assert.equal(markerImageUrl(unicode), unicode, unicode);
    assert.equal(readMowingMapScene({ schema_version: 1, revision: "a".repeat(64), map_index: 0, map_id: 7, name: "G", width: 10, height: 10,
      background_path: `/api/dreame_lawn_mower/mowing-map/entry/background/${"a".repeat(64)}`,
      overlay: { trail: [], position_status: "unavailable" }, marker_image_path: unicode }, "/api/dreame_lawn_mower/mowing-map/entry").marker_image_path, unicode);
  }
});

test("a picture that failed comes back after it is cleared and set again, or after a retry", () => {
  const { check, images, tick } = setup();
  check.sync("/local/a.png");
  fail(images[0]);
  assert.equal(check.usable("/local/a.png"), undefined, "a failed picture shows the built-in mower");
  check.sync(undefined);
  check.sync("/local/a.png");
  assert.equal(images.length, 2, "re-entering the path checks it again");
  assert.equal(check.usable("/local/a.png"), "/local/a.png");
  fail(images[1]);
  check.sync("/local/a.png");
  assert.equal(images.length, 2, "no new check before the retry time");
  tick(MARKER_RETRY_MS + 1);
  check.sync("/local/a.png");
  assert.equal(images.length, 3);
  load(images[2]);
  assert.equal(check.usable("/local/a.png"), "/local/a.png", "the file appeared, so the picture returns");
});

test("only the latest check reports, so A then B then A is not hidden by the first A failing late", () => {
  const { check, images } = setup();
  check.sync("/local/a.png");
  check.sync("/local/b.png");
  check.sync("/local/a.png");
  assert.equal(images[0].onerror, null, "the obsolete check is detached");
  fail(images[0]);
  assert.equal(check.usable("/local/a.png"), "/local/a.png");
  fail(images[2]);
  assert.equal(check.usable("/local/a.png"), undefined);
  check.reset();
  assert.equal(check.usable("/local/a.png"), "/local/a.png", "reset on disconnect forgets the failure");
});