import { css, html, type TemplateResult } from "lit";

import type { ScheduleControl } from "./schedule-controls";

export const schedulePanelStyles = css`
  .schedule-panel {
    display: grid;
    gap: 10px;
    padding: 14px;
    border: 1px solid var(--divider-color);
    border-radius: 14px;
    background:
      linear-gradient(145deg, color-mix(in srgb, var(--primary-color) 9%, transparent), transparent 52%),
      color-mix(in srgb, var(--card-background-color) 97%, var(--primary-color) 3%);
  }

  .schedule-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-weight: 650;
  }

  .schedule-heading span:first-child {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .schedule-count {
    color: var(--secondary-text-color);
    font-size: 0.78rem;
    font-weight: 500;
  }

  .schedule-list {
    display: grid;
    gap: 8px;
  }

  .schedule-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    padding: 11px 12px;
    border: 1px solid color-mix(in srgb, var(--divider-color) 80%, transparent);
    border-radius: 11px;
    background: color-mix(in srgb, var(--card-background-color) 95%, white 5%);
  }

  .schedule-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.92rem;
    font-weight: 600;
  }

  .schedule-detail {
    margin-top: 3px;
    color: var(--secondary-text-color);
    font-size: 0.76rem;
    line-height: 1.35;
  }

  .schedule-toggle {
    position: relative;
    width: 46px;
    height: 26px;
    border: 0;
    border-radius: 999px;
    padding: 0;
    background: color-mix(in srgb, var(--disabled-text-color) 55%, transparent);
    cursor: pointer;
    transition: background 160ms ease;
  }

  .schedule-toggle::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 2px 6px rgb(0 0 0 / 25%);
    transition: transform 160ms ease;
  }

  .schedule-toggle[aria-checked="true"] {
    background: var(--primary-color);
  }

  .schedule-toggle[aria-checked="true"]::after {
    transform: translateX(20px);
  }

  .schedule-toggle:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

export function renderSchedulePanel(
  controls: ScheduleControl[],
  onToggle: (entityId: string, enabled: boolean) => void | Promise<void>,
): TemplateResult {
  const showMapLabels = new Set(
    controls.map((control) => control.mapLabel).filter(Boolean),
  ).size > 1;
  return html`
    <section class="schedule-panel">
      <div class="schedule-heading">
        <span><ha-icon icon="mdi:calendar-clock"></ha-icon> Schedules</span>
        <span class="schedule-count">${controls.length} plan${controls.length === 1 ? "" : "s"}</span>
      </div>
      <div class="schedule-list">
        ${controls.map((control) => {
          const timing = [
            showMapLabels ? control.mapLabel : undefined,
            control.weekdays.length ? control.weekdays.join(", ") : undefined,
            control.startTimes.length ? control.startTimes.join(", ") : undefined,
          ].filter(Boolean).join(" · ");
          return html`
            <div class="schedule-row">
              <div>
                <div class="schedule-name">${control.label}</div>
                ${timing
                  ? html`<div class="schedule-detail">${timing}</div>`
                  : undefined}
              </div>
              <button
                class="schedule-toggle"
                role="switch"
                aria-label=${`${control.label}: ${control.enabled ? "enabled" : "disabled"}`}
                aria-checked=${String(control.enabled)}
                ?disabled=${!control.available}
                @click=${() => onToggle(control.entityId, control.enabled)}
              ></button>
            </div>
          `;
        })}
      </div>
    </section>
  `;
}
