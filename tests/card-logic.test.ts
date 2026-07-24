import test from "node:test";
import assert from "node:assert/strict";

import {
  autoDetectedControlEntities,
  cameraImageUrl,
  configuredHeaderSummaryEntities,
  defaultHelperEntities,
  entitySummaryLabel,
  firstAvailableEntity,
  numberControlSettings,
  prioritizedHeaderSummary,
  resolvedControlEntities,
  resolvedCoverageEntityIds,
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

test("progress fallback skips unavailable companion entities", () => {
  const fallback = entity("42");

  assert.equal(
    firstAvailableEntity([entity("unavailable"), entity("unknown"), fallback]),
    fallback,
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

test("zone mowing exposes writable preference controls when available", () => {
  const states = {
    "select.garden_map": entity("Map 1"),
    "select.garden_mowing_action": entity("Zone"),
    "select.garden_zone": entity("Zone 1"),
    "select.garden_selected_map_preference_mode": entity("Custom"),
    "number.garden_selected_zone_mowing_height": {
      state: "4.5",
      attributes: { min: 3.5, max: 6, step: 0.5, unit_of_measurement: "cm" },
    },
  };

  assert.deepEqual(autoDetectedControlEntities(states, "lawn_mower.garden"), [
    "select.garden_map",
    "select.garden_mowing_action",
    "select.garden_zone",
    "select.garden_selected_map_preference_mode",
    "number.garden_selected_zone_mowing_height",
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

test("coverage uses the runtime pair when it is available", () => {
  const states = {
    "sensor.garden_runtime_current_area": entity("125"),
    "sensor.garden_runtime_total_area": entity("500"),
    "sensor.garden_current_cleaned_area": entity("120"),
  };

  assert.deepEqual(
    resolvedCoverageEntityIds(states, "lawn_mower.garden"),
    {
      current: "sensor.garden_runtime_current_area",
      total: "sensor.garden_runtime_total_area",
    },
  );
});

test("coverage falls back to current mowed area and honors explicit entities", () => {
  const states = {
    "sensor.garden_runtime_current_area": entity("unavailable"),
    "sensor.garden_current_cleaned_area": entity("73"),
    "sensor.front_lawn_coverage": entity("81"),
    "sensor.front_lawn_target": entity("240"),
  };

  assert.deepEqual(
    resolvedCoverageEntityIds(states, "lawn_mower.garden"),
    {
      current: "sensor.garden_current_cleaned_area",
      total: undefined,
    },
  );
  assert.deepEqual(
    resolvedCoverageEntityIds(
      states,
      "lawn_mower.garden",
      "sensor.front_lawn_coverage",
      "sensor.front_lawn_target",
    ),
    {
      current: "sensor.front_lawn_coverage",
      total: "sensor.front_lawn_target",
    },
  );
});

test("number control settings preserve Home Assistant bounds and units", () => {
  assert.deepEqual(
    numberControlSettings({
      state: "4.5",
      attributes: {
        min: 3.5,
        max: 6,
        step: 0.5,
        unit_of_measurement: "cm",
      },
    }),
    { value: 4.5, min: 3.5, max: 6, step: 0.5, unit: "cm" },
  );
  assert.equal(numberControlSettings(entity("unavailable")), undefined);
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
