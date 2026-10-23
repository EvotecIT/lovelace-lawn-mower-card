import { css, html, nothing, type TemplateResult } from "lit";
import type { Translator } from "./localization";
import { mowingAutomationSetupPath, type MowingAutomationStatus } from "./mowing-automation";

export const mowingAutomationStyles = css`
  .mowing-automation { display: grid; gap: 10px; padding: 12px; border: 1px solid var(--divider-color, #ddd); border-radius: 12px; min-width: 0; color: var(--primary-text-color); background: var(--card-background-color); }
  .mowing-automation-header { display: flex; gap: 12px; align-items: center; justify-content: space-between; }
  .mowing-automation-title { font-weight: 600; }
  .mowing-automation-detail { color: var(--secondary-text-color); font-size: 13px; line-height: 1.5; overflow-wrap: anywhere; }
  .mowing-automation a { color: var(--primary-color); text-decoration: underline; justify-self: start; padding-block: 4px; }
  .mowing-automation a:focus-visible, .mowing-automation button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 3px; }
  .mowing-automation button { border: 1px solid var(--divider-color); color: var(--primary-text-color); background: var(--card-background-color); border-radius: 8px; min-height: 40px; padding: 8px 12px; font: inherit; cursor: pointer; }
  .mowing-automation button:disabled { opacity: .5; cursor: default; }
`;

export function renderMowingAutomation(
  model: MowingAutomationStatus, busy: boolean,
  toggle: () => void | Promise<void>, t: Translator,
): TemplateResult {
  return html`<section class="mowing-automation" aria-label=${t("automation.title")}>
    <div class="mowing-automation-header">
      <span class="mowing-automation-title">${t("automation.title")}</span>
      ${model.configured ? html`<button type="button" role="switch"
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
        : t(model.permitted ? "automation.permitted" : "automation.blocked")}
    </div>
    ${model.configured && model.reason ? html`<div class="mowing-automation-detail">${model.reason}</div>` : nothing}
    ${model.lastOutcome ? html`<div class="mowing-automation-detail">${model.lastOutcome}</div>` : nothing}
    <a href=${mowingAutomationSetupPath(model.entryId)}>${t(model.configured ? "automation.edit" : "automation.setup")}</a>
  </section>`;
}
