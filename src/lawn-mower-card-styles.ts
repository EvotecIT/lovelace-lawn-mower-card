import { heroThemeStyles } from "./hero-theme";
import { themeTokenStyles } from "./theme-tokens";
import { cardAppearanceStyles } from "./card-appearance-styles";
import { customizationStyles } from "./customization-view";
import { css } from "lit";

import { deviceSettingsPanelStyles } from "./device-settings-panel";
import { heroLayoutStyles } from "./hero-layout";
import { schedulePanelStyles } from "./schedule-panel";
import { mowingAutomationStyles } from "./mowing-automation-panel";
import { settingsSheetStyles } from "./settings-sheet";
import { recentConditionsStyles } from "./recent-conditions-panel";
import { mowerAlertStyles } from "./mower-alerts";
import { mediaSwitchStyles } from "./media-switch";
import { tileLayoutStyles } from "./tile-layout";
import { maintenanceStyles } from "./maintenance";

export const lawnMowerCardStyles = [themeTokenStyles, css`
    :host {
      container-type: inline-size;
      display: block;
    }

    ha-card {
      overflow: hidden;
      color: var(--mower-text);
    }

    .wrap {
      display: grid;
      gap: 16px;
      padding: 16px;
    }

    .wrap.layout-compact {
      gap: 12px;
      padding: 12px;
    }

    .wrap.layout-wide {
      grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr);
      align-items: start;
    }

    .main {
      display: grid;
      gap: 16px;
      min-width: 0;
    }

    .side {
      display: grid;
      gap: 16px;
      min-width: 0;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 12px;
    }

    .title-block {
      min-width: 0;
    }

    .title {
      font-size: 1.3rem;
      font-weight: 600;
      line-height: 1.2;
    }

    .subtitle {
      color: var(--mower-muted);
      margin-top: 4px;
      word-break: break-word;
    }

    .header-summary {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    .summary-chip {
      border: 1px solid var(--mower-border);
      border-radius: var(--mower-radius-control);
      padding: 6px 10px;
      font-size: 0.82rem;
      background: var(--mower-fill);
      white-space: nowrap;
    }

    .state-pill {
      align-self: center;
      border: 1px solid var(--mower-border);
      border-radius: var(--mower-radius-control);
      padding: 6px 10px;
      font-size: 0.85rem;
      white-space: nowrap;
      background: color-mix(in srgb, var(--mower-state, var(--mower-accent)) 14%, transparent);
      border-color: color-mix(in srgb, var(--mower-state, var(--mower-accent)) 45%, transparent);
    }
    .map {
      position: relative;
      border: 1px solid var(--mower-border);
      border-radius: var(--mower-radius-inner);
      overflow: hidden;
      background:
        radial-gradient(circle at 20% 10%, var(--mower-fill-accent), transparent 45%),
        var(--mower-fill-strong);
      min-height: 180px;
      display: grid;
      place-items: center;
    }

    .map img {
      display: block;
      width: 100%;
      max-height: min(62vh, 560px);
      object-fit: contain;
    }

    .map img.map-fit-cover {
      height: clamp(240px, 50vh, 560px);
      object-fit: cover;
    }

    .map-position-top { object-position: center top; }
    .map-position-bottom { object-position: center bottom; }
    .map-position-left { object-position: left center; }
    .map-position-right { object-position: right center; }
    .map-position-top-left { object-position: left top; }
    .map-position-top-right { object-position: right top; }
    .map-position-bottom-left { object-position: left bottom; }
    .map-position-bottom-right { object-position: right bottom; }

    .map-status {
      position: absolute;
      inset: 12px 12px auto 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      pointer-events: none;
      z-index: 3;
    }

    .map-badge {
      padding: 5px 9px;
      border: 1px solid color-mix(in srgb, white 24%, transparent);
      border-radius: 999px;
      color: white;
      background: color-mix(in srgb, #101b17 76%, transparent);
      backdrop-filter: blur(8px);
      font-size: 0.75rem;
      font-weight: 600;
      box-shadow: 0 3px 12px rgb(0 0 0 / 18%);
    }

    .map-badge.live {
      background: color-mix(in srgb, #0c6f44 82%, transparent);
      border-color: color-mix(in srgb, #7cf1b4 55%, transparent);
    }

    .map-badge.warning {
      background: color-mix(in srgb, #8a3a22 85%, transparent);
      border-color: color-mix(in srgb, #ffb49c 55%, transparent);
    }

    .map-placeholder {
      min-height: 180px;
      display: grid;
      place-items: center;
      color: var(--mower-muted);
      padding: 16px;
      text-align: center;
    }

    .point-cloud-panel {
      min-height: 320px;
      overflow: hidden;
      border: 1px solid var(--mower-border);
      border-radius: var(--mower-radius-inner);
      background: var(--mower-fill-strong);
    }

    .layout-compact .point-cloud-panel {
      min-height: 250px;
    }

    .point-cloud-placeholder {
      min-height: inherit;
      display: grid;
      place-content: center;
      justify-items: center;
      gap: 12px;
      padding: 24px;
      color: var(--mower-muted);
      text-align: center;
    }

    .point-cloud-placeholder ha-icon {
      --mdc-icon-size: 36px;
      color: var(--mower-accent);
    }

    .point-cloud-placeholder p {
      margin: 0;
    }

    .selectors {
      display: grid;
      gap: 10px;
    }

    .preference-panel {
      border: 1px solid color-mix(in srgb, var(--mower-accent) 28%, var(--mower-border));
      border-radius: var(--mower-radius-inner);
      overflow: hidden;
      background: var(--mower-fill);
    }

    .preference-panel summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 13px 14px;
      cursor: pointer;
      color: var(--mower-text);
      font-weight: 700;
      list-style: none;
    }

    .preference-panel summary::-webkit-details-marker {
      display: none;
    }

    .preference-panel summary::after {
      content: "›";
      color: var(--mower-accent);
      font-size: 1.35rem;
      line-height: 1;
      transform: rotate(90deg);
      transition: transform 140ms ease;
    }

    .preference-panel[open] summary::after {
      transform: rotate(-90deg);
    }

    .preference-summary {
      display: grid;
      gap: 2px;
    }

    .preference-summary small {
      color: var(--mower-muted);
      font-weight: 500;
    }

    .preference-controls {
      padding: 0 12px 12px;
    }

    .selector-card {
      display: grid;
      gap: 6px;
      padding: 12px;
      border: 1px solid var(--mower-border);
      border-radius: var(--mower-radius-inner);
      background: var(--mower-fill);
    }

    .selector-label {
      font-size: 0.8rem;
      color: var(--mower-muted);
    }

    .selector-hint {
      color: var(--mower-muted);
      font-size: 0.78rem;
      line-height: 1.35;
    }

    .selector-hint.warning {
      color: var(--mower-text);
      border-inline-start: 3px solid var(--mower-warning);
      padding-inline-start: 8px;
    }

    .selector-card select {
      color-scheme:inherit;
      width: 100%;
      box-sizing: border-box;
      border: 1px solid var(--mower-border);
      border-radius: var(--mower-radius-control);
      padding: 10px 12px;
      background: var(--mower-field);
      color: var(--mower-text);
      font: inherit;
    }

    .selector-card select:focus-visible {
      outline:2px solid var(--mower-accent);
      outline-offset:2px;
    }

    .selector-number-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
    }

    .selector-number-value {
      font-weight: 700;
      color: var(--mower-text);
      white-space: nowrap;
    }

    .selector-switch-body {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      color: var(--mower-text);
      font-weight: 600;
    }

    .selector-card input[type="range"] {
      width: 100%;
      margin: 4px 0 0;
      accent-color: var(--mower-accent);
    }

    .selector-card input.number-box {
      box-sizing: border-box;
      width: 100%;
      min-height: 40px;
      margin: 4px 0 0;
      padding: 6px 10px;
      border: 1px solid var(--mower-border);
      border-radius: var(--mower-radius-control);
      font: inherit;
      color: var(--mower-text);
      background: var(--mower-field);
    }

    .zone-selector-card {
      grid-column: 1 / -1;
      min-width: 0;
      container: zone-picker / inline-size;
    }

    .zone-option-list {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 8px;
    }

    @container zone-picker (min-width: 264px) {
      .zone-option-list {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .zone-option-list[data-columns="1"] {
      grid-template-columns: minmax(0, 1fr);
    }

    .zone-option-list[data-columns="2"] {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .zone-option {
      display: flex;
      align-items: center;
      gap: 9px;
      min-width: 0;
      min-height: 44px;
      box-sizing: border-box;
      padding: 9px 10px;
      border: 1px solid var(--mower-border);
      border-radius: var(--mower-radius-control);
      background: var(--mower-field);
      color: var(--mower-text);
      cursor: pointer;
    }

    .zone-option.selected {
      border-color: color-mix(in srgb, var(--mower-accent) 62%, var(--mower-border));
      background: var(--mower-fill-accent);
    }

    .zone-option input {
      flex: 0 0 auto;
      margin: 0;
      accent-color: var(--mower-accent);
    }

    .zone-option:focus-within {
      outline: 2px solid var(--mower-accent);
      outline-offset: 2px;
    }

    .zone-option:has(input:disabled) {
      opacity: 0.6;
      cursor: default;
    }

    .zone-option span {
      min-width: 0;
      line-height: 1.25;
      overflow-wrap: anywhere;
    }

    .zone-selection-note {
      color: var(--mower-muted);
      font-size: 0.78rem;
      line-height: 1.35;
    }

    .target-panel {
      display: grid;
      gap: 12px;
      padding: 14px;
      border: 1px solid color-mix(in srgb, var(--mower-accent) 22%, var(--mower-border));
      border-radius: var(--mower-radius-inner);
      background: linear-gradient(180deg, color-mix(in srgb, var(--mower-accent) 7%, transparent), color-mix(in srgb, var(--mower-accent) 2%, transparent));
    }

    .target-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .target-title {
      font-size: 0.86rem;
      font-weight: 700;
    }

    .target-badge {
      border: 1px solid color-mix(in srgb, var(--mower-accent) 28%, var(--mower-border));
      border-radius: 999px;
      padding: 4px 8px;
      font-size: 0.76rem;
      color: var(--mower-muted);
      background: var(--mower-fill-accent);
      white-space: nowrap;
    }

    .target-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 10px;
    }

    .target-metric {
      border: 1px solid var(--mower-border);
      border-radius: var(--mower-radius-control);
      padding: 10px;
      background: var(--mower-fill);
      min-width: 0;
    }

    .target-metric-label {
      color: var(--mower-muted);
      font-size: 0.76rem;
      margin-bottom: 6px;
    }

    .target-metric-value {
      font-size: 0.98rem;
      font-weight: 600;
      line-height: 1.25;
      word-break: break-word;
    }

    .target-note {
      color: var(--mower-muted);
      font-size: 0.84rem;
      line-height: 1.4;
    }

    .session-panel {
      display: grid;
      gap: 12px;
      padding: 14px;
      border: 1px solid color-mix(in srgb, var(--mower-state-mowing) 32%, var(--mower-border));
      border-radius: var(--mower-radius-inner);
      background: linear-gradient(180deg, color-mix(in srgb, var(--mower-state-mowing) 10%, transparent), color-mix(in srgb, var(--mower-state-mowing) 2%, transparent));
    }

    .session-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .session-title {
      font-size: 0.86rem;
      font-weight: 700;
      color: color-mix(in srgb, var(--mower-text) 86%, var(--mower-state-mowing));
    }

    .session-badge {
      border: 1px solid color-mix(in srgb, var(--mower-state-mowing) 34%, var(--mower-border));
      border-radius: 999px;
      padding: 4px 8px;
      font-size: 0.76rem;
      color: color-mix(in srgb, var(--mower-text) 78%, var(--mower-state-mowing));
      background: color-mix(in srgb, var(--mower-state-mowing) 14%, transparent);
      white-space: nowrap;
    }

    .session-subtitle {
      color: var(--mower-muted);
      font-size: 0.85rem;
      line-height: 1.4;
    }

    .session-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 10px;
    }

    .session-metric {
      border: 1px solid color-mix(in srgb, var(--mower-state-mowing) 16%, var(--mower-border));
      border-radius: var(--mower-radius-control);
      padding: 10px;
      background: color-mix(in srgb, var(--mower-state-mowing) 5%, transparent);
      min-width: 0;
    }

    .session-metric-label {
      color: var(--mower-muted);
      font-size: 0.76rem;
      margin-bottom: 6px;
    }

    .session-metric-value {
      font-size: 0.98rem;
      font-weight: 600;
      line-height: 1.25;
      word-break: break-word;
    }

    .actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 10px;
    }

    .action-feedback {
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid color-mix(in srgb, var(--mower-success) 42%, transparent);
      border-radius: var(--mower-radius-control);
      padding: 9px 11px;
      background: color-mix(in srgb, var(--mower-success) 13%, transparent);
      color: var(--mower-text);
      font-size: 0.8rem;
    }

    .action-feedback.error {
      border-color: color-mix(in srgb, var(--mower-error) 48%, transparent);
      background: color-mix(in srgb, var(--mower-error) 13%, transparent);
    }

    .action-feedback ha-icon {
      --mdc-icon-size: 18px;
      flex: 0 0 auto;
    }

    .action-group {
      display: grid;
      gap: 10px;
    }

    .action-group-title {
      color: var(--mower-muted);
      font-size: 0.8rem;
    }

    button {
      font: inherit;
      padding: 12px;
      border-radius: var(--mower-radius-control);
      border: 1px solid var(--mower-border);
      color: var(--mower-text);
      background: var(--mower-fill-accent);
      cursor: pointer;
    }

    button:hover {
      background: var(--mower-fill-accent-strong);
    }

    button.primary:not(:disabled) {
      border-color: var(--mower-accent);
      background: var(--mower-fill-accent-strong);
      font-weight: 600;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .button-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-width: 0;
    }

    ha-icon {
      --mdc-icon-size: 20px;
      flex: 0 0 auto;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 10px;
    }

    .wrap.layout-compact .stats {
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 8px;
    }

    .tile {
      border: 1px solid var(--mower-border);
      border-radius: var(--mower-radius-control);
      padding: 12px;
      min-width: 0;
    }

    .tile-label {
      color: var(--mower-muted);
      font-size: 0.8rem;
      margin-bottom: 6px;
    }

    .tile-value {
      font-size: 1rem;
      font-weight: 600;
      line-height: 1.2;
      word-break: break-word;
    }

    .wrap.layout-compact .title {
      font-size: 1.15rem;
    }

    .wrap.layout-compact button {
      padding: 10px;
    }

    .wrap.layout-compact .tile {
      padding: 10px;
    }

    @container (max-width: 480px) {
      .actions {
        grid-template-columns: 1fr;
      }
    }

    @container (max-width: 900px) {
      .wrap.layout-wide {
        grid-template-columns: 1fr;
      }
    }
  `, schedulePanelStyles, mowingAutomationStyles, settingsSheetStyles, mowerAlertStyles, mediaSwitchStyles, tileLayoutStyles, maintenanceStyles, recentConditionsStyles, deviceSettingsPanelStyles, heroLayoutStyles, customizationStyles, heroThemeStyles, cardAppearanceStyles];
