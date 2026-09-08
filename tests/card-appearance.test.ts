import assert from "node:assert/strict";
import test from "node:test";
import { cardAppearance } from "../src/card-appearance.ts";
import { getStubConfig, type LawnMowerCardConfig } from "../src/card-config.ts";

const config: LawnMowerCardConfig = { type:"custom:lawn-mower-card",entity:"lawn_mower.example" };

test("existing cards retain legacy appearance while new cards follow HA", () => {
  assert.equal(cardAppearance(config).preset, undefined);
  assert.equal(cardAppearance(config).theme, undefined);
  assert.equal(cardAppearance({ ...config, hero_theme:"dark" }).theme, "dark");
  assert.equal(cardAppearance(getStubConfig()).preset, "native");
  assert.equal(cardAppearance({ ...config, appearance:"native", hero_theme:"dark" }).theme, "auto");
});

test("minimal artwork defaults can be overridden independently of the style", () => {
  assert.equal(cardAppearance({ ...config, appearance:"minimal" }).artwork, false);
  assert.equal(cardAppearance({ ...config, appearance:"minimal", hero_artwork:"image" }).artwork, true);
  assert.equal(cardAppearance({ ...config, appearance:"modern", hero_artwork:"none" }).artwork, false);
});

test("appearance values cannot inject CSS and numeric overrides have finite bounds", () => {
  const invalid=cardAppearance({ ...config, accent_color:"red;display:none", corner_radius:Infinity, hero_overlay:NaN, surface_opacity:-20 });
  assert.equal(invalid.styles["--mower-custom-accent"], undefined);
  assert.equal(invalid.styles["--mower-custom-radius"], undefined);
  assert.equal(invalid.styles["--mower-art-overlay"], undefined);
  assert.equal(invalid.styles["--mower-surface-opacity"], "60%");
  const valid=cardAppearance({ ...config, accent_color:" #AbC ",corner_radius:0,hero_overlay:0,surface_opacity:120 });
  assert.equal(valid.styles["--mower-custom-accent"], "#AbC");
  assert.equal(valid.styles["--mower-custom-radius"], "0px");
  assert.equal(valid.styles["--mower-art-overlay"], "0");
  assert.equal(valid.styles["--mower-surface-opacity"], "100%");
});
