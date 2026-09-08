import { css } from "lit";

/** Optional HA theme colors outside the photographic/media canvas. */
export const heroThemeStyles = css`
  ha-card.hero-card.theme-auto {
    --mower-surface:var(--card-background-color,#fff);
    --mower-text:var(--primary-text-color,#20252a);
    --mower-muted:var(--secondary-text-color,#596570);
    --mower-border:var(--divider-color,#d5dce1);
    --mower-accent:var(--primary-color,#397d51);
    --mower-map-toolbar:var(--mower-surface);
    color-scheme:inherit;
    background:var(--mower-surface);
    border-color:var(--mower-border);
  }
  .theme-auto .hero-shell { background:var(--mower-surface); color:var(--mower-text); }
  .theme-auto .hero-actions, .theme-auto .hero-tabs, .theme-auto .hero-selectors,
  .theme-auto .dashboard-battery, .theme-auto .dashboard-camera-panel,
  .theme-auto .dashboard-mission-panel, .theme-auto .dashboard-camera-start {
    background:var(--mower-surface); color:var(--mower-text); border-color:var(--mower-border);
  }
  .theme-auto .hero-selectors { color-scheme:inherit; }
  .theme-auto .hero-action, .theme-auto .hero-tab, .theme-auto .hero-selectors .selector-card,
  .theme-auto .hero-selectors .schedule-panel, .theme-auto .hero-selectors .schedule-row,
  .theme-auto .dashboard-camera-toggle {
    background:var(--mower-surface); color:var(--mower-text); border-color:var(--mower-border);
  }
  .theme-auto .hero-action ha-icon, .theme-auto .dashboard-mower-icon,
  .theme-auto .dashboard-panel-heading ha-icon { color:var(--mower-accent); }
  .theme-auto .hero-action:hover:not(:disabled), .theme-auto .hero-action.active,
  .theme-auto .hero-tab.selected, .theme-auto .hero-tab:hover,
  .theme-auto .hero-action.primary:not(:disabled) {
    background:color-mix(in srgb,var(--mower-accent) 12%,var(--mower-surface));
    color:var(--mower-text); border-color:var(--mower-accent);
  }
  .theme-auto .hero-action.primary:not(:disabled) ha-icon { color:var(--mower-accent); }
  .theme-auto .hero-selectors .selector-label, .theme-auto .dashboard-panel-heading,
  .theme-auto .dashboard-camera-start span { color:var(--mower-muted); }
  .theme-auto .dashboard-panel-heading, .theme-auto .mowing-stat { border-color:var(--mower-border); }
  .theme-auto .dashboard-camera-start strong, .theme-auto .dashboard-camera-start ha-icon { color:var(--mower-accent); }
  .theme-auto .dashboard-mower-icon { background:var(--mower-surface); box-shadow:none; border-color:var(--mower-border); }
  .theme-auto .view-map.interactive-map .hero-heading { background:var(--mower-surface); color:var(--mower-text); }
  .theme-auto .view-map.interactive-map .hero-heading h2,
  .theme-auto .view-map.interactive-map .hero-subtitle { color:var(--mower-text); }
  .theme-auto .dashboard-state.state-paused, .theme-auto .dashboard-state.state-returning,
  .theme-auto .dashboard-state.state-docked { color:var(--mower-text); }
  .theme-auto .dashboard-state.state-error, .theme-auto .dashboard-state.state-unavailable { color:var(--error-color,#b83d3d); }
`;
