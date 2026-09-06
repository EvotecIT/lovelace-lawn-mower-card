import { html, nothing, type TemplateResult } from "lit";
import type { HeroLayoutModel } from "./hero-layout";
import { isHeroViewAvailable } from "./hero-views";

/** The command result follows its controls in each composition. */
export function renderHeroActionFeedback(model: HeroLayoutModel) {
  return html`${model.actionFeedback
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
          : nothing}`;
}

function renderAction(
  label: string,
  icon: string,
  handler: () => void | Promise<void>,
  options: { disabled?: boolean; active?: boolean; primary?: boolean } = {},
): TemplateResult {
  return html`
    <button
      class=${`hero-action${options.active ? " active" : ""}${options.primary ? " primary" : ""}`}
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

/** Shared action handlers, availability and feedback remain owned by the card. */
export function renderHeroActions(model: HeroLayoutModel): TemplateResult {
  return html`
        <div class="hero-actions" aria-label=${model.t("hero.controlsLabel")}>
          ${model.showDefaultActions
            ? html`
                ${model.supportsStart
                  ? renderAction(model.t("action.start"), "mdi:play", model.onStart, {
                      disabled: !model.canStart, primary: true,
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
  `;
}
