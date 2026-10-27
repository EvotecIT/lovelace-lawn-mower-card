import { css } from "lit";

/**
 * Following the HA theme needs no colour rules: the Hero reads the shared tokens,
 * which only the original palettes override. What remains are views whose heading
 * sits beside the media instead of on top of it.
 */
export const heroThemeStyles = css`
  .theme-auto .hero-stage.view-map.interactive-map { background:transparent; color:var(--mower-text); }
  .theme-auto .view-map.interactive-map .hero-heading h2,
  .theme-auto .view-map.interactive-map .hero-subtitle { color:var(--mower-text); }
  .theme-auto .view-map.interactive-map .hero-state {
    color:var(--mower-text); background:var(--mower-fill-strong); border-color:var(--mower-border);
    box-shadow:none; backdrop-filter:none;
  }
  .dashboard-state.state-error, .dashboard-state.state-unavailable { color:var(--mower-state-error); }
`;
