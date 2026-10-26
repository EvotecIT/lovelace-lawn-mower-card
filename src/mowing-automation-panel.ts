import { css, html, nothing, type TemplateResult } from "lit";
import type { TranslationKey, Translator } from "./localization";
import {
  automationReason, mowingAutomationSetupPath, OUTCOME_STATUSES, type MowingAutomationStatus,
} from "./mowing-automation";

export const mowingAutomationStyles = css`
  .mowing-automation { grid-column: 1 / -1; display: grid; gap: 10px; padding: 12px; border: 1px solid var(--divider-color, #ddd); border-radius: 12px; min-width: 0; color: var(--primary-text-color); background: var(--card-background-color); }
  .mowing-automation-header { display: flex; gap: 12px; align-items: center; justify-content: space-between; }
  .mowing-automation-title { font-weight: 600; }
  .mowing-automation-detail { color: var(--secondary-text-color); font-size: 13px; line-height: 1.5; overflow-wrap: anywhere; }
  .mowing-automation a { color: var(--primary-color); text-decoration: underline; justify-self: start; padding-block: 4px; }
  .mowing-automation a:focus-visible, .mowing-automation button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 3px; }
  .mowing-automation button { border: 1px solid var(--divider-color); color: var(--primary-text-color); background: var(--card-background-color); border-radius: 8px; min-height: 40px; padding: 8px 12px; font: inherit; cursor: pointer; }
  .mowing-automation button:disabled { opacity: .5; cursor: default; }
  .mowing-automation button.on { border-color: var(--primary-color); color: var(--primary-color); font-weight: 600; }
  .mowing-automation button.link { border: none; background: none; min-height: 0; padding: 4px 0; color: var(--primary-color); text-decoration: underline; }
  .mowing-automation-plan { font-size: 14px; line-height: 1.5; overflow-wrap: anywhere; }
  .mowing-automation-settings { display: flex; flex-wrap: wrap; gap: 8px; }
  .mowing-automation-settings > * { flex: 1 1 160px; min-width: 0; }
  .mowing-automation-links { display: flex; flex-wrap: wrap; gap: 4px 16px; align-items: center; }
`;

function when(value: string, locale: string): string {
  return new Date(value).toLocaleString(locale, {
    weekday: "short", hour: "2-digit", minute: "2-digit",
  });
}

export type MowingAutomationControls = {
  /** Rendered entity controls for What to mow, rest days and maximum area. */
  settings: Array<TemplateResult | typeof nothing>;
  openSchedule?: () => void;
  locale: string;
};

function renderPlan(model: MowingAutomationStatus, t: Translator, locale: string): TemplateResult | typeof nothing {
  const plan = model.plan;
  if (!plan) return nothing;
  const start = plan.nextStart
    ? t("automation.nextStart", { time: when(plan.nextStart, locale) }) : t("automation.nextStartUnknown");
  const target = plan.wholeLawn ? t("automation.wholeLawn")
    : plan.zones.length ? t("automation.zones", {
      zones: plan.zones.join(", "),
      area: plan.areaM2 === undefined ? "" : ` (${Math.round(plan.areaM2)} m²)`,
    })
      : plan.reason ? automationReason(plan.reason, t) : t("automation.noZone");
  return html`<div class="mowing-automation-plan">${start} · <strong>${target}</strong></div>`;
}

function renderOutcome(model: MowingAutomationStatus, t: Translator, locale: string): TemplateResult | typeof nothing {
  const outcome = model.lastOutcome;
  if (!outcome) return nothing;
  const status = OUTCOME_STATUSES.has(outcome.status)
    ? t(`automation.status.${outcome.status}` as TranslationKey) : outcome.status;
  const at = outcome.observedAt && !Number.isNaN(Date.parse(outcome.observedAt))
    ? ` · ${when(outcome.observedAt, locale)}` : "";
  return html`<div class="mowing-automation-detail">${t("automation.lastRun")}: ${status} — ${automationReason(outcome.reason, t)}${at}</div>`;
}

export function renderMowingAutomation(
  model: MowingAutomationStatus, busy: boolean,
  toggle: () => void | Promise<void>, t: Translator,
  controls?: MowingAutomationControls,
): TemplateResult {
  const locale = controls?.locale ?? "en";
  const blocked = model.configured && model.enabled && model.canToggle && !model.phase && !model.permitted;
  return html`<section class="mowing-automation" aria-label=${t("automation.title")}>
    <div class="mowing-automation-header">
      <span class="mowing-automation-title">${t("automation.title")}</span>
      ${model.configured ? html`<button type="button" role="switch"
        class=${model.enabled ? "on" : "off"}
        aria-label=${t("automation.enableLabel")} aria-checked=${String(model.enabled)}
        ?disabled=${busy || !model.canToggle} @click=${toggle}>
        ${t(model.enabled ? "common.enabled" : "common.disabled")}
      </button>` : nothing}
    </div>
    <div class="mowing-automation-detail" role="status">
      ${!model.configured ? t("automation.setupHint")
        : !model.canToggle ? t("common.unavailable")
        : !model.enabled ? t("automation.disabledHint")
        : model.phase ? `${t("automation.managed")}: ${model.phase.replaceAll("_", " ")}`
        : model.permitted ? t("automation.permitted")
        : t("automation.blockedBy", { reason: model.reason ?? t("automation.blocked") })}
    </div>
    ${model.configured && model.enabled ? renderPlan(model, t, locale) : nothing}
    ${model.configured && controls?.settings.length ? html`<div class="mowing-automation-settings">${controls.settings}</div>` : nothing}
    ${renderOutcome(model, t, locale)}
    <div class="mowing-automation-links">
      ${model.scheduleEntity && controls?.openSchedule ? html`<button type="button" class="link"
        @click=${controls.openSchedule}>${t("automation.schedule", { name: model.scheduleName ?? model.scheduleEntity })}</button>` : nothing}
      <a href=${mowingAutomationSetupPath(model.entryId)}>${t(model.configured ? "automation.edit" : "automation.setup")}</a>
    </div>
  </section>`;
}
