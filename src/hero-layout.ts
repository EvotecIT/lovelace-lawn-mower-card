import { css, html, nothing, type TemplateResult } from "lit";

import heroArtwork from "../assets/lawn-mower-hero.jpg";
import {
  normalizeHeroImage,
  normalizeHeroImagePosition,
  type HeroImagePosition,
} from "./hero-image";

export type HeroView = "overview" | "map" | "camera";

export type HeroLayoutModel = {
  title: string;
  subtitle: string;
  stateLabel: string;
  stateKey: string;
  battery?: string;
  progress?: string;
  progressLabel?: string;
  coverage?: string;
  coverageLabel?: string;
  heroImage?: string;
  heroImagePosition?: HeroImagePosition;
  activeView: HeroView;
  mapUrl?: string;
  cameraEntity?: object;
  hass: object;
  canStart: boolean;
  canPause: boolean;
  canDock: boolean;
  showDefaultActions: boolean;
  showHelperActions: boolean;
  onView(view: HeroView): void;
  onStart(): void | Promise<void>;
  onPause(): void | Promise<void>;
  onDock(): void | Promise<void>;
  onMoreInfo(): void;
};

function useBuiltInHeroArtwork(event: Event): void {
  const image = event.currentTarget as HTMLImageElement;
  if (image.getAttribute("src") !== heroArtwork) {
    image.src = heroArtwork;
  }
}

function renderView(model: HeroLayoutModel): TemplateResult {
  if (model.activeView === "map") {
    return model.mapUrl
      ? html`<img class="hero-map" src=${model.mapUrl} alt=${`${model.title} map`} />`
      : html`
          <div class="hero-empty">
            <ha-icon icon="mdi:map-outline"></ha-icon>
            <span>No mower map is available.</span>
          </div>
        `;
  }

  if (model.activeView === "camera") {
    return model.cameraEntity
      ? html`
          <ha-camera-stream
            class="hero-camera"
            .hass=${model.hass}
            .stateObj=${model.cameraEntity}
            .controls=${true}
            .muted=${true}
          ></ha-camera-stream>
        `
      : html`
          <div class="hero-empty">
            <ha-icon icon="mdi:video-off-outline"></ha-icon>
            <span>No live-video camera is available.</span>
          </div>
        `;
  }

  const image = normalizeHeroImage(model.heroImage) || heroArtwork;
  const position = normalizeHeroImagePosition(model.heroImagePosition);
  return html`
    <img
      class=${`hero-art position-${position}`}
      src=${image}
      alt=""
      aria-hidden="true"
      @error=${useBuiltInHeroArtwork}
    />
  `;
}

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
  disabled = false,
): TemplateResult {
  const selected = model.activeView === view;
  return html`
    <button
      class=${`hero-tab${selected ? " selected" : ""}`}
      role="tab"
      aria-selected=${selected ? "true" : "false"}
      aria-label=${label}
      ?disabled=${disabled}
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
  const overview = model.activeView === "overview";
  return html`
    <ha-card class="hero-card">
      <div class="hero-shell">
        <section class=${`hero-stage view-${model.activeView}`}>
          ${renderView(model)}
          ${model.activeView !== "map" && model.mapUrl
            ? html`<img
                class="hero-map-preload"
                src=${model.mapUrl}
                alt=""
                aria-hidden="true"
              />`
            : nothing}
          <div class="hero-scrim" aria-hidden="true"></div>

          <div class="hero-heading">
            <div class="hero-title-block">
              <span class="hero-eyebrow">Garden mower</span>
              <h2>${model.title}</h2>
              <span class="hero-subtitle">${model.subtitle}</span>
            </div>
            <div class=${`hero-state state-${model.stateKey}`}>
              <span class="hero-state-dot" aria-hidden="true"></span>
              <span>${model.stateLabel}</span>
            </div>
          </div>

          ${overview
            ? html`
                <div class="hero-metrics">
                  ${renderMetric("mdi:battery-high", "Battery", model.battery)}
                  ${renderMetric(
                    "mdi:progress-clock",
                    model.progressLabel || "Mission",
                    model.progress,
                  )}
                  ${renderMetric(
                    "mdi:grass",
                    model.coverageLabel || "Coverage",
                    model.coverage,
                  )}
                </div>
              `
            : nothing}
        </section>

        <nav class="hero-tabs" role="tablist" aria-label="Mower view">
          ${renderTab(model, "overview", "Overview", "mdi:view-dashboard-outline")}
          ${renderTab(model, "map", "Map", "mdi:map-outline", !model.mapUrl)}
          ${renderTab(
            model,
            "camera",
            "Camera",
            "mdi:video-wireless-outline",
            !model.cameraEntity,
          )}
        </nav>

        <div class="hero-actions" aria-label="Mower controls">
          ${model.showDefaultActions
            ? html`
                ${renderAction("Start", "mdi:play", model.onStart, {
                  disabled: !model.canStart,
                })}
                ${renderAction("Pause", "mdi:pause", model.onPause, {
                  disabled: !model.canPause,
                })}
                ${renderAction("Dock", "mdi:home-import-outline", model.onDock, {
                  disabled: !model.canDock,
                })}
              `
            : nothing}
          ${model.showHelperActions
            ? html`
                ${renderAction(
                  "Camera",
                  "mdi:video-wireless-outline",
                  () => model.onView("camera"),
                  {
                    disabled: !model.cameraEntity,
                    active: model.activeView === "camera",
                  },
                )}
                ${renderAction("Map", "mdi:map-outline", () => model.onView("map"), {
                  disabled: !model.mapUrl,
                  active: model.activeView === "map",
                })}
              `
            : nothing}
          ${renderAction("More", "mdi:dots-horizontal", model.onMoreInfo)}
        </div>
      </div>
    </ha-card>
  `;
}

export const heroLayoutStyles = css`
  ha-card.hero-card {
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--divider-color) 80%, #7ea36e 20%);
    background: #0a0d0b;
  }

  .hero-shell {
    display: grid;
    color: #f7faf7;
    background:
      radial-gradient(circle at 50% -20%, rgba(122, 164, 97, 0.18), transparent 42%),
      #0a0d0b;
  }

  .hero-stage {
    position: relative;
    min-height: 330px;
    aspect-ratio: 16 / 9.5;
    overflow: hidden;
    isolation: isolate;
    background: #080b09;
  }

  .hero-art,
  .hero-map,
  .hero-camera,
  .hero-empty {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .hero-map-preload {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .hero-art {
    object-fit: cover;
    transform: scale(1.015);
  }

  .hero-art.position-center {
    object-position: center;
  }

  .hero-art.position-left {
    object-position: left center;
  }

  .hero-art.position-right {
    object-position: right center;
  }

  .hero-art.position-top {
    object-position: center top;
  }

  .hero-art.position-bottom {
    object-position: center bottom;
  }

  .hero-map {
    box-sizing: border-box;
    object-fit: contain;
    padding: 72px 12px 12px;
    background: #0b0f0c;
  }

  .hero-camera {
    display: block;
    object-fit: cover;
    background: #050605;
  }

  .hero-empty {
    box-sizing: border-box;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 12px;
    padding: 96px 24px 32px;
    color: rgba(247, 250, 247, 0.72);
    background:
      radial-gradient(circle at center, rgba(115, 155, 96, 0.14), transparent 38%),
      #080b09;
  }

  .hero-empty ha-icon {
    --mdc-icon-size: 34px;
  }

  .hero-scrim {
    position: absolute;
    z-index: 1;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(180deg, rgba(3, 5, 4, 0.82) 0%, rgba(3, 5, 4, 0.08) 40%, rgba(3, 5, 4, 0.82) 100%),
      linear-gradient(90deg, rgba(3, 5, 4, 0.38), transparent 55%);
  }

  .view-map .hero-scrim,
  .view-camera .hero-scrim {
    background: linear-gradient(180deg, rgba(3, 5, 4, 0.78) 0%, transparent 34%, rgba(3, 5, 4, 0.2) 100%);
  }

  .hero-heading {
    position: absolute;
    z-index: 2;
    inset: 0 0 auto;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    padding: 22px;
  }

  .hero-title-block {
    flex: 1 1 auto;
    min-width: 0;
    display: grid;
    gap: 4px;
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.75);
  }

  .hero-eyebrow {
    color: rgba(232, 240, 228, 0.72);
    font-size: 0.72rem;
    font-weight: 650;
    letter-spacing: 0.11em;
    text-transform: uppercase;
  }

  .hero-title-block h2 {
    margin: 0;
    font-size: clamp(1.25rem, 3vw, 1.8rem);
    line-height: 1.1;
  }

  .hero-subtitle {
    overflow: hidden;
    color: rgba(247, 250, 247, 0.8);
    font-size: 0.9rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hero-state {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    max-width: 45%;
    padding: 8px 11px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 999px;
    color: #f7faf7;
    font-size: 0.84rem;
    font-weight: 650;
    white-space: nowrap;
    background: rgba(8, 12, 9, 0.62);
    backdrop-filter: blur(14px) saturate(1.2);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
  }

  .hero-state-dot {
    width: 8px;
    height: 8px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: #93c47d;
    box-shadow: 0 0 0 4px rgba(147, 196, 125, 0.14);
  }

  .hero-state.state-returning .hero-state-dot {
    background: #f0c764;
    box-shadow: 0 0 0 4px rgba(240, 199, 100, 0.14);
  }

  .hero-state.state-paused .hero-state-dot {
    background: #b4a0e5;
    box-shadow: 0 0 0 4px rgba(180, 160, 229, 0.14);
  }

  .hero-state.state-docked .hero-state-dot {
    background: #78aee8;
    box-shadow: 0 0 0 4px rgba(120, 174, 232, 0.14);
  }

  .hero-state.state-error .hero-state-dot,
  .hero-state.state-unavailable .hero-state-dot {
    background: #ef7f75;
    box-shadow: 0 0 0 4px rgba(239, 127, 117, 0.14);
  }

  .hero-metrics {
    position: absolute;
    z-index: 2;
    inset: auto 18px 18px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .hero-metric {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 12px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 13px;
    background: rgba(8, 12, 9, 0.66);
    backdrop-filter: blur(16px) saturate(1.25);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
  }

  .hero-metric ha-icon {
    --mdc-icon-size: 22px;
    color: #a8ce95;
  }

  .hero-metric-copy {
    min-width: 0;
    display: grid;
    gap: 2px;
  }

  .hero-metric-label {
    color: rgba(232, 240, 228, 0.66);
    font-size: 0.68rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .hero-metric strong {
    overflow: hidden;
    font-size: 0.93rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hero-tabs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    padding: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: #0d120e;
  }

  .hero-tab,
  .hero-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 0;
    border: 1px solid transparent;
    color: rgba(247, 250, 247, 0.72);
    background: transparent;
  }

  .hero-tab {
    padding: 9px 12px;
    border-radius: 10px;
  }

  .hero-tab:hover,
  .hero-tab.selected {
    color: #f7faf7;
    border-color: rgba(146, 190, 124, 0.24);
    background: rgba(119, 159, 99, 0.16);
  }

  .hero-tab.selected {
    box-shadow: inset 0 -2px 0 #91bd7b;
  }

  .hero-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
    gap: 8px;
    padding: 12px;
    background: #0a0d0b;
  }

  .hero-action {
    min-width: 0;
    min-height: 54px;
    flex-direction: column;
    padding: 8px 6px;
    border-color: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    font-size: 0.72rem;
    background: rgba(255, 255, 255, 0.035);
  }

  .hero-action:hover,
  .hero-action.active {
    color: #f7faf7;
    border-color: rgba(146, 190, 124, 0.32);
    background: rgba(119, 159, 99, 0.16);
  }

  .hero-action:disabled,
  .hero-tab:disabled {
    opacity: 0.34;
  }

  .hero-action ha-icon,
  .hero-tab ha-icon {
    --mdc-icon-size: 20px;
  }

  @media (max-width: 560px) {
    .hero-stage {
      width: 100%;
      min-width: 0;
      min-height: 310px;
      aspect-ratio: auto;
    }

    .hero-heading {
      padding: 16px;
    }

    .hero-metrics {
      inset: auto auto 12px 12px;
      width: calc(100% - 24px);
      box-sizing: border-box;
      gap: 6px;
    }

    .hero-metric {
      display: grid;
      justify-items: center;
      gap: 5px;
      padding: 9px 6px;
      text-align: center;
    }

    .hero-metric strong {
      font-size: 0.76rem;
    }

    .hero-metric-label {
      display: none;
    }

    .hero-actions {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
      padding: 9px;
    }

    .hero-action {
      min-height: 52px;
      font-size: 0.7rem;
    }

    .hero-action ha-icon {
      --mdc-icon-size: 21px;
    }
  }
`;
