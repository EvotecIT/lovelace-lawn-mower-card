import test from "node:test";
import assert from "node:assert/strict";

import {
  autoDetectedControlEntities,
  defaultHelperEntities,
  type MinimalHassEntity,
} from "../src/card-logic.ts";

const entity = (state: string): MinimalHassEntity => ({ state });

test("all-area mowing hides irrelevant target selectors", () => {
  const states = {
    "select.garden_map": entity("Map 1"),
    "select.garden_mowing_action": entity("All area"),
    "select.garden_edge": entity("Edge 1"),
    "select.garden_zone": entity("Zone 1"),
    "select.garden_spot": entity("Spot 1"),
  };

  assert.deepEqual(autoDetectedControlEntities(states, "lawn_mower.garden"), [
    "select.garden_map",
    "select.garden_mowing_action",
  ]);
});

test("zone mowing shows only the zone target", () => {
  const states = {
    "select.garden_map": entity("Map 1"),
    "select.garden_mowing_action": entity("Zone"),
    "select.garden_edge": entity("Edge 1"),
    "select.garden_zone": entity("Zone 1"),
    "select.garden_spot": entity("Spot 1"),
  };

  assert.deepEqual(autoDetectedControlEntities(states, "lawn_mower.garden"), [
    "select.garden_map",
    "select.garden_mowing_action",
    "select.garden_zone",
  ]);
});

test("default helpers expose user features and omit diagnostics", () => {
  const states = {
    "camera.backyard_garden_live_video": entity("idle"),
    "calendar.garden_schedule": entity("off"),
    "camera.garden_live_path_map": entity("idle"),
    "camera.garden_all_maps": entity("idle"),
    "camera.garden_map_data": entity("idle"),
    "button.garden_capture_operation_snapshot": entity("unknown"),
  };

  assert.deepEqual(
    defaultHelperEntities(states, "lawn_mower.garden").map(
      ({ entityId, label }) => [entityId, label],
    ),
    [
      ["camera.backyard_garden_live_video", "Live Video"],
      ["calendar.garden_schedule", "Schedule"],
      ["camera.garden_live_path_map", "Live Map"],
      ["camera.garden_all_maps", "All Maps"],
    ],
  );
});
