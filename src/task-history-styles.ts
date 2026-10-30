import { css } from "lit";

export const taskHistoryStyles = css`
  :host { display:block; color:var(--mower-text,var(--primary-text-color)); font:inherit; min-width:0; container-type:inline-size; }
  * { box-sizing:border-box; }
  section { min-width:0; }
  :host > section { padding:16px; }
  header { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; }
  h3,h4,p,figure { margin:0; } h3 { font-size:16px; } h4 { font-size:14px; margin-bottom:10px; }
  p { font-size:12px; color:var(--mower-muted,var(--secondary-text-color)); line-height:1.6; overflow-wrap:anywhere; }
  header p { margin-top:4px; }
  button { font:inherit; color:inherit; background:var(--mower-field); border:1px solid var(--mower-border,var(--divider-color)); border-radius:10px; padding:10px 12px; cursor:pointer; min-height:42px; }
  button:hover:not(:disabled) { border-color:var(--mower-accent,var(--primary-color)); }
  button:focus-visible,summary:focus-visible,.detail-title:focus-visible,.photo:focus-visible { outline:2px solid var(--mower-accent,var(--primary-color)); outline-offset:3px; }
  button:disabled,button[aria-disabled="true"] { opacity:.45; cursor:default; }
  ha-icon { --mdc-icon-size:20px; flex:none; }
  .back,.icon-button { display:inline-flex; align-items:center; gap:8px; }
  .icon-button { padding:10px; }
  .message { padding:32px 12px; text-align:center; }
  .message button { margin-top:12px; }
  .cache-note { padding:0 0 12px; }
  .week-summary { display:flex; flex-wrap:wrap; align-items:baseline; gap:6px 16px; margin-bottom:14px; padding:12px 14px; border-radius:12px; background:var(--mower-fill-accent,color-mix(in srgb,var(--mower-accent,var(--primary-color)) 12%,transparent)); font-size:13px; font-variant-numeric:tabular-nums; }
  .week-summary strong { font-size:15px; }
  .summary-label { flex-basis:100%; font-size:11px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; color:var(--mower-muted,var(--secondary-text-color)); }
  .season { display:grid; gap:8px; margin-bottom:10px; padding:12px 14px; border-radius:12px; border:1px solid var(--mower-border,var(--divider-color)); font-variant-numeric:tabular-nums; }
  .season-totals { display:flex; flex-wrap:wrap; align-items:baseline; gap:4px 16px; font-size:13px; }
  .season-totals strong { font-size:20px; letter-spacing:-.01em; }
  .season-chart { list-style:none; margin:4px 0 0; padding:0; display:grid; grid-template-columns:repeat(12,minmax(0,1fr)); gap:4px; }
  .season-chart li { display:grid; grid-template-rows:56px auto; gap:4px; justify-items:center; }
  .season-chart .bars { position:relative; width:100%; max-width:22px; height:100%; border-bottom:1px solid var(--mower-border,var(--divider-color)); }
  .season-chart .bar { position:absolute; inset:auto 0 0; border-radius:4px 4px 1px 1px; background:var(--mower-accent,var(--primary-color)); }
  .season-chart .bar.previous { background:color-mix(in srgb,var(--mower-muted,var(--secondary-text-color)) 28%,transparent); }
  .season-chart .bar.previous + .bar { inset:auto 22% 0 0; }
  .season-chart .month { font-size:10px; color:var(--mower-muted,var(--secondary-text-color)); }
  .season-chart .current .month { color:var(--mower-text,var(--primary-text-color)); font-weight:700; }
  .season .note { margin:0; }
  .day + .day { margin-top:14px; }
  .day-label { margin:0 2px 8px; font-size:12px; font-weight:600; color:var(--mower-muted,var(--secondary-text-color)); }
  .task-list { list-style:none; margin:0; padding:0; display:grid; gap:6px; }
  .task-list button { display:flex; align-items:center; gap:12px; width:100%; text-align:start; padding:10px 10px 10px 12px; }
  .task-icon { display:grid; place-items:center; width:36px; height:36px; flex:none; border-radius:10px; color:var(--mower-accent,var(--primary-color)); background:var(--mower-fill-accent,color-mix(in srgb,var(--mower-accent,var(--primary-color)) 14%,transparent)); }
  .task-copy { display:grid; gap:3px; flex:1; min-width:0; }
  .task-copy strong { font-size:14px; }
  .task-copy > span { font-size:12px; color:var(--mower-muted,var(--secondary-text-color)); font-variant-numeric:tabular-nums; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .chevron { color:var(--mower-muted,var(--secondary-text-color)); --mdc-icon-size:18px; }
  .badge { --tone:var(--mower-muted,var(--secondary-text-color)); display:inline-flex; align-items:center; gap:6px; flex:none; padding:2px 9px 2px 7px; border:1px solid color-mix(in srgb,var(--tone) 45%,transparent); border-radius:999px; font-size:11px; font-weight:600; line-height:1.4; white-space:nowrap; color:var(--mower-text,var(--primary-text-color)); background:color-mix(in srgb,var(--tone) 12%,transparent); }
  .badge::before { content:""; width:7px; height:7px; border-radius:50%; background:var(--tone); }
  .badge-done { --tone:var(--mower-success,#4f9b58); }
  .badge-stopped { --tone:var(--mower-warning,#c08a2e); }
  .badge-partial { --tone:var(--mower-info,#4b8fb0); }
  .detail { display:grid; gap:14px; }
  .detail-head { display:flex; flex-wrap:wrap; align-items:center; gap:6px 10px; }
  .detail-title { font-size:18px; border-radius:4px; }
  .detail-when { flex-basis:100%; font-size:13px; }
  .note { margin-top:10px; font-size:11px; }
  dl { margin:0; } dt { font-size:11px; color:var(--mower-muted,var(--secondary-text-color)); } dd { margin:4px 0 0; font-size:14px; }
  .metrics { display:grid; grid-template-columns:repeat(auto-fit,minmax(84px,1fr)); gap:8px; }
  .metrics > div { padding:10px 12px; border-radius:10px; background:var(--mower-fill,color-mix(in srgb,currentColor 6%,transparent)); }
  .metrics dd { font-size:clamp(16px,5cqi,20px); font-weight:600; font-variant-numeric:tabular-nums; white-space:nowrap; }
  .settings-values { display:flex; gap:8px; flex-wrap:wrap; }
  .settings-values > div { padding:6px 10px; border-radius:8px; background:var(--mower-fill,color-mix(in srgb,currentColor 6%,transparent)); }
  .settings-values dd { margin-top:2px; font-size:13px; font-weight:600; }
  .historical-map,.panel { border:1px solid var(--mower-border,var(--divider-color)); border-radius:12px; padding:14px; }
  figcaption { font-size:12px; color:var(--mower-muted,var(--secondary-text-color)); margin-bottom:8px; }
  .historical-map svg { width:100%; height:230px; display:block; background:var(--mower-map-ground,var(--mower-fill)); border-radius:8px; }
  .lawn { fill:color-mix(in srgb,var(--mower-accent,#8fbd7d) 18%,transparent); stroke:var(--mower-accent,#8fbd7d); stroke-width:2; vector-effect:non-scaling-stroke; }
  .boundary { fill:none; stroke:var(--mower-muted,#899b93); stroke-width:1; vector-effect:non-scaling-stroke; }
  .track { fill:none; stroke:var(--mower-route,#71b9cf); stroke-width:1.5; vector-effect:non-scaling-stroke; }
  .battery-summary { display:flex; align-items:baseline; flex-wrap:wrap; gap:12px; }
  .battery-summary strong { font-size:21px; } .battery-summary span { font-size:12px; color:var(--mower-muted,var(--secondary-text-color)); }
  .battery-plot { display:grid; grid-template-columns:32px minmax(0,1fr); grid-template-rows:140px auto; margin-top:12px; }
  .chart-times { grid-column:2; display:flex; justify-content:space-between; margin-top:4px; color:var(--mower-muted,var(--secondary-text-color)); font-size:10px; font-variant-numeric:tabular-nums; }
  .chart-scale { display:flex; flex-direction:column; justify-content:space-between; padding:12px 0; color:var(--mower-muted); font:10px system-ui; }
  .battery-chart { display:block; width:100%; height:140px; overflow:visible; }
  .chart-grid { stroke:var(--mower-border,var(--divider-color)); fill:none; }
  .battery-line { stroke:var(--mower-accent,var(--primary-color)); stroke-width:2; vector-effect:non-scaling-stroke; }
  .charge { stroke:var(--mower-state-returning,#d6aa55); stroke-width:2; stroke-dasharray:4 3; vector-effect:non-scaling-stroke; }
  circle { fill:var(--mower-accent,var(--primary-color)); }
  .settings-values { margin-top:10px; } .zone-settings { margin-top:12px; padding-top:10px; border-top:1px solid var(--mower-border,var(--divider-color)); font-size:12px; }
  details.panel { font-size:12px; padding:0; }
  summary { display:flex; align-items:center; justify-content:space-between; gap:8px; cursor:pointer; padding:12px 14px; font-size:14px; font-weight:600; list-style:none; border-radius:12px; }
  summary::-webkit-details-marker { display:none; }
  summary::after { content:""; width:7px; height:7px; border-right:2px solid currentColor; border-bottom:2px solid currentColor; transform:rotate(45deg); opacity:.6; transition:transform .15s; }
  details[open] > summary::after { transform:rotate(-135deg); }
  details ul { margin:0; padding:0 14px 12px 30px; } li { line-height:1.6; }
  .zone-results { list-style:none; padding:0 14px 12px; display:grid; gap:6px; }
  .zone-results li { display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .photo { display:grid; place-items:center; min-height:120px; margin-top:8px; }
  .photo img { width:100%; max-height:360px; object-fit:contain; border-radius:8px; }
  .photo-nav { display:flex; align-items:center; justify-content:center; gap:14px; margin-top:10px; font-size:12px; }
  @container (max-width:400px) { :host > section { padding:12px; } .task-icon { display:none; } .task-list button { gap:8px; } .task-copy > span { font-size:11px; } }
`;
