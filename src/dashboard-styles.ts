import { css } from "lit";

export const dashboardStyles = css`
  ha-card.hero-card.dashboard-card {
    --mower-surface:#142632; --mower-text:#edf8f6; --mower-muted:#a6bdc5;
    --mower-border:#2d4855; --mower-accent:#9ddb89; --mower-route:#67c7dd;
    --mower-map-ground:#132e29;
    display:block; container-type:inline-size; border:1px solid #304652; border-radius:22px;
    background:#0c1b28;
  }
  .dashboard-card .hero-shell { background:#0c1b28; padding:14px; gap:12px; }
  .dashboard-card .hero-stage { border:1px solid var(--mower-border); border-radius:16px; background:#112632; }
  .dashboard-card .hero-tabs, .dashboard-card .hero-selectors,
  .dashboard-card .hero-actions, .dashboard-card .hero-action-feedback { margin:0; }
  .dashboard-card .hero-tabs { border:1px solid var(--mower-border); border-radius:12px; background:#142632; }
  .dashboard-card .hero-selectors { border:1px solid var(--mower-border); border-radius:12px; background:var(--mower-surface); }
  .dashboard-card .hero-actions { border-top:1px solid var(--mower-border); padding:12px 0 0; background:transparent; }
  .dashboard-aside { display:grid; gap:12px; min-width:0; align-content:start; }
  .dashboard-camera-panel, .dashboard-mission-panel { border:1px solid var(--mower-border); border-radius:16px; overflow:hidden; background:var(--mower-surface); }
  .dashboard-panel-heading { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px; padding:12px 14px; font-size:12px; font-weight:600; }
  .dashboard-panel-heading > span { display:flex; align-items:center; gap:8px; }
  .dashboard-panel-heading ha-icon { --mdc-icon-size:18px; color:var(--mower-accent); }
  .dashboard-camera-stage { position:relative; aspect-ratio:16/10; min-height:150px; background:linear-gradient(135deg,#183941,#0b1d2c); }
  .dashboard-camera-stage .hero-empty { box-sizing:border-box; padding:18px; }
  .dashboard-camera-start { position:absolute; inset:0; width:100%; border:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:9px; padding:20px; color:var(--mower-text); background:transparent; cursor:pointer; font:inherit; }
  .dashboard-camera-start ha-icon { --mdc-icon-size:40px; color:var(--mower-route); }
  .dashboard-camera-start strong { font-size:14px; }
  .dashboard-camera-start span { font-size:11px; color:var(--mower-muted); }
  .dashboard-camera-toggle { display:flex; align-items:center; gap:5px; border:1px solid var(--mower-border); border-radius:8px; background:#0c1b28; color:var(--mower-text); padding:5px 7px; cursor:pointer; font:inherit; font-size:11px; }
  .dashboard-camera-start:focus-visible, .dashboard-camera-toggle:focus-visible { outline:2px solid var(--mower-route); outline-offset:-3px; }
  .dashboard-card .mowing-mission { border-top:0; }
  @container (min-width:720px) {
    .dashboard-card .hero-shell { grid-template-columns:minmax(0,1fr) minmax(230px,.48fr); padding:18px; gap:14px; }
    .dashboard-card .hero-stage { grid-column:1; grid-row:1; align-self:stretch; }
    .dashboard-aside { grid-column:2; grid-row:1; }
    .dashboard-card .hero-tabs, .dashboard-card .hero-selectors,
    .dashboard-card .hero-actions, .dashboard-card .hero-action-feedback { grid-column:1/-1; }
    .dashboard-card .mowing-metrics { grid-template-columns:1fr; gap:16px; }
    .dashboard-card .mowing-stat strong { font-size:22px; }
    .dashboard-card .view-map.interactive-map .hero-mowing-map { height:360px; flex:1 1 360px; min-height:360px; }
  }
`;
