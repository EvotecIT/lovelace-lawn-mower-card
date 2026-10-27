import assert from "node:assert/strict";
import test from "node:test";
import { alertTime, mowerAlerts } from "../src/mower-alerts.ts";
import { createTranslator } from "../src/localization.ts";
import type { HassEntity, HomeAssistant } from "../src/card-config.ts";

const config = { type: "custom:lawn-mower-card", entity: "lawn_mower.garden" };
const t = createTranslator("en");
const now = new Date("2026-10-27T10:00:00");
const entity = (entity_id: string, state: string, attributes: Record<string, unknown> = {}): HassEntity =>
  ({ entity_id, state, attributes });
const hass = (mowerState: string, ...extra: HassEntity[]): Pick<HomeAssistant, "states" | "entities"> => ({
  states: Object.fromEntries([entity(config.entity, mowerState), ...extra].map(item => [item.entity_id, item])),
  entities: {},
});
const alerts = (mowerState: string, ...extra: HassEntity[]) => mowerAlerts(hass(mowerState, ...extra), config, t, "en-GB", now);

test("a quiet mower shows no alerts", () => {
  assert.deepEqual(alerts("docked",
    entity("sensor.garden_error", "none"),
    entity("binary_sensor.garden_rain_delay_active", "off"),
    entity("binary_sensor.garden_maintenance_due", "off"),
    entity("sensor.garden_status_notice", "none"),
  ), []);
});

test("a rain delay says when mowing resumes", () => {
  const [rain] = alerts("docked", entity("binary_sensor.garden_rain_delay_active", "on",
    { rain_protect_end_time_iso: "2026-10-27T16:20:00" }));
  assert.equal(rain.title, "Rain delay");
  assert.equal(rain.detail, "Mowing resumes after 16:20");
  assert.equal(rain.entityId, "binary_sensor.garden_rain_delay_active");
});

test("a rain delay without an end time still explains itself", () => {
  const [rain] = alerts("docked", entity("binary_sensor.garden_rain_delay_active", "on"));
  assert.equal(rain.detail, "Mowing resumes when the delay ends");
});

test("due maintenance names the parts and how to clear it", () => {
  const [due] = alerts("docked", entity("binary_sensor.garden_maintenance_due", "on",
    { due_items: ["robot", "blade"] }),
  entity("binary_sensor.garden_maintenance_warning", "on", { warning_items: ["robot", "blade"] }));
  assert.equal(due.title, "Maintenance due");
  assert.equal(due.detail, "Robot maintenance, Blade · Reset the counter after servicing");
  // The warning is the same news a step earlier, so it is not repeated.
  assert.equal(alerts("docked", entity("binary_sensor.garden_maintenance_due", "on"),
    entity("binary_sensor.garden_maintenance_warning", "on")).length, 1);
});

test("the mowing automation hold shows the garden reason", () => {
  const [hold] = alerts("docked",
    entity("switch.garden_mowing_automation", "on"),
    entity("binary_sensor.garden_mowing_permitted", "off", { reason: "Soil is too wet" }),
    { ...entity(config.entity, "docked"), attributes: { mowing_automation: {
      version: 1, configured: true, entry_id: "entry", enable_entity: "switch.garden_mowing_automation",
      permission_entity: "binary_sensor.garden_mowing_permitted" } } },
  );
  assert.equal(hold.title, "Mowing on hold");
  assert.equal(hold.detail, "Soil is too wet");
});

test("errors come first and carry the integration's text", () => {
  const result = alerts("error",
    entity("binary_sensor.garden_rain_delay_active", "on"),
    entity("sensor.garden_status_notice", "Frost protection"),
    entity("sensor.garden_error", "Wheel blocked"),
  );
  assert.deepEqual(result.map(alert => alert.key), ["error", "rain", "notice"]);
  assert.equal(result[0].detail, "Wheel blocked");
  assert.equal(result[0].entityId, "sensor.garden_error");
});

test("\"No error\" is a healthy mower, not an alert", () => {
  assert.deepEqual(alerts("docked", entity("sensor.garden_error", "No error")), []);
  assert.deepEqual(alerts("docked", { ...entity(config.entity, "docked"), attributes: { error_display: "No error" } }), []);
});

test("mower error attributes are used when the sensor reports none, and the mower opens", () => {
  const [error] = alerts("docked", entity("sensor.garden_error", "none"),
    { ...entity(config.entity, "docked"), attributes: { error_text: "Blade motor overload" } });
  assert.equal(error.detail, "Blade motor overload");
  assert.equal(error.entityId, config.entity);
});

test("an error state without error text still asks for attention", () => {
  const [error] = alerts("error");
  assert.equal(error.title, "Mower needs attention");
  assert.equal(error.detail, undefined);
  assert.equal(error.entityId, config.entity);
});

test("a rain notice is not repeated under the rain delay", () => {
  assert.deepEqual(alerts("docked",
    entity("binary_sensor.garden_rain_delay_active", "on"),
    entity("sensor.garden_status_notice", "Rain protection active"),
  ).map(alert => alert.key), ["rain"]);
});

test("show_alerts: false turns the strip off", () => {
  assert.deepEqual(mowerAlerts(hass("error"), { ...config, show_alerts: false }, t, "en-GB", now), []);
});

test("alert times name the day only when it is not today", () => {
  assert.equal(alertTime("2026-10-27T16:20:00", "en-GB", now), "16:20");
  assert.match(alertTime("2026-10-28T08:00:00", "en-GB", now) ?? "", /^Wed.*08:00$/);
  assert.equal(alertTime("2026-10-27T09:00:00", "en-GB", now), undefined);
  assert.equal(alertTime("soon", "en-GB", now), undefined);
});
