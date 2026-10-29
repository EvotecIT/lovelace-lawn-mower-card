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
  .task-list { list-style:none; margin:0; padding:0; display:grid; gap:8px; }
  .task-list button { display:flex; align-items:center; gap:12px; width:100%; text-align:start; padding:14px 12px; }
  .task-icon { color:var(--mower-accent,var(--primary-color)); }
  .task-copy { display:grid; gap:5px; flex:1; min-width:0; }
  .task-copy strong { font-size:14px; }
  .task-copy > span { font-size:12px; color:var(--mower-muted,var(--secondary-text-color)); }
  .outcome { display:inline-flex; align-items:center; gap:4px; font-size:11px; color:var(--mower-muted,var(--secondary-text-color)); }
  .result-1 { color:var(--mower-success,#7bae73); }
  .detail { display:grid; gap:14px; }
  .detail-title { display:flex; align-items:center; justify-content:space-between; gap:12px; border-radius:4px; }
  dl { margin:0; } dt { font-size:11px; color:var(--mower-muted,var(--secondary-text-color)); } dd { margin:4px 0 0; font-size:14px; }
  .metrics,.settings-values { display:flex; gap:24px; flex-wrap:wrap; }
  .metrics dd { font-size:20px; font-weight:600; }
  .historical-map,.panel { border:1px solid var(--mower-border,var(--divider-color)); border-radius:12px; padding:14px; }
  figcaption { font-size:12px; color:var(--mower-muted,var(--secondary-text-color)); margin-bottom:8px; }
  .historical-map svg { width:100%; height:230px; display:block; background:var(--mower-map-ground,var(--mower-fill)); border-radius:8px; }
  .lawn { fill:color-mix(in srgb,var(--mower-accent,#8fbd7d) 18%,transparent); stroke:var(--mower-accent,#8fbd7d); stroke-width:2; vector-effect:non-scaling-stroke; }
  .boundary { fill:none; stroke:var(--mower-muted,#899b93); stroke-width:1; vector-effect:non-scaling-stroke; }
  .track { fill:none; stroke:var(--mower-route,#71b9cf); stroke-width:1.5; vector-effect:non-scaling-stroke; }
  .battery-summary { display:flex; align-items:baseline; flex-wrap:wrap; gap:12px; }
  .battery-summary strong { font-size:21px; } .battery-summary span { font-size:12px; color:var(--mower-muted,var(--secondary-text-color)); }
  .battery-plot { display:grid; grid-template-columns:32px minmax(0,1fr); height:140px; margin-top:12px; }
  .chart-scale { display:flex; flex-direction:column; justify-content:space-between; padding:12px 0; color:var(--mower-muted); font:10px system-ui; }
  .battery-chart { display:block; width:100%; height:140px; overflow:visible; }
  .chart-grid { stroke:var(--mower-border,var(--divider-color)); fill:none; }
  .battery-line { stroke:var(--mower-accent,var(--primary-color)); stroke-width:2; vector-effect:non-scaling-stroke; }
  .charge { stroke:var(--mower-state-returning,#d6aa55); stroke-width:2; stroke-dasharray:4 3; vector-effect:non-scaling-stroke; }
  circle { fill:var(--mower-accent,var(--primary-color)); }
  .settings-values { margin-top:10px; } .zone-settings { margin-top:12px; padding-top:10px; border-top:1px solid var(--mower-border,var(--divider-color)); font-size:12px; }
  details { font-size:12px; border-bottom:1px solid var(--mower-border,var(--divider-color)); padding:8px 0 12px; }
  summary { cursor:pointer; padding:4px 0; } li { line-height:1.6; }
  .photo { display:grid; place-items:center; min-height:120px; margin-top:8px; }
  .photo img { width:100%; max-height:360px; object-fit:contain; border-radius:8px; }
  .photo-nav { display:flex; align-items:center; justify-content:center; gap:14px; margin-top:10px; font-size:12px; }
  @container (max-width:400px) { :host > section { padding:12px; } .task-icon { display:none; } .task-list button { gap:6px; } .outcome { max-width:85px; } .task-copy > span { font-size:11px; } }
`;
