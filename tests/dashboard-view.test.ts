import assert from "node:assert/strict";
import test from "node:test";
import { dashboardMainView } from "../src/dashboard-view.ts";

test("dashboard camera retains a map when available and falls back to artwork", () => {
  assert.equal(dashboardMainView({ activeView: "camera", availableViews: ["overview", "map", "camera"] }), "map");
  assert.equal(dashboardMainView({ activeView: "camera", availableViews: ["overview", "camera"] }), "overview");
});

test("dashboard preserves explicit non-camera selection", () => {
  for (const activeView of ["overview", "map", "point-cloud"] as const) {
    assert.equal(dashboardMainView({ activeView, availableViews: ["overview", "map", "point-cloud", "camera"] }), activeView);
  }
});
