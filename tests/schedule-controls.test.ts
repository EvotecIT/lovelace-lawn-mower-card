import assert from "node:assert/strict";
import test from "node:test";

import { discoverScheduleControls } from "../src/schedule-controls.ts";

test("discovers and summarizes mower schedule switches", () => {
  const result = discoverScheduleControls(
    {
      "lawn_mower.garden_mower": {
        state: "docked",
      },
      "lawn_mower.other_mower": {
        state: "docked",
      },
      "switch.garden_mower_map_1_morning": {
        state: "on",
        attributes: {
          schedule_control: true,
          friendly_name: "Garden Morning",
          map_label: "Garden",
          weekdays: ["mon", "wed", "fri"],
          start_times: ["08:00"],
          task_count: 3,
        },
      },
      "switch.other_mower_map_1_morning": {
        state: "off",
        attributes: { schedule_control: true },
      },
      "switch.garden_mower_working_voice": {
        state: "on",
        attributes: {},
      },
    },
    "lawn_mower.garden_mower",
  );

  assert.deepEqual(result, [
    {
      entityId: "switch.garden_mower_map_1_morning",
      label: "Garden Morning",
      mapLabel: "Garden",
      enabled: true,
      available: true,
      weekdays: ["mon", "wed", "fri"],
      startTimes: ["08:00"],
      taskCount: 3,
    },
  ]);
});

test("supports area-prefixed companion entity ids", () => {
  const result = discoverScheduleControls(
    {
      "lawn_mower.garden_mower": {
        state: "docked",
      },
      "switch.back_yard_garden_mower_map_2_schedule_1": {
        state: "unavailable",
        attributes: {
          schedule_control: true,
          map_label: "Back yard",
        },
      },
    },
    "lawn_mower.garden_mower",
  );

  assert.equal(result.length, 1);
  assert.equal(result[0].available, false);
  assert.equal(result[0].enabled, false);
});

test("does not claim schedules from a mower with a longer shared prefix", () => {
  const states = {
    "lawn_mower.mower": {
      state: "docked",
    },
    "lawn_mower.mower_2": {
      state: "docked",
    },
    "switch.mower_map_1_schedule_1": {
      state: "on",
      attributes: {
        schedule_control: true,
      },
    },
    "switch.mower_2_map_1_schedule_1": {
      state: "off",
      attributes: {
        schedule_control: true,
      },
    },
  };

  assert.deepEqual(
    discoverScheduleControls(states, "lawn_mower.mower").map(
      (control) => control.entityId,
    ),
    ["switch.mower_map_1_schedule_1"],
  );
  assert.deepEqual(
    discoverScheduleControls(states, "lawn_mower.mower_2").map(
      (control) => control.entityId,
    ),
    ["switch.mower_2_map_1_schedule_1"],
  );
});
