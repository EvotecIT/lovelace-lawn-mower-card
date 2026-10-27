import { css, html, nothing, type TemplateResult } from "lit";
import type { HassEntity, HomeAssistant, LawnMowerCardConfig } from "./card-config";
import { resolvedMowerCompanionEntity } from "./card-logic.ts";
import type { TranslationKey, Translator } from "./localization";
import { mowingAutomationStatus } from "./mowing-automation.ts";

export type MowerAlertSeverity = "error" | "warning" | "info";

export type MowerAlert = {
  key: "error" | "rain" | "maintenance" | "hold" | "notice" | "maintenance-soon";
  severity: MowerAlertSeverity;
  icon: string;
  title: string;
  detail?: string;
  /** Entity whose more-info dialog explains the alert. */
  entityId?: string;
};

const EMPTY = new Set(["", "none", "unknown", "unavailable", "ok", "no_error", "no error", "null"]);
const MAINTENANCE_ITEMS = new Set(["blade", "brush", "robot", "edge_trimmer"]);
const RANK: Record<MowerAlertSeverity, number> = { error: 0, warning: 1, info: 2 };

const present = (value: unknown): value is string =>
  typeof value === "string" && !EMPTY.has(value.trim().toLowerCase());

function itemNames(value: unknown, t: Translator): string | undefined {
  if (!Array.isArray(value)) return undefined;
  const names = value.flatMap(item => typeof item === "string"
    ? [MAINTENANCE_ITEMS.has(item) ? t(`alerts.item.${item}` as TranslationKey) : item.replaceAll("_", " ")]
    : []);
  return names.length ? names.join(", ") : undefined;
}

/** "16:20", or "Tue 16:20" when the time is not today. */
export function alertTime(value: unknown, locale: string, now: Date): string | undefined {
  if (typeof value !== "string") return undefined;
  const time = new Date(value);
  if (Number.isNaN(time.getTime()) || time <= now) return undefined;
  const today = time.toDateString() === now.toDateString();
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric", minute: "2-digit", ...(today ? {} : { weekday: "short" }),
  }).format(time);
}

/**
 * What needs attention and why the mower is not mowing, read from what the integration
 * reports. Errors come first, then reasons that stop a run, then notes.
 */
export function mowerAlerts(
  hass: Pick<HomeAssistant, "states" | "entities">,
  config: LawnMowerCardConfig,
  t: Translator,
  locale: string,
  now = new Date(),
): MowerAlert[] {
  if (config.show_alerts === false) return [];
  const states = hass.states;
  const mower = states[config.entity];
  if (!mower) return [];
  const companion = (domain: string, suffix: string): HassEntity | undefined => {
    const id = resolvedMowerCompanionEntity(states, config.entity, hass.entities, domain, suffix);
    return id ? states[id] : undefined;
  };
  const alerts: MowerAlert[] = [];

  const errorSensor = companion("sensor", "error");
  const sensorError = present(errorSensor?.state) ? errorSensor!.state : undefined;
  const mowerError = [mower.attributes.error_display, mower.attributes.error_text].find(present);
  const errorText = sensorError ?? mowerError;
  if (errorText || mower.state === "error") {
    alerts.push({
      key: "error", severity: "error", icon: "mdi:alert-circle-outline",
      title: t("alerts.error"), detail: errorText,
      // Open whichever entity supplied the text the strip shows.
      entityId: sensorError ? errorSensor!.entity_id : mower.entity_id,
    });
  }

  const rain = companion("binary_sensor", "rain_delay_active");
  if (rain?.state === "on") {
    const until = alertTime(rain.attributes.rain_protect_end_time_iso, locale, now);
    alerts.push({
      key: "rain", severity: "warning", icon: "mdi:weather-pouring", title: t("alerts.rain"),
      detail: until ? t("alerts.rainUntil", { time: until }) : t("alerts.rainDetail"), entityId: rain.entity_id,
    });
  }

  const due = companion("binary_sensor", "maintenance_due");
  if (due?.state === "on") {
    const items = itemNames(due.attributes.due_items, t);
    alerts.push({
      key: "maintenance", severity: "warning", icon: "mdi:wrench-clock", title: t("alerts.maintenance"),
      detail: [items, t("alerts.maintenanceDetail")].filter(Boolean).join(" · "), entityId: due.entity_id,
    });
  }

  const automation = mowingAutomationStatus(states, config.entity);
  if (automation?.configured && automation.enabled && !automation.permitted) {
    alerts.push({
      key: "hold", severity: "warning", icon: "mdi:pause-octagon-outline", title: t("alerts.hold"),
      detail: automation.reason, entityId: automation.enableEntity,
    });
  }

  const notice = companion("sensor", "status_notice");
  // Rain has its own line above; the notice would only repeat it.
  if (present(notice?.state) && !(rain?.state === "on" && /rain/i.test(notice!.state))) {
    alerts.push({
      key: "notice", severity: "info", icon: "mdi:information-outline",
      title: notice!.state, entityId: notice!.entity_id,
    });
  }

  const soon = companion("binary_sensor", "maintenance_warning");
  if (soon?.state === "on" && due?.state !== "on") {
    alerts.push({
      key: "maintenance-soon", severity: "info", icon: "mdi:wrench-outline", title: t("alerts.maintenanceSoon"),
      detail: itemNames(soon.attributes.warning_items, t), entityId: soon.entity_id,
    });
  }

  return alerts.sort((left, right) => RANK[left.severity] - RANK[right.severity]);
}

export const mowerAlertStyles = css`
  .mower-alerts {
    display: grid;
    gap: 8px;
    min-width: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .mower-alert {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
    margin: 0;
    padding: 10px 12px;
    border: 0;
    border-radius: var(--mower-radius-control);
    color: var(--mower-text);
    background: color-mix(in srgb, var(--alert-color) 14%, transparent);
    font: inherit;
    text-align: start;
    cursor: pointer;
  }

  .mower-alert:hover {
    background: color-mix(in srgb, var(--alert-color) 22%, transparent);
  }

  .mower-alert:focus-visible {
    outline: 2px solid var(--alert-color);
    outline-offset: 2px;
  }

  .mower-alert.error { --alert-color: var(--mower-error); }
  .mower-alert.warning { --alert-color: var(--mower-warning); }
  .mower-alert.info { --alert-color: var(--mower-info); }

  .mower-alert ha-icon {
    flex: none;
    color: var(--alert-color);
  }

  .mower-alert-copy {
    display: grid;
    flex: 1;
    min-width: 0;
    gap: 2px;
    line-height: 1.4;
  }

  .mower-alert-title {
    font-size: 0.95rem;
    font-weight: 500;
  }

  .mower-alert-detail {
    color: var(--mower-muted);
    font-size: 0.8125rem;
    overflow-wrap: anywhere;
  }

  .mower-alert-why {
    color: var(--mower-muted);
    font-size: 0.75rem;
  }

  .hero-shell > .mower-alerts { grid-column: 1 / -1; margin: 0 18px 12px; }
  .dashboard-command-panel > .mower-alerts { margin: 0 0 12px; }
`;

export type MowerAlertsModel = {
  alerts: readonly MowerAlert[];
  /** Mowing has stopped, so the first reason that stops a run is the answer to "why not". */
  idle: boolean;
  t: Translator;
  onSelect(entityId?: string): void;
};

export function renderMowerAlerts(model: MowerAlertsModel): TemplateResult | typeof nothing {
  if (!model.alerts.length) return nothing;
  const why = model.idle ? model.alerts.find(alert => alert.severity !== "info") : undefined;
  return html`
    <ul class="mower-alerts" aria-label=${model.t("alerts.label")}>
      ${model.alerts.map(alert => html`
        <li>
          <button type="button" class=${`mower-alert ${alert.severity}`}
            @click=${() => model.onSelect(alert.entityId)}>
            <ha-icon icon=${alert.icon} aria-hidden="true"></ha-icon>
            <span class="mower-alert-copy">
              ${alert === why ? html`<span class="mower-alert-why">${model.t("alerts.whyNot")}</span>` : nothing}
              <span class="mower-alert-title">${alert.title}</span>
              ${alert.detail ? html`<span class="mower-alert-detail">${alert.detail}</span>` : nothing}
            </span>
          </button>
        </li>`)}
    </ul>
  `;
}
