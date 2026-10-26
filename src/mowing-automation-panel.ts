import { css, html, nothing, type TemplateResult } from "lit";
import type { TranslationKey, Translator } from "./localization";
import {
  automationReason, mowingAutomationSetupPath, OUTCOME_STATUSES, type MowingAutomationStatus,
} from "./mowing-automation";
import { ENABLED_FIELD, sameSections, type FlowSection } from "./automation-options-flow";
import {
  sameSchedule, scheduleProblems, shortTime, WEEKDAYS, type ScheduleDraft, type Weekday,
} from "./schedule-editor";

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
  .mowing-automation-dialog { box-sizing: border-box; width: min(560px, 100vw); max-height: 100dvh; margin: auto; padding: 16px;
    border: 1px solid var(--divider-color, #ddd); border-radius: 16px; color: var(--primary-text-color);
    background: var(--card-background-color, var(--ha-card-background, #fff)); overflow: auto; }
  .mowing-automation-dialog[open] { display: flex; flex-direction: column; gap: 8px; max-height: min(680px, 100dvh); overflow: hidden; }
  .dialog-body { flex: 1 1 auto; min-height: 0; overflow: auto; padding: 4px 2px; }
  .mowing-automation-dialog[open] > :not(.dialog-body) { flex: none; }
  .dialog-tabs { display: flex; gap: 4px; overflow-x: auto; border-bottom: 1px solid var(--divider-color, #ddd); scrollbar-width: thin; }
  .mowing-automation-dialog .dialog-tabs button.tab { flex: none; border: none; border-bottom: 2px solid transparent; border-radius: 0;
    background: none; min-height: 40px; padding: 8px 10px; color: var(--secondary-text-color); white-space: nowrap; }
  .mowing-automation-dialog .dialog-tabs button.tab.active { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; }
  .dialog-tabs .dot { display: inline-block; width: 7px; height: 7px; margin-left: 6px; border-radius: 50%; background: var(--primary-color); vertical-align: middle; }
  .dialog-tabs .dot.error { background: var(--error-color, #db4437); }
  .mowing-automation-dialog::backdrop { background: rgba(0,0,0,.6); }
  .mowing-automation-dialog h3 { margin: 16px 0 8px; font-size: 15px; font-weight: 600; }
  .mowing-automation-dialog button { border: 1px solid var(--divider-color); color: var(--primary-text-color); background: var(--card-background-color);
    border-radius: 8px; min-height: 40px; padding: 8px 12px; font: inherit; cursor: pointer; }
  .mowing-automation-dialog button:disabled { opacity: .5; cursor: default; }
  .mowing-automation-dialog button.on { border-color: var(--primary-color); color: var(--primary-color); font-weight: 600; }
  .mowing-automation-dialog button.primary { border-color: var(--primary-color); background: var(--primary-color); color: var(--text-primary-color, #fff); }
  .mowing-automation-dialog button.icon { min-width: 40px; padding: 4px 8px; }
  .mowing-automation-dialog button.link { border: none; background: none; min-height: 0; padding: 4px 0; color: var(--primary-color); text-decoration: underline; }
  .dialog-header { display: flex; gap: 8px; align-items: center; }
  .dialog-header .mowing-automation-title { flex: 1; font-size: 18px; }
  .schedule-days { display: grid; gap: 6px; }
  .schedule-day { display: grid; grid-template-columns: 96px 1fr auto; gap: 8px; align-items: center; min-height: 44px;
    border-bottom: 1px solid var(--divider-color, #ddd); padding-bottom: 6px; }
  .schedule-day-name { text-transform: capitalize; font-weight: 500; }
  .schedule-blocks { display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; }
  .schedule-block { display: inline-flex; gap: 4px; align-items: center; padding: 2px 4px; border: 1px solid var(--divider-color, #ddd); border-radius: 8px; }
  .schedule-block.invalid { border-color: var(--error-color, #db4437); }
  .schedule-block input { font: inherit; color: inherit; background: transparent; border: none; min-height: 36px; }
  .schedule-none { color: var(--secondary-text-color); }
  .schedule-problem { color: var(--error-color, #db4437); }
  .setup-step h3 { text-transform: none; }
  .mowing-automation-dialog ha-form { display: block; }
  .mowing-automation-dialog .dialog-body { min-height: 120px; }
  .dialog-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 8px; border-top: 1px solid var(--divider-color, #ddd); }
  @media (max-width: 480px) { .schedule-day { grid-template-columns: 1fr auto; } .schedule-blocks { grid-column: 1 / -1; grid-row: 2; } }
`;

function when(value: string, locale: string): string {
  return new Date(value).toLocaleString(locale, {
    weekday: "short", hour: "2-digit", minute: "2-digit",
  });
}

export type MowingAutomationControls = {
  /** Opens the management dialog (schedule and settings). */
  manage?: () => void;
  locale: string;
};

export type ScheduleDialogState = {
  status: "loading" | "ready" | "saving" | "readonly" | "error";
  draft?: ScheduleDraft;
  original?: ScheduleDraft;
  error?: string;
  /** The integration's own setup forms, read from its options flow. */
  options?: FlowSection[];
  optionsOriginal?: FlowSection[];
  optionsStatus?: "loading" | "ready" | "unavailable";
  optionsMessage?: string;
  /** The visible tab: "schedule", "target", or "step:<flow step id>". */
  tab?: string;
};

export type ScheduleDialogActions = {
  close: () => void;
  save: () => void | Promise<void>;
  addBlock: (day: Weekday) => void;
  removeBlock: (day: Weekday, index: number) => void;
  setTime: (day: Weekday, index: number, end: "from" | "to", value: string) => void;
  openHelper?: () => void;
  setOptions: (stepId: string, value: Record<string, unknown>) => void;
  setTab: (tab: string) => void;
};

/** What the dialog needs from Home Assistant to render the integration's forms. */
export type DialogHass = {
  localize?(key: string, ...args: unknown[]): string;
};

const INTEGRATION = "dreame_lawn_mower";

function localized(hass: DialogHass, key: string, fallback: string): string {
  const value = hass.localize?.(`component.${INTEGRATION}.${key}`);
  return typeof value === "string" && value ? value : fallback;
}

function stepTitle(hass: DialogHass, stepId: string): string {
  const title = localized(hass, `options.step.${stepId}.title`, stepId.replaceAll("_", " "));
  // "Mowing automation: wait and recovery" → "wait and recovery"; the dialog already names the automation.
  const short = title.includes(": ") ? title.slice(title.indexOf(": ") + 2) : title;
  return short.charAt(0).toLocaleUpperCase() + short.slice(1);
}

function renderOptionSection(
  hass: DialogHass, section: FlowSection, state: ScheduleDialogState, actions: ScheduleDialogActions,
): TemplateResult {
  return html`<ha-form .hass=${hass} .data=${section.data} .disabled=${state.status === "saving"}
      .schema=${section.schema.filter(field => field.name !== ENABLED_FIELD)}
      .error=${section.errors}
      .computeLabel=${(field: { name: string }) => localized(hass, `options.step.${section.stepId}.data.${field.name}`, field.name)}
      .computeError=${(error: string) => localized(hass, `options.error.${error}`, error)}
      .localizeValue=${(key: string) => localized(hass, `selector.${key}`, key)}
      @value-changed=${(event: CustomEvent<{ value: Record<string, unknown> }>) => actions.setOptions(section.stepId, event.detail.value)}>
    </ha-form>
    ${section.errors?.base ? html`<p class="schedule-problem" role="alert">${localized(hass, `options.error.${section.errors.base}`, section.errors.base)}</p>` : nothing}`;
}

type DialogTab = { id: string; label: string; changed: boolean; error: boolean; body: () => unknown };

/** Monday-first weekday names in the card's language (2024-01-01 was a Monday). */
function dayName(index: number, locale: string): string {
  return new Date(2024, 0, 1 + index).toLocaleDateString(locale, { weekday: "long" });
}

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
    ${renderOutcome(model, t, locale)}
    <div class="mowing-automation-links">
      ${model.configured && controls?.manage ? html`<button type="button" class="manage"
        ?disabled=${busy} @click=${controls.manage}>${t("automation.manage")}</button>` : nothing}
      <a href=${mowingAutomationSetupPath(model.entryId)}>${t(model.configured ? "automation.edit" : "automation.setup")}</a>
    </div>
  </section>`;
}

function renderScheduleDays(
  state: ScheduleDialogState, actions: ScheduleDialogActions, t: Translator, locale: string,
): TemplateResult {
  const draft = state.draft;
  if (state.status === "loading") return html`<p class="mowing-automation-detail">${t("automation.loading")}</p>`;
  if (!draft) {
    return html`<p class="mowing-automation-detail">${state.status === "readonly"
      ? t("automation.adminOnly") : t("automation.scheduleError", { error: state.error ?? "" })}</p>
      ${actions.openHelper ? html`<button type="button" class="link" @click=${actions.openHelper}>${t("automation.openHelper")}</button>` : nothing}`;
  }
  const problems = scheduleProblems(draft);
  const busy = state.status === "saving";
  return html`<div class="schedule-days">
    ${WEEKDAYS.map((day, dayIndex) => html`<div class="schedule-day">
      <span class="schedule-day-name">${dayName(dayIndex, locale)}</span>
      <div class="schedule-blocks">
        ${draft.days[day].length ? draft.days[day].map((block, index) => html`<span
          class="schedule-block ${problems.some(item => item.day === day && item.index === index) ? "invalid" : ""}">
          <input type="time" step="60" aria-label=${t("automation.blockStart")} .value=${shortTime(block.from)}
            ?disabled=${busy} @change=${(event: Event) => actions.setTime(day, index, "from", (event.target as HTMLInputElement).value)}>
          –
          <input type="time" step="60" aria-label=${t("automation.blockEnd")} .value=${block.to === "24:00:00" ? "00:00" : shortTime(block.to)}
            ?disabled=${busy} @change=${(event: Event) => actions.setTime(day, index, "to", (event.target as HTMLInputElement).value)}>
          <button type="button" class="icon" aria-label=${t("automation.removeBlock")} ?disabled=${busy}
            @click=${() => actions.removeBlock(day, index)}>✕</button>
        </span>`) : html`<span class="schedule-none">${t("automation.noBlock")}</span>`}
      </div>
      <button type="button" class="add" ?disabled=${busy} @click=${() => actions.addBlock(day)}>${t("automation.addBlock")}</button>
    </div>`)}
  </div>
  ${problems.length ? html`<p class="schedule-problem" role="alert">${t("automation.scheduleInvalid")}</p>` : nothing}
  ${state.status === "error" ? html`<p class="schedule-problem" role="alert">${t("automation.scheduleError", { error: state.error ?? "" })}</p>` : nothing}`;
}

function renderTabs(tabs: DialogTab[], active: DialogTab, actions: ScheduleDialogActions): TemplateResult {
  return html`<div class="dialog-tabs" role="tablist">
    ${tabs.map(tab => html`<button type="button" role="tab" aria-selected=${String(tab === active)}
      class="tab ${tab === active ? "active" : ""}" @click=${() => actions.setTab(tab.id)}>
      ${tab.label}${tab.error ? html`<span class="dot error" aria-hidden="true"></span>`
        : tab.changed ? html`<span class="dot" aria-hidden="true"></span>` : nothing}
    </button>`)}
  </div>`;
}

/** Schedule blocks, rotation and the integration's setup forms, one tab at a time. */
export function renderMowingAutomationDialog(
  model: MowingAutomationStatus, state: ScheduleDialogState, settings: Array<TemplateResult | typeof nothing>,
  actions: ScheduleDialogActions, toggle: () => void | Promise<void>, busy: boolean,
  t: Translator, locale: string, hass: DialogHass = {},
): TemplateResult {
  const draft = state.draft;
  const scheduleChanged = Boolean(draft && state.original && !sameSchedule(draft, state.original));
  const optionsChanged = !sameSections(state.options, state.optionsOriginal);
  const changed = scheduleChanged || optionsChanged;
  const canSave = changed && state.status !== "saving" && !(draft && scheduleProblems(draft).length);
  const setupPath = mowingAutomationSetupPath(model.entryId);
  const original = new Map((state.optionsOriginal ?? []).map(section => [section.stepId, section]));
  const optionTabs: DialogTab[] = state.options?.length && state.optionsStatus !== "unavailable" && customElements.get("ha-form")
    ? state.options.map(section => ({
      id: `step:${section.stepId}`, label: stepTitle(hass, section.stepId),
      changed: !sameSections([section], original.has(section.stepId) ? [original.get(section.stepId)!] : []),
      error: Boolean(section.errors && Object.keys(section.errors).length),
      body: () => renderOptionSection(hass, section, state, actions),
    }))
    : [{
      id: "setup", label: t("automation.setupTab"), changed: false, error: false,
      body: () => state.optionsStatus === "loading"
        ? html`<p class="mowing-automation-detail">${t("automation.loading")}</p>`
        : html`<a class="link" href=${setupPath}>${t("automation.openSetup")}</a>`,
    }];
  const tabs: DialogTab[] = [
    {
      id: "schedule", label: t("automation.scheduleTitle"), changed: scheduleChanged,
      error: Boolean(draft && scheduleProblems(draft).length) || state.status === "error",
      body: () => html`${model.scheduleName ? html`<p class="mowing-automation-detail">${model.scheduleName}</p>` : nothing}
        ${renderScheduleDays(state, actions, t, locale)}`,
    },
    ...(settings.length ? [{
      id: "target", label: t("automation.settingsTitle"), changed: false, error: false,
      body: () => html`<div class="mowing-automation-settings">${settings}</div>`,
    }] : []),
    ...optionTabs,
  ];
  const active = tabs.find(tab => tab.id === state.tab) ?? tabs[0];
  return html`<dialog class="mowing-automation-dialog" aria-label=${t("automation.title")}
    @cancel=${(event: Event) => { event.preventDefault(); actions.close(); }}>
    <div class="dialog-header">
      <span class="mowing-automation-title">${t("automation.title")}</span>
      <button type="button" role="switch" class=${model.enabled ? "on" : "off"}
        aria-label=${t("automation.enableLabel")} aria-checked=${String(model.enabled)}
        ?disabled=${busy || !model.canToggle} @click=${toggle}>
        ${t(model.enabled ? "common.enabled" : "common.disabled")}
      </button>
      <button type="button" class="icon close" aria-label=${t("automation.close")} @click=${actions.close}>✕</button>
    </div>
    ${model.enabled ? renderPlan(model, t, locale) : nothing}
    ${renderTabs(tabs, active, actions)}
    <div class="dialog-body" role="tabpanel">${active.body()}</div>
    ${state.optionsMessage ? html`<p class="mowing-automation-detail" role="status">${state.optionsMessage}</p>` : nothing}
    ${optionsChanged ? html`<p class="mowing-automation-detail">${t("automation.reloadNotice")}</p>` : nothing}
    <div class="dialog-actions">
      <button type="button" @click=${actions.close}>${t(changed ? "automation.cancel" : "automation.close")}</button>
      ${draft || state.options?.length ? html`<button type="button" class="primary" ?disabled=${!canSave} @click=${actions.save}>
        ${t(state.status === "saving" ? "automation.saving" : "automation.save")}</button>` : nothing}
    </div>
  </dialog>`;
}
