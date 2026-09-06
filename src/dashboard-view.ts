import type { HeroView } from "./hero-views";

/** Keep a useful main panel visible when the separate camera is selected. */
export function dashboardMainView(model: {
  activeView: HeroView; availableViews: readonly HeroView[];
}): HeroView {
  return model.activeView === "camera"
    ? model.availableViews.includes("map") ? "map" : "overview"
    : model.activeView;
}
