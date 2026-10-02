import assert from "node:assert/strict";
import test from "node:test";
import { defaultHelperEntities } from "../src/card-logic.ts";

const entity = (state = "off", attributes = {}) => ({ state, attributes });
const schedule = (...args: Parameters<typeof defaultHelperEntities>) =>
  defaultHelperEntities(...args).find((helper) => helper.label === "Schedule");

test("a matching calendar is discovered without an event or custom attributes", () => {
  assert.equal(schedule({ "calendar.mowgli_schedule": entity() }, "lawn_mower.mowgli")?.entityId,
    "calendar.mowgli_schedule");
});

test("schedule discovery accepts common singular, plural and device-prefixed names", () => {
  for (const suffix of ["schedule", "schedules", "mowing_schedule", "mowing_schedules"]) {
    for (const prefix of ["", "tuin_voor_"]) {
      const id = `calendar.${prefix}mowgli_${suffix}`;
      assert.equal(schedule({ [id]: entity() }, "lawn_mower.mowgli")?.entityId, id);
    }
  }
});

test("renamed schedule calendars can use registry ownership and role metadata", () => {
  const owner = { device_id: "mowgli", platform: "mower_integration" };
  const states = { "calendar.garden": entity("off", { friendly_name: "Garden mowing schedule" }) };
  const entities = { "lawn_mower.mowgli": owner, "calendar.garden": owner };
  assert.equal(schedule(states, "lawn_mower.mowgli", entities)?.entityId, "calendar.garden");
  assert.equal(schedule(states, "lawn_mower.other", entities), undefined);
});

test("schedule discovery preserves exact-match preference and rejects ambiguous prefixes", () => {
  const prefixed = {
    "calendar.front_mowgli_schedule": entity(),
    "calendar.back_mowgli_schedule": entity(),
  };
  assert.equal(schedule(prefixed, "lawn_mower.mowgli"), undefined);
  assert.equal(schedule({ ...prefixed, "calendar.mowgli_schedule": entity() }, "lawn_mower.mowgli")?.entityId,
    "calendar.mowgli_schedule");
});

test("prefixed calendars cannot override known registry ownership", () => {
  const states = { "calendar.front_mowgli_mowing_schedule": entity() };
  const entities = {
    "lawn_mower.mowgli": { device_id: "mowgli", platform: "mower_integration" },
    "calendar.front_mowgli_mowing_schedule": { device_id: "another_mower", platform: "mower_integration" },
  };
  assert.equal(schedule(states, "lawn_mower.mowgli", entities), undefined);
  assert.equal(schedule(states, "lawn_mower.mowgli", entities, "calendar.front_mowgli_mowing_schedule")?.entityId,
    "calendar.front_mowgli_mowing_schedule");
});

test("an explicit calendar wins and a missing selection never falls back to another calendar", () => {
  const states = {
    "calendar.mowgli_schedule": entity(),
    "calendar.front_garden": entity("unknown"),
    "sensor.front_garden": entity(),
  };
  assert.equal(schedule(states, "lawn_mower.mowgli", undefined, "calendar.front_garden")?.entityId,
    "calendar.front_garden");
  assert.equal(schedule(states, "lawn_mower.mowgli", undefined, "calendar.missing"), undefined);
  assert.equal(schedule(states, "lawn_mower.mowgli", undefined, "sensor.front_garden"), undefined);
  assert.equal(schedule(states, "lawn_mower.mowgli", undefined, "")?.entityId, "calendar.mowgli_schedule");
});
