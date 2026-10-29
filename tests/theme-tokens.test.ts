import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (name: string) => readFileSync(new URL(`../src/${name}`, import.meta.url), "utf8");

// Rules that draw on top of photos, camera, 3D or map imagery keep fixed colours.
const media = /hero-(stage|map|camera|scrim|heading|title-block|eyebrow|subtitle|state|metric|empty|point-cloud)|map-badge/;
const literal = /#[\da-f]{3,8}\b|rgba?\(/i;
// The card's own surface (appearance presets) may use the theme's card background and shadow.
const outerCard = (selector: string) => selector.split(",").every(part => /^ha-card(\.[\w-]+)*$/.test(part.trim()));
// A literal used only as a var() fallback still follows the theme when the variable is set.
const fixedColour = (body: string) => literal.test(body.replace(/var\(\s*--[\w-]+\s*,\s*(#[\da-f]{3,8}|rgba?\([^)]*\))\s*\)/gi, "var()"));

/** Splits flat CSS into [selector, body] pairs; nested @container blocks still match per rule. */
function rules(css: string) {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(match => [match[1].split(/[;`]|\*\//).pop()!.trim(), match[2]] as const);
}

const themed = [
  "lawn-mower-card-styles.ts", "hero-layout-styles.ts", "dashboard-styles.ts", "hero-theme.ts",
  "card-appearance-styles.ts", "schedule-panel.ts", "device-settings-panel.ts",
  "recent-conditions-panel.ts", "customization-view.ts",
  "task-history-styles.ts",
];

test("theme-following rules use tokens instead of fixed colours", () => {
  for (const file of themed) {
    for (const [selector, body] of rules(source(file))) {
      if (!fixedColour(body)) continue;
      const palette = selector.includes(":not(.theme-auto)");
      assert.ok(palette || outerCard(selector) || media.test(selector), `${file}: "${selector}" sets a fixed colour outside a palette or media rule`);
    }
  }
});

test("only var() fallbacks are exempt from the fixed-colour check", () => {
  assert.equal(fixedColour("color: var(--primary-text-color, #212121);"), false);
  assert.equal(fixedColour("background: linear-gradient(90deg, transparent, #f00);"), true);
  assert.equal(fixedColour("box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);"), true);
});

test("inner surfaces never repaint the opaque card background", () => {
  for (const file of themed) {
    for (const [selector, body] of rules(source(file))) {
      if (outerCard(selector)) continue;
      assert.doesNotMatch(body, /background[^;]*var\(--card-background-color/, `${file}: "${selector}" paints an inner surface with --card-background-color`);
    }
  }
});

test("tokens come from Home Assistant theme variables", () => {
  const tokens = source("theme-tokens.ts");
  for (const name of ["--primary-text-color", "--primary-color", "--ha-card-border-radius", "--ha-border-radius-lg",
    "--switch-checked-color", "--state-lawn_mower-active-color", "--state-lawn_mower-error-color", "--ha-font-family-body"]) {
    assert.ok(tokens.includes(`var(${name}`), `missing ${name}`);
  }
});
