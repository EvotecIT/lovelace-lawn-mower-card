import assert from "node:assert/strict";
import test from "node:test";

import type { HassEntity, HomeAssistant } from "../src/card-config.ts";
import {
  homeAssistantAttributeValue,
  homeAssistantLocaleMatches,
  homeAssistantState,
  translatedDreameEntityValue,
} from "../src/entity-presentation.ts";
import { createTranslator } from "../src/localization.ts";

const entity = (
  entityId: string,
  state: string,
  attributes: Record<string, unknown> = {},
): HassEntity => ({ entity_id: entityId, state, attributes });

const hass = (overrides: Partial<HomeAssistant> = {}): HomeAssistant => ({
  states: {},
  callService: async () => undefined,
  callWS: async <T>() => undefined as T,
  hassUrl: path => path,
  ...overrides,
});

test("Home Assistant state formatting supports current values and select option overrides", () => {
  const values: Array<string | undefined> = [];
  const host = hass({
    formatEntityState: (_entity, value) => {
      values.push(value);
      return value === "all_area" ? "Cały obszar" : "Ładowanie zakończone";
    },
  });
  const state = entity("sensor.demo_state_name", "charging_completed");

  assert.equal(homeAssistantState(host, state), "Ładowanie zakończone");
  assert.equal(homeAssistantState(host, state, "all_area"), "Cały obszar");
  assert.deepEqual(values, [undefined, "all_area"]);
});

test("host formatter failures fall back without breaking card rendering", () => {
  const host = hass({
    formatEntityState: () => {
      throw new Error("old host");
    },
    formatEntityAttributeValue: () => "",
  });
  const state = entity("sensor.demo", "ready", { detail: "ready" });

  assert.equal(homeAssistantState(host, state), undefined);
  assert.equal(
    homeAssistantAttributeValue(host, state, "detail", "ready"),
    undefined,
  );
});

test("Home Assistant formatting is used only when its locale matches the card", () => {
  assert.equal(
    homeAssistantLocaleMatches(hass({ locale: { language: "pl-PL" } }), "pl"),
    true,
  );
  assert.equal(
    homeAssistantLocaleMatches(hass({ locale: { language: "pl" } }), "en"),
    false,
  );
  assert.equal(
    homeAssistantLocaleMatches(hass({ locale: { language: "ja" } }), "en"),
    false,
  );
});

test("legacy Dreame fixed values are localized while dynamic labels stay untouched", () => {
  const t = createTranslator("pl");

  assert.equal(
    translatedDreameEntityValue(
      "sensor.garden_state_name",
      "charging_completed",
      "pl",
      t,
    ),
    "Ładowanie zakończone",
  );
  assert.equal(
    translatedDreameEntityValue(
      "select.garden_mowing_action",
      "All area",
      "pl",
      t,
    ),
    "Cały obszar",
  );
  assert.equal(
    translatedDreameEntityValue(
      "select.garden_selected_map_display_rotation",
      "0 degrees",
      "pl",
      t,
    ),
    "0°",
  );
  assert.equal(
    translatedDreameEntityValue(
      "select.garden_selected_map_display_rotation",
      "270 degrees clockwise",
      "pl",
      t,
    ),
    "270° zgodnie z ruchem wskazówek zegara",
  );
  assert.equal(
    translatedDreameEntityValue(
      "select.garden_rain_delay",
      "22 hours",
      "pl",
      t,
    ),
    "22 godziny",
  );
  assert.equal(
    translatedDreameEntityValue(
      "select.garden_selected_edge_mowing_walk_mode",
      "Along line",
      "pl",
      t,
    ),
    "Wzdłuż linii",
  );
  assert.equal(
    translatedDreameEntityValue(
      "select.garden_selected_edge_cutting_style",
      "Side cutting",
      "pl",
      t,
    ),
    "Koszenie boczne",
  );
  assert.equal(
    translatedDreameEntityValue(
      "select.garden_voice_language",
      "German",
      "pl",
      t,
    ),
    "niemiecki",
  );
  assert.equal(
    translatedDreameEntityValue("select.garden_zone", "North-East", "pl", t),
    "North-East",
  );
  assert.equal(
    translatedDreameEntityValue("select.garden_spot", "front_yard", "pl", t),
    "front_yard",
  );
});

test("registry metadata preserves fixed-value localization after entity IDs are renamed", () => {
  const t = createTranslator("pl");
  const fixedValues = [
    ["state_name", "charging_completed", "Ładowanie zakończone"],
    ["selected_mowing_action", "All area", "Cały obszar"],
    ["selected_map_display_rotation", "90 degrees", "90°"],
    ["selected_map_preference_mode", "Custom", "Niestandardowe"],
    ["selected_zone_efficiency_mode", "Efficient", "Wydajne"],
    ["selected_zone_direction_mode", "Checkerboard", "Szachownica"],
    ["selected_edge_cutting_style", "Side cutting", "Koszenie boczne"],
    ["rain_delay", "8 hours", "8 godzin"],
    ["voice_language", "German", "niemiecki"],
  ] as const;

  for (const [translationKey, value, expected] of fixedValues) {
    assert.equal(
      translatedDreameEntityValue(
        "select.my_renamed_entity",
        value,
        "pl",
        t,
        {
          platform: "dreame_lawn_mower",
          translation_key: translationKey,
        },
      ),
      expected,
      translationKey,
    );
  }

  assert.equal(
    translatedDreameEntityValue(
      "sensor.renamed_status",
      "smart_charging",
      "pl",
      t,
      { platform: "dreame_lawn_mower", name: "State name" },
    ),
    "Inteligentne ładowanie",
  );
});

test("registry hints do not translate user-owned labels or dynamic option values", () => {
  const t = createTranslator("pl");

  assert.equal(
    translatedDreameEntityValue(
      "select.personal_choice",
      "All area",
      "pl",
      t,
      { name: "Mowing action" },
    ),
    "All area",
  );
  assert.equal(
    translatedDreameEntityValue(
      "select.personal_choice",
      "All area",
      "pl",
      t,
      { platform: "other", translation_key: "mowing_action" },
    ),
    "All area",
  );
  assert.equal(
    translatedDreameEntityValue(
      "select.user_named_mowing_action",
      "All area",
      "pl",
      t,
      {
        platform: "dreame_lawn_mower",
        translation_key: "selected_zone",
        name: "Mowing action",
      },
    ),
    "All area",
  );
});

test("all Dreame mower states are localized without relying on the host locale", () => {
  const t = createTranslator("pl");
  const states = [
    "unknown",
    "mowing",
    "idle",
    "paused",
    "error",
    "returning",
    "charging",
    "building",
    "charging_completed",
    "upgrading",
    "mow_summon",
    "station_reset",
    "remote_control",
    "smart_charging",
    "second_mowing",
    "human_following",
    "spot_mowing",
    "waiting_for_task",
    "station_cleaning",
    "shortcut",
    "monitoring",
    "monitoring_paused",
  ];

  for (const state of states) {
    assert.notEqual(
      translatedDreameEntityValue("sensor.garden_state_name", state, "pl", t),
      undefined,
      state,
    );
  }

  assert.equal(
    translatedDreameEntityValue("sensor.garden_state_name", "idle", "pl", t),
    "Bezczynność",
  );
  assert.equal(
    translatedDreameEntityValue("sensor.garden_state_name", "smart_charging", "pl", t),
    "Inteligentne ładowanie",
  );
  assert.equal(
    translatedDreameEntityValue("sensor.garden_state_name", "monitoring_paused", "pl", t),
    "Monitorowanie wstrzymane",
  );
});
