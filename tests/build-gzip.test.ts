import assert from "node:assert/strict";
import test from "node:test";
import { gunzipSync } from "node:zlib";

import { createDeterministicGzip } from "../build-gzip.mjs";

test("point-cloud gzip output is portable across build operating systems", () => {
  const source = Buffer.from("same point-cloud module on every platform\n", "utf8");
  const compressed = createDeterministicGzip(source, { level: 9 });

  assert.equal(compressed[9], 255);
  assert.deepEqual(gunzipSync(compressed), source);
});
