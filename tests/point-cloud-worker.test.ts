import assert from "node:assert/strict";
import test from "node:test";

import { parsePointCloudBuffer } from "../src/point-cloud-worker.ts";

function asciiPointCloud(lines: string[], fields = "x y z rgb"): ArrayBuffer {
  const pointCount = lines.filter((line) => line.trim().length > 0).length;
  const text = [
    "# .PCD v0.7",
    `FIELDS ${fields}`,
    "SIZE 4 4 4 4",
    "TYPE F F F U",
    "COUNT 1 1 1 1",
    `WIDTH ${pointCount}`,
    "HEIGHT 1",
    `POINTS ${pointCount}`,
    "DATA ascii",
    ...lines,
    "",
  ].join("\n");
  return new TextEncoder().encode(text).buffer as ArrayBuffer;
}

function binaryPointCloud(points: Array<[number, number, number, number]>): ArrayBuffer {
  const header = new TextEncoder().encode(
    [
      "# .PCD v0.7",
      "FIELDS x y z rgb",
      "SIZE 4 4 4 4",
      "TYPE F F F U",
      "COUNT 1 1 1 1",
      `WIDTH ${points.length}`,
      "HEIGHT 1",
      `POINTS ${points.length}`,
      "DATA binary",
      "",
    ].join("\n"),
  );
  const result = new Uint8Array(header.byteLength + points.length * 16);
  result.set(header);
  const view = new DataView(result.buffer);
  points.forEach(([x, y, z, color], index) => {
    const offset = header.byteLength + index * 16;
    view.setFloat32(offset, x, true);
    view.setFloat32(offset + 4, y, true);
    view.setFloat32(offset + 8, z, true);
    view.setUint32(offset + 12, color, true);
  });
  return result.buffer;
}

test("ASCII parsing preserves coordinates and deterministically downsamples", () => {
  const parsed = parsePointCloudBuffer(
    asciiPointCloud([
      "0 1 2 16711680",
      "3 4 5 65280",
      "6 7 8 255",
      "9 10 11 16777215",
    ]),
    2,
  );

  assert.equal(parsed.sourcePoints, 4);
  assert.equal(parsed.renderedPoints, 2);
  assert.deepEqual([...parsed.positions], [0, 1, 2, 6, 7, 8]);
  assert.deepEqual([...parsed.colors!], [255, 0, 0, 0, 0, 255]);
});

test("ASCII parsing skips blank rows without consuming declared points", () => {
  const parsed = parsePointCloudBuffer(
    asciiPointCloud([
      "",
      "0 1 2 16711680",
      "   ",
      "3 4 5 65280",
      "",
      "6 7 8 255",
    ]),
    10,
  );

  assert.equal(parsed.sourcePoints, 3);
  assert.equal(parsed.renderedPoints, 3);
  assert.deepEqual([...parsed.positions], [0, 1, 2, 3, 4, 5, 6, 7, 8]);
});

test("binary parsing reads packed colors without copying the source payload", () => {
  const parsed = parsePointCloudBuffer(
    binaryPointCloud([
      [1.5, 2.5, 3.5, 0x112233],
      [-1, -2, -3, 0xaabbcc],
    ]),
    10,
  );

  assert.equal(parsed.renderedPoints, 2);
  assert.deepEqual([...parsed.positions], [1.5, 2.5, 3.5, -1, -2, -3]);
  assert.deepEqual([...parsed.colors!], [0x11, 0x22, 0x33, 0xaa, 0xbb, 0xcc]);
});

test("parser rejects unsafe limits, malformed coordinates, and truncated binary", () => {
  assert.throws(
    () => parsePointCloudBuffer(asciiPointCloud(["0 1 2 0"]), 0),
    /positive integer/,
  );
  assert.throws(
    () => parsePointCloudBuffer(asciiPointCloud(["NaN 1 2 0"]), 10),
    /invalid point/,
  );

  const binary = binaryPointCloud([[1, 2, 3, 0]]);
  assert.throws(
    () => parsePointCloudBuffer(binary.slice(0, binary.byteLength - 1), 10),
    /truncated/,
  );
});
