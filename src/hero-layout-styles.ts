import { css } from "lit";
import { mowingMissionStyles } from "./mowing-mission";
import { dashboardStyles } from "./dashboard-styles";

export const heroLayoutStyles = css`
  ${mowingMissionStyles}
  ${dashboardStyles}
  /* With an interactive map, Overview and Map share one stage height, so switching
     tabs never resizes the card; the map fills what its heading leaves. */
  .hero-stage.interactive-map { aspect-ratio:auto;
    height:var(--mower-hero-stage-height, clamp(420px, 56vh, 560px)); }
  .view-map.interactive-map { display:flex; flex-direction:column; }
  .view-map.interactive-map .mowing-mission { order:3; flex:none; position:relative; }
  .view-map.interactive-map .hero-heading { position:relative; order:1; padding:18px; align-items:center; }
  .view-map.interactive-map .hero-eyebrow { display:none; }
  .view-map.interactive-map .hero-title-block { text-shadow:none; }
  .view-map.interactive-map .hero-title-block h2 { font-size:clamp(1.1rem,2.4vw,1.4rem); }
  .view-map.interactive-map .hero-scrim { display:none; }
  .hero-mowing-map { position:absolute; inset:0; width:100%; height:100%; }
  .view-map.interactive-map .hero-mowing-map { position:relative; order:2;
    height:auto; flex:1 1 auto; min-height:0; }
  ha-card.hero-card {
    --mower-chrome:transparent;
    --mower-shell-glow:transparent;
    overflow: hidden;
    border-radius:var(--mower-radius);
  }

  /* The original Hero look is a token palette. HA variables are remapped too, so
     nested panels that read them follow the same palette. */
  ha-card.hero-card:not(.theme-auto) {
    --mower-text:#eef3ed;
    --mower-muted:#a4b3a8;
    --mower-border:#2b3b30;
    --mower-accent:var(--mower-custom-accent,#aed098);
    --mower-route:#71b9cf;
    --mower-map-ground:#18291e;
    --mower-canvas:#0a0d0b;
    --mower-chrome:#0d120e;
    --mower-field:#111a15;
    --mower-shell-glow:rgba(122, 164, 97, 0.18);
    --mower-success:#8bc978;
    --mower-error:#ef8178;
    --mower-state-mowing:#93c47d;
    --mower-state-returning:#f0c764;
    --mower-state-paused:#b4a0e5;
    --mower-state-docked:#78aee8;
    --mower-state-error:#ef7f75;
    --mower-switch-on:var(--mower-accent);
    --card-background-color:var(--mower-field);
    --primary-text-color:var(--mower-text);
    --secondary-text-color:var(--mower-muted);
    --divider-color:var(--mower-border);
    --primary-color:var(--mower-accent);
    color-scheme:dark;
    color:var(--mower-text);
    border:1px solid color-mix(in srgb, var(--mower-border) 70%, #7ea36e 30%);
    background:var(--mower-canvas);
  }

  .hero-shell {
    display: grid;
    color: var(--mower-text);
    background:
      radial-gradient(circle at 50% -20%, var(--mower-shell-glow), transparent 42%),
      var(--mower-canvas);
  }

  .hero-action-feedback {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 14px 10px;
    border: 1px solid color-mix(in srgb, var(--mower-success) 42%, transparent);
    border-radius: var(--mower-radius-control);
    padding: 9px 11px;
    background: color-mix(in srgb, var(--mower-success) 16%, transparent);
    color: var(--mower-text);
    font-size: 0.8rem;
  }

  .hero-action-feedback.error {
    border-color: color-mix(in srgb, var(--mower-error) 48%, transparent);
    background: color-mix(in srgb, var(--mower-error) 16%, transparent);
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
    color: #f7faf7;
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

  .hero-stage.view-photos { display:flex; flex-direction:column; aspect-ratio:auto; height:auto; }
  .view-photos .hero-heading { position:relative; order:1; }
  .view-photos .hero-scrim { display:none; }
  .hero-photos { position:absolute; inset:0; }
  .view-photos .hero-photos { position:relative; order:2; flex:none; height:auto; }

  /* Keep capability guidance and errors clear of the mower heading. */
  .hero-stage.view-point-cloud {
    display: flex; flex-direction: column; aspect-ratio: auto; height: auto;
  }
  .view-point-cloud .hero-heading { position: relative; order: 1; }
  .view-point-cloud .hero-point-cloud {
    position: relative; order: 2; flex: none;
    height: clamp(330px, 50vh, 500px);
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
    font-size: 0.75rem;
    font-weight: 650;
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
    background: var(--mower-state, var(--mower-state-mowing));
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--mower-state, var(--mower-state-mowing)) 14%, transparent);
  }

  .hero-metrics {
    position: absolute;
    z-index: 2;
    inset: auto 18px 18px;
    display: grid;
    grid-template-columns: repeat(var(--hero-metric-count, 3), minmax(0, 1fr));
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
    font-size: 0.75rem;
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
    border-top: 1px solid var(--mower-hairline);
    border-bottom: 1px solid var(--mower-hairline);
    background: var(--mower-chrome);
  }

  .hero-selectors {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--mower-hairline);
    background: var(--mower-chrome);
  }

  .hero-selectors .selector-card {
    border-color: color-mix(in srgb, var(--mower-text) 12%, transparent);
    color: var(--mower-text);
    background: var(--mower-fill);
  }

  .hero-selectors .selector-label {
    color: var(--mower-muted);
  }

  .hero-selectors .selector-card select {
    border-color: var(--mower-border);
    color: var(--mower-text);
    background-color: var(--mower-field);
  }

  .hero-selectors .schedule-panel {
    grid-column: 1 / -1;
    border-color: color-mix(in srgb, var(--mower-text) 12%, transparent);
    color: var(--mower-text);
    background:
      linear-gradient(145deg, color-mix(in srgb, var(--mower-accent) 12%, transparent), transparent 55%),
      var(--mower-fill);
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
    border-color: var(--mower-hairline);
    background: var(--mower-fill);
  }

  .hero-tab,
  .hero-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 0;
    border: 1px solid transparent;
    color: color-mix(in srgb, var(--mower-text) 72%, transparent);
    background: transparent;
  }

  .hero-tab {
    padding: 9px 12px;
    border-radius: var(--mower-radius-control);
  }

  .hero-tab:hover,
  .hero-tab.selected {
    color: var(--mower-text);
    border-color: color-mix(in srgb, var(--mower-accent) 24%, transparent);
    background: color-mix(in srgb, var(--mower-accent) 16%, transparent);
  }

  .hero-tab.selected {
    box-shadow: inset 0 -2px 0 var(--mower-accent);
  }

  .hero-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
    gap: 8px;
    padding: 12px;
    background: var(--mower-canvas);
  }

  .hero-action {
    min-width: 0;
    min-height: 54px;
    flex-direction: column;
    padding: 8px 6px;
    border-color: var(--mower-hairline);
    border-radius: var(--mower-radius-inner);
    font-size: 0.72rem;
    background: var(--mower-fill);
  }

  .hero-action.primary:not(:disabled) {
    color: var(--mower-text);
    border-color: color-mix(in srgb, var(--mower-accent) 55%, transparent);
    background: color-mix(in srgb, var(--mower-accent) 22%, transparent);
    font-weight: 600;
  }

  .hero-action.primary:not(:disabled) ha-icon {
    color: var(--mower-accent);
  }

  .hero-action:hover,
  .hero-action.active {
    color: var(--mower-text);
    border-color: color-mix(in srgb, var(--mower-accent) 32%, transparent);
    background: color-mix(in srgb, var(--mower-accent) 16%, transparent);
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

    /* A bare time doesn't say what it is; the next run keeps its label. */
    .hero-metric.next-run .hero-metric-label {
      display: block;
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
