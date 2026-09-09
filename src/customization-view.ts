import { css, html, nothing, type TemplateResult } from "lit";
import type { DisplayAction, DisplayTile } from "./card-customization";

export function renderSummary(items: DisplayTile[]) {
  return items.length ? html`<div class="custom-summary">${items.map(item => html`
    <span class="custom-chip" title=${item.label}>
      ${item.icon ? html`<ha-icon .icon=${item.icon} aria-hidden="true"></ha-icon>` : nothing}
      <span>${item.label} <strong>${item.value}</strong></span>
    </span>`)}</div>` : nothing;
}

export function renderTiles(items: DisplayTile[], columns?: number) {
  return items.length ? html`<div class=${`custom-tiles${columns ? " fixed-columns" : ""}${columns === 1 ? " single-column" : ""}`} style=${columns ? `--custom-columns:${columns}` : ""}>
    ${items.map(item => html`<div class=${`custom-tile${item.unavailable ? " unavailable" : ""}`}>
      <span class="custom-tile-label">${item.icon ? html`<ha-icon .icon=${item.icon} aria-hidden="true"></ha-icon>` : nothing}<span>${item.label}</span></span>
      <strong>${item.value}</strong>
    </div>`)}
  </div>` : nothing;
}

export function renderCustomActions(actions: DisplayAction[], title: string, confirmation?: TemplateResult) {
  return actions.length ? html`<section class="custom-action-section" aria-label=${title}>
    <div class="custom-section-title">${title}</div>
    <div class="custom-actions">${actions.map(action => html`<button type="button" ?disabled=${action.disabled} @click=${action.handler}>
      ${action.icon ? html`<ha-icon .icon=${action.icon} aria-hidden="true"></ha-icon>` : nothing}<span>${action.label}</span>
    </button>`)}</div>${confirmation || nothing}
  </section>` : nothing;
}

export const customizationStyles = css`
  .custom-summary { display:flex; flex-wrap:wrap; gap:8px; min-width:0; }
  .custom-chip { display:flex; align-items:center; gap:6px; padding:6px 10px; border:1px solid var(--mower-border,var(--divider-color)); border-radius:18px; background:var(--mower-surface,var(--secondary-background-color)); font-size:12px; min-width:0; max-width:100%; color:var(--mower-muted,var(--secondary-text-color)); overflow-wrap:anywhere; }
  .custom-chip strong { color:var(--mower-text,var(--primary-text-color)); font-weight:600; }
  .custom-chip ha-icon { --mdc-icon-size:16px; flex:none; }
  .custom-tiles { --custom-tile-gap:10px; display:grid; grid-template-columns:repeat(var(--custom-columns,auto-fit),minmax(min(140px,100%),1fr)); gap:var(--custom-tile-gap); min-width:0; }
  .custom-tiles.fixed-columns { grid-template-columns:repeat(var(--custom-columns),minmax(0,1fr)); }
  .custom-tile { box-sizing:border-box; display:flex; flex-direction:column; align-items:center; text-align:center; padding:12px; border:1px solid var(--mower-border,var(--divider-color)); border-radius:12px; background:var(--mower-surface,var(--secondary-background-color)); min-width:0; overflow-wrap:anywhere; }
  .custom-tile-label { display:flex; align-items:center; justify-content:center; gap:7px; color:var(--mower-muted,var(--secondary-text-color)); font-size:12px; margin-bottom:8px; }
  .custom-tile-label ha-icon { --mdc-icon-size:19px; flex:none; color:var(--mower-accent,var(--primary-color)); }
  .custom-tile strong { font-size:20px; color:var(--mower-text,var(--primary-text-color)); }
  .custom-tile.unavailable strong { font-size:14px; }
  .custom-section-title { font-size:12px; font-weight:600; color:var(--mower-muted,var(--secondary-text-color)); margin-bottom:9px; }
  .custom-action-section .custom-section-title { text-align:center; }
  .custom-actions { display:flex; flex-wrap:wrap; justify-content:center; gap:8px; }
  .custom-actions button { display:flex; align-items:center; justify-content:center; gap:8px; min-height:44px; max-width:100%; min-width:0; padding:10px 14px; border:1px solid var(--mower-border,var(--divider-color)); border-radius:10px; background:var(--mower-surface,var(--secondary-background-color)); color:var(--mower-text,var(--primary-text-color)); font:inherit; font-size:13px; cursor:pointer; overflow-wrap:anywhere; }
  .custom-actions button ha-icon { --mdc-icon-size:20px; flex:none; color:var(--mower-accent,var(--primary-color)); }
  .custom-actions button:disabled { opacity:.45; cursor:default; }
  .custom-actions button:focus-visible { outline:2px solid var(--mower-accent,var(--primary-color)); outline-offset:2px; }
  .custom-actions button:hover:not(:disabled) { border-color:var(--mower-accent,var(--primary-color)); }
  .hero-customization { display:grid; gap:16px; min-width:0; padding:0 14px 14px; }
  .hero-summary { padding:12px 14px; min-width:0; }
  .dashboard-header-block { grid-column:1/-1; grid-row:1; min-width:0; }
  .dashboard-card .hero-summary { padding:12px 0 0; }
  .dashboard-card .hero-customization { grid-column:1/-1; padding:0; }
  .hero-customization .hero-selectors { margin:0; }
  .hero-card.density-compact .hero-customization { gap:10px; }
  .density-compact .custom-tile { padding:9px; }
  .density-compact .custom-tile strong { font-size:17px; }
  .density-compact .custom-tiles { --custom-tile-gap:7px; }
  @container (max-width:450px) {
    .custom-tiles, .custom-tiles.fixed-columns { grid-template-columns:repeat(min(var(--custom-columns,2),2),minmax(0,1fr)); }
    .custom-tiles:not(.single-column) > .custom-tile:last-child:nth-child(odd):not(:only-child) { grid-column:1/-1; justify-self:center; width:calc((100% - var(--custom-tile-gap)) / 2); }
    .custom-actions button { flex:1 1 120px; }
  }
`;
