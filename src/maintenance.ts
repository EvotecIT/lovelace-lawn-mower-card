import { css, html, nothing, type TemplateResult } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import type { HassEntity, HomeAssistant } from "./card-config";
import { resolvedMowerCompanionEntity } from "./card-logic.ts";
import type { TranslationKey, Translator } from "./localization";

export type MaintenancePartKey = "blade" | "brush" | "robot" | "edge_trimmer";

export type MaintenancePart = {
  key: MaintenancePartKey;
  icon: string;
  /** Remaining life, 0–100. */
  percent: number;
  remainingHours?: number;
  status: "normal" | "soon" | "due";
  sensorId: string;
  /** The integration's reset button, when it is enabled and available. */
  resetId?: string;
};

/**
 * The integration names these entities in English ("Blade Remaining", "Reset Blade
 * Maintenance"), so their object IDs end with fixed suffixes on the mower's device.
 */
const PARTS: ReadonlyArray<{ key: MaintenancePartKey; name: string; icon: string }> = [
  { key: "blade", name: "blade", icon: "mdi:scissors-cutting" },
  { key: "brush", name: "cleaning_brush", icon: "mdi:brush" },
  { key: "robot", name: "robot_maintenance", icon: "mdi:robot-mower" },
  { key: "edge_trimmer", name: "edge_trimmer", icon: "mdi:content-cut" },
];

const finite = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

function partStatus(entity: HassEntity, percent: number): MaintenancePart["status"] {
  const reported = entity.attributes.status;
  if (entity.attributes.due === true || reported === "due" || percent <= 0) return "due";
  if (entity.attributes.warning === true || reported === "replace_soon") return "soon";
  return "normal";
}

/** Maintenance counters the mower reports, in the integration's order, with their reset buttons. */
export function maintenanceParts(
  hass: Pick<HomeAssistant, "states" | "entities">, mowerId: string,
): MaintenancePart[] {
  const states = hass.states;
  return PARTS.flatMap(part => {
    const sensorId = resolvedMowerCompanionEntity(states, mowerId, hass.entities, "sensor", `${part.name}_remaining`);
    const sensor = sensorId ? states[sensorId] : undefined;
    const percent = sensor ? finite(Number(sensor.state)) : undefined;
    if (!sensor || !sensorId || percent === undefined || sensor.state === "") return [];
    const resetId = resolvedMowerCompanionEntity(states, mowerId, hass.entities, "button", `reset_${part.name}_maintenance`);
    const reset = resetId ? states[resetId] : undefined;
    return [{
      key: part.key,
      icon: part.icon,
      percent: Math.max(0, Math.min(100, percent)),
      remainingHours: finite(sensor.attributes.remaining_hours),
      status: partStatus(sensor, percent),
      sensorId,
      // A button's state is when it was last pressed, so a never-pressed one reads "unknown".
      resetId: reset && reset.state !== "unavailable" ? resetId : undefined,
    }];
  });
}

export const maintenanceStyles = css`
  .maintenance-panel {
    display: grid;
    gap: 4px;
    min-width: 0;
    padding: 12px;
    border: 1px solid var(--mower-border);
    border-radius: var(--mower-radius-inner);
    color: var(--mower-text);
    background: var(--mower-fill);
  }

  .maintenance-panel h3 {
    margin: 0 0 4px;
    font-size: 0.95rem;
    font-weight: 500;
  }

  .maintenance-row {
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr) auto;
    align-items: center;
    gap: 4px 12px;
    padding: 8px 0;
    border-top: 1px solid var(--mower-hairline);
  }

  .maintenance-row:first-of-type {
    border-top: 0;
  }

  .maintenance-icon {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    color: var(--mower-muted);
  }

  .maintenance-copy {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .maintenance-name {
    font-size: 0.9rem;
  }

  .maintenance-meta {
    color: var(--mower-muted);
    font-size: 0.8rem;
  }

  .maintenance-row.soon .maintenance-meta { color: var(--mower-warning); }
  .maintenance-row.due .maintenance-meta { color: var(--mower-error); }

  .maintenance-bar {
    height: 4px;
    overflow: hidden;
    border-radius: 2px;
    background: var(--mower-fill-strong);
  }

  .maintenance-bar > span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--mower-success);
  }

  .maintenance-row.soon .maintenance-bar > span { background: var(--mower-warning); }
  .maintenance-row.due .maintenance-bar > span { background: var(--mower-error); }

  .maintenance-actions {
    display: flex;
    gap: 6px;
  }

  .maintenance-actions button {
    min-height: 36px;
    margin: 0;
    padding: 6px 12px;
    border: 1px solid var(--mower-border);
    border-radius: var(--mower-radius-control);
    color: var(--mower-text);
    background: transparent;
    font: inherit;
    font-size: 0.85rem;
    cursor: pointer;
  }

  .maintenance-actions button.confirm {
    border-color: var(--mower-accent);
    background: var(--mower-fill-accent);
    font-weight: 500;
  }

  .maintenance-actions button:disabled {
    cursor: default;
    opacity: 0.45;
  }

  .maintenance-confirm {
    grid-column: 2 / -1;
    margin: 0;
    color: var(--mower-text);
    font-size: 0.85rem;
  }

  .maintenance-hint {
    margin: 4px 0 0;
    color: var(--mower-muted);
    font-size: 0.8rem;
    line-height: 1.45;
  }
`;

export type MaintenancePanelModel = {
  parts: readonly MaintenancePart[];
  t: Translator;
  locale: string;
  busy: boolean;
  /** The part whose reset is waiting for confirmation. */
  confirming?: MaintenancePartKey;
  onAsk(part: MaintenancePart): void;
  onCancel(key: MaintenancePartKey): void;
  onReset(part: MaintenancePart): void;
};

export function renderMaintenancePanel(model: MaintenancePanelModel): TemplateResult | typeof nothing {
  if (!model.parts.length) return nothing;
  const { t } = model;
  const percent = new Intl.NumberFormat(model.locale, { maximumFractionDigits: 0 });
  const hours = new Intl.NumberFormat(model.locale, { maximumFractionDigits: 0 });
  // The buttons are enabled one by one, so the hint stays while any shown part lacks one.
  const missingReset = model.parts.some(part => !part.resetId);
  return html`
    <section class="maintenance-panel" id="maintenance-panel" aria-labelledby="maintenance-title">
      <h3 id="maintenance-title">${t("maintenance.title")}</h3>
      ${model.parts.map(part => {
        const name = t(`alerts.item.${part.key}` as TranslationKey);
        const asking = model.confirming === part.key;
        const meta = [
          `${percent.format(part.percent)}%`,
          part.remainingHours !== undefined && part.status !== "due"
            ? t("maintenance.hoursLeft", { hours: hours.format(part.remainingHours) }) : undefined,
          part.status === "due" ? t("maintenance.due") : part.status === "soon" ? t("maintenance.soon") : undefined,
        ].filter(Boolean).join(" · ");
        return html`
          <div class=${`maintenance-row ${part.status}`}>
            <!-- The icon keeps its own cell, so the row holds its shape even without ha-icon. -->
            <span class="maintenance-icon" aria-hidden="true"><ha-icon icon=${part.icon}></ha-icon></span>
            <div class="maintenance-copy">
              <span class="maintenance-name">${name}</span>
              <span class="maintenance-bar" role="meter" aria-label=${name} aria-valuemin="0" aria-valuemax="100"
                aria-valuenow=${String(Math.round(part.percent))}><span style=${styleMap({ width: `${part.percent}%` })}></span></span>
              <span class="maintenance-meta">${meta}</span>
            </div>
            ${part.resetId && !asking ? html`<div class="maintenance-actions">
              <button type="button" data-maintenance-reset=${part.key} ?disabled=${model.busy} @click=${() => model.onAsk(part)}
                aria-label=${t("maintenance.resetPart", { part: name })}>${t("maintenance.reset")}</button>
            </div>` : nothing}
            ${asking ? html`
              <p class="maintenance-confirm" role="alert" id=${`maintenance-confirm-${part.key}`}>${t("maintenance.confirm", { part: name })}</p>
              <div class="maintenance-actions" style="grid-column: 2 / -1" role="group" aria-labelledby=${`maintenance-confirm-${part.key}`}>
                <button type="button" data-maintenance-cancel=${part.key} @click=${() => model.onCancel(part.key)}>${t("custom.cancel")}</button>
                <button type="button" class="confirm" ?disabled=${model.busy} @click=${() => model.onReset(part)}>${t("maintenance.resetPart", { part: name })}</button>
              </div>` : nothing}
          </div>`;
      })}
      ${missingReset ? html`<p class="maintenance-hint">${t("maintenance.enableReset")}</p>` : nothing}
    </section>
  `;
}
