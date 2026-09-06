import { css, html, nothing } from "lit";
import type { SupportedLocale, Translator } from "./localization";
import type { MowingAreaProgress } from "./mowing-progress";

/** Device-reported area totals are distinct from position and route geometry. */
export function renderMowingMission(model: {
  t: Translator; locale: SupportedLocale; battery?: string; progress?: string;
  progressLabel?: string; coverage?: string; coverageLabel?: string;
  area?: MowingAreaProgress; showBattery?: boolean;
}) {
  const { t, area } = model;
  const format = new Intl.NumberFormat(model.locale, { maximumFractionDigits: 1 });
  const areaValue = (value: number) => `${format.format(value)} ${area?.unit}`;
  return html`
    <section class="mowing-mission" aria-label=${t("hero.mission")}>
      <div class="mowing-metrics">
        ${model.showBattery !== false ? html`<div class="mowing-stat battery"><span>${t("hero.battery")}</span><strong>${model.battery || "—"}</strong></div>` : nothing}
        ${area ? html`
          <div class="mowing-stat completed"><span>${t("mowingMap.completed")}</span><strong>${areaValue(area.completed)}</strong></div>
          <div class="mowing-stat remaining"><span>${t("mowingMap.remaining")}</span><strong>${areaValue(area.remaining)}</strong></div>` : html`
          <div class="mowing-stat"><span>${model.coverageLabel || t("hero.coverage")}</span><strong>${model.coverage || "—"}</strong></div>
          <div class="mowing-stat"><span>${model.progressLabel || t("hero.mission")}</span><strong>${model.progress || "—"}</strong></div>`}
      </div>
      ${area ? html`
        <div class="mowing-progress-label"><span>${t("mowingMap.reportedArea")}</span>
          <strong>${format.format(area.percent)}% <span>· ${areaValue(area.total)}</span></strong></div>
        <progress max="100" .value=${area.percent} aria-label=${t("mowingMap.reportedArea")}></progress>` : nothing}
    </section>`;
}

export const mowingMissionStyles = css`
  .mowing-mission { padding:14px 18px 16px; color:var(--mower-text);
    background:var(--mower-surface); border-top:1px solid var(--mower-border); }
  .mowing-metrics { display:grid; grid-template-columns:.75fr 1fr 1fr; gap:16px; }
  .mowing-stat { display:grid; gap:5px; min-width:0; padding-left:12px;
    border-left:2px solid var(--mower-border); }
  .mowing-stat.completed { border-color:var(--mower-accent); }
  .mowing-stat.remaining { border-color:#819b8d; }
  .mowing-stat > span { color:var(--mower-muted); font-size:11px; line-height:1.3; }
  .mowing-stat strong { font-size:clamp(14px,2.4vw,20px); line-height:1.2;
    font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
  .mowing-stat.completed strong { color:var(--mower-accent); }
  .mowing-progress-label { display:flex; flex-wrap:wrap; justify-content:space-between;
    gap:4px 8px; margin-top:15px; color:var(--mower-muted); font-size:11px; }
  .mowing-progress-label strong { color:var(--mower-text); font-weight:600; }
  .mowing-progress-label strong span { color:var(--mower-muted); font-weight:400; }
  .mowing-mission progress { width:100%; height:5px; margin-top:8px; display:block;
    border:0; border-radius:5px; overflow:hidden; accent-color:var(--mower-accent); }
  .mowing-mission progress::-webkit-progress-bar { background:var(--mower-border); }
  .mowing-mission progress::-webkit-progress-value { background:var(--mower-accent); }
  .mowing-mission progress::-moz-progress-bar { background:var(--mower-accent); }
  @media(max-width:420px) {
    .mowing-mission { padding:12px; }
    .mowing-metrics { gap:8px; }
    .mowing-stat { padding-left:8px; }
  }
`;
