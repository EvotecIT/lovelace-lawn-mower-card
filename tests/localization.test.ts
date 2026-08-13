import test from "node:test";
import assert from "node:assert/strict";

import {
  catalogFor,
  catalogKeys,
  createTranslator,
  normalizeLocale,
  resolveLocale,
  SUPPORTED_LOCALES,
} from "../src/localization.ts";

function placeholders(value: unknown): string[] {
  const messages = typeof value === "string" ? [value] : Object.values(value as object);
  return [...new Set(messages.flatMap((message) =>
    [...String(message).matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map((match) => match[1]),
  ))].sort();
}

test("locale resolution accepts Home Assistant BCP-47 languages and falls back safely", () => {
  assert.equal(normalizeLocale("pl-PL"), "pl");
  assert.equal(normalizeLocale("uk_UA"), "uk");
  assert.equal(resolveLocale("auto", "de-DE"), "de");
  assert.equal(resolveLocale("fr", "pl-PL"), "fr");
  assert.equal(resolveLocale("auto", "es-ES", "pl-PL"), "pl");
  assert.equal(resolveLocale("auto", "es-ES"), "en");
});

test("every supported catalog is complete, non-empty, and preserves placeholders", () => {
  const keys = catalogKeys();
  const english = catalogFor("en");
  for (const locale of SUPPORTED_LOCALES) {
    const catalog = catalogFor(locale);
    assert.deepEqual(Object.keys(catalog).sort(), [...keys].sort(), `${locale} keys`);
    for (const key of keys) {
      const message = catalog[key];
      const variants = typeof message === "string" ? [message] : Object.values(message);
      assert.ok(variants.every((variant) => variant.trim().length > 0), `${locale}:${key}`);
      assert.deepEqual(placeholders(message), placeholders(english[key]), `${locale}:${key} placeholders`);
    }
  }
});

test("Polish uses native wording and Polish plural rules", () => {
  const t = createTranslator("pl");
  assert.equal(t("action.startMowing"), "Rozpocznij koszenie");
  assert.equal(t("editor.mapFitContain"), "Pokaż całą mapę");
  assert.equal(t("editor.layoutHero"), "Hero");
  assert.equal(t("editor.titlePlaceholder"), "Kosiarka w ogrodzie");
  assert.equal(t("cardPicker.name"), "Karta kosiarki");
  assert.equal(t("schedule.count", { count: 1 }), "1 plan");
  assert.equal(t("schedule.count", { count: 2 }), "2 plany");
  assert.equal(t("schedule.count", { count: 5 }), "5 planów");
  assert.match(t("card.zoneSelection", { count: 22 }), /22 strefy/);
});

test("French elapsed-time wording is correct for any numeric duration", () => {
  const t = createTranslator("fr");
  assert.equal(t("pointCloud.elapsed", { seconds: 1 }), "Temps écoulé : 1 s.");
  assert.equal(t("pointCloud.elapsed", { seconds: 12 }), "Temps écoulé : 12 s.");
});

test("Russian and Ukrainian use their few and many plural forms", () => {
  assert.equal(createTranslator("ru")("schedule.count", { count: 2 }), "2 плана");
  assert.equal(createTranslator("ru")("schedule.count", { count: 5 }), "5 планов");
  assert.equal(createTranslator("uk")("schedule.count", { count: 2 }), "2 плани");
  assert.equal(createTranslator("uk")("schedule.count", { count: 5 }), "5 планів");
});
