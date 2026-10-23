import assert from "node:assert/strict";
import { test } from "node:test";
import { mowingAutomationSetupPath, mowingAutomationStatus } from "../src/mowing-automation.ts";
import { mowerHassChanged } from "../src/card-update-scope.ts";
import type { HassEntity, HomeAssistant } from "../src/card-config.ts";

function entity(entity_id: string, state: string, attributes: Record<string, unknown> = {}): HassEntity {
  return { entity_id, state, attributes };
}

test("automation panel uses advertised entities and isolates another automation's run", () => {
  const states = {
    "lawn_mower.garden": entity("lawn_mower.garden", "docked", {
      mowing_automation: { version: 1, configured: true, entry_id: "garden-entry",
        enable_entity: "switch.renamed_automation", permission_entity: "binary_sensor.renamed_permission" },
      scheduled_automation: { phase: "waiting", permission_entity: "binary_sensor.other" },
    }),
    "switch.renamed_automation": entity("switch.renamed_automation", "on"),
    "binary_sensor.renamed_permission": entity("binary_sensor.renamed_permission", "off", { reason: "Soil is wet" }),
  };
  assert.deepEqual(mowingAutomationStatus(states, "lawn_mower.garden"), {
    configured: true, entryId: "garden-entry", enabled: true, canToggle: true,
    enableEntity: "switch.renamed_automation", permitted: false, reason: "Soil is wet", phase: undefined, lastOutcome: undefined,
  });
  states["lawn_mower.garden"].attributes.scheduled_automation = {
    phase: "paused", permission_entity: "binary_sensor.renamed_permission",
  };
  assert.equal(mowingAutomationStatus(states, "lawn_mower.garden")?.phase, "paused");
  states["switch.renamed_automation"].state = "unavailable";
  assert.equal(mowingAutomationStatus(states, "lawn_mower.garden")?.canToggle, false);
});

test("setup is available before configuration and never claims permission from old attributes", () => {
  const states = { "lawn_mower.garden": entity("lawn_mower.garden", "docked", {
    mowing_automation: { version: 1, configured: false, entry_id: "garden", permitted: true },
  }) };
  assert.equal(mowingAutomationStatus(states, "lawn_mower.garden")?.configured, false);
  assert.equal(mowingAutomationStatus(states, "lawn_mower.garden")?.permitted, false);
  assert.equal(mowingAutomationSetupPath("garden"), "/config/integrations/integration/dreame_lawn_mower#config_entry=garden");
  states["lawn_mower.garden"].attributes.mowing_automation = { version: 2, entry_id: "garden" };
  assert.equal(mowingAutomationStatus(states, "lawn_mower.garden"), undefined);
  assert.equal(mowingAutomationStatus({}, "lawn_mower.garden"), undefined);
});

test("renamed permission and enable entities refresh the card without a name prefix", () => {
  const mower = entity("lawn_mower.garden", "docked", {
    mowing_automation: { version: 1, entry_id: "garden", permission_entity: "binary_sensor.custom_name",
      enable_entity: "switch.custom_name" },
  });
  const before = { states: { "lawn_mower.garden": mower,
    "binary_sensor.custom_name": entity("binary_sensor.custom_name", "off") } } as unknown as HomeAssistant;
  const after = { ...before, states: { ...before.states,
    "binary_sensor.custom_name": entity("binary_sensor.custom_name", "on") } };
  assert.equal(mowerHassChanged(before, after, { type: "custom:lawn-mower-card", entity: "lawn_mower.garden" }), true);
});
