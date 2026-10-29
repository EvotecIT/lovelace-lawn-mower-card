export type HeroView = "overview" | "map" | "point-cloud" | "camera" | "photos" | "history";

export type HeroViewCapabilities = {
  map: boolean;
  pointCloud: boolean;
  camera: boolean;
  photos?: boolean;
  history?: boolean;
};

/** Returns only Hero views backed by content the current mower can present. */
export function availableHeroViews(
  capabilities: HeroViewCapabilities,
): HeroView[] {
  const views: HeroView[] = ["overview"];
  if (capabilities.map) {
    views.push("map");
  }
  if (capabilities.pointCloud) {
    views.push("point-cloud");
  }
  if (capabilities.camera) {
    views.push("camera");
  }
  if (capabilities.photos) {
    views.push("photos");
  }
  if (capabilities.history) views.push("history");
  return views;
}

/** Keeps a selected view only while the mower still exposes its capability. */
export function resolveHeroView(
  selected: HeroView,
  availableViews: readonly HeroView[],
): HeroView {
  return isHeroViewAvailable(selected, availableViews) ? selected : "overview";
}

/** An explicit starting tab takes precedence over the live mowing shortcut. */
export function initialHeroView(
  configured: "overview" | "map" | undefined,
  mowing: boolean,
  interactiveMap: boolean,
  availableViews: readonly HeroView[],
): HeroView {
  const preferred = configured === "overview" || configured === "map"
    ? configured
    : mowing && interactiveMap ? "map" : "overview";
  return resolveHeroView(preferred, availableViews);
}

export function showHeroViewTabs(availableViews: readonly HeroView[]): boolean {
  return availableViews.length > 1;
}

export function isHeroViewAvailable(
  view: HeroView,
  availableViews: readonly HeroView[],
): boolean {
  return availableViews.includes(view);
}

/** Up to five views share one row; six make two even rows of three. */
export function tabColumns(views: number): number {
  return views <= 5 ? Math.max(1, views) : Math.ceil(views / 2);
}
