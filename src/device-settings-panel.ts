import { css, html, nothing, type TemplateResult } from "lit";

import {
  deviceSettingControlGroup,
  deviceSettingsSummary,
  type DeviceSettingEntity,
  type DeviceSettingControlGroup,
} from "./device-settings-controls";

const groupPresentation: Record<
  DeviceSettingControlGroup,
  { label: string; icon: string }
> = {
  charging: { label: "Charging", icon: "mdi:battery-clock" },
  rain: { label: "Rain protection", icon: "mdi:weather-rainy" },
};

export const deviceSettingsPanelStyles = css`
  .device-settings-panel {
    border: 1px solid color-mix(in srgb, var(--primary-color) 28%, var(--divider-color));
    border-radius: 12px;
    overflow: hidden;
    background: color-mix(in srgb, var(--card-background-color) 96%, var(--primary-color) 4%);
  }

  .device-settings-panel summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 13px 14px;
    cursor: pointer;
    color: var(--primary-text-color);
    font-weight: 700;
    list-style: none;
  }

  .device-settings-panel summary::-webkit-details-marker {
    display: none;
  }

  .device-settings-panel summary::after {
    content: "›";
    color: var(--primary-color);
    font-size: 1.35rem;
    line-height: 1;
    transform: rotate(90deg);
    transition: transform 140ms ease;
  }

  .device-settings-panel[open] summary::after {
    transform: rotate(-90deg);
  }

  .device-settings-summary {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .device-settings-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .device-settings-summary small {
    color: var(--secondary-text-color);
    font-weight: 500;
    overflow-wrap: anywhere;
  }

  .device-settings-groups {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 12px;
    padding: 0 12px 12px;
  }

  .device-settings-group {
    display: grid;
    align-content: start;
    gap: 9px;
    min-width: 0;
  }

  .device-settings-group-heading {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--secondary-text-color);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .device-settings-group-heading ha-icon {
    --mdc-icon-size: 17px;
    color: var(--primary-color);
  }

  .device-settings-controls {
    display: grid;
    gap: 9px;
  }

  .selector-card input[type="time"] {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    padding: 10px 12px;
    background: var(--card-background-color);
    color: var(--primary-text-color);
    color-scheme: light dark;
    font: inherit;
  }

  .selector-card input[type="time"]:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export function renderDeviceSettingsPanel(
  entityIds: readonly string[],
  entities: Record<string, DeviceSettingEntity | undefined>,
  renderControl: (entityId: string) => TemplateResult | typeof nothing,
): TemplateResult | typeof nothing {
  if (!entityIds.length) {
    return nothing;
  }

  const groups = (["charging", "rain"] as const)
    .map((group) => ({
      group,
      entityIds: entityIds.filter(
        (entityId) => deviceSettingControlGroup(entityId) === group,
      ),
    }))
    .filter(({ entityIds: groupEntityIds }) => groupEntityIds.length);
  const summary = deviceSettingsSummary(entities, entityIds);

  return html`
    <details class="device-settings-panel">
      <summary>
        <span class="device-settings-summary">
          <span class="device-settings-title">
            <ha-icon icon="mdi:tune-variant"></ha-icon>
            Device settings
          </span>
          ${summary ? html`<small>${summary}</small>` : nothing}
        </span>
      </summary>
      <div class="device-settings-groups">
        ${groups.map(({ group, entityIds: groupEntityIds }) => {
          const presentation = groupPresentation[group];
          return html`
            <section class="device-settings-group">
              <div class="device-settings-group-heading">
                <ha-icon icon=${presentation.icon}></ha-icon>
                ${presentation.label}
              </div>
              <div class="device-settings-controls">
                ${groupEntityIds.map(renderControl)}
              </div>
            </section>
          `;
        })}
      </div>
    </details>
  `;
}
