import assert from "node:assert/strict";
import test from "node:test";

import { entityIndex } from "../src/entity-index.ts";

test("entity indexes scan one immutable Home Assistant state snapshot once", () => {
  const states = {
    "sensor.second": { state: "2" },
    "camera.mower": { state: "streaming" },
    "sensor.first": { state: "1" },
  };

  const first = entityIndex(states);
  const second = entityIndex(states);

  assert.equal(second, first);
  assert.deepEqual(first.ids, [
    "camera.mower",
    "sensor.first",
    "sensor.second",
  ]);
  assert.deepEqual(first.byDomain("sensor"), [
    "sensor.first",
    "sensor.second",
  ]);
});

test("a replacement Home Assistant state snapshot receives a new index", () => {
  const first = entityIndex({ "sensor.one": { state: "1" } });
  const second = entityIndex({ "sensor.two": { state: "2" } });

  assert.notEqual(second, first);
  assert.deepEqual(second.byDomain("sensor"), ["sensor.two"]);
});
