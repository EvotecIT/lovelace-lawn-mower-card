import assert from "node:assert/strict";
import test from "node:test";
import { controlsLayout, settingsSummary } from "../src/settings-sheet.ts";

test("settings live in the sheet unless the card asks for inline controls", () => {
  assert.equal(controlsLayout(undefined), "sheet");
  assert.equal(controlsLayout("sheet"), "sheet");
  assert.equal(controlsLayout("inline"), "inline");
  assert.equal(controlsLayout("something else"), "sheet");
});

test("the settings row lists the first values and counts the rest", () => {
  assert.equal(settingsSummary(["2 plans", "Map 1", "Zone mowing"]), "2 plans · Map 1 · Zone mowing");
  assert.equal(settingsSummary(["2 plans", "Map 1", "Zone mowing", "0°", "Point 3"]), "2 plans · Map 1 · Zone mowing · +2");
});

test("empty and repeated values are left out of the settings row", () => {
  assert.equal(settingsSummary([undefined, " ", "Map 1", "Map 1"]), "Map 1");
  assert.equal(settingsSummary([]), "");
});
