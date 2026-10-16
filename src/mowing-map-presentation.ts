import { css, svg } from "lit";

/**
 * Top-down mower silhouette; rotation is supplied only by validated telemetry.
 * `stretch` sizes the body along the mower's width (x) and length (y).
 */
export function mowerMapMarker(heading: number | null, stretch = { x: 1, y: 1 }) {
  return svg`
    <circle class="position-halo" r=${1.13 * Math.max(stretch.x, stretch.y)} />
    <g transform=${`rotate(${heading ?? 0}) scale(${stretch.x} ${stretch.y})`}>
      ${heading === null ? svg`` : svg`
        <path class="heading-cone" d="M -.62 -1.05 L 0 -1.65 L .62 -1.05 Z" />`}
      <rect x="-.83" y="-.39" width=".3" height="1.05" rx=".12" fill="#111917" stroke="#85968d" stroke-width=".05" />
      <rect x=".53" y="-.39" width=".3" height="1.05" rx=".12" fill="#111917" stroke="#85968d" stroke-width=".05" />
      <path d="M -.62 .62 L -.68 -.35 Q -.68 -.87 0 -.92 Q .68 -.87 .68 -.35 L .62 .62 Q 0 .97 -.62 .62 Z"
        fill="#dce5df" stroke="#f7faf8" stroke-width=".08" />
      <path d="M -.47 .49 L -.52 -.27 Q -.51 -.69 0 -.74 Q .51 -.69 .52 -.27 L .47 .49 Q 0 .72 -.47 .49 Z"
        fill="#26332e" />
      <path d="M -.5 -.48 Q 0 -.83 .5 -.48" fill="none" stroke="#8fa498" stroke-width=".065" />
      <circle cy="-.3" r=".23" fill="#121b17" stroke="#839a8c" stroke-width=".06" />
      <circle cy="-.3" r=".08" fill="#819887" />
      <rect x="-.18" y=".2" width=".36" height=".14" rx=".04" fill="#da735e" />
      <path d="M -.25 .5 H .25" stroke="#a7b5ad" stroke-width=".06" stroke-linecap="round" />
    </g>`;
}

export type MapControlIcon =
  "fit" | "centre" | "photo" | "layers" | "align" | "move" | "view" | "rotate-left" | "rotate-right";

/** Small inline controls stay legible even outside the Home Assistant icon host. */
export function mapControlIcon(kind: MapControlIcon) {
  switch (kind) {
    case "photo": return svg`
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 16 5-5 4 4 3-3 6 6" /><circle cx="16" cy="9" r="1.5" /></svg>`;
    case "fit": return svg`
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /></svg>`;
    case "layers": return svg`
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></svg>`;
    case "align": return svg`
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="12" height="10" rx="1.5" /><path d="M9 4h11v11" stroke-dasharray="2.5 2" /></svg>`;
    case "move": return svg`
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3" /></svg>`;
    case "view": return svg`
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6" /><path d="m20 20-4.5-4.5M8.5 11h5M11 8.5v5" /></svg>`;
    case "rotate-left": return svg`
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5v5h5" /><path d="M5 10a8 8 0 1 1 1.5 7" /></svg>`;
    case "rotate-right": return svg`
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 5v5h-5" /><path d="M19 10a8 8 0 1 0-1.5 7" /></svg>`;
    default: return svg`
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6" /><path d="M12 2v4m0 12v4M2 12h4m12 0h4" /><circle cx="12" cy="12" r="1" /></svg>`;
  }
}

export const mowingMapStyles = css`
  :host {
    display:block; width:100%; height:100%; min-height:280px; container-type:inline-size;
    --map-surface:var(--mower-surface, var(--card-background-color, #f4f7f4));
    --map-text:var(--mower-text, var(--primary-text-color, #213b2e));
    --map-muted:var(--mower-muted, var(--secondary-text-color, #53665b));
    --map-border:var(--mower-border, var(--divider-color, #cedbd1));
    --map-accent:var(--mower-accent, var(--primary-color, #597d49));
    --map-trail:var(--mower-route, #197f98);
  }
  .viewport {
    width:100%; height:100%; min-height:inherit; overflow:hidden;
    display:flex; flex-direction:column;
    color:var(--map-text); background:var(--map-surface);
  }
  .toolbar, .align-bar, .legend { flex:none; }
  .canvas { position:relative; flex:1 1 auto; min-height:0; overflow:hidden;
    background:var(--mower-map-ground, color-mix(in srgb, var(--map-surface) 94%, #91a799)); }
  .map-canvas,.fallback { width:100%; height:100%; display:block; object-fit:contain; }
  .map-empty { height:100%; display:grid; place-items:center; padding:20px;
    box-sizing:border-box; color:var(--map-muted); font-size:13px; text-align:center; }
  .map-canvas { touch-action:none; cursor:grab; outline-offset:-3px; }
  .map-canvas:active { cursor:grabbing; }
  .map-canvas:focus-visible { outline:2px solid var(--map-accent); }
  .toolbar { display:flex; align-items:center; flex-wrap:wrap; gap:8px;
    padding:10px 14px; border-bottom:1px solid var(--map-border);
    background:var(--mower-map-toolbar,var(--map-surface)); }
  .map-name { min-width:0; flex:1 1 100px; font-size:12px; font-weight:600;
    color:var(--map-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .tool-actions { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
  button { display:inline-flex; justify-content:center; align-items:center; gap:7px;
    min-height:38px; min-width:38px; padding:7px 10px; box-sizing:border-box;
    border:1px solid var(--map-border); border-radius:10px; font:inherit;
    font-size:12px; font-weight:600; cursor:pointer; color:var(--map-text);
    background:color-mix(in srgb, var(--map-surface) 94%, var(--map-text) 6%); }
  button:hover:not(:disabled) { border-color:var(--map-accent);
    background:color-mix(in srgb, var(--map-surface) 86%, var(--map-accent)); }
  button:disabled { opacity:.42; cursor:default; }
  button[aria-pressed="true"] { border-color:var(--map-accent); color:var(--map-accent);
    background:color-mix(in srgb, var(--map-surface) 80%, var(--map-accent)); }
  .real-scene { opacity:var(--mower-map-real-scene-opacity,.88); }
  button:focus-visible { outline:2px solid var(--map-accent); outline-offset:2px; }
  button svg { width:16px; height:16px; flex:none; fill:none; stroke:currentColor;
    stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; }
  .zoom { font-size:19px; font-weight:400; padding:4px; }
  .background-picker { position:relative; display:inline-flex; align-items:center; gap:6px;
    min-height:38px; padding:0 8px; box-sizing:border-box; border:1px solid var(--map-border);
    border-radius:10px; color:var(--map-text);
    background:color-mix(in srgb, var(--map-surface) 94%, var(--map-text) 6%); }
  .background-picker:focus-within { outline:2px solid var(--map-accent); outline-offset:2px; }
  .background-picker svg { width:16px; height:16px; flex:none; fill:none; stroke:currentColor;
    stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; }
  .background-picker select { min-height:36px; max-width:9.5em; border:0; outline:0; padding:0 2px;
    font:inherit; font-size:12px; font-weight:600; cursor:pointer;
    color:var(--map-text); background-color:transparent; }
  /* Native pickers draw options on their own surface: give them the theme's colours. */
  .background-picker option { color:var(--map-text); background-color:var(--map-surface); }
  .canvas.world { background:var(--mower-map-world-ground, #6f7d71); }
  .world-tiles { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
  .world-tiles img { position:absolute; left:0; top:0; width:256.5px; height:256.5px; max-width:none;
    transform-origin:0 0; user-select:none; -webkit-user-drag:none; }
  .canvas.world .map-canvas { position:relative; }
  .mower-layer.over-world { opacity:var(--mower-map-world-overlay-opacity,.92); }
  .mower-layer.aligning { opacity:var(--mower-map-align-opacity,.6); }
  .align-frame { stroke:var(--map-accent); stroke-width:2; stroke-dasharray:6 4; }
  .map-canvas.moving-map { cursor:move; }
  .tile-attribution { position:absolute; right:0; bottom:0; max-width:100%; box-sizing:border-box;
    padding:2px 6px; font-size:9px; line-height:1.3; text-align:right; color:#1d2621;
    background:rgba(255,255,255,.72); border-top-left-radius:6px; pointer-events:auto; }
  .tile-attribution a { color:inherit; }
  .map-notice { position:absolute; top:8px; left:50%; transform:translateX(-50%);
    max-width:calc(100% - 24px); box-sizing:border-box; padding:6px 10px; border-radius:8px;
    font-size:12px; font-weight:600; text-align:center; pointer-events:none;
    color:var(--map-text); background:color-mix(in srgb, var(--map-surface) 90%, transparent);
    border:1px solid var(--map-border); }
  .align-dialog { box-sizing:border-box; width:100vw; height:100vh; height:100dvh;
    max-width:100vw; max-height:100vh; max-height:100dvh; margin:0; padding:0; border:0;
    overflow:hidden; container-type:inline-size; color:var(--map-text); background:var(--map-surface); }
  .align-dialog::backdrop { background:rgba(0,0,0,.6); }
  .align-dialog .legend, .align-dialog .map-name { display:none; }
  @media (min-width:900px) and (min-height:600px) {
    .align-dialog { width:min(1100px, 92vw); height:min(820px, 90vh); margin:auto;
      border:1px solid var(--map-border); border-radius:16px; }
  }
  .align-bar { display:flex; flex-direction:column; gap:8px; padding:8px 14px;
    border-bottom:1px solid var(--map-border);
    background:color-mix(in srgb, var(--map-surface) 92%, var(--map-accent)); }
  .align-row { display:flex; flex-wrap:wrap; align-items:center; gap:8px; }
  .segmented { display:inline-flex; }
  .segmented button { border-radius:0; }
  .segmented button:first-child { border-radius:10px 0 0 10px; }
  .segmented button:last-child { border-radius:0 10px 10px 0; margin-left:-1px; }
  .stepper { display:inline-flex; align-items:center; gap:4px; }
  .stepper button { min-width:42px; min-height:42px; touch-action:manipulation; }
  .readout { min-width:4.2em; text-align:center; font-size:12px; font-weight:600;
    font-variant-numeric:tabular-nums; }
  .align-hint { flex:1 1 180px; min-width:0; font-size:12px; line-height:1.4; color:var(--map-muted); }
  .align-hint.error { color:var(--error-color, #b3261e); }
  .align-actions { display:inline-flex; gap:6px; margin-left:auto; }
  .align-actions button { min-height:42px; padding:8px 14px; }
  button.primary { color:var(--text-primary-color, #fff); border-color:var(--map-accent);
    background:var(--map-accent); }
  button.primary:hover:not(:disabled) { color:var(--text-primary-color, #fff);
    background:color-mix(in srgb, var(--map-accent) 85%, #000); }
  .trail-outline { stroke:var(--map-surface); stroke-opacity:.75; }
  .trail { stroke:var(--map-trail); stroke-opacity:var(--mower-map-trail-opacity,.85); }
  .position-halo { fill:var(--map-trail); fill-opacity:.16;
    stroke:var(--map-trail); stroke-opacity:.7; stroke-width:.055; }
  .heading-cone { fill:var(--map-trail); }
  .legend { display:flex; flex-wrap:wrap; align-items:center; gap:8px 18px;
    padding:10px 14px; border-top:1px solid var(--map-border);
    font-size:11px; line-height:1.5; color:var(--map-muted); }
  .legend-item { display:inline-flex; align-items:center; gap:6px; }
  .swatch { width:13px; height:9px; border:1px solid #86a696; border-radius:3px;
    background:rgba(171,227,207,.25); }
  .swatch.route { height:0; border:0; border-top:2px solid var(--map-trail); }
  .status { margin-left:auto; display:inline-flex; align-items:center; gap:6px; }
  .status-dot { width:6px; height:6px; border-radius:50%; background:var(--map-muted); }
  .status.current .status-dot { background:var(--map-trail); }
  .status.error .status-dot { background:#e3a276; }
  .coverage-note { flex-basis:100%; font-size:10px; opacity:.85; }
  @container (max-width:480px) {
    .toolbar { padding:8px 10px; gap:5px; }
    .map-name { flex-basis:100%; }
    .tool-actions { width:100%; }
    .tool-actions button:last-child { margin-left:auto; }
    .centre-button span, .align-button span { display:none; }
    .align-bar { padding:8px 10px; }
    .align-row { gap:6px; }
    .readout { min-width:3.6em; }
    .align-actions { width:100%; }
    .align-actions button { flex:1 1 0; }
    .legend { padding:8px 10px; gap:5px 12px; }
    .status { margin-left:0; }
  }
`;
