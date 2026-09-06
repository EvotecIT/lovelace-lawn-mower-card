/** Select spatial representatives without changing coordinates or color pairing. */
export function spatialPreviewIndices(positions: Float32Array, limit: number): Uint32Array {
  const count = positions.length / 3;
  if (!Number.isInteger(limit) || limit < 1 || !Number.isInteger(count)) {
    throw new Error("Invalid point-cloud preview limit or coordinates.");
  }
  if (count <= limit) return Uint32Array.from({ length: count }, (_, index) => index);
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let index = 0; index < positions.length; index += 1) {
    const axis = index % 3;
    const value = positions[index];
    if (!Number.isFinite(value)) throw new Error("Invalid preview coordinate.");
    min[axis] = Math.min(min[axis], value);
    max[axis] = Math.max(max[axis], value);
  }
  const divisions = Math.max(1, Math.ceil(Math.cbrt(limit)));
  const cells = new Map<number, number>();
  for (let point = 0; point < count; point += 1) {
    let cell = 0;
    for (let axis = 0; axis < 3; axis += 1) {
      const extent = max[axis] - min[axis];
      const normalized = extent ? (positions[point * 3 + axis] - min[axis]) / extent : 0;
      cell = cell * divisions + Math.min(divisions - 1, Math.floor(normalized * divisions));
    }
    if (!cells.has(cell)) cells.set(cell, point);
  }
  const candidates = [...cells.values()];
  const size = Math.min(candidates.length, limit);
  return Uint32Array.from({ length: size }, (_, index) =>
    candidates[size === 1 ? 0 : Math.round(index * (candidates.length - 1) / (size - 1))]);
}
