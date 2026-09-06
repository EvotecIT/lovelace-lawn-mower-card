import { css } from "lit";

/** Dashboard-only composition; media lifetime stays in the card. */
export const dashboardStyles = css`
  ha-card.hero-card.dashboard-card {
    --mower-surface:#0d2533; --mower-text:#edf8ff; --mower-muted:#a1bece;
    --mower-border:#244c60; --mower-accent:#69e59c; --mower-route:#69d4f4;
    --mower-map-ground:#0d2928; --mower-map-toolbar:#102c3a; --mower-map-trail-opacity:1;
    display:block; container-type:inline-size; border:1px solid #24536a; border-radius:22px;
    background:#081c2a; box-shadow:inset 0 1px 0 #4186a329,0 14px 36px #020e1826;
  }
  .dashboard-card .hero-shell { background:radial-gradient(ellipse at 0 0,#12527033,transparent 60%),#081c2a; padding:18px; gap:16px; }
  .dashboard-header { display:flex; align-items:center; justify-content:space-between; gap:16px; min-width:0; }
  .dashboard-identity { display:flex; align-items:center; gap:14px; min-width:0; }
  .dashboard-mower-icon { display:grid; place-items:center; flex:none; width:70px; height:70px; border:1px solid #337b9b; border-radius:50%; color:#77d4f4; background:linear-gradient(145deg,#15415a,#0a2637); box-shadow:inset 0 0 20px #0c202b; }
  .dashboard-mower-icon ha-icon { --mdc-icon-size:40px; }
  .dashboard-title { min-width:0; }
  .dashboard-title h2 { margin:0 0 6px; color:var(--mower-muted); font-size:18px; line-height:1.25; font-weight:500; overflow-wrap:anywhere; }
  .dashboard-subtitle { display:block; margin-top:6px; color:var(--mower-muted); font-size:12px; line-height:1.4; overflow-wrap:anywhere; }
  .dashboard-state { display:flex; align-items:center; gap:8px; color:var(--mower-text); font-size:25px; font-weight:650; line-height:1.2; overflow-wrap:anywhere; }
  .dashboard-state ha-icon { --mdc-icon-size:25px; flex:none; }
  .dashboard-state.state-mowing { color:var(--mower-accent); }
  .dashboard-state.state-paused { color:#c5b4f6; }
  .dashboard-state.state-returning { color:#efd082; }
  .dashboard-state.state-docked { color:#8fd2f5; }
  .dashboard-state.state-error, .dashboard-state.state-unavailable { color:#ffa699; }
  .dashboard-battery { display:flex; align-items:center; gap:12px; flex:0 1 auto; min-width:0; max-width:45%; padding:12px 20px; border:1px solid var(--mower-border); border-radius:14px; background:#102c3a; }
  .dashboard-battery-icon { width:50px; height:36px; flex:none; color:var(--mower-accent); }
  .battery-low .dashboard-battery-icon { color:#ffa699; }
  .battery-medium .dashboard-battery-icon { color:#efd082; }
  .battery-unknown .dashboard-battery-icon { color:var(--mower-muted); }
  .dashboard-battery > div { display:grid; gap:1px; min-width:0; overflow-wrap:anywhere; }
  .dashboard-battery strong { font-size:28px; font-weight:650; line-height:1.2; font-variant-numeric:tabular-nums; }
  .dashboard-battery span { color:var(--mower-muted); font-size:12px; }
  .dashboard-card .hero-stage { border:1px solid #2d6479; border-radius:15px; background:var(--mower-map-ground); }
  .dashboard-card .hero-stage .hero-scrim { display:none; }
  .dashboard-card .hero-map { padding:0; background:var(--mower-map-ground); }
  .dashboard-card .hero-tabs, .dashboard-card .hero-selectors, .dashboard-card .hero-actions, .dashboard-card .hero-action-feedback { margin:0; }
  .dashboard-card .hero-tabs { padding:5px; gap:5px; border:1px solid var(--mower-border); border-radius:12px; background:#0b2230; }
  .dashboard-card .hero-tab { min-height:42px; font-family:inherit; font-size:13px; font-weight:600; line-height:1.25; color:var(--mower-muted); cursor:pointer; }
  .dashboard-card .hero-tab.selected { background:#163c4c; border-color:#32708a; color:#b7edff; box-shadow:none; }
  .dashboard-card .hero-tab ha-icon { --mdc-icon-size:20px; }
  .dashboard-card .hero-selectors { border:1px solid var(--mower-border); border-radius:12px; background:var(--mower-surface); }
  .dashboard-card .hero-actions { grid-template-columns:repeat(auto-fit,minmax(54px,1fr)); border:0; padding:0; gap:10px; align-content:start; background:transparent; }
  .dashboard-command-panel { display:grid; align-content:start; gap:10px; min-width:0; }
  .dashboard-card .hero-actions:has(.hero-action:nth-child(5)) { grid-template-columns:repeat(3,minmax(0,1fr)); }
  .dashboard-card .hero-actions:has(.hero-action:nth-child(7)) { grid-template-columns:repeat(4,minmax(0,1fr)); }
  .dashboard-card .hero-action { min-height:82px; gap:8px; padding:12px 8px; border:1px solid #2a6683; border-radius:12px; background:linear-gradient(155deg,#153b50,#0c293b); color:#d9effb; font-size:13px; font-weight:550; line-height:1.2; cursor:pointer; box-shadow:inset 0 1px 0 #8bdfff0d; }
  .dashboard-card .hero-action ha-icon { --mdc-icon-size:28px; color:#83d9fb; }
  .dashboard-card .hero-action span { min-width:0; max-width:100%; overflow-wrap:anywhere; hyphens:auto; }
  .dashboard-card .hero-action.primary:not(:disabled) { border-color:#4cb97f; background:linear-gradient(150deg,#194636,#0d322b); color:#b7f7d0; }
  .dashboard-card .hero-action.primary:not(:disabled) ha-icon { color:#71f3a2; }
  .dashboard-card .hero-action:hover:not(:disabled), .dashboard-card .hero-action.active { border-color:#74d2f2; background:#194659; }
  .dashboard-card .hero-action:disabled { opacity:.43; cursor:default; }
  .dashboard-card .hero-action:focus-visible, .dashboard-card .hero-tab:focus-visible { outline:2px solid #9fe4ff; outline-offset:2px; }
  .dashboard-aside { display:grid; gap:14px; min-width:0; align-content:start; }
  .dashboard-camera-panel, .dashboard-mission-panel { border:1px solid var(--mower-border); border-radius:15px; overflow:hidden; background:var(--mower-surface); }
  .dashboard-panel-heading { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px; padding:12px 16px; font-size:13px; font-weight:600; color:#d2e9f4; }
  .dashboard-panel-heading > span { display:flex; align-items:center; gap:8px; }
  .dashboard-panel-heading ha-icon { --mdc-icon-size:19px; color:#85d5f5; }
  .dashboard-camera-stage { position:relative; aspect-ratio:16/9; min-height:150px; background:radial-gradient(ellipse at 50% 100%,#144757,transparent 75%),#0a202d; }
  .dashboard-camera-stage .hero-empty { box-sizing:border-box; padding:18px; }
  .dashboard-camera-start { position:absolute; inset:0; width:100%; border:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:20px; color:var(--mower-text); background:transparent; cursor:pointer; font:inherit; }
  .dashboard-camera-start ha-icon { --mdc-icon-size:46px; color:var(--mower-route); margin-bottom:3px; }
  .dashboard-camera-start:hover { background:#66d6ff0a; }
  .dashboard-camera-start strong { font-size:15px; font-weight:600; }
  .dashboard-camera-start span { font-size:12px; color:var(--mower-muted); }
  .dashboard-camera-toggle { display:flex; align-items:center; gap:5px; border:1px solid var(--mower-border); border-radius:8px; background:#0c1b28; color:var(--mower-text); padding:5px 7px; cursor:pointer; font:inherit; font-size:11px; }
  .dashboard-camera-start:focus-visible, .dashboard-camera-toggle:focus-visible { outline:2px solid var(--mower-route); outline-offset:-3px; }
  .dashboard-card .mowing-mission { border-top:0; padding:0 16px 16px; background:transparent; }
  .dashboard-card .mowing-metrics { grid-template-columns:1fr; gap:0; }
  .dashboard-card .mowing-stat { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:12px 0; border:0; border-bottom:1px solid #254959; }
  .dashboard-card .mowing-stat > span { font-size:13px; }
  .dashboard-card .mowing-stat strong { font-size:22px; text-align:right; min-width:0; max-width:65%; }
  .dashboard-card .mowing-progress-label { font-size:11px; gap:8px; }
  .dashboard-card .mowing-mission progress { height:6px; }
  @container (min-width:720px) {
    .dashboard-card .hero-shell { grid-template-columns:minmax(0,1.35fr) minmax(260px,1fr); grid-template-rows:auto max-content minmax(340px,1fr); padding:22px; gap:16px; }
    .dashboard-header { grid-column:1/-1; grid-row:1; margin-bottom:2px; }
    .dashboard-command-panel { grid-column:1; grid-row:2; }
    .dashboard-card .hero-stage { grid-column:1; grid-row:3; align-self:stretch; }
    .dashboard-aside { grid-column:2; grid-row:2/span 2; }
    .dashboard-card .hero-tabs, .dashboard-card .hero-selectors, .dashboard-card .hero-action-feedback { grid-column:1/-1; }
    .dashboard-card .view-map.interactive-map .hero-mowing-map { height:340px; flex:1 1 340px; min-height:340px; }
  }
  @container (max-width:440px) {
    .dashboard-card .hero-shell { padding:12px; gap:12px; }
    .dashboard-header { gap:10px; }
    .dashboard-identity { gap:9px; }
    .dashboard-mower-icon { width:46px; height:46px; }
    .dashboard-mower-icon ha-icon { --mdc-icon-size:29px; }
    .dashboard-title h2 { font-size:13px; margin-bottom:4px; }
    .dashboard-state { font-size:19px; gap:5px; }
    .dashboard-state ha-icon { --mdc-icon-size:19px; }
    .dashboard-battery { padding:8px 10px; gap:5px; border-radius:10px; }
    .dashboard-battery-icon { width:30px; height:24px; }
    .dashboard-battery strong { font-size:20px; }
    .dashboard-battery span { font-size:10px; }
    .dashboard-card .hero-actions { gap:7px; }
    .dashboard-card .hero-actions:has(.hero-action:nth-child(5)) { grid-template-columns:repeat(3,minmax(0,1fr)); }
    .dashboard-card .hero-action { min-height:72px; padding:9px 5px; font-size:12px; }
    .dashboard-card .hero-action ha-icon { --mdc-icon-size:25px; }
    .dashboard-card .hero-tab { padding:8px 4px; gap:5px; font-size:12px; }
    .dashboard-card .view-map.interactive-map .hero-mowing-map { height:350px; }
  }
`;
