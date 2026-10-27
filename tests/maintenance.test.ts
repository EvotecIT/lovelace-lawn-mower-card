import assert from "node:assert/strict";
import test from "node:test";
import { maintenanceParts } from "../src/maintenance.ts";
import type { HassEntity } from "../src/card-config.ts";

const mower = "lawn_mower.garden";
const entity = (entity_id: string, state: string, attributes: Record<string, unknown> = {}): HassEntity =>
  ({ entity_id, state, attributes });
const hass = (...items: HassEntity[]) => ({
  states: Object.fromEntries([entity(mower, "docked"), ...items].map(item => [item.entity_id, item])),
  entities: {},
});

test("each counter the mower reports becomes a part, in the integration's order", () => {
  const parts = maintenanceParts(hass(
    entity("sensor.garden_robot_maintenance_remaining", "0", { due: true, remaining_hours: 0 }),
    entity("sensor.garden_blade_remaining", "78.4", { status: "normal", remaining_hours: 46.2 }),
    entity("sensor.garden_cleaning_brush_remaining", "9", { warning: true }),
  ), mower);
  assert.deepEqual(parts.map(part => [part.key, part.status, part.percent]), [
    ["blade", "normal", 78.4], ["brush", "soon", 9], ["robot", "due", 0],
  ]);
  assert.equal(parts[0].remainingHours, 46.2);
});

test("a part offers Reset only when its reset button is enabled and available", () => {
  const parts = maintenanceParts(hass(
    entity("sensor.garden_blade_remaining", "50"),
    entity("button.garden_reset_blade_maintenance", "unknown"),
    entity("sensor.garden_robot_maintenance_remaining", "20"),
    entity("button.garden_reset_robot_maintenance_maintenance", "2026-10-27T10:00:00+00:00"),
    entity("sensor.garden_edge_trimmer_remaining", "40"),
    entity("button.garden_reset_edge_trimmer_maintenance", "unavailable"),
  ), mower);
  // A never-pressed button reads "unknown" in Home Assistant, so only "unavailable" hides it.
  assert.deepEqual(parts.map(part => [part.key, part.resetId]), [
    ["blade", "button.garden_reset_blade_maintenance"],
    ["robot", "button.garden_reset_robot_maintenance_maintenance"],
    ["edge_trimmer", undefined],
  ]);
  // Without its button entity (disabled by default in the integration), a part has no Reset.
  assert.equal(maintenanceParts(hass(entity("sensor.garden_blade_remaining", "50")), mower)[0].resetId, undefined);
});

test("unavailable or non-numeric counters are left out, and values are clamped", () => {
  assert.deepEqual(maintenanceParts(hass(
    entity("sensor.garden_blade_remaining", "unavailable"),
    entity("sensor.garden_cleaning_brush_remaining", ""),
  ), mower), []);
  assert.equal(maintenanceParts(hass(entity("sensor.garden_blade_remaining", "120")), mower)[0].percent, 100);
});
