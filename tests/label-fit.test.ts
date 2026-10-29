import assert from "node:assert/strict";
import test from "node:test";
import { fitLabelRows, looseTabColumns } from "../src/label-fit.ts";

const row = (labels: Array<[number, number]>) => {
  const seen: Array<string | undefined> = [];
  const dataset: Record<string, string> = {};
  return {
    seen,
    dataset: new Proxy(dataset, { set(target, key, value) { target[key as string] = value; seen.push(value); return true; } }) as DOMStringMap,
    querySelectorAll: () => labels.map(([text, box]) => ({ text, box })),
  };
};

test("a row is loosened only when a whole word sticks out of its button", () => {
  const fits = row([[60, 60], [40, 58]]), tight = row([[60, 60], [71, 63]]), empty = row([]);
  const overflow = (label: { text: number; box: number }) => label.text - label.box;
  fitLabelRows([fits, tight, empty], overflow);
  assert.equal(fits.dataset.fit, undefined);
  assert.equal(tight.dataset.fit, "loose");
  assert.equal(empty.dataset.fit, undefined);
  assert.deepEqual(tight.seen, ["measure", "loose"], "measured with unbreakable words before deciding");
  // A tenth of a pixel already splits a word; a few hundredths of rounding do not.
  const tenth = row([[63.4, 63.29]]), rounding = row([[63.31, 63.29]]);
  fitLabelRows([tenth, rounding], overflow);
  assert.equal(tenth.dataset.fit, "loose");
  assert.equal(rounding.dataset.fit, undefined);
});

test("loose tab rows use two rows", () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6].map(looseTabColumns), [1, 1, 2, 2, 3, 3]);
});