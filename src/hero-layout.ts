import { html, nothing, type TemplateResult } from "lit";
import {
  type MapFit,
  type MapPosition,
} from "./map-presentation";
import { renderMowingMission } from "./mowing-mission";
import type { MowingAreaProgress } from "./mowing-progress";

import type { HeroImagePosition } from "./hero-image";
import { renderHeroMedia } from "./hero-media";
import { dashboardMainView, renderDashboardAside } from "./dashboard-layout";
export { heroLayoutStyles } from "./hero-layout-styles";
import type { SupportedLocale, Translator } from "./localization";
import {
  isHeroViewAvailable,
  showHeroViewTabs,
  type HeroView,
} from "./hero-views";

export type { HeroView } from "./hero-views";

export type HeroLayoutModel = {
  dashboard?: boolean;
  t: Translator;
  locale: SupportedLocale;
  title: string;
  subtitle: string;
  stateLabel: string;
  stateKey: string;
  battery?: string;
  progress?: string;
  progressLabel?: string;
  coverage?: string;
  coverageLabel?: string;
  area?: MowingAreaProgress;
  mowingMapPath?: string;
  mapSavedPreview?: boolean;
  heroImage?: string;
  heroImagePosition?: HeroImagePosition;
  activeView: HeroView;
  availableViews: readonly HeroView[];
  mapUrl?: string;
  mapFit: MapFit;
  mapPosition: MapPosition;
  mapStatus?: TemplateResult;
  pointCloudPath?: string;
  pointCloudMounted: boolean;
  mediaVisible?: boolean;
  pointCloudLoadError?: string;
  cameraEntity?: object;
  cameraMounted: boolean;
  cameraRenderKey?: string;
  cameraReconnecting: boolean;
  cameraBlockReason?: string;
  cameraPreviewUrl?: string;
  controls?: TemplateResult;
  hass: object;
  supportsStart: boolean;
  supportsPause: boolean;
  supportsDock: boolean;
  canStart: boolean;
  canPause: boolean;
  canDock: boolean;
  maintenancePointAvailable?: boolean;
  actionFeedback?: {
    message: string;
    error: boolean;
  };
  showDefaultActions: boolean;
  showHelperActions: boolean;
  onView(view: HeroView): void;
  onStart(): void | Promise<void>;
  onPause(): void | Promise<void>;
  onDock(): void | Promise<void>;
  onMaintenancePoint?(): void | Promise<void>;
  onMoreInfo(): void;
};

function renderMetric(icon: string, label: string, value?: string): TemplateResult {
  return html`
    <div class="hero-metric">
      <ha-icon .icon=${icon}></ha-icon>
      <span class="hero-metric-copy">
        <span class="hero-metric-label">${label}</span>
        <strong>${value || "—"}</strong>
      </span>
    </div>
  `;
}

function renderTab(
  model: HeroLayoutModel,
  view: HeroView,
  label: string,
  icon: string,
): TemplateResult {
  const selected = model.activeView === view;
  return html`
    <button
      class=${`hero-tab${selected ? " selected" : ""}`}
      role="tab"
      aria-selected=${selected ? "true" : "false"}
      aria-label=${label}
      @click=${() => model.onView(view)}
    >
      <ha-icon .icon=${icon}></ha-icon>
      <span>${label}</span>
    </button>
  `;
}

function renderAction(
  label: string,
  icon: string,
  handler: () => void | Promise<void>,
  options: { disabled?: boolean; active?: boolean } = {},
): TemplateResult {
  return html`
    <button
      class=${`hero-action${options.active ? " active" : ""}`}
      aria-label=${label}
      title=${label}
      ?disabled=${options.disabled}
      @click=${handler}
    >
      <ha-icon .icon=${icon}></ha-icon>
      <span>${label}</span>
    </button>
  `;
}

export function renderHeroLayout(model: HeroLayoutModel): TemplateResult {
  const mainView = model.dashboard ? dashboardMainView(model) : model.activeView;
  const mainModel = { ...model, activeView: mainView };
  const overview = mainView === "overview" && !model.dashboard;
  const tabs: ReadonlyArray<{
    view: HeroView;
    label: string;
    icon: string;
  }> = [
    {
      view: "overview",
      label: model.t("hero.overview"),
      icon: "mdi:view-dashboard-outline",
    },
    { view: "map", label: model.t("hero.map"), icon: "mdi:map-outline" },
    {
      view: "point-cloud",
      label: model.t("action.pointCloud"),
      icon: "mdi:rotate-3d-variant",
    },
    {
      view: "camera",
      label: model.t("hero.camera"),
      icon: "mdi:video-wireless-outline",
    },
  ];
  return html`
    <ha-card class=${`hero-card${model.dashboard ? " dashboard-card" : ""}`} lang=${model.locale}>
      <div class="hero-shell">
        <section class=${`hero-stage view-${mainView}${model.mowingMapPath ? " interactive-map" : ""}`}>
          ${renderHeroMedia(mainModel, model.dashboard ? ["overview", "map", "point-cloud"] : undefined)}
          ${mainView === "map" && !model.mowingMapPath ? model.mapStatus : nothing}
          <div class="hero-scrim" aria-hidden="true"></div>

          <div class="hero-heading">
            <div class="hero-title-block">
              <span class="hero-eyebrow">${model.t("hero.gardenMower")}</span>
              <h2>${model.title}</h2>
              ${mainView !== "map" || model.subtitle.toLowerCase() !== model.stateLabel.toLowerCase()
                ? html`<span class="hero-subtitle">${model.subtitle}</span>` : nothing}
            </div>
            <div class=${`hero-state state-${model.stateKey}`}>
              <span class="hero-state-dot" aria-hidden="true"></span>
              <span>${model.stateLabel}</span>
            </div>
          </div>

          ${overview
            ? html`
                <div class="hero-metrics">
                  ${renderMetric("mdi:battery-high", model.t("hero.battery"), model.battery)}
                  ${renderMetric(
                    "mdi:progress-clock",
                    model.progressLabel || model.t("hero.mission"),
                    model.progress,
                  )}
                  ${renderMetric(
                    "mdi:grass",
                    model.coverageLabel || model.t("hero.coverage"),
                    model.coverage,
                  )}
                </div>
              `
            : nothing}
        </section>

        ${model.dashboard ? renderDashboardAside(model) : model.activeView === "map" ? renderMowingMission(model) : nothing}

        ${showHeroViewTabs(model.availableViews)
          ? html`
              <nav
                class="hero-tabs"
                role="tablist"
                aria-label=${model.t("hero.viewLabel")}
              >
                ${tabs
                  .filter(({ view }) => model.availableViews.includes(view))
                  .map(({ view, label, icon }) =>
                    renderTab(model, view, label, icon),
                  )}
              </nav>
            `
          : nothing}

        ${model.controls
          ? html`
              <div class="hero-selectors" aria-label=${model.t("hero.selectionsLabel")}>
                ${model.controls}
              </div>
            `
          : nothing}

        ${model.actionFeedback
          ? html`
              <div
                class=${`hero-action-feedback${
                  model.actionFeedback.error ? " error" : ""
                }`}
                role=${model.actionFeedback.error ? "alert" : "status"}
                aria-live=${model.actionFeedback.error ? "assertive" : "polite"}
              >
                <ha-icon
                  icon=${model.actionFeedback.error
                    ? "mdi:alert-circle-outline"
                    : "mdi:wifi-sync"}
                ></ha-icon>
                <span>${model.actionFeedback.message}</span>
              </div>
            `
          : nothing}

        <div class="hero-actions" aria-label=${model.t("hero.controlsLabel")}>
          ${model.showDefaultActions
            ? html`
                ${model.supportsStart
                  ? renderAction(model.t("action.start"), "mdi:play", model.onStart, {
                      disabled: !model.canStart,
                    })
                  : nothing}
                ${model.supportsPause
                  ? renderAction(model.t("action.pause"), "mdi:pause", model.onPause, {
                      disabled: !model.canPause,
                    })
                  : nothing}
                ${model.supportsDock
                  ? renderAction(
                      model.t("action.dock"),
                      "mdi:home-import-outline",
                      model.onDock,
                      { disabled: !model.canDock },
                    )
                  : nothing}
              `
            : nothing}
          ${model.showHelperActions
            ? html`
                ${isHeroViewAvailable("camera", model.availableViews)
                  ? renderAction(
                      model.t("action.camera"),
                      "mdi:video-wireless-outline",
                      () => model.onView("camera"),
                      { active: model.activeView === "camera" },
                    )
                  : nothing}
                ${isHeroViewAvailable("map", model.availableViews)
                  ? renderAction(
                      model.t("action.map"),
                      "mdi:map-outline",
                      () => model.onView("map"),
                      { active: model.activeView === "map" },
                    )
                  : nothing}
                ${isHeroViewAvailable("point-cloud", model.availableViews)
                  ? renderAction(
                      model.t("action.pointCloud"),
                      "mdi:rotate-3d-variant",
                      () => model.onView("point-cloud"),
                      { active: model.activeView === "point-cloud" },
                    )
                  : nothing}
                ${model.onMaintenancePoint
                  ? renderAction(
                      model.t("action.maintenance"),
                      "mdi:map-marker-wrench",
                      model.onMaintenancePoint,
                      {
                        disabled: !model.maintenancePointAvailable,
                      },
                    )
                  : nothing}
              `
            : nothing}
          ${renderAction(model.t("action.more"), "mdi:dots-horizontal", model.onMoreInfo)}
        </div>
      </div>
    </ha-card>
  `;
}
