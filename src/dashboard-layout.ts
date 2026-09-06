import { html, nothing, svg } from "lit";
import type { HeroLayoutModel } from "./hero-layout";
import { renderHeroMedia } from "./hero-media";
import { renderMowingMission } from "./mowing-mission";
import { dashboardMainView } from "./dashboard-view";
import { batteryPercent } from "./battery-presentation";
export { dashboardMainView } from "./dashboard-view";

/** Dashboard telemetry stays outside the media stage, including camera and 3D views. */
export function renderDashboardHeader(model: HeroLayoutModel) {
  const battery = batteryPercent(model.battery);
  const stateIcon = model.stateKey === "mowing" ? "mdi:leaf"
    : model.stateKey === "paused" ? "mdi:pause-circle-outline"
    : model.stateKey === "returning" || model.stateKey === "docked" ? "mdi:home-outline"
    : model.stateKey === "error" || model.stateKey === "unavailable" ? "mdi:alert-circle-outline"
    : "mdi:power";
  return html`
    <header class="dashboard-header">
      <div class="dashboard-identity">
        <div class="dashboard-mower-icon" aria-hidden="true"><ha-icon icon="mdi:robot-mower-outline"></ha-icon></div>
        <div class="dashboard-title">
          <h2>${model.title}</h2>
          <div class=${`dashboard-state state-${model.stateKey}`}>
            <ha-icon .icon=${stateIcon} aria-hidden="true"></ha-icon><span>${model.stateLabel}</span>
          </div>
          ${model.subtitle && model.subtitle.toLowerCase() !== model.stateLabel.toLowerCase()
            ? html`<span class="dashboard-subtitle">${model.subtitle}</span>` : nothing}
        </div>
      </div>
      <div class=${`dashboard-battery${battery === undefined ? " battery-unknown" : battery <= 20 ? " battery-low" : battery <= 40 ? " battery-medium" : ""}`}>
        <svg class="dashboard-battery-icon" viewBox="0 0 36 24" aria-hidden="true">
          <rect x="1.5" y="4" width="29" height="16" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8" />
          <rect x="32" y="9" width="3" height="6" rx="1" fill="currentColor" />
          ${battery !== undefined ? svg`<rect x="4.5" y="7" width=${23 * battery / 100} height="10" rx="1" fill="currentColor" />` : nothing}
        </svg>
        <div><strong>${model.battery || "—"}</strong><span>${model.t("hero.battery")}</span></div>
      </div>
    </header>`;
}

/** Composition only: camera activation and warm-stream lifetime remain in the card. */
export function renderDashboardAside(model: HeroLayoutModel) {
  const camera = model.availableViews.includes("camera");
  const watching = model.activeView === "camera";
  return html`
    <aside class="dashboard-aside" aria-label=${model.t("hero.mission")}>
      ${camera ? html`
        <section class="dashboard-camera-panel">
          <div class="dashboard-panel-heading">
            <span><ha-icon icon="mdi:video-wireless-outline"></ha-icon>${model.t("hero.camera")}</span>
            ${watching ? html`<button class="dashboard-camera-toggle" @click=${() => model.onView(dashboardMainView(model))}>
              <ha-icon icon="mdi:close"></ha-icon><span>${model.t("dashboard.closeCamera")}</span>
            </button>` : nothing}
          </div>
          <div class="dashboard-camera-stage">
            ${renderHeroMedia(model, ["camera"])}
            ${!watching ? html`
              <button class="dashboard-camera-start" @click=${() => model.onView("camera")}>
                <ha-icon icon="mdi:play-circle-outline"></ha-icon>
                <strong>${model.t("dashboard.openCamera")}</strong>
                <span>${model.t("dashboard.cameraOnDemand")}</span>
              </button>` : nothing}
          </div>
        </section>` : nothing}
      <div class="dashboard-mission-panel">
        <div class="dashboard-panel-heading"><span><ha-icon icon="mdi:grass"></ha-icon>${model.t("hero.mission")}</span></div>
        ${renderMowingMission({ ...model, showBattery: false })}
      </div>
    </aside>`;
}
