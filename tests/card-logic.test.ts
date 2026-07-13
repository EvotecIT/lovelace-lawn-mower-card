import test from "node:test";
import assert from "node:assert/strict";

import {
  autoDetectedControlEntities,
  cameraImageUrl,
  configuredHeaderSummaryEntities,
  defaultHelperEntities,
  entitySummaryLabel,
  prioritizedHeaderSummary,
  resolvedControlEntities,
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

test("camera URLs use stable Home Assistant revisions instead of render time", () => {
  const entityPicture = {
    state: "idle",
    attributes: { entity_picture: "/api/camera_proxy/camera.garden?token=abc" },
    last_updated: "2026-07-13T15:05:00+00:00",
  };

  assert.equal(
    cameraImageUrl("camera.garden", entityPicture),
    "/api/camera_proxy/camera.garden?token=abc&v=2026-07-13T15%3A05%3A00%2B00%3A00",
  );
  assert.equal(
    cameraImageUrl("camera.garden", entity("idle")),
    "/api/camera_proxy/camera.garden",
  );
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

test("target selectors remain visible when no mowing action selector exists", () => {
  const states = {
    "select.garden_map": entity("Map 1"),
    "select.garden_edge": entity("Edge 1"),
    "select.garden_zone": entity("Zone 1"),
    "select.garden_spot": entity("Spot 1"),
  };

  assert.deepEqual(autoDetectedControlEntities(states, "lawn_mower.garden"), [
    "select.garden_map",
    "select.garden_edge",
    "select.garden_zone",
    "select.garden_spot",
  ]);
});

test("explicitly configured selectors are preserved", () => {
  const states = {
    "select.garden_map": entity("Map 1"),
    "select.garden_mowing_action": entity("All area"),
    "select.garden_edge": entity("Edge 1"),
    "select.garden_zone": entity("Zone 1"),
    "select.garden_spot": entity("Spot 1"),
  };
  const configured = Object.keys(states);

  assert.deepEqual(
    resolvedControlEntities(states, "lawn_mower.garden", configured),
    configured,
  );
});

test("explicitly configured summary chips are preserved", () => {
  const configured = [
    "sensor.garden_runtime_mission_progress",
    "sensor.garden_runtime_current_area",
    "sensor.garden_runtime_total_area",
  ];

  assert.deepEqual(
    configuredHeaderSummaryEntities(configured),
    configured,
  );
});

test("summary labels prefer Home Assistant friendly names", () => {
  const progress = {
    state: "77%",
    attributes: { friendly_name: "Front lawn progress" },
  };

  assert.equal(
    entitySummaryLabel(
      "sensor.garden_runtime_mission_progress",
      progress,
      "Progress",
    ),
    "Front lawn progress",
  );
  assert.equal(
    entitySummaryLabel(
      "sensor.garden_weather_protection_status",
      entity("enabled"),
      "Rain protection",
    ),
    "Rain protection",
  );
});

test("explicit summary chips are prioritized before automatic chips", () => {
  assert.deepEqual(
    prioritizedHeaderSummary(
      ["Custom one", "Custom two", "Custom three"],
      ["Error blocked", "Battery 78%", "Rain Delay On"],
    ),
    ["Custom one", "Custom two", "Custom three", "Error blocked"],
  );
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
