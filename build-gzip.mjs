import { gzipSync } from "node:zlib";

const GZIP_ID1 = 0x1f;
const GZIP_ID2 = 0x8b;
const DEFLATE_METHOD = 8;
const OPERATING_SYSTEM_OFFSET = 9;
const UNKNOWN_OPERATING_SYSTEM = 255;

export function createDeterministicGzip(input, options) {
  const compressed = gzipSync(input, options);
  if (
    compressed.length <= OPERATING_SYSTEM_OFFSET ||
    compressed[0] !== GZIP_ID1 ||
    compressed[1] !== GZIP_ID2 ||
    compressed[2] !== DEFLATE_METHOD
  ) {
    throw new Error("The point-cloud build did not produce a valid gzip stream.");
  }

  compressed[OPERATING_SYSTEM_OFFSET] = UNKNOWN_OPERATING_SYSTEM;
  return compressed;
}
