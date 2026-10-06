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

test("registry ownership discovers renamed area controls", () => {
  const owner = { device_id: "mower-device", platform: "mowglinext" };
  const states = {
    ...baseStates(),
    "button.run_selected": { state: "unknown" },
    "select.garden_area": areaSelect(["A", "B"], { start_entity: "button.run_selected" }),
  };
  assert.equal(discoverAreaStartControl(states, "lawn_mower.mowgli", {
    "lawn_mower.mowgli": owner,
    "select.garden_area": owner,
    "button.run_selected": owner,
  })?.selectEntityId, "select.garden_area");
});

test("a matching name cannot override a different registry owner", () => {
  const owner = { device_id: "mower-device", platform: "mowglinext" };
  const other = { device_id: "other-device", platform: "mowglinext" };
  const states = { ...baseStates(), "select.mowgli_start_area": areaSelect(["A", "B"]) };
  for (const [selectOwner, buttonOwner] of [[other, owner], [owner, other]]) {
    assert.equal(discoverAreaStartControl(states, "lawn_mower.mowgli", {
      "lawn_mower.mowgli": owner,
      "select.mowgli_start_area": selectOwner,
      "button.tuin_mowgli_start_selected_area": buttonOwner,
    }), undefined);
  }
});

test("naming fallback rejects a start button belonging to another mower", () => {
  assert.equal(discoverAreaStartControl({
    ...baseStates(),
    "button.other_mower_start": { state: "unknown" },
    "select.mowgli_start_area": areaSelect(["A", "B"], { start_entity: "button.other_mower_start" }),
  }, "lawn_mower.mowgli"), undefined);
});

test("ambiguous area selectors do not choose an arbitrary control", () => {
  assert.equal(discoverAreaStartControl({
    ...baseStates(),
    "select.mowgli_start_area": areaSelect(["A", "B"]),
    "select.mowgli_alternative_area": areaSelect(["C", "D"]),
  }, "lawn_mower.mowgli"), undefined);
});
