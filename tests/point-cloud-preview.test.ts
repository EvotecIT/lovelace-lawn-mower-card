import assert from "node:assert/strict";
import test from "node:test";
import { spatialPreviewIndices } from "../src/point-cloud-preview.ts";

test("preview is bounded, deterministic and spans spatially distinct regions", () => {
  const points: number[] = [];
  // Dense, repeated foreground must not consume all spatial representatives.
  for (let index = 0; index < 1000; index += 1) points.push(0, 0, 0);
  for (let index = 1; index <= 100; index += 1) points.push(index, index, index);
  const positions = new Float32Array(points);
  const sampled = spatialPreviewIndices(positions, 8);
  assert.ok(sampled.length <= 8);
  assert.deepEqual(sampled, spatialPreviewIndices(positions, 8));
  assert.equal(sampled[0], 0);
  assert.ok(sampled.some((index) => positions[index * 3] >= 50));
  assert.equal(new Set(sampled).size, sampled.length);
});

test("small clouds retain all points and malformed budgets are rejected", () => {
  assert.deepEqual(spatialPreviewIndices(new Float32Array([1, 2, 3, 4, 5, 6]), 8), new Uint32Array([0, 1]));
  assert.throws(() => spatialPreviewIndices(new Float32Array(6), 0));
  assert.throws(() => spatialPreviewIndices(new Float32Array(4), 1));
});
