import assert from "node:assert/strict";
import test from "node:test";
import { availabilityAlert, integrationStatus, lastSeen } from "../src/availability.ts";
import { mowerAlerts } from "../src/mower-alerts.ts";
import { createTranslator } from "../src/localization.ts";
import type { HassEntity } from "../src/card-config.ts";

const config = { type: "custom:lawn-mower-card", entity: "lawn_mower.dreame_a2_bodzio" };
const t = createTranslator("en");
const now = new Date("2026-10-27T20:00:00Z");
const entity = (entity_id: string, state: string, extra: Partial<HassEntity> = {}): HassEntity =>
  ({ entity_id, state, attributes: {}, ...extra });
const hass = (...items: HassEntity[]) => ({
  states: Object.fromEntries(items.map(item => [item.entity_id, item])),
  entities: {},
});
// What Home Assistant reports for the entry in this card's live check.
const retrying = {
  entryId: "01K", domain: "dreame_lawn_mower", state: "setup_retry",
  reason: "Initial device properties are unavailable",
};

test("an integration that isn't running says so, with HA's reason and a way to its page", () => {
  const alert = availabilityAlert(hass(entity(config.entity, "unavailable", { attributes: { restored: true } })),
    config, t, "en", now, retrying)!;
  assert.equal(alert.title, "The mower's integration isn't running");
  assert.equal(alert.detail, "Setup failed, retrying · Initial device properties are unavailable");
  assert.equal(alert.severity, "error");
  assert.equal(alert.path, "/config/integrations/integration/dreame_lawn_mower#config_entry=01K");
});

test("a disabled entry reads Disabled, and without the entry a restored mower still explains itself", () => {
  const disabled = availabilityAlert(hass(entity(config.entity, "unavailable")), config, t, "en", now,
    { ...retrying, state: "not_loaded", reason: undefined, disabledBy: "user" })!;
  assert.equal(disabled.detail, "Disabled");
  // Non-admins can't read config entries; HA's restored flag still tells the story.
  const restored = availabilityAlert(hass(entity(config.entity, "unavailable", { attributes: { restored: true } })),
    config, t, "en", now)!;
  assert.equal(restored.key, "integration");
  assert.equal(restored.detail, "Its entities are kept from before; Home Assistant isn't getting updates");
  assert.equal(restored.path, undefined);
});

test("a running integration with an unreachable mower shows when it was last seen", () => {
  const offline = availabilityAlert(hass(entity(config.entity, "unavailable", { last_changed: "2026-10-27T18:00:00Z" })),
    config, t, "en", now, { ...retrying, state: "loaded", reason: undefined })!;
  assert.equal(offline.key, "offline");
  assert.equal(offline.detail, "Last seen 2 hours ago");
});

test("an available mower can still be offline or cut off from the cloud", () => {
  const mower = entity(config.entity, "docked");
  assert.equal(availabilityAlert(hass(mower), config, t, "en", now), undefined);
  const device = availabilityAlert(hass(mower,
    entity("binary_sensor.dreame_a2_bodzio_device_connected", "off", { last_changed: "2026-10-27T19:55:00Z" })),
  config, t, "en", now)!;
  assert.deepEqual([device.title, device.detail, device.severity], ["Mower is offline", "Last seen 5 minutes ago", "warning"]);
  const cloud = availabilityAlert(hass(mower, entity("binary_sensor.dreame_a2_bodzio_cloud_connected", "off")),
    config, t, "en", now)!;
  assert.equal(cloud.title, "Can't reach the Dreame cloud");
});

test("an unreachable mower shows only its availability line", () => {
  const alerts = mowerAlerts(hass(
    entity(config.entity, "unavailable", { attributes: { restored: true } }),
    entity("binary_sensor.dreame_a2_bodzio_rain_delay_active", "on"),
  ), config, t, "en", now, retrying);
  assert.deepEqual(alerts.map(alert => alert.key), ["integration"]);
});

test("the mower's entry is found through its device, or when it is the only one", () => {
  const entries = [
    { entry_id: "A", domain: "dreame_lawn_mower", state: "loaded" },
    { entry_id: "B", domain: "dreame_lawn_mower", state: "setup_retry", reason: "Initial device properties are unavailable" },
  ];
  const registry = { entities: { [config.entity]: { device_id: "dev" } }, devices: { dev: { config_entries: ["B"] } } };
  assert.equal(integrationStatus(entries, registry, config.entity)?.entryId, "B");
  assert.equal(integrationStatus(entries, {}, config.entity), undefined, "two entries and no device: don't guess");
  assert.equal(integrationStatus([entries[1]], {}, config.entity)?.state, "setup_retry");
  assert.equal(integrationStatus("nonsense", {}, config.entity), undefined);
});

test("last seen reads naturally across minutes, hours and days", () => {
  assert.equal(lastSeen("2026-10-27T19:59:00Z", "en", now), "1 minute ago");
  assert.equal(lastSeen("2026-10-26T20:00:00Z", "en", now), "24 hours ago");
  assert.equal(lastSeen("2026-10-24T20:00:00Z", "en", now), "3 days ago");
  assert.equal(lastSeen("never", "en", now), undefined);
});
