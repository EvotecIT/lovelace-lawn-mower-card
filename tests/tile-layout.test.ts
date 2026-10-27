import assert from "node:assert/strict";
import test from "node:test";
import { cardGridOptions, tileSecondary } from "../src/tile-layout.ts";

test("each layout tells a Sections view its default size and limits", () => {
  assert.deepEqual(cardGridOptions("tile"), { columns: 6, rows: 1, min_columns: 6, min_rows: 1, max_rows: 1 });
  assert.deepEqual(cardGridOptions("compact"), { columns: 12, rows: "auto", min_columns: 6 });
  for (const layout of ["default", "wide", "hero"] as const) {
    assert.deepEqual(cardGridOptions(layout), { columns: 12, rows: "auto", min_columns: 9 });
  }
});

test("the tile line explains an alert before anything else", () => {
  assert.equal(tileSecondary("Docked", "Rain delay · Mowing resumes after 16:20", ["87 %"]), "Rain delay · Mowing resumes after 16:20");
  assert.equal(tileSecondary("Mowing", undefined, ["62 %", undefined, "87 %"]), "Mowing · 62 % · 87 %");
  assert.equal(tileSecondary("Docked", undefined, [undefined, "Next run Wed 8:15", " "]), "Docked · Next run Wed 8:15");
});
