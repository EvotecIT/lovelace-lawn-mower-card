import assert from "node:assert/strict";
import test from "node:test";
import { mowerHassChanged } from "../src/card-update-scope.ts";
import type { HomeAssistant, HassEntity } from "../src/card-config.ts";

const entity = (id: string): HassEntity => ({ entity_id: id, state: "on", attributes: {} });
const config = { type: "custom:lawn-mower-card", entity: "lawn_mower.bodzio" };
const base = (): HomeAssistant => ({
  states: {
    "lawn_mower.bodzio": entity("lawn_mower.bodzio"),
    "sensor.bodzio_battery": entity("sensor.bodzio_battery"),
    "sensor.kitchen": entity("sensor.kitchen"),
  },
  callService: async () => {}, callWS: async () => undefined as never,
  hassUrl: (path) => path,
});

test("unrelated updates do not redraw the mower; owned state does", () => {
  const old = base();
  const update = (id: string) => ({ ...old, states: { ...old.states, [id]: entity(id) } });
  assert.equal(mowerHassChanged(old, update("sensor.kitchen"), config), false);
  assert.equal(mowerHassChanged(old, update("sensor.bodzio_battery"), config), true);
  assert.equal(mowerHassChanged(old, update("lawn_mower.bodzio"), config), true);
  assert.equal(mowerHassChanged(old, update("switch.dreame_bodzio_schedule"), config), true);
});

test("configured and registry-renamed helpers remain reactive", () => {
  const old = base();
  const next = { ...old, states: { ...old.states, "sensor.renamed": entity("sensor.renamed") } };
  assert.equal(mowerHassChanged(old, next, { ...config, tiles: [{ entity: "sensor.renamed" }] }), true);
  const registry = {
    "lawn_mower.bodzio": { device_id: "one" },
    "sensor.renamed": { device_id: "one" },
  };
  assert.equal(mowerHassChanged({ ...old, entities: registry }, { ...next, entities: registry }, config), true);
});

test("discovery, removal, locale and service changes update the card", () => {
  const old = base();
  const removed = { ...old.states };
  delete removed["sensor.bodzio_battery"];
  assert.equal(mowerHassChanged(old, { ...old, states: removed }, config), true);
  assert.equal(mowerHassChanged(old, { ...old, language: "pl" }, config), true);
  assert.equal(mowerHassChanged(old, { ...old, services: {} }, config), true);
  assert.equal(mowerHassChanged(old, {
    ...old, states: { ...old.states, "lawn_mower.bodzio_two": entity("lawn_mower.bodzio_two") },
  }, config), true);
});
