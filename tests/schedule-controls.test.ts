import assert from "node:assert/strict";
import test from "node:test";

import { discoverScheduleControls } from "../src/schedule-controls.ts";

test("discovers and summarizes mower schedule switches", () => {
  const result = discoverScheduleControls(
    {
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
