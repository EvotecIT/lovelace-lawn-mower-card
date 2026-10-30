import assert from "node:assert/strict";
import test from "node:test";

import type { HassEntity } from "../src/card-config.ts";
import {
  LawnMowerFeature,
  mowerAdvertisesFeature,
  mowerSupportsFeature,
} from "../src/mower-capabilities.ts";

function mower(supportedFeatures?: unknown): HassEntity {
  return {
    entity_id: "lawn_mower.garden",
    state: "docked",
    attributes:
      supportedFeatures === undefined
        ? {}
        : { supported_features: supportedFeatures },
  };
}

test("feature constants match Home Assistant's lawn mower bit assignments", () => {
  assert.deepEqual(LawnMowerFeature, {
    START_MOWING: 1,
    PAUSE: 2,
    DOCK: 4,
    STOP: 8,
  });
});

test("Stop shows only when the integration advertises it", () => {
  const legacy = mower();
  assert.equal(mowerSupportsFeature(legacy, LawnMowerFeature.PAUSE), true);
  assert.equal(mowerAdvertisesFeature(legacy, LawnMowerFeature.STOP), false);
  assert.equal(mowerAdvertisesFeature(mower(LawnMowerFeature.START_MOWING | LawnMowerFeature.STOP), LawnMowerFeature.STOP), true);
  assert.equal(mowerAdvertisesFeature(mower(LawnMowerFeature.START_MOWING | LawnMowerFeature.DOCK), LawnMowerFeature.STOP), false);
});

test("standard mower actions follow Home Assistant supported_features", () => {
  const startOnly = mower(LawnMowerFeature.START_MOWING);

  assert.equal(
    mowerSupportsFeature(startOnly, LawnMowerFeature.START_MOWING),
    true,
  );
  assert.equal(mowerSupportsFeature(startOnly, LawnMowerFeature.PAUSE), false);
  assert.equal(mowerSupportsFeature(startOnly, LawnMowerFeature.DOCK), false);
});

test("explicit zero features hides every standard mower action", () => {
  const readOnly = mower(0);

  assert.equal(
    mowerSupportsFeature(readOnly, LawnMowerFeature.START_MOWING),
    false,
  );
  assert.equal(mowerSupportsFeature(readOnly, LawnMowerFeature.PAUSE), false);
  assert.equal(mowerSupportsFeature(readOnly, LawnMowerFeature.DOCK), false);
});

test("legacy custom mower entities without metadata retain existing controls", () => {
  const legacy = mower();

  assert.equal(
    mowerSupportsFeature(legacy, LawnMowerFeature.START_MOWING),
    true,
  );
  assert.equal(mowerSupportsFeature(legacy, LawnMowerFeature.PAUSE), true);
  assert.equal(mowerSupportsFeature(legacy, LawnMowerFeature.DOCK), true);
});
