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

function lzfLiteralEncode(content: Uint8Array): Uint8Array {
  const encoded: number[] = [];
  for (let offset = 0; offset < content.byteLength; offset += 32) {
    const chunk = content.subarray(offset, Math.min(offset + 32, content.byteLength));
    encoded.push(chunk.byteLength - 1, ...chunk);
  }
  return Uint8Array.from(encoded);
}

function binaryCompressedPointCloud(
  points: Array<[number, number, number, number]>,
): ArrayBuffer {
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
      "DATA binary_compressed",
      "",
    ].join("\n"),
  );
  const fields = new Uint8Array(points.length * 16);
  const fieldView = new DataView(fields.buffer);
  points.forEach(([x, y, z, color], index) => {
    fieldView.setFloat32(index * 4, x, true);
    fieldView.setFloat32(points.length * 4 + index * 4, y, true);
    fieldView.setFloat32(points.length * 8 + index * 4, z, true);
    fieldView.setUint32(points.length * 12 + index * 4, color, true);
  });
  const compressed = lzfLiteralEncode(fields);
  const result = new Uint8Array(header.byteLength + 8 + compressed.byteLength);
  result.set(header);
  const sizes = new DataView(result.buffer, header.byteLength, 8);
  sizes.setUint32(0, compressed.byteLength, true);
  sizes.setUint32(4, fields.byteLength, true);
  result.set(compressed, header.byteLength + 8);
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
  assert.deepEqual([...parsed.positions], [0, 1, 2, 9, 10, 11]);
  assert.deepEqual([...parsed.colors!], [255, 0, 0, 255, 255, 255]);
});

test("downsampling fills the point budget with evenly distributed samples", () => {
  const parsed = parsePointCloudBuffer(
    asciiPointCloud(
      Array.from({ length: 11 }, (_value, index) =>
        `${index} ${index + 1} ${index + 2} 0`,
      ),
    ),
    10,
  );

  assert.equal(parsed.sourcePoints, 11);
  assert.equal(parsed.renderedPoints, 10);
  assert.deepEqual(
    Array.from({ length: parsed.renderedPoints }, (_value, index) =>
      parsed.positions[index * 3],
    ),
    [0, 1, 2, 3, 4, 6, 7, 8, 9, 10],
  );
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
  assert.deepEqual([...parsed.colors!], [1, 4, 8, 103, 127, 154]);
});

test("binary-compressed parsing preserves field-major coordinates and colors", () => {
  const parsed = parsePointCloudBuffer(
    binaryCompressedPointCloud([
      [1, 2, 3, 0x112233],
      [4, 5, 6, 0x445566],
      [7, 8, 9, 0x778899],
    ]),
    2,
  );

  assert.equal(parsed.sourcePoints, 3);
  assert.equal(parsed.renderedPoints, 2);
  assert.deepEqual([...parsed.positions], [1, 2, 3, 7, 8, 9]);
  assert.deepEqual([...parsed.colors!], [1, 4, 8, 47, 63, 81]);
});

test("parser derives organized point count from WIDTH and HEIGHT", () => {
  const content = new TextEncoder().encode(
    [
      "# .PCD v0.7",
      "FIELDS x y z",
      "SIZE 4 4 4",
      "TYPE F F F",
      "COUNT 1 1 1",
      "WIDTH 2",
      "HEIGHT 2",
      "DATA ascii",
      "0 1 2",
      "3 4 5",
      "6 7 8",
      "9 10 11",
      "",
    ].join("\n"),
  ).buffer as ArrayBuffer;

  const parsed = parsePointCloudBuffer(content, 10);

  assert.equal(parsed.sourcePoints, 4);
  assert.equal(parsed.renderedPoints, 4);
  assert.deepEqual(
    [...parsed.positions],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  );
});

test("packed PCD colors are converted from sRGB into linear working values", () => {
  const parsed = parsePointCloudBuffer(
    asciiPointCloud(["0 1 2 8421504"]),
    10,
  );

  assert.deepEqual([...parsed.colors!], [55, 55, 55]);
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
  const compressed = binaryCompressedPointCloud([[1, 2, 3, 0]]);
  assert.throws(
    () => parsePointCloudBuffer(compressed.slice(0, compressed.byteLength - 1), 10),
    /truncated|invalid/,
  );
});
