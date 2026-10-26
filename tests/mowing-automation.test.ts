import assert from "node:assert/strict";
import { test } from "node:test";
import { automationReason, mowingAutomationSetupPath, mowingAutomationStatus, readableReason } from "../src/mowing-automation.ts";
import { createTranslator } from "../src/localization.ts";
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
    scheduleEntity: undefined, scheduleName: undefined, rotation: false, targetEntity: undefined,
    restDaysEntity: undefined, maxAreaEntity: undefined, plan: undefined,
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

test("rotation plan, settings entities and schedule come from the integration summary", () => {
  const states = {
    "lawn_mower.garden": entity("lawn_mower.garden", "docked", {
      mowing_automation: {
        version: 1, configured: true, entry_id: "garden",
        enable_entity: "switch.garden_automation", permission_entity: "binary_sensor.garden_permission",
        schedule_entity: "schedule.weekly_mowing", mowing_target: "rotation",
        target_entity: "select.garden_what_to_mow", rest_days_entity: "number.garden_rest_days",
        max_area_entity: "number.garden_max_area",
        last_outcome: { status: "skipped", reason: "external_permission_blocked",
          detail: "binary_sensor.garden_permission: input_boolean.trial: mowing not permitted",
          observed_at: "2026-10-26T14:45:02+00:00" },
        plan: { next_start: "2026-10-27T14:45:00+00:00", task_type: "zone", area_m2: 295.1, reason: null,
          zones: [{ zone_id: 1, label: "Back", area_m2: 107.7 }, { zone_id: 6, label: null, area_m2: 144 }, "bad"] },
      },
    }),
    "switch.garden_automation": entity("switch.garden_automation", "on"),
    "binary_sensor.garden_permission": entity("binary_sensor.garden_permission", "off",
      { reason: "input_boolean.trial: mowing not permitted" }),
    "input_boolean.trial": entity("input_boolean.trial", "off", { friendly_name: "Trial permission" }),
    "schedule.weekly_mowing": entity("schedule.weekly_mowing", "off", { friendly_name: "Weekly mowing" }),
  };
  const model = mowingAutomationStatus(states, "lawn_mower.garden")!;
  assert.equal(model.reason, "Trial permission: mowing not permitted");
  assert.equal(model.scheduleEntity, "schedule.weekly_mowing");
  assert.equal(model.scheduleName, "Weekly mowing");
  assert.equal(model.rotation, true);
  assert.equal(model.targetEntity, "select.garden_what_to_mow");
  assert.equal(model.restDaysEntity, "number.garden_rest_days");
  assert.equal(model.maxAreaEntity, "number.garden_max_area");
  assert.deepEqual(model.plan, {
    nextStart: "2026-10-27T14:45:00+00:00", wholeLawn: false, zones: ["Back", "#6"], areaM2: 295.1, reason: undefined,
  });
  assert.deepEqual(model.lastOutcome, {
    status: "skipped", reason: "external_permission_blocked", observedAt: "2026-10-26T14:45:02+00:00",
  });
});

test("advertised IDs outside their domain and unparsable plans are ignored", () => {
  const states = { "lawn_mower.garden": entity("lawn_mower.garden", "docked", {
    mowing_automation: { version: 1, configured: true, entry_id: "garden",
      schedule_entity: "switch.not_a_schedule", target_entity: "number.not_a_select",
      rest_days_entity: "select.not_a_number", plan: { next_start: "soon", task_type: "all", zones: "1" } },
  }) };
  const model = mowingAutomationStatus(states, "lawn_mower.garden")!;
  assert.equal(model.scheduleEntity, undefined);
  assert.equal(model.targetEntity, undefined);
  assert.equal(model.restDaysEntity, undefined);
  assert.deepEqual(model.plan, { nextStart: undefined, wholeLawn: true, zones: [], areaM2: undefined, reason: undefined });
});

test("reasons show entity names and translate known integration reasons", () => {
  const states = { "input_boolean.trial": entity("input_boolean.trial", "off", { friendly_name: "Trial" }) };
  assert.equal(readableReason(states, "input_boolean.trial: off; sensor.gone: stale"), "Trial: off; sensor.gone: stale");
  const fr = createTranslator("fr");
  assert.equal(automationReason("no_zone_due", fr), "aucune zone due");
  assert.equal(automationReason("some_new_reason", fr), "some new reason");
});

test("settings and schedule entities refresh the card", () => {
  const mower = entity("lawn_mower.garden", "docked", {
    mowing_automation: { version: 1, entry_id: "garden", rest_days_entity: "number.rest",
      schedule_entity: "schedule.weekly" },
  });
  for (const id of ["number.rest", "schedule.weekly"]) {
    const before = { states: { "lawn_mower.garden": mower, [id]: entity(id, "1") } } as unknown as HomeAssistant;
    const after = { ...before, states: { ...before.states, [id]: entity(id, "2") } };
    assert.equal(mowerHassChanged(before, after, { type: "custom:lawn-mower-card", entity: "lawn_mower.garden" }), true);
  }
});
