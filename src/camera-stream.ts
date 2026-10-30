import { html, nothing, type TemplateResult } from "lit";
import type { Translator } from "./localization";

export type CameraStreamModel = {
  hass: unknown;
  entity: object;
  previewUrl?: string;
  /** Shown only while the camera is the visible view. */
  reconnecting: boolean;
  t: Translator;
};

/** The still preview sits under the stream so the view never opens black. */
export function renderCameraStream(model: CameraStreamModel): TemplateResult {
  return html`
    ${model.previewUrl
      ? html`<img class="hero-camera-preview" src=${model.previewUrl} alt="" aria-hidden="true" />`
      : nothing}
    <ha-camera-stream
      class="hero-camera"
      .hass=${model.hass}
      .stateObj=${model.entity}
      .controls=${true}
      .muted=${true}
    ></ha-camera-stream>
    ${model.reconnecting
      ? html`
          <div class="hero-camera-reconnecting" role="status">
            <ha-icon icon="mdi:wifi-sync"></ha-icon>
            <span>${model.t("hero.reconnectingVideo")}</span>
          </div>
        `
      : nothing}
  `;
}
