import assert from "node:assert/strict";
import test from "node:test";
import { areaStartContextMatches, type AreaStartContext } from "../src/area-start-context.ts";
import type { HassEntity, LawnMowerActionConfig, LawnMowerCardConfig } from "../src/card-config.ts";

const action: LawnMowerActionConfig = { type: "start", confirmation: "Start?", visibility: { entity: "binary_sensor.allowed", state: "on" } };
const config: LawnMowerCardConfig = { type: "custom:lawn-mower-card", entity: "lawn_mower.garden", actions: [action] };
const control = { selectEntityId: "select.garden_area", startEntityId: "button.garden_start", areas: ["Front", "Back"] };
const context: AreaStartContext = { mowerEntityId: config.entity, ...control, action };
const states = (value: string): Record<string, HassEntity> => ({
  "binary_sensor.allowed": { entity_id: "binary_sensor.allowed", state: value, attributes: {} },
});

test("area requests revalidate the originating Start visibility and configuration", () => {
  assert.equal(areaStartContextMatches(context, config, states("on"), control), true);
  for (const value of ["off", "unavailable", "unknown"]) {
    assert.equal(areaStartContextMatches(context, config, states(value), control), false);
  }
  assert.equal(areaStartContextMatches(context, { ...config, actions: [] }, states("on"), control), false);
  assert.equal(areaStartContextMatches(context, { ...config, actions: [{ ...action }] }, states("on"), control), false);
});

test("area requests expire when the mower or selected control pair changes", () => {
  assert.equal(areaStartContextMatches(context, { ...config, entity: "lawn_mower.other" }, states("on"), control), false);
  assert.equal(areaStartContextMatches(context, config, states("on"), undefined), false);
  assert.equal(areaStartContextMatches(context, config, states("on"), { ...control, selectEntityId: "select.replacement" }), false);
  assert.equal(areaStartContextMatches(context, config, states("on"), { ...control, startEntityId: "button.replacement" }), false);
  assert.equal(areaStartContextMatches(context, config, states("on"), { ...control, areas: ["Orchard", "Front"] }), true);
});

test("default Start requests do not depend on custom-action conditions", () => {
  assert.equal(areaStartContextMatches({ ...context, action: undefined }, config, states("off"), control), true);
});
