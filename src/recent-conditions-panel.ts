import { css, html, nothing, type TemplateResult } from "lit";
import type { Translator, SupportedLocale } from "./localization";
import type { RecentCondition } from "./recent-conditions";

export const recentConditionsStyles = css`
  .recent-conditions { min-width: 0; border: 1px solid var(--divider-color); border-radius: 12px; padding: 12px; background: var(--card-background-color); color: var(--primary-text-color); }
  .recent-conditions summary { cursor: pointer; font-weight: 600; line-height: 1.5; }
  .recent-conditions summary:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 4px; border-radius: 4px; }
  .condition-list { display: grid; gap: 10px; list-style: none; padding: 0; margin: 12px 0 0; }
  .condition-row { display: grid; grid-template-columns: 24px minmax(0, 1fr); gap: 9px; padding-top: 10px; border-top: 1px solid var(--divider-color); }
  .condition-row ha-icon { color: var(--secondary-text-color); }
  .condition-row.active ha-icon { color: var(--error-color, #c84949); }
  .condition-row.warning.active ha-icon { color: var(--warning-color, #b57912); }
  .condition-message { overflow-wrap: anywhere; line-height: 1.45; }
  .condition-meta { color: var(--secondary-text-color); font-size: .78rem; line-height: 1.5; margin-top: 4px; }
  .hero-shell > .recent-conditions { grid-column: 1 / -1; margin: 0 18px 18px; }
  .dashboard-card .recent-conditions { margin: 0; }
`;

export function renderRecentConditions(
  conditions: readonly RecentCondition[], t: Translator, locale: SupportedLocale,
): TemplateResult | typeof nothing {
  if (!conditions.length) return nothing;
  return html`<details class="recent-conditions">
    <summary>${t("conditions.recent")} (${conditions.length})</summary>
    <ol class="condition-list">${conditions.map(condition => html`
      <li class=${`condition-row ${condition.severity}${condition.active ? " active" : ""}`}>
        <ha-icon icon=${condition.severity === "error" ? "mdi:alert-circle-outline" : "mdi:bell-outline"} aria-hidden="true"></ha-icon>
        <div><div class="condition-message">${condition.message}</div>
          <div class="condition-meta">
            ${t(condition.active === true ? "conditions.active" : condition.active === false ? "conditions.cleared" : "conditions.unknown")}
            ${condition.observedAt ? html` · <time datetime=${condition.observedAt} title=${condition.observedAt}>${new Date(condition.observedAt).toLocaleString(locale)}</time>` : nothing}
          </div>
        </div>
      </li>`)}</ol>
  </details>`;
}
