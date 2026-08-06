import test from "node:test";
import assert from "node:assert/strict";

import {
  autoDetectedControlEntities,
  cameraBlockReason,
  cameraCanBeAutoSelected,
  cameraCanBePresented,
  cameraCanRecoverWhileUnavailable,
  cameraImageUrl,
  cameraReconnectDelayMs,
  cameraRecoveryMarker,
  cameraRecoveryVerified,
  configuredHeaderSummaryEntities,
  defaultHelperEntities,
  entitySummaryLabel,
  firstAvailableEntity,
  heroViewRestorationAllowed,
  isPreferenceControlEntity,
  numberControlSettings,
  prioritizedHeaderSummary,
  resolvedControlEntities,
  resolvedCoverageEntityIds,
  resolvedMowerCompanionEntity,
  resolvedOwnedMowerCompanionEntity,
  type MinimalHassEntity,
} from "../src/card-logic.ts";

const entity = (state: string): MinimalHassEntity => ({ state });

test("Hero reconnect state restores only into the Hero layout", () => {
  assert.equal(heroViewRestorationAllowed("hero"), true);
  assert.equal(heroViewRestorationAllowed("default"), false);
  assert.equal(heroViewRestorationAllowed("compact"), false);
  assert.equal(heroViewRestorationAllowed("wide"), false);
  assert.equal(heroViewRestorationAllowed(undefined), false);
});

const dreameRegistry = (
  mowerEntityId: string,
  entityIds: readonly string[],
) => Object.fromEntries([
  [
    mowerEntityId,
    { platform: "dreame_lawn_mower", device_id: "mower-device" },
  ],
  ...entityIds.map((entityId) => [
    entityId,
    { platform: "dreame_lawn_mower", device_id: "mower-device" },
  ]),
]);

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

test("camera safety blocks are normalized and bounded for display", () => {
  assert.equal(
    cameraBlockReason({
      state: "idle",
      attributes: {
        video_block_reason:
          "  Camera stream handshake probe is blocked\nwhile the mower is docked.  ",
      },
    }),
    "Camera stream handshake probe is blocked while the mower is docked.",
  );
  assert.equal(
    cameraBlockReason({
      state: "idle",
      attributes: { video_block_reason: "x".repeat(400) },
    })?.length,
    280,
  );
  assert.equal(cameraBlockReason(entity("idle")), undefined);
});

test("camera recovery backoff is bounded for repeated Wi-Fi failures", () => {
  assert.deepEqual(
    Array.from({ length: 8 }, (_value, attempt) =>
      cameraReconnectDelayMs(attempt),
    ),
    [3_000, 6_000, 12_000, 24_000, 30_000, 30_000, 30_000, 30_000],
  );
});

test("camera recovery markers ignore safety blocks and reset on verified media", () => {
  const reconnecting: MinimalHassEntity = {
    state: "idle",
    attributes: {
      video_recovery_pending: true,
      video_recovery_failure_count: 3,
      last_stream_error_at: "2026-07-28T20:00:00Z",
      xp2p_provisioning_cached: true,
      last_stream_health: {
        playback_session_verified: false,
      },
    },
  };

  assert.equal(
    cameraRecoveryMarker(reconnecting),
    "3:2026-07-28T20:00:00Z",
  );
  assert.equal(cameraRecoveryVerified(reconnecting), false);
  assert.equal(cameraCanRecoverWhileUnavailable(reconnecting), true);

  reconnecting.attributes!.video_block_reason = "The mower is docked.";
  assert.equal(cameraRecoveryMarker(reconnecting), undefined);
  assert.equal(cameraCanRecoverWhileUnavailable(reconnecting), false);

  reconnecting.attributes = {
    video_recovery_pending: false,
    last_stream_health: {
      playback_session_verified: true,
    },
  };
  assert.equal(cameraRecoveryVerified(reconnecting), true);
});

test("unavailable safety-blocked cameras remain presentable without recovery", () => {
  const blocked: MinimalHassEntity = {
    state: "unavailable",
    attributes: {
      video_block_reason: "The mower is docked.",
    },
  };
  const reconnecting: MinimalHassEntity = {
    state: "unavailable",
    attributes: {
      video_recovery_pending: true,
      video_recovery_failure_count: 1,
    },
  };

  assert.equal(cameraCanBePresented(blocked, false), true);
  assert.equal(cameraCanBePresented(reconnecting, false), false);
  assert.equal(cameraCanBePresented(reconnecting, true), true);
});

test("camera autofill excludes explicitly unsupported video entities", () => {
  const unsupported: MinimalHassEntity = {
    state: "unavailable",
    attributes: {
      video_capability_advertised: false,
      video_capability_observed: false,
      xp2p_provisioning_cached: false,
      lan_video_endpoint_cached: false,
    },
  };
  const cachedRoute: MinimalHassEntity = {
    ...unsupported,
    attributes: {
      ...unsupported.attributes,
      xp2p_provisioning_cached: true,
    },
  };

  assert.equal(cameraCanBeAutoSelected(unsupported), false);
  assert.equal(cameraCanBeAutoSelected(cachedRoute), true);
  assert.equal(cameraCanBeAutoSelected(entity("unavailable")), false);
  assert.equal(cameraCanBeAutoSelected(entity("idle")), true);
  assert.equal(
    defaultHelperEntities(
      { "camera.garden_live_video": unsupported },
      "lawn_mower.garden",
    ).some((helper) => helper.label === "Live Video"),
    false,
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

test("global mode exposes the complete active preference surface", () => {
  const states = {
    "select.garden_map": entity("Map 1"),
    "select.garden_mowing_action": entity("All area"),
    "select.garden_selected_map_preference_mode": entity("Global"),
    "number.garden_selected_map_mowing_height": entity("4.5"),
    "select.garden_selected_efficient_mode": entity("Efficient"),
    "select.garden_selected_obstacle_avoidance_height_cm": entity("5 cm"),
    "select.garden_selected_obstacle_avoidance_distance_cm": entity("15 cm"),
    "select.garden_selected_edge_mowing_walk_mode": entity("Along line"),
    "switch.garden_selected_edge_mowing_auto": entity("on"),
    "switch.garden_selected_edge_mowing_safe": entity("on"),
    "switch.garden_selected_edge_mowing_obstacle_avoidance": entity("on"),
    "switch.garden_selected_obstacle_avoidance_enabled": entity("on"),
    "switch.garden_selected_people": entity("on"),
    "switch.garden_selected_animals": entity("on"),
    "switch.garden_selected_objects": entity("on"),
  };

  assert.deepEqual(autoDetectedControlEntities(states, "lawn_mower.garden"), [
    "select.garden_map",
    "select.garden_mowing_action",
    "select.garden_selected_map_preference_mode",
    "number.garden_selected_map_mowing_height",
    "select.garden_selected_efficient_mode",
    "select.garden_selected_edge_mowing_walk_mode",
    "switch.garden_selected_edge_mowing_auto",
    "switch.garden_selected_edge_mowing_safe",
    "switch.garden_selected_edge_mowing_obstacle_avoidance",
    "switch.garden_selected_obstacle_avoidance_enabled",
    "select.garden_selected_obstacle_avoidance_height_cm",
    "select.garden_selected_obstacle_avoidance_distance_cm",
    "switch.garden_selected_people",
    "switch.garden_selected_animals",
    "switch.garden_selected_objects",
  ]);
  assert.equal(
    isPreferenceControlEntity("switch.garden_selected_people"),
    true,
  );
  assert.equal(isPreferenceControlEntity("select.garden_map"), false);
});

test("Dreame registry names and area prefixes auto-discover every mowing preference", () => {
  const states = {
    "select.dreame_a2_bodzio_map": entity("Map #1"),
    "select.dreame_a2_bodzio_mowing_action": entity("All area"),
    "select.ogrod_dreame_a2_bodzio_selected_map_preference_mode":
      entity("Global"),
    "number.ogrod_dreame_a2_bodzio_selected_map_mowing_height": entity("4"),
    "select.ogrod_dreame_a2_bodzio_selected_mowing_efficiency":
      entity("Efficient"),
    "select.ogrod_dreame_a2_bodzio_selected_mowing_direction_mode":
      entity("Mow at angle"),
    "number.ogrod_dreame_a2_bodzio_selected_mowing_direction": entity("5"),
    "select.ogrod_dreame_a2_bodzio_selected_turning_method":
      entity("Efficient"),
    "switch.ogrod_dreame_a2_bodzio_selected_automatic_edge_cutting":
      entity("on"),
    "switch.ogrod_dreame_a2_bodzio_selected_safe_edge_cutting": entity("on"),
    "switch.ogrod_dreame_a2_bodzio_selected_edgemaster": entity("off"),
    "switch.ogrod_dreame_a2_bodzio_selected_edge_obstacle_avoidance":
      entity("on"),
    "switch.ogrod_dreame_a2_bodzio_selected_lidar_obstacle_recognition":
      entity("on"),
    "select.ogrod_dreame_a2_bodzio_selected_obstacle_height": entity("5 cm"),
    "select.ogrod_dreame_a2_bodzio_selected_obstacle_distance":
      entity("15 cm"),
    "switch.ogrod_dreame_a2_bodzio_selected_avoid_people": entity("on"),
    "switch.ogrod_dreame_a2_bodzio_selected_avoid_animals": entity("on"),
    "switch.ogrod_dreame_a2_bodzio_selected_avoid_objects": entity("on"),
  };

  assert.deepEqual(
    autoDetectedControlEntities(
      states,
      "lawn_mower.dreame_a2_bodzio",
      dreameRegistry(
        "lawn_mower.dreame_a2_bodzio",
        Object.keys(states),
      ),
    ),
    Object.keys(states),
  );
  assert.equal(
    isPreferenceControlEntity(
      "number.ogrod_dreame_a2_bodzio_selected_mowing_direction",
    ),
    true,
  );
  assert.equal(
    isPreferenceControlEntity(
      "switch.ogrod_dreame_a2_bodzio_selected_edgemaster",
    ),
    true,
  );
});

test("mower companion resolution rejects unrelated target selectors", () => {
  const states = {
    "select.front_yard_zone": entity("Zone 1"),
    "select.ogrod_dreame_a2_bodzio_zone": entity("Zone 2"),
  };
  const entities = {
    "lawn_mower.dreame_a2_bodzio": {
      platform: "dreame_lawn_mower",
      device_id: "mower-device",
    },
    "select.front_yard_zone": {
      platform: "other",
      device_id: "other-device",
    },
    "select.ogrod_dreame_a2_bodzio_zone": {
      platform: "dreame_lawn_mower",
      device_id: "mower-device",
    },
  };

  assert.equal(
    resolvedMowerCompanionEntity(
      states,
      "lawn_mower.dreame_a2_bodzio",
      entities,
      "select",
      "zone",
    ),
    "select.ogrod_dreame_a2_bodzio_zone",
  );
  assert.equal(
    resolvedMowerCompanionEntity(
      states,
      "lawn_mower.unknown",
      entities,
      "select",
      "zone",
    ),
    undefined,
  );
});

test("ordinary prefixed discovery survives missing registry metadata", () => {
  const states = {
    "select.ogrod_dreame_a2_bodzio_zone": entity("Zone 2"),
  };

  assert.equal(
    resolvedMowerCompanionEntity(
      states,
      "lawn_mower.dreame_a2_bodzio",
      undefined,
      "select",
      "zone",
    ),
    "select.ogrod_dreame_a2_bodzio_zone",
  );
  assert.equal(
    resolvedOwnedMowerCompanionEntity(
      states,
      "lawn_mower.dreame_a2_bodzio",
      undefined,
      "select",
      "zone",
    ),
    undefined,
  );
});

test("mower companion resolution uses registry ownership and fails on ambiguity", () => {
  const states = {
    "select.renamed_zone": {
      state: "Front lawn (#1)",
      attributes: { friendly_name: "Garden Zone" },
    },
    "select.second_zone": {
      state: "Side lawn (#2)",
      attributes: { friendly_name: "Side Zone" },
    },
  };
  const mower = {
    platform: "dreame_lawn_mower",
    device_id: "mower-device",
  };
  const owned = {
    "lawn_mower.garden": mower,
    "select.renamed_zone": {
      platform: "dreame_lawn_mower",
      device_id: "mower-device",
      name: "Zone",
    },
    "select.second_zone": {
      platform: "other",
      device_id: "other-device",
      name: "Zone",
    },
  };

  assert.equal(
    resolvedOwnedMowerCompanionEntity(
      states,
      "lawn_mower.garden",
      owned,
      "select",
      "zone",
    ),
    "select.renamed_zone",
  );
  assert.equal(
    resolvedOwnedMowerCompanionEntity(
      states,
      "lawn_mower.garden",
      {
        ...owned,
        "select.second_zone": {
          platform: "dreame_lawn_mower",
          device_id: "mower-device",
          translation_key: "zone",
        },
      },
      "select",
      "zone",
    ),
    undefined,
  );
});

test("owned mower companion discovery skips an unowned exact-name collision", () => {
  const states = {
    "select.garden_zone": entity("Wrong zone"),
    "select.area_garden_zone": entity("Front lawn (#1)"),
  };
  const entities = {
    "lawn_mower.garden": {
      platform: "dreame_lawn_mower",
      device_id: "mower-device",
    },
    "select.garden_zone": {
      platform: "other",
      device_id: "other-device",
      name: "Zone",
    },
    "select.area_garden_zone": {
      platform: "dreame_lawn_mower",
      device_id: "mower-device",
      name: "Zone",
    },
  };

  assert.equal(
    resolvedOwnedMowerCompanionEntity(
      states,
      "lawn_mower.garden",
      entities,
      "select",
      "zone",
    ),
    "select.area_garden_zone",
  );
});

test("legacy Dreame entity names remain discoverable after preference renames", () => {
  const states = {
    "select.dreame_a2_bodzio_map": entity("Map #1"),
    "select.dreame_a2_bodzio_mowing_action": entity("All area"),
    "select.ogrod_dreame_a2_bodzio_selected_map_preference_mode":
      entity("Global"),
    "select.ogrod_dreame_a2_bodzio_selected_edge_cutting_style":
      entity("Side cutting"),
    "switch.ogrod_dreame_a2_bodzio_selected_automatic_edge_cutting":
      entity("on"),
    "switch.ogrod_dreame_a2_bodzio_selected_safe_edge_cutting": entity("on"),
  };

  assert.deepEqual(
    autoDetectedControlEntities(
      states,
      "lawn_mower.dreame_a2_bodzio",
      dreameRegistry(
        "lawn_mower.dreame_a2_bodzio",
        Object.keys(states),
      ),
    ),
    Object.keys(states),
  );
});

test("configured maintenance points are shown while unavailable points stay hidden", () => {
  const available = {
    "select.garden_map": entity("Map 1"),
    "select.garden_mowing_action": entity("All area"),
    "select.garden_maintenance_point": entity("Maintenance Point #301"),
  };
  const unavailable = {
    ...available,
    "select.garden_maintenance_point": entity("unavailable"),
  };

  assert.deepEqual(autoDetectedControlEntities(available, "lawn_mower.garden"), [
    "select.garden_map",
    "select.garden_mowing_action",
    "select.garden_maintenance_point",
  ]);
  assert.deepEqual(autoDetectedControlEntities(unavailable, "lawn_mower.garden"), [
    "select.garden_map",
    "select.garden_mowing_action",
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
    "button.garden_go_to_maintenance_point": entity("unknown"),
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
      ["button.garden_go_to_maintenance_point", "Maintenance Point"],
    ],
  );
  assert.equal(
    defaultHelperEntities(states, "lawn_mower.garden").at(-1)?.action,
    "press",
  );
});
