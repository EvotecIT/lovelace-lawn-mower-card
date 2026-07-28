type ParseRequest = {
  id: number;
  content: ArrayBuffer;
  maxPoints: number;
};

export type PointCloudWorkerResult = {
  id: number;
  positions: ArrayBuffer;
  colors?: ArrayBuffer;
  sourcePoints: number;
  renderedPoints: number;
  hasColors: boolean;
};

export type ParsedPointCloud = {
  positions: Float32Array;
  colors?: Uint8Array;
  sourcePoints: number;
  renderedPoints: number;
};

type Header = {
  fields: string[];
  sizes: number[];
  types: string[];
  counts: number[];
  points: number;
  data: "ascii" | "binary" | "binary_compressed";
  payloadOffset: number;
};

const HEADER_LIMIT = 64 * 1024;
const MAX_DECOMPRESSED_BYTES = 64 * 1024 * 1024;

function parseHeader(content: Uint8Array): Header {
  const limit = Math.min(content.byteLength, HEADER_LIMIT);
  let payloadOffset = -1;
  for (let index = 0; index < limit; index += 1) {
    if (content[index] !== 10) {
      continue;
    }
    const start = (() => {
      for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
        if (content[cursor] === 10) {
          return cursor + 1;
        }
      }
      return 0;
    })();
    const line = new TextDecoder("ascii")
      .decode(content.subarray(start, index))
      .trim()
      .toUpperCase();
    if (line.startsWith("DATA ")) {
      payloadOffset = index + 1;
      break;
    }
  }
  if (payloadOffset < 0) {
    throw new Error("The PCD header does not contain a DATA line.");
  }
  const text = new TextDecoder("ascii").decode(
    content.subarray(0, payloadOffset),
  );
  const values = new Map<string, string[]>();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const [key, ...items] = line.split(/\s+/);
    values.set(key.toUpperCase(), items);
  }
  const fields = values.get("FIELDS") || [];
  const sizes = (values.get("SIZE") || []).map(Number);
  const types = values.get("TYPE") || [];
  const counts = (values.get("COUNT") || fields.map(() => "1")).map(Number);
  const points = Number(values.get("POINTS")?.[0]);
  const data = values.get("DATA")?.[0]?.toLowerCase();
  if (
    !fields.length ||
    !["x", "y", "z"].every((field) => fields.includes(field)) ||
    fields.length !== sizes.length ||
    fields.length !== types.length ||
    fields.length !== counts.length ||
    !sizes.every((value) => Number.isSafeInteger(value) && value > 0) ||
    !counts.every((value) => Number.isSafeInteger(value) && value > 0) ||
    !types.every((value) => ["F", "I", "U"].includes(value)) ||
    !Number.isSafeInteger(points) ||
    points < 0 ||
    !["ascii", "binary", "binary_compressed"].includes(data || "")
  ) {
    throw new Error("The PCD header is not supported.");
  }
  return {
    fields,
    sizes,
    types,
    counts,
    points,
    data: data as Header["data"],
    payloadOffset,
  };
}

function scalarOffsets(header: Header): {
  scalarIndices: number[];
  byteOffsets: number[];
  byteStride: number;
} {
  const scalarIndices: number[] = [];
  const byteOffsets: number[] = [];
  let scalar = 0;
  let byte = 0;
  for (let index = 0; index < header.fields.length; index += 1) {
    scalarIndices[index] = scalar;
    byteOffsets[index] = byte;
    scalar += header.counts[index];
    byte += header.sizes[index] * header.counts[index];
  }
  return { scalarIndices, byteOffsets, byteStride: byte };
}

function numericReader(
  view: DataView,
  offset: number,
  size: number,
  type: string,
): number {
  if (type === "F") {
    if (size === 4) return view.getFloat32(offset, true);
    if (size === 8) return view.getFloat64(offset, true);
  }
  if (type === "I") {
    if (size === 1) return view.getInt8(offset);
    if (size === 2) return view.getInt16(offset, true);
    if (size === 4) return view.getInt32(offset, true);
  }
  if (type === "U") {
    if (size === 1) return view.getUint8(offset);
    if (size === 2) return view.getUint16(offset, true);
    if (size === 4) return view.getUint32(offset, true);
  }
  throw new Error(`Unsupported PCD scalar ${type}${size}.`);
}

function packedColor(value: number): [number, number, number] {
  const packed = value >>> 0;
  return [(packed >> 16) & 255, (packed >> 8) & 255, packed & 255];
}

function packedAsciiColor(value: number, type: string): [number, number, number] {
  if (type !== "F") {
    return packedColor(value);
  }
  const floating = new Float32Array([value]);
  return packedColor(new Uint32Array(floating.buffer)[0]);
}

function parseBinary(
  content: ArrayBuffer,
  header: Header,
  step: number,
  targetPoints: number,
): { positions: Float32Array; colors?: Uint8Array; count: number } {
  const { byteOffsets, byteStride } = scalarOffsets(header);
  const xIndex = header.fields.indexOf("x");
  const yIndex = header.fields.indexOf("y");
  const zIndex = header.fields.indexOf("z");
  const colorIndex = Math.max(
    header.fields.indexOf("rgb"),
    header.fields.indexOf("rgba"),
  );
  const positions = new Float32Array(targetPoints * 3);
  const colors = colorIndex >= 0 ? new Uint8Array(targetPoints * 3) : undefined;
  const view = new DataView(content);
  if (
    header.payloadOffset + header.points * byteStride >
    content.byteLength
  ) {
    throw new Error("The binary PCD payload is truncated.");
  }
  let output = 0;
  for (let point = 0; point < header.points; point += step) {
    const base = header.payloadOffset + point * byteStride;
    const outputOffset = output * 3;
    for (const [axis, fieldIndex] of [xIndex, yIndex, zIndex].entries()) {
      const value = numericReader(
        view,
        base + byteOffsets[fieldIndex],
        header.sizes[fieldIndex],
        header.types[fieldIndex],
      );
      if (!Number.isFinite(value)) {
        throw new Error("The PCD payload contains an invalid coordinate.");
      }
      positions[outputOffset + axis] = value;
    }
    if (colors && colorIndex >= 0) {
      const colorOffset = base + byteOffsets[colorIndex];
      const packed = view.getUint32(colorOffset, true);
      colors.set(packedColor(packed), outputOffset);
    }
    output += 1;
  }
  return {
    positions: output === targetPoints ? positions : positions.slice(0, output * 3),
    colors:
      colors && output !== targetPoints ? colors.slice(0, output * 3) : colors,
    count: output,
  };
}

function decompressLzf(input: Uint8Array, outputLength: number): Uint8Array {
  const output = new Uint8Array(outputLength);
  let inputOffset = 0;
  let outputOffset = 0;
  while (inputOffset < input.byteLength) {
    const control = input[inputOffset++];
    if (control < 32) {
      const length = control + 1;
      if (
        inputOffset + length > input.byteLength ||
        outputOffset + length > outputLength
      ) {
        throw new Error("The compressed PCD payload is invalid.");
      }
      output.set(
        input.subarray(inputOffset, inputOffset + length),
        outputOffset,
      );
      inputOffset += length;
      outputOffset += length;
      continue;
    }

    let length = control >> 5;
    let reference = outputOffset - ((control & 0x1f) << 8) - 1;
    if (inputOffset >= input.byteLength) {
      throw new Error("The compressed PCD payload is invalid.");
    }
    if (length === 7) {
      length += input[inputOffset++];
      if (inputOffset >= input.byteLength) {
        throw new Error("The compressed PCD payload is invalid.");
      }
    }
    reference -= input[inputOffset++];
    length += 2;
    if (
      reference < 0 ||
      reference >= outputOffset ||
      outputOffset + length > outputLength
    ) {
      throw new Error("The compressed PCD payload is invalid.");
    }
    for (let index = 0; index < length; index += 1) {
      output[outputOffset++] = output[reference++];
    }
  }
  if (outputOffset !== outputLength) {
    throw new Error("The compressed PCD payload has an invalid size.");
  }
  return output;
}

function parseBinaryCompressed(
  content: ArrayBuffer,
  header: Header,
  step: number,
  targetPoints: number,
): { positions: Float32Array; colors?: Uint8Array; count: number } {
  const { byteOffsets, byteStride } = scalarOffsets(header);
  const expectedSize = header.points * byteStride;
  if (
    !Number.isSafeInteger(expectedSize) ||
    expectedSize < 0 ||
    expectedSize > MAX_DECOMPRESSED_BYTES ||
    header.payloadOffset + 8 > content.byteLength
  ) {
    throw new Error("The compressed PCD payload size is not supported.");
  }
  const sizes = new DataView(content, header.payloadOffset, 8);
  const compressedSize = sizes.getUint32(0, true);
  const decompressedSize = sizes.getUint32(4, true);
  const compressedOffset = header.payloadOffset + 8;
  if (
    decompressedSize !== expectedSize ||
    compressedSize > content.byteLength - compressedOffset
  ) {
    throw new Error("The compressed PCD payload is truncated.");
  }
  const decompressed = decompressLzf(
    new Uint8Array(content, compressedOffset, compressedSize),
    decompressedSize,
  );
  const view = new DataView(
    decompressed.buffer,
    decompressed.byteOffset,
    decompressed.byteLength,
  );
  const xIndex = header.fields.indexOf("x");
  const yIndex = header.fields.indexOf("y");
  const zIndex = header.fields.indexOf("z");
  const colorIndex = Math.max(
    header.fields.indexOf("rgb"),
    header.fields.indexOf("rgba"),
  );
  const positions = new Float32Array(targetPoints * 3);
  const colors = colorIndex >= 0 ? new Uint8Array(targetPoints * 3) : undefined;
  let output = 0;
  for (let point = 0; point < header.points; point += step) {
    const outputOffset = output * 3;
    for (const [axis, fieldIndex] of [xIndex, yIndex, zIndex].entries()) {
      const fieldOffset =
        header.points * byteOffsets[fieldIndex] +
        point * header.sizes[fieldIndex];
      const value = numericReader(
        view,
        fieldOffset,
        header.sizes[fieldIndex],
        header.types[fieldIndex],
      );
      if (!Number.isFinite(value)) {
        throw new Error("The PCD payload contains an invalid coordinate.");
      }
      positions[outputOffset + axis] = value;
    }
    if (colors && colorIndex >= 0) {
      const colorOffset =
        header.points * byteOffsets[colorIndex] +
        point * header.sizes[colorIndex];
      colors.set(packedColor(view.getUint32(colorOffset, true)), outputOffset);
    }
    output += 1;
  }
  return {
    positions: output === targetPoints ? positions : positions.slice(0, output * 3),
    colors:
      colors && output !== targetPoints ? colors.slice(0, output * 3) : colors,
    count: output,
  };
}

function parseAscii(
  bytes: Uint8Array,
  header: Header,
  step: number,
  targetPoints: number,
): { positions: Float32Array; colors?: Uint8Array; count: number } {
  const { scalarIndices } = scalarOffsets(header);
  const xIndex = header.fields.indexOf("x");
  const yIndex = header.fields.indexOf("y");
  const zIndex = header.fields.indexOf("z");
  const colorIndex = Math.max(
    header.fields.indexOf("rgb"),
    header.fields.indexOf("rgba"),
  );
  const positions = new Float32Array(targetPoints * 3);
  const colors = colorIndex >= 0 ? new Uint8Array(targetPoints * 3) : undefined;
  const decoder = new TextDecoder("ascii");
  const requiredScalars = header.counts.reduce((total, count) => total + count, 0);
  let lineStart = header.payloadOffset;
  let sourcePoint = 0;
  let output = 0;
  for (
    let cursor = header.payloadOffset;
    cursor <= bytes.byteLength && sourcePoint < header.points;
    cursor += 1
  ) {
    if (cursor < bytes.byteLength && bytes[cursor] !== 10) {
      continue;
    }
    const line = decoder.decode(bytes.subarray(lineStart, cursor)).trim();
    lineStart = cursor + 1;
    if (!line) {
      continue;
    }
    if (sourcePoint % step === 0) {
      const values = line.split(/\s+/).map(Number);
      if (
        values.length < requiredScalars ||
        ![xIndex, yIndex, zIndex].every((fieldIndex) =>
          Number.isFinite(values[scalarIndices[fieldIndex]]),
        )
      ) {
        throw new Error("The ASCII PCD payload contains an invalid point.");
      }
      const outputOffset = output * 3;
      positions[outputOffset] = values[scalarIndices[xIndex]];
      positions[outputOffset + 1] = values[scalarIndices[yIndex]];
      positions[outputOffset + 2] = values[scalarIndices[zIndex]];
      if (colors && colorIndex >= 0) {
        colors.set(
          packedAsciiColor(
            values[scalarIndices[colorIndex]],
            header.types[colorIndex],
          ),
          outputOffset,
        );
      }
      output += 1;
    }
    sourcePoint += 1;
  }
  return {
    positions: output === targetPoints ? positions : positions.slice(0, output * 3),
    colors:
      colors && output !== targetPoints ? colors.slice(0, output * 3) : colors,
    count: output,
  };
}

export function parsePointCloudBuffer(
  content: ArrayBuffer,
  maxPoints: number,
): ParsedPointCloud {
  if (!Number.isSafeInteger(maxPoints) || maxPoints < 1) {
    throw new Error("The point-cloud render limit must be a positive integer.");
  }
  const bytes = new Uint8Array(content);
  const header = parseHeader(bytes);
  const { byteStride } = scalarOffsets(header);
  if (!Number.isSafeInteger(byteStride) || byteStride < 1) {
    throw new Error("The PCD point stride is invalid.");
  }
  const coordinateIndices = ["x", "y", "z"].map((field) =>
    header.fields.indexOf(field),
  );
  for (const fieldIndex of coordinateIndices) {
    const type = header.types[fieldIndex];
    const size = header.sizes[fieldIndex];
    if (
      (type === "F" && size !== 4 && size !== 8) ||
      (type !== "F" && ![1, 2, 4].includes(size))
    ) {
      throw new Error("The PCD coordinate encoding is not supported.");
    }
  }
  const colorIndex = Math.max(
    header.fields.indexOf("rgb"),
    header.fields.indexOf("rgba"),
  );
  if (colorIndex >= 0 && header.sizes[colorIndex] !== 4) {
    throw new Error("The packed PCD color encoding is not supported.");
  }
  const step = Math.max(1, Math.ceil(header.points / maxPoints));
  const targetPoints = Math.ceil(header.points / step);
  const parsed =
    header.data === "binary"
      ? parseBinary(content, header, step, targetPoints)
      : header.data === "binary_compressed"
        ? parseBinaryCompressed(content, header, step, targetPoints)
        : parseAscii(bytes, header, step, targetPoints);
  return {
    positions: parsed.positions,
    colors: parsed.colors,
    sourcePoints: header.points,
    renderedPoints: parsed.count,
  };
}

if (typeof self !== "undefined" && typeof self.postMessage === "function") {
  self.onmessage = (event: MessageEvent<ParseRequest>): void => {
    const { id, content, maxPoints } = event.data;
    try {
      const parsed = parsePointCloudBuffer(content, maxPoints);
      const result: PointCloudWorkerResult = {
        id,
        positions: parsed.positions.buffer as ArrayBuffer,
        colors: parsed.colors?.buffer as ArrayBuffer | undefined,
        sourcePoints: parsed.sourcePoints,
        renderedPoints: parsed.renderedPoints,
        hasColors: Boolean(parsed.colors),
      };
      const transfer: Transferable[] = [result.positions];
      if (result.colors) {
        transfer.push(result.colors);
      }
      self.postMessage(result, { transfer });
    } catch (error) {
      self.postMessage({
        id,
        error:
          error instanceof Error ? error.message : "Point-cloud parsing failed.",
      });
    }
  };
}
