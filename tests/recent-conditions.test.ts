import assert from "node:assert/strict";
import test from "node:test";
import { recentMowerConditions } from "../src/recent-conditions.ts";
import type { HomeAssistant } from "../src/card-config.ts";

const config = { type: "custom:lawn-mower-card", entity: "lawn_mower.garden" };
const historyId = "sensor.garden_last_mower_notification";
const condition = { severity: "error", message: "Wheel blocked", observed_at: "2026-10-03T12:00:00Z" };
const hass = (recent: unknown): HomeAssistant => ({
  states: {
    [config.entity]: { entity_id: config.entity, state: "docked", attributes: {} },
    [historyId]: { entity_id: historyId, state: "Wheel blocked", attributes: { recent } },
  },
  entities: {
    [config.entity]: { device_id: "garden", platform: "dreame_lawn_mower" },
    [historyId]: { device_id: "garden", platform: "dreame_lawn_mower" },
  },
  callService: async () => {}, callWS: async () => undefined as never,
  hassUrl: path => path,
});

test("history preserves active, cleared and unknown evidence independently of activity", () => {
  const result = recentMowerConditions(hass([
    { ...condition, active: true }, { ...condition, active: false }, condition,
  ]), config);
  assert.deepEqual(result.map(item => item.active), [true, false, undefined]);
  assert.equal(result[0].observedAt, condition.observed_at);
  assert.deepEqual(recentMowerConditions(hass([condition]), { ...config, show_recent_conditions: false }), []);
});

test("history rejects malformed rows and bounds messages and visible entries", () => {
  const rows = [null, {}, { ...condition, severity: "info" }, { ...condition, message: " " },
    ...Array.from({ length: 8 }, () => ({ ...condition, message: "x".repeat(300), observed_at: "invalid" }))];
  const result = recentMowerConditions(hass(rows), config);
  assert.equal(result.length, 5);
  assert.equal(result[0].message.length, 255);
  assert.equal(result[0].observedAt, undefined);
});

test("automatic history selection stays on the mower device and supports renamed entities", () => {
  const view = hass([condition]);
  view.entities = {
    [config.entity]: { device_id: "garden", platform: "dreame_lawn_mower" },
    [historyId]: { device_id: "other", platform: "dreame_lawn_mower" },
    "sensor.renamed_history": { device_id: "garden", platform: "dreame_lawn_mower", translation_key: "last_mower_notification" },
  };
  assert.deepEqual(recentMowerConditions(view, config), []);
  view.states = { ...view.states,
    "sensor.renamed_history": { ...view.states[historyId], entity_id: "sensor.renamed_history" },
  };
  assert.equal(recentMowerConditions(view, config).length, 1);
  assert.equal(recentMowerConditions(view, { ...config, notification_entity: historyId }).length, 1);
});
