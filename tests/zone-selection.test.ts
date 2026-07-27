import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizedZoneSelection,
  zoneChoices,
  zoneMowingServiceData,
  zonePreferenceChoice,
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
});

test("zone selection defaults to the integration scope and preserves empty intent", () => {
  const choices = [
    { id: 1, label: "Front lawn (#1)" },
    { id: 3, label: "Orchard (#3)" },
  ];

  assert.deepEqual(normalizedZoneSelection(choices, undefined, 3), [3]);
  assert.deepEqual(normalizedZoneSelection(choices, undefined, 9), [1]);
  assert.deepEqual(normalizedZoneSelection(choices, [], 3), []);
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
