import assert from "node:assert/strict";
import test from "node:test";
import { mowingAreaProgress } from "../src/mowing-progress.ts";

const area = (state: string, attributes: Record<string, unknown> = {}) => ({
  entity_id: "sensor.area", state, attributes: { unit_of_measurement: "m²", ...attributes },
});

test("reported area distinguishes completed and remaining work without inventing geometry", () => {
  assert.deepEqual(mowingAreaProgress(area("25"), area("100")),
    { completed: 25, remaining: 75, total: 100, percent: 25, unit: "m²" });
  assert.equal(mowingAreaProgress(area("0"), area("100"))?.remaining, 100);
  assert.equal(mowingAreaProgress(area("100"), area("100"))?.remaining, 0);
});

test("cached, invalid, differently scoped or incompatible totals never produce remaining work", () => {
  for (const attributes of [{ cached: true }, { frame_valid: false }, { task_id: 9 },
    { region_id: 2 }, { map_index: 1 }, { unit_of_measurement: "ft²" }]) {
    assert.equal(mowingAreaProgress(area("25", attributes), area("100")), undefined);
    assert.equal(mowingAreaProgress(area("25"), area("100", attributes)), undefined);
  }
  for (const value of ["", " ", "unavailable", "Infinity", "NaN", "-1", "101"]) {
    assert.equal(mowingAreaProgress(area(value), area("100")), undefined);
  }
  assert.equal(mowingAreaProgress(area("0"), area("0")), undefined);
  assert.equal(mowingAreaProgress(area("10"), undefined), undefined);
  assert.equal(mowingAreaProgress(area("25", { task_id: 9 }), area("100", { task_id: 9 }))?.percent, 25);
});
