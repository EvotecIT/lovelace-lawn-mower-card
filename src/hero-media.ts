import { html, nothing, type TemplateResult } from "lit";
import { keyed } from "lit/directives/keyed.js";
import type { HeroLayoutModel, HeroView } from "./hero-layout";
import { mapPresentationClasses } from "./map-presentation";
import { normalizeHeroImage, normalizeHeroImagePosition } from "./hero-image";
import heroArtwork from "../assets/lawn-mower-hero.jpg";
import "./mowing-map";

function useBuiltInHeroArtwork(event: Event): void {
  const image = event.currentTarget as HTMLImageElement;
  if (image.getAttribute("src") !== heroArtwork) {
    image.src = heroArtwork;
  }
}

export function renderHeroMedia(model: HeroLayoutModel, views: readonly HeroView[] = ["overview", "map", "point-cloud", "camera"]): TemplateResult {
  const image = normalizeHeroImage(model.heroImage) || heroArtwork;
  const position = normalizeHeroImagePosition(model.heroImagePosition);
  return html`
    ${views.includes("overview") ? html`<img
      class=${`hero-layer hero-art position-${position}${
        model.activeView === "overview" ? " active" : ""
      }`}
      src=${image}
      alt=""
      aria-hidden="true"
      @error=${useBuiltInHeroArtwork}
    />` : nothing}
    ${views.includes("map") && model.mowingMapPath ? html`
      <lawn-mower-mowing-map
        class=${`hero-layer hero-mowing-map${model.activeView === "map" ? " active" : ""}`}
        .hass=${model.hass} .path=${model.mowingMapPath} .locale=${model.locale}
        .fallbackUrl=${model.mapUrl} .fallbackSaved=${Boolean(model.mapSavedPreview)}
        .active=${views.includes("map") && model.activeView === "map" && model.mediaVisible !== false}
      ></lawn-mower-mowing-map>` : views.includes("map") && model.mapUrl
      ? html`
          <img
            class=${`hero-layer hero-map ${mapPresentationClasses(
              model.mapFit,
              model.mapPosition,
            )}${
              model.activeView === "map" ? " active" : ""
            }`}
            src=${model.mapUrl}
            alt=${model.t("hero.mapAlt", { name: model.title })}
            aria-hidden=${model.activeView === "map" ? "false" : "true"}
          />
        `
      : nothing}
    ${views.includes("point-cloud") && model.pointCloudMounted && model.pointCloudPath
      ? html`
          <lawn-mower-point-cloud
            class=${`hero-layer hero-point-cloud${
              model.activeView === "point-cloud" ? " active" : ""
            }`}
            .hass=${model.hass}
            .path=${model.pointCloudPath}
            .active=${views.includes("point-cloud") && model.activeView === "point-cloud" && model.mediaVisible !== false}
            .autoLoad=${true}
            .compact=${true}
            .locale=${model.locale}
            aria-hidden=${model.activeView === "point-cloud" ? "false" : "true"}
          ></lawn-mower-point-cloud>
        `
      : nothing}
    ${views.includes("camera") && model.cameraMounted &&
    model.cameraEntity &&
    model.cameraRenderKey &&
    !model.cameraBlockReason
      ? keyed(
          model.cameraRenderKey,
          html`
          <div
            class=${`hero-layer hero-camera-layer${
              model.activeView === "camera" ? " active" : ""
            }`}
            aria-hidden=${model.activeView === "camera" ? "false" : "true"}
          >
            ${model.cameraPreviewUrl
              ? html`
                  <img
                    class="hero-camera-preview"
                    src=${model.cameraPreviewUrl}
                    alt=""
                    aria-hidden="true"
                  />
                `
              : nothing}
            <ha-camera-stream
              class="hero-camera"
              .hass=${model.hass}
              .stateObj=${model.cameraEntity}
              .controls=${true}
              .muted=${true}
            ></ha-camera-stream>
            ${model.cameraReconnecting && model.activeView === "camera"
              ? html`
                  <div class="hero-camera-reconnecting" role="status">
                    <ha-icon icon="mdi:wifi-sync"></ha-icon>
                    <span>${model.t("hero.reconnectingVideo")}</span>
                  </div>
                `
              : nothing}
          </div>
        `,
        )
      : nothing}
    ${views.includes("point-cloud") && model.activeView === "point-cloud" && !model.pointCloudPath
      ? html`
          <div class="hero-empty">
            <ha-icon icon="mdi:cube-off-outline"></ha-icon>
            <span>${model.t("hero.noPointCloud")}</span>
          </div>
        `
      : nothing}
    ${views.includes("point-cloud") && model.activeView === "point-cloud" && model.pointCloudPath &&
    !model.pointCloudMounted && !model.pointCloudLoadError
      ? html`
          <div class="hero-empty" role="status">
            <ha-icon icon="mdi:cube-scan"></ha-icon>
            <span>${model.t("pointCloud.rendererLoading")}</span>
          </div>
        `
      : nothing}
    ${views.includes("point-cloud") && model.activeView === "point-cloud" && model.pointCloudLoadError
      ? html`
          <div class="hero-empty">
            <ha-icon icon="mdi:cube-off-outline"></ha-icon>
            <span>${model.pointCloudLoadError}</span>
          </div>
        `
      : nothing}
    ${views.includes("map") && model.activeView === "map" && !model.mapUrl && !model.mowingMapPath
      ? html`
          <div class="hero-empty">
            <ha-icon icon="mdi:map-outline"></ha-icon>
            <span>${model.t("hero.noMap")}</span>
          </div>
        `
      : nothing}
    ${views.includes("camera") && model.activeView === "camera" && !model.cameraEntity
      ? html`
          <div class="hero-empty">
            <ha-icon icon="mdi:video-off-outline"></ha-icon>
            <span>${model.t("hero.noCamera")}</span>
          </div>
        `
        : nothing}
    ${views.includes("camera") && model.activeView === "camera" && model.cameraBlockReason
      ? html`
          <div class="hero-empty" role="status">
            <ha-icon icon="mdi:shield-lock-outline"></ha-icon>
            <span>${model.cameraBlockReason}</span>
          </div>
        `
      : nothing}
  `;
}
