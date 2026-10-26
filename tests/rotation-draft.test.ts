import assert from "node:assert/strict";
import { test } from "node:test";
import {
  frequencyLabel, rotationDraft, rotationServiceCalls, sameRotation, withZoneRestDays,
} from "../src/rotation-draft.ts";
import { createTranslator } from "../src/localization.ts";

const model: any = {
  rotation: true, defaultRestDays: 1, rotationMaxArea: 300, rotationMapIndex: 0,
  targetEntity: "select.what", restDaysEntity: "number.rest", maxAreaEntity: "number.area",
  rotationZones: [
    { zoneId: 6, label: "Front", restDays: 0, customRestDays: true },
    { zoneId: 1, label: "Back", restDays: 1, customRestDays: false },
  ],
};

test("the draft starts from the advertised settings and needs their controls", () => {
  assert.deepEqual(rotationDraft(model), { target: "rotation", restDays: 1, maxArea: 300, zoneRestDays: { 6: 0 } });
  assert.equal(rotationDraft({ ...model, maxAreaEntity: undefined }), undefined);
  assert.equal(rotationDraft({ ...model, defaultRestDays: undefined }), undefined);
});

test("only changed settings become service calls, zones in order", () => {
  const original = rotationDraft(model)!;
  assert.ok(sameRotation(original, { ...original, zoneRestDays: { 6: 0 } }));
  let draft = { ...original, target: "all" as const, restDays: 2 };
  draft = withZoneRestDays(withZoneRestDays(draft, 6, undefined), 1, 3);
  assert.ok(!sameRotation(original, draft));
  assert.deepEqual(rotationServiceCalls(model, "lawn_mower.garden", original, draft).map(call => [call.service, call.data]), [
    ["select_option", { entity_id: "select.what", option: "all" }],
    ["set_value", { entity_id: "number.rest", value: 2 }],
    ["set_rotation_zone_rest_days", { entity_id: "lawn_mower.garden", zone_id: 1, map_index: 0, rest_days: 3 }],
    ["set_rotation_zone_rest_days", { entity_id: "lawn_mower.garden", zone_id: 6, map_index: 0 }],
  ]);
  assert.deepEqual(rotationServiceCalls(model, "lawn_mower.garden", original, original), []);
});

test("rest days read as a frequency", () => {
  const fr = createTranslator("fr");
  assert.equal(frequencyLabel(0, fr), "Chaque jour");
  assert.equal(frequencyLabel(1, fr), "Aux 2 jours");
  const ru = createTranslator("ru");
  assert.equal(frequencyLabel(1, ru), "Каждые 2 дня");
  assert.equal(frequencyLabel(4, ru), "Каждые 5 дней");
  assert.equal(frequencyLabel(20, ru), "Каждый 21 день");
  assert.equal(frequencyLabel(20, createTranslator("uk")), "Кожен 21 день");
  assert.equal(frequencyLabel(4, createTranslator("cs")), "Každých 5 dní");
});
