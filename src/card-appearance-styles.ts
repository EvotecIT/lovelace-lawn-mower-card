import { css } from "lit";

/** Shared presets only change presentation; all layouts retain their normal behavior. */
export const cardAppearanceStyles = css`
  ha-card.appearance, ha-card.hero-card.appearance {
    --mower-base:var(--ha-card-background,var(--card-background-color,#fff));
    --mower-card-background:var(--mower-base);
    --mower-shadow:var(--mower-custom-shadow,var(--ha-card-box-shadow,none));
    color:var(--mower-text); background:var(--mower-card-background);
    border-radius:var(--mower-radius); box-shadow:var(--mower-shadow); border-color:var(--mower-border);
  }
  ha-card.appearance.appearance-modern { --mower-radius:var(--mower-custom-radius,24px); --mower-shadow:var(--mower-custom-shadow,0 8px 28px #00000020); }
  ha-card.appearance.appearance-minimal { --mower-radius:var(--mower-custom-radius,4px); --mower-shadow:var(--mower-custom-shadow,none); }
  ha-card.appearance.surface-tinted { --mower-card-background:color-mix(in srgb,var(--mower-base) 94%,var(--mower-accent)); }
  ha-card.appearance.surface-translucent { --mower-card-background:color-mix(in srgb,var(--mower-base) var(--mower-surface-opacity),transparent); backdrop-filter:blur(16px); }
  ha-card.appearance .hero-shell { background:transparent; color:var(--mower-text); }
  ha-card.appearance .hero-tabs, ha-card.appearance .hero-actions, ha-card.appearance .hero-selectors { background:transparent; }
  ha-card.appearance .custom-tile, ha-card.appearance .custom-chip,
  ha-card.appearance .custom-actions button, ha-card.appearance .hero-action,
  ha-card.appearance .hero-tab, ha-card.appearance .selector-card,
  ha-card.appearance .dashboard-battery, ha-card.appearance .dashboard-camera-panel,
  ha-card.appearance .dashboard-mission-panel, ha-card.appearance .tile, ha-card.appearance .actions button {
    border-radius:var(--mower-radius-inner); border-color:var(--mower-border);
  }
  ha-card.appearance-minimal .dashboard-mower-icon { display:none; }
  ha-card.appearance-minimal .custom-tile, ha-card.appearance-minimal .dashboard-battery,
  ha-card.appearance-minimal .dashboard-mission-panel { border:0; border-bottom:1px solid var(--mower-border); background:transparent; box-shadow:none; }
  ha-card.appearance-minimal .hero-tab.selected { box-shadow:none; border-bottom:2px solid var(--mower-accent); }
  ha-card.appearance-modern .hero-tab.selected { border-color:var(--mower-accent); background:var(--mower-fill-accent); }
  ha-card.appearance .actions button ha-icon { color:var(--mower-accent); }
  ha-card.appearance-minimal .tile { border:0; border-bottom:1px solid var(--mower-border); background:transparent; box-shadow:none; }
  .view-overview .hero-scrim { opacity:var(--mower-art-overlay,1); }
  .hero-card .hero-stage { color:#f7faf7; }
  .without-artwork .view-overview { min-height:0; height:auto; aspect-ratio:auto; background:transparent; }
  .without-artwork .view-overview .hero-scrim { display:none; }
  .without-artwork .view-overview .hero-heading { position:relative; color:var(--mower-text); }
  .without-artwork .view-overview .hero-title-block { text-shadow:none; }
  .without-artwork .view-overview h2 { color:var(--mower-text); }
  .without-artwork .view-overview .hero-eyebrow, .without-artwork .view-overview .hero-subtitle { color:var(--mower-muted); }
  .without-artwork .view-overview .hero-metrics { position:relative; inset:auto; width:auto; margin:0 12px 16px; }
  .without-artwork .view-overview .hero-metric { background:var(--mower-fill); color:var(--mower-text); border-color:var(--mower-border); box-shadow:none; backdrop-filter:none; border-radius:var(--mower-radius-inner); }
  .without-artwork .view-overview .hero-metric ha-icon { color:var(--mower-accent); }
  .without-artwork .view-overview .hero-state { background:var(--mower-fill); color:var(--mower-text); box-shadow:none; border-color:var(--mower-border); }
  .without-artwork .view-overview .hero-metric-label { color:var(--mower-muted); }
  .without-artwork.dashboard-card .hero-stage.view-overview { display:none; }
`;
