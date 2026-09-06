import assert from "node:assert/strict";
import test from "node:test";
import { batteryPercent } from "../src/battery-presentation.ts";

test("battery fill accepts formatted percentages including zero and decimal comma", () => {
  for (const [text, value] of [["87 %", 87], ["0%", 0], ["100", 100], [" 42.5 % ", 42.5], ["42,5\u00a0%", 42.5]] as const) {
    assert.equal(batteryPercent(text), value);
  }
});

test("battery fill never invents a level from status text or invalid telemetry", () => {
  for (const text of [undefined, "", "unknown", "unavailable", "—", "-1%", "101%", "12 V", "40% charging", "Infinity", "12.3.4"]) {
    assert.equal(batteryPercent(text), undefined, text);
  }
});
