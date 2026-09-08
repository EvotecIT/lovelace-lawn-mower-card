import { css } from "lit";

/** Shared presets only change presentation; all layouts retain their normal behavior. */
export const cardAppearanceStyles = css`
  ha-card.appearance, ha-card.hero-card.appearance {
    --mower-base:var(--card-background-color,var(--ha-card-background,#fff));
    --mower-surface:var(--mower-base);
    --mower-text:var(--primary-text-color,#20252a);
    --mower-muted:var(--secondary-text-color,#596570);
    --mower-border:var(--divider-color,#d5dce1);
    --mower-accent:var(--mower-custom-accent,var(--primary-color,#397d51));
    --mower-radius:var(--mower-custom-radius,var(--ha-card-border-radius,12px));
    --mower-shadow:var(--mower-custom-shadow,var(--ha-card-box-shadow,none));
    font-family:var(--ha-font-family-body,var(--paper-font-body1_-_font-family,inherit));
    color:var(--mower-text); background:var(--mower-surface);
    border-radius:var(--mower-radius); box-shadow:var(--mower-shadow); border-color:var(--mower-border);
  }
  ha-card.appearance.appearance-modern { --mower-radius:var(--mower-custom-radius,24px); --mower-shadow:var(--mower-custom-shadow,0 8px 28px #00000020); }
  ha-card.appearance.appearance-minimal { --mower-radius:var(--mower-custom-radius,4px); --mower-shadow:var(--mower-custom-shadow,none); }
  ha-card.appearance.surface-tinted { --mower-surface:color-mix(in srgb,var(--mower-base) 94%,var(--mower-accent)); }
  ha-card.appearance.surface-translucent { --mower-surface:color-mix(in srgb,var(--mower-base) var(--mower-surface-opacity),transparent); backdrop-filter:blur(16px); }
  ha-card.appearance .hero-shell { background:transparent; color:var(--mower-text); }
  ha-card.appearance .hero-tabs, ha-card.appearance .hero-actions, ha-card.appearance .hero-selectors { background:transparent; }
  ha-card.appearance .custom-tile, ha-card.appearance .custom-chip,
  ha-card.appearance .custom-actions button, ha-card.appearance .hero-action,
  ha-card.appearance .hero-tab, ha-card.appearance .selector-card,
  ha-card.appearance .dashboard-battery, ha-card.appearance .dashboard-camera-panel,
  ha-card.appearance .dashboard-mission-panel, ha-card.appearance .tile, ha-card.appearance .actions button {
    border-radius:min(var(--mower-radius),12px); border-color:var(--mower-border);
  }
  ha-card.appearance .custom-tile, ha-card.appearance .custom-chip,
  ha-card.appearance .custom-actions button, ha-card.appearance .hero-action,
  ha-card.appearance .selector-card, ha-card.appearance .dashboard-battery,
  ha-card.appearance .dashboard-camera-panel, ha-card.appearance .dashboard-mission-panel { background:var(--mower-base); }
  ha-card.appearance-minimal .dashboard-mower-icon { display:none; }
  ha-card.appearance-minimal .custom-tile, ha-card.appearance-minimal .dashboard-battery,
  ha-card.appearance-minimal .dashboard-mission-panel { border:0; border-bottom:1px solid var(--mower-border); background:transparent; box-shadow:none; }
  ha-card.appearance-minimal .hero-tab.selected { box-shadow:none; border-bottom:2px solid var(--mower-accent); }
  ha-card.appearance-modern .hero-tab.selected { border-color:var(--mower-accent); background:color-mix(in srgb,var(--mower-accent) 14%,var(--mower-base)); }
  ha-card.appearance .actions button ha-icon { color:var(--mower-accent); }
  ha-card.appearance-minimal .tile { border:0; border-bottom:1px solid var(--mower-border); background:transparent; box-shadow:none; }
  .view-overview .hero-scrim { opacity:var(--mower-art-overlay,1); }
  .hero-card .hero-stage { color:#f7faf7; }
  .without-artwork .view-overview { min-height:0; height:auto; aspect-ratio:auto; background:var(--mower-surface); }
  .without-artwork .view-overview .hero-scrim { display:none; }
  .without-artwork .view-overview .hero-heading { position:relative; color:var(--mower-text); }
  .without-artwork .view-overview .hero-title-block { text-shadow:none; }
  .without-artwork .view-overview h2 { color:var(--mower-text); }
  .without-artwork .view-overview .hero-eyebrow, .without-artwork .view-overview .hero-subtitle { color:var(--mower-muted); }
  .without-artwork .view-overview .hero-metrics { position:relative; inset:auto; width:auto; margin:0 12px 16px; }
  .without-artwork .view-overview .hero-metric { background:var(--mower-base,var(--mower-surface)); color:var(--mower-text); border-color:var(--mower-border); box-shadow:none; backdrop-filter:none; border-radius:min(var(--mower-radius,12px),12px); }
  .without-artwork .view-overview .hero-metric ha-icon { color:var(--mower-accent); }
  .without-artwork .view-overview .hero-state { background:var(--mower-base,var(--mower-surface)); color:var(--mower-text); box-shadow:none; border-color:var(--mower-border); }
  .without-artwork .view-overview .hero-metric-label { color:var(--mower-muted); }
  .without-artwork.dashboard-card .hero-stage.view-overview { display:none; }
`;
