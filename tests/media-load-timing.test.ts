import assert from "node:assert/strict";
import test from "node:test";
import { MediaLoadTiming } from "../src/media-load-timing.ts";

test("timings retain bounded numeric milestones with immutable snapshots", () => {
  let clock = 100;
  const timing = new MediaLoadTiming(() => clock);
  clock = 110;
  timing.mark("authorization");
  const early = timing.snapshot("error");
  clock = 200;
  timing.mark("preview_render");
  const final = timing.snapshot("ready", 2.54);
  assert.deepEqual(early.milestones_ms, { authorization: 10 });
  assert.deepEqual(final.milestones_ms, { authorization: 10, preview_render: 100 });
  assert.equal(final.total_ms, 100);
  assert.equal(final.parse_ms, 2.5);
  assert.equal(final.outcome, "ready");
});
