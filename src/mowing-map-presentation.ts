import { css, svg } from "lit";

/** Top-down mower silhouette; rotation is supplied only by validated telemetry. */
export function mowerMapMarker(heading: number | null) {
  return svg`
    <circle class="position-halo" r="1.13" />
    <g transform=${`rotate(${heading ?? 0})`}>
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

/** Small inline controls stay legible even outside the Home Assistant icon host. */
export function mapControlIcon(kind: "fit" | "centre") {
  return kind === "fit" ? svg`
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /></svg>` : svg`
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6" /><path d="M12 2v4m0 12v4M2 12h4m12 0h4" /><circle cx="12" cy="12" r="1" /></svg>`;
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
    display:grid; grid-template-rows:auto minmax(0,1fr) auto;
    color:var(--map-text); background:var(--map-surface);
  }
  .canvas { position:relative; min-height:0; overflow:hidden;
    background:var(--mower-map-ground, color-mix(in srgb, var(--map-surface) 94%, #91a799)); }
  .map-canvas,.fallback { width:100%; height:100%; display:block; object-fit:contain; }
  .map-canvas { touch-action:none; cursor:grab; outline-offset:-3px; }
  .map-canvas:active { cursor:grabbing; }
  .map-canvas:focus-visible { outline:2px solid var(--map-accent); }
  .toolbar { display:flex; align-items:center; flex-wrap:wrap; gap:8px;
    padding:10px 14px; border-bottom:1px solid var(--map-border); }
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
  button:focus-visible { outline:2px solid var(--map-accent); outline-offset:2px; }
  button svg { width:16px; height:16px; flex:none; fill:none; stroke:currentColor;
    stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; }
  .zoom { font-size:19px; font-weight:400; padding:4px; }
  .trail-outline { stroke:var(--map-surface); stroke-opacity:.75; }
  .trail { stroke:var(--map-trail); stroke-opacity:.85; }
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
    .centre-button span { display:none; }
    .legend { padding:8px 10px; gap:5px 12px; }
    .status { margin-left:0; }
  }
`;
