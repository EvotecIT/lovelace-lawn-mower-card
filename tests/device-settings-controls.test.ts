import assert from "node:assert/strict";
import test from "node:test";

import {
  deviceSettingControlGroup,
  deviceSettingsSummary,
  isDeviceSettingControlEntity,
  timeInputStep,
  timeInputValue,
  timeServiceValue,
} from "../src/device-settings-controls.ts";

test("device setting controls are classified without absorbing mowing preferences", () => {
  assert.equal(
    deviceSettingControlGroup("switch.garden_charging_period"),
    "charging",
  );
  assert.equal(
    deviceSettingControlGroup("time.garden_charging_period_start"),
    "charging",
  );
  assert.equal(
    deviceSettingControlGroup("select.garden_rain_delay"),
    "rain",
  );
  assert.equal(
    deviceSettingControlGroup("switch.garden_lift_alarm"),
    "anti_theft",
  );
  assert.equal(
    deviceSettingControlGroup(
      "switch.garden_pin_check_before_power_off_enabled",
    ),
    "anti_theft",
  );
  assert.equal(
    isDeviceSettingControlEntity("switch.garden_rain_protection"),
    true,
  );
  assert.equal(
    isDeviceSettingControlEntity("select.garden_selected_map_preference_mode"),
    false,
  );
});

test("time controls normalize Home Assistant state and service values", () => {
  assert.equal(timeInputValue("18:05:00"), "18:05");
  assert.equal(timeInputValue("08:30"), "08:30");
  assert.equal(timeInputValue("18:05:30"), "18:05:30");
  assert.equal(timeInputValue("18:05:30.125000"), "18:05:30.125");
  assert.equal(timeInputValue("18:05:30.123456"), undefined);
  assert.equal(timeServiceValue("22:15"), "22:15:00");
  assert.equal(timeServiceValue("22:15:45"), "22:15:45");
  assert.equal(timeServiceValue("22:15:45.125"), "22:15:45.125");
  assert.equal(timeServiceValue("22:15:45.123456"), "22:15:45.123456");
  assert.equal(timeInputStep("22:15"), "60");
  assert.equal(timeInputStep("22:15:45"), "1");
  assert.equal(timeInputStep("22:15:45.125"), "any");
  assert.equal(timeInputValue("24:00:00"), undefined);
  assert.equal(timeServiceValue("unavailable"), undefined);
});

test("device settings summary reports charging, rain, and anti-theft", () => {
  const entities = {
    "switch.garden_charging_period": { state: "on" },
    "time.garden_charging_period_start": { state: "18:00:00" },
    "time.garden_charging_period_end": { state: "08:00:00" },
    "switch.garden_rain_protection": { state: "on" },
    "select.garden_rain_delay": { state: "8 hours" },
    "switch.garden_lift_alarm": { state: "on" },
    "switch.garden_off_map_alarm": { state: "off" },
    "switch.garden_real_time_location": { state: "on" },
  };

  assert.equal(
    deviceSettingsSummary(entities, Object.keys(entities)),
    "Charging 18:00–08:00 · Rain 8 hours · Anti-theft 2/3 on",
  );
});

test("device settings summary keeps disabled features explicit", () => {
  const entities = {
    "switch.garden_charging_period": { state: "off" },
    "switch.garden_rain_protection": { state: "off" },
  };

  assert.equal(
    deviceSettingsSummary(entities, Object.keys(entities)),
    "Charging off · Rain protection off",
  );
});
