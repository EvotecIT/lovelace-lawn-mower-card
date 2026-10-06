import assert from "node:assert/strict";
import test from "node:test";

import { discoverAreaStartControl } from "../src/area-controls.ts";

const areaSelect = (options: unknown, extra: Record<string, unknown> = {}) => ({
  state: "unknown",
  attributes: {
    area_control: true,
    start_entity: "button.tuin_mowgli_start_selected_area",
    options,
    ...extra,
  },
});

const baseStates = () => ({
  "lawn_mower.mowgli": { state: "docked" },
  "lawn_mower.other_mower": { state: "docked" },
  "button.tuin_mowgli_start_selected_area": { state: "unknown" },
});

test("discovers the mower's area picker and its start button", () => {
  const result = discoverAreaStartControl(
    {
      ...baseStates(),
      "select.tuin_mowgli_start_area": areaSelect(["Achter", "Voor", "Achter"]),
      "select.other_mower_start_area": areaSelect(["A", "B"]),
      "select.tuin_mowgli_map_style": { state: "classic", attributes: { options: ["classic"] } },
    },
    "lawn_mower.mowgli",
  );

  assert.deepEqual(result, {
    selectEntityId: "select.tuin_mowgli_start_area",
    startEntityId: "button.tuin_mowgli_start_selected_area",
    areas: ["Achter", "Voor"],
  });
});

test("ignores area pickers of other mowers", () => {
  assert.equal(
    discoverAreaStartControl(
      { ...baseStates(), "select.other_mower_start_area": areaSelect(["A", "B"]) },
      "lawn_mower.mowgli",
    ),
    undefined,
  );
});

test("needs more than one area to offer a choice", () => {
  assert.equal(
    discoverAreaStartControl(
      { ...baseStates(), "select.mowgli_start_area": areaSelect(["Achter"]) },
      "lawn_mower.mowgli",
    ),
    undefined,
  );
});

test("needs an existing, available start button", () => {
  const states = {
    ...baseStates(),
    "select.mowgli_start_area": areaSelect(["A", "B"], {
      start_entity: "button.missing",
    }),
  };
  assert.equal(discoverAreaStartControl(states, "lawn_mower.mowgli"), undefined);

  const unavailable = {
    ...baseStates(),
    "button.tuin_mowgli_start_selected_area": { state: "unavailable" },
    "select.mowgli_start_area": areaSelect(["A", "B"]),
  };
  assert.equal(discoverAreaStartControl(unavailable, "lawn_mower.mowgli"), undefined);
});
