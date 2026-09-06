import { html, nothing } from "lit";
import type { HeroLayoutModel } from "./hero-layout";
import { renderHeroMedia } from "./hero-media";
import { renderMowingMission } from "./mowing-mission";
import { dashboardMainView } from "./dashboard-view";
export { dashboardMainView } from "./dashboard-view";

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
        ${renderMowingMission(model)}
      </div>
    </aside>`;
}
