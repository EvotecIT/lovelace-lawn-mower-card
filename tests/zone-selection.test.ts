import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizedZoneSelection,
  selectedMapIsCurrent,
  supportsDreameMultiZoneMowing,
  zoneChoices,
  zoneMowingServiceData,
  zonePreferenceChoice,
  zoneSelectionFallbackId,
  zoneSelectionKey,
  zoneSelectionLabels,
} from "../src/zone-selection.ts";

const mower = (availableZoneIds: unknown) => ({
  state: "docked",
  attributes: { available_zone_ids: availableZoneIds },
});

const zone = (options: unknown) => ({
  state: "Front lawn (#1)",
  attributes: { options },
});

test("zone choices pair integration-owned current-map IDs with select labels", () => {
  assert.deepEqual(
    zoneChoices(
      mower([1, 3]),
      zone(["Front lawn (#1)", "Orchard (#3)"]),
    ),
    [
      { id: 1, label: "Front lawn (#1)" },
      { id: 3, label: "Orchard (#3)" },
    ],
  );
});

test("zone choices reject stale or ambiguous Home Assistant snapshots", () => {
  assert.deepEqual(
    zoneChoices(mower([1]), zone(["Front lawn (#1)", "Orchard (#3)"])),
    [],
  );
  assert.deepEqual(zoneChoices(mower([1, 1]), zone(["One", "Two"])), []);
  assert.deepEqual(zoneChoices(mower([true, 3]), zone(["One", "Two"])), []);
  assert.deepEqual(zoneChoices(mower([1, 3]), zone(["Zone", "Zone"])), []);
  assert.deepEqual(
    zoneChoices(
      mower([1, 3]),
      {
        state: "unavailable",
        attributes: { options: ["One", "Two"] },
      },
    ),
    [],
  );
});

test("multi-zone mode requires the Dreame entity platform and registered service", () => {
  const entities = {
    "lawn_mower.garden": { platform: "dreame_lawn_mower" },
    "lawn_mower.other": { platform: "other_mower" },
  };
  const services = {
    lawn_mower: { start_zone_mowing: {} },
  };

  assert.equal(
    supportsDreameMultiZoneMowing(
      "lawn_mower.garden",
      entities,
      services,
    ),
    true,
  );
  assert.equal(
    supportsDreameMultiZoneMowing(
      "lawn_mower.other",
      entities,
      services,
    ),
    false,
  );
  assert.equal(
    supportsDreameMultiZoneMowing(
      "lawn_mower.garden",
      entities,
      { lawn_mower: {} },
    ),
    false,
  );
});

test("zone selection keys bind labels and a stable current-map identity", () => {
  const choices = [
    { id: 1, label: "Front lawn (#1)" },
    { id: 2, label: "Back lawn (#2)" },
  ];
  const baseMower = {
    state: "docked",
    attributes: { selected_map_index: 0 },
  };
  const first = zoneSelectionKey(
    "lawn_mower.garden",
    "select.garden_zone",
    baseMower,
    undefined,
    choices,
  );
  const renamed = zoneSelectionKey(
    "lawn_mower.garden",
    "select.garden_zone",
    baseMower,
    undefined,
    [
      { id: 1, label: "Side lawn (#1)" },
      { id: 2, label: "Orchard (#2)" },
    ],
  );
  const secondMap = zoneSelectionKey(
    "lawn_mower.garden",
    "select.garden_zone",
    {
      state: "docked",
      attributes: { selected_map_index: 1 },
    },
    undefined,
    choices,
  );
  const enrichedEquivalentMap = zoneSelectionKey(
    "lawn_mower.garden",
    "select.garden_zone",
    {
      state: "docked",
      attributes: {
        selected_map_index: 0,
        app_current_map_index: 0,
      },
    },
    undefined,
    choices,
  );
  const selectedLabel = zoneSelectionKey(
    "lawn_mower.garden",
    "select.garden_zone",
    {
      state: "docked",
      attributes: { selected_map_label: "Map 1" },
    },
    undefined,
    choices,
  );
  const enrichedEquivalentLabel = zoneSelectionKey(
    "lawn_mower.garden",
    "select.garden_zone",
    {
      state: "docked",
      attributes: {
        selected_map_label: "Map 1",
        app_current_map_label: "Map 1",
      },
    },
    undefined,
    choices,
  );

  assert.ok(first);
  assert.equal(first, enrichedEquivalentMap);
  assert.equal(selectedLabel, enrichedEquivalentLabel);
  assert.notEqual(first, renamed);
  assert.notEqual(first, secondMap);
  assert.equal(
    zoneSelectionKey(
      "lawn_mower.garden",
      "select.garden_zone",
      { state: "docked", attributes: {} },
      undefined,
      choices,
    ),
    undefined,
  );
  for (const invalidIdentity of ["unknown", "unavailable", -1]) {
    assert.equal(
      zoneSelectionKey(
        "lawn_mower.garden",
        "select.garden_zone",
        {
          state: "docked",
          attributes: { selected_map_index: invalidIdentity },
        },
        undefined,
        choices,
      ),
      undefined,
    );
  }
});

test("zone selection rejects conflicting selected and active maps", () => {
  const mismatched = {
    state: "docked",
    attributes: {
      selected_map_index: 1,
      app_current_map_index: 2,
    },
  };
  const explicitlyMismatched = {
    state: "docked",
    attributes: {
      selected_map_index: 1,
      app_current_map_index: 1,
      selected_map_matches_active_app_map: false,
    },
  };
  const choices = [
    { id: 1, label: "Front lawn (#1)" },
    { id: 2, label: "Back lawn (#2)" },
  ];

  assert.equal(selectedMapIsCurrent(mismatched), false);
  assert.equal(selectedMapIsCurrent(explicitlyMismatched), false);
  assert.equal(
    zoneSelectionKey(
      "lawn_mower.garden",
      "select.garden_zone",
      mismatched,
      undefined,
      choices,
    ),
    undefined,
  );
  const labelMismatch = {
    state: "docked",
    attributes: {
      selected_map_label: "Map 2",
      app_current_map_label: "Map 1",
    },
  };
  const selectorMismatch = {
    state: "docked",
    attributes: {
      selected_map_label: "Map 2",
    },
  };

  assert.equal(selectedMapIsCurrent(labelMismatch), false);
  assert.equal(
    selectedMapIsCurrent(selectorMismatch, {
      state: "Map 1",
      attributes: {},
    }),
    false,
  );
  assert.equal(
    zoneSelectionKey(
      "lawn_mower.garden",
      "select.garden_zone",
      labelMismatch,
      undefined,
      choices,
    ),
    undefined,
  );
});

test("zone selection defaults to the integration scope and preserves empty intent", () => {
  const choices = [
    { id: 1, label: "Front lawn (#1)" },
    { id: 3, label: "Orchard (#3)" },
  ];

  assert.deepEqual(normalizedZoneSelection(choices, undefined, 3), [3]);
  assert.deepEqual(normalizedZoneSelection(choices, undefined, 9), []);
  assert.deepEqual(normalizedZoneSelection(choices, undefined), []);
  assert.deepEqual(normalizedZoneSelection(choices, [], 3), []);
  assert.equal(
    zoneSelectionFallbackId(choices, undefined, "Orchard (#3)"),
    3,
  );
  assert.equal(
    zoneSelectionFallbackId(choices, 1, "Orchard (#3)"),
    1,
  );
  assert.equal(
    zoneSelectionFallbackId(choices, 9, "Unknown zone"),
    undefined,
  );
});

test("zone selection drops stale IDs and follows current-map option order", () => {
  const choices = [
    { id: 3, label: "Orchard (#3)" },
    { id: 1, label: "Front lawn (#1)" },
  ];

  const selected = normalizedZoneSelection(choices, [1, 9, 3], 1);
  assert.deepEqual(selected, [3, 1]);
  assert.deepEqual(zoneSelectionLabels(choices, selected), [
    "Orchard (#3)",
    "Front lawn (#1)",
  ]);
});

test("zone preference scope changes only for a newly checked or removed scoped zone", () => {
  const choices = [
    { id: 1, label: "Front lawn (#1)" },
    { id: 2, label: "Back lawn (#2)" },
    { id: 3, label: "Orchard (#3)" },
  ];

  assert.deepEqual(
    zonePreferenceChoice(choices, [2, 3], "Orchard (#3)"),
    choices[2],
  );
  assert.deepEqual(
    zonePreferenceChoice(choices, [1, 2, 3], "Back lawn (#2)", 3),
    choices[2],
  );
  assert.deepEqual(
    zonePreferenceChoice(choices, [1, 2], "Orchard (#3)"),
    choices[0],
  );
  assert.equal(
    zonePreferenceChoice(choices, [], "Orchard (#3)"),
    undefined,
  );
});

test("multi-zone start data uses the integration entity-service contract", () => {
  assert.deepEqual(
    zoneMowingServiceData("lawn_mower.garden", [3, 1, 3]),
    {
      entity_id: "lawn_mower.garden",
      zone_ids: [3, 1],
    },
  );
  assert.equal(zoneMowingServiceData("lawn_mower.garden", []), undefined);
  assert.equal(zoneMowingServiceData("lawn_mower.garden", [0]), undefined);
});
