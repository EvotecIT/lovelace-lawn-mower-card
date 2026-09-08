import { css } from "lit";
import { mowingMissionStyles } from "./mowing-mission";
import { dashboardStyles } from "./dashboard-styles";

export const heroLayoutStyles = css`
  ${mowingMissionStyles}
  ${dashboardStyles}
  .view-map.interactive-map { display:flex; flex-direction:column; aspect-ratio:auto; height:auto; }
  .view-map.interactive-map .hero-heading { position:relative; order:1; padding:18px; align-items:center; }
  .view-map.interactive-map .hero-eyebrow { display:none; }
  .view-map.interactive-map .hero-title-block { text-shadow:none; }
  .view-map.interactive-map .hero-title-block h2 { font-size:clamp(1.1rem,2.4vw,1.4rem); }
  .view-map.interactive-map .hero-scrim { display:none; }
  .hero-mowing-map { position:absolute; inset:0; width:100%; height:100%; }
  .view-map.interactive-map .hero-mowing-map { position:relative; order:2;
    height:clamp(360px,50vh,500px); flex:none; }
  ha-card.hero-card {
    --mower-surface:#111a15;
    --mower-text:#eef3ed;
    --mower-muted:#a4b3a8;
    --mower-border:#2b3b30;
    --mower-accent:#aed098;
    --mower-route:#71b9cf;
    --mower-map-ground:#18291e;
    overflow: hidden;
    border-radius:var(--ha-card-border-radius,18px);
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

  .hero-action-feedback {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 14px 10px;
    border: 1px solid color-mix(in srgb, #8bc978 42%, transparent);
    border-radius: 10px;
    padding: 9px 11px;
    background: color-mix(in srgb, #17391c 88%, transparent);
    color: #eaf8e7;
    font-size: 0.8rem;
  }

  .hero-action-feedback.error {
    border-color: color-mix(in srgb, #ef8178 48%, transparent);
    background: color-mix(in srgb, #4a1816 88%, transparent);
    color: #ffe8e5;
  }

  .hero-action-feedback ha-icon {
    --mdc-icon-size: 18px;
    flex: 0 0 auto;
  }

  .hero-stage {
    position: relative;
    width: 100%;
    min-width: 0;
    min-height: 330px;
    aspect-ratio: 16 / 9.5;
    overflow: hidden;
    isolation: isolate;
    background: #080b09;
  }

  .hero-stage .map-status {
    inset: auto 12px 12px;
  }

  .hero-art,
  .hero-map,
  .hero-point-cloud,
  .hero-camera-layer,
  .hero-camera,
  .hero-empty {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .hero-layer {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
  }

  .hero-layer.active {
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
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

  .hero-map.map-fit-cover {
    object-fit: cover;
    padding: 0;
  }

  .map-position-top { object-position: center top; }
  .map-position-bottom { object-position: center bottom; }
  .map-position-left { object-position: left center; }
  .map-position-right { object-position: right center; }
  .map-position-top-left { object-position: left top; }
  .map-position-top-right { object-position: right top; }
  .map-position-bottom-left { object-position: left bottom; }
  .map-position-bottom-right { object-position: right bottom; }

  .hero-camera-layer {
    overflow: hidden;
    background: #050605;
  }

  .hero-camera,
  .hero-camera-preview {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .hero-camera-preview {
    background: #050605;
    filter: saturate(0.92);
  }

  .hero-camera {
    background: transparent;
  }

  .hero-camera-reconnecting {
    position: absolute;
    z-index: 3;
    bottom: 56px;
    left: 50%;
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: calc(100% - 32px);
    box-sizing: border-box;
    padding: 8px 12px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 999px;
    color: #fff;
    background: rgba(15, 23, 42, 0.84);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
    backdrop-filter: blur(8px);
    transform: translateX(-50%);
    font-size: 0.78rem;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
  }

  .hero-point-cloud {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
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
  .view-point-cloud .hero-scrim,
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
    grid-auto-flow:column;
    grid-auto-columns:minmax(0, 1fr);
    gap: 6px;
    padding: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: #0d120e;
  }

  .hero-selectors {
    --card-background-color: var(--mower-surface);
    --primary-text-color: var(--mower-text);
    --secondary-text-color: var(--mower-muted);
    --divider-color: var(--mower-border);
    --primary-color: var(--mower-accent);
    color-scheme: dark;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: #0d120e;
  }

  .hero-selectors .selector-card {
    border-color: rgba(255, 255, 255, 0.12);
    color: #f7faf7;
    background: rgba(255, 255, 255, 0.04);
  }

  .hero-selectors .selector-label {
    color: rgba(232, 240, 228, 0.68);
  }

  .hero-selectors .selector-card select {
    border-color: var(--mower-border);
    color: var(--mower-text);
    background-color: var(--mower-surface);
  }

  .hero-selectors .schedule-panel {
    grid-column: 1 / -1;
    border-color: rgba(255, 255, 255, 0.12);
    color: #f7faf7;
    background:
      linear-gradient(145deg, rgba(92, 190, 122, 0.12), transparent 55%),
      rgba(255, 255, 255, 0.04);
  }

  .hero-selectors .schedule-list {
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  }

  .hero-selectors .device-settings-panel,
  .hero-selectors .preference-panel {
    grid-column: 1 / -1;
  }

  .hero-selectors .preference-controls {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .hero-selectors .schedule-row {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.045);
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

  @media (max-height: 600px) and (min-width: 561px) {
    .hero-stage {
      height: min(330px, 62vh);
      min-height: 300px;
      aspect-ratio: auto;
    }
  }

  @container (max-width: 560px) {
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

    .hero-tabs {
      gap: 2px;
      padding: 6px;
    }

    .hero-tab {
      min-width: 0;
      flex-direction: column;
      gap: 3px;
      padding: 7px 2px;
      font-size: 0.68rem;
      line-height: 1.1;
    }

    .hero-actions {
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
