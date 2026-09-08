import { heroThemeStyles } from "./hero-theme";
import { customizationStyles } from "./customization-view";
import { css } from "lit";

import { deviceSettingsPanelStyles } from "./device-settings-panel";
import { heroLayoutStyles } from "./hero-layout";
import { schedulePanelStyles } from "./schedule-panel";

export const lawnMowerCardStyles = [css`
    :host {
      container-type: inline-size;
      display: block;
    }

    ha-card {
      overflow: hidden;
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
      color: var(--secondary-text-color);
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
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 0.82rem;
      background: color-mix(in srgb, var(--card-background-color) 94%, var(--primary-color) 6%);
      white-space: nowrap;
    }

    .state-pill {
      align-self: center;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 0.85rem;
      white-space: nowrap;
      background: color-mix(in srgb, var(--card-background-color) 92%, var(--primary-color) 8%);
    }

    .state-pill.state-mowing {
      background: color-mix(in srgb, #173122 80%, var(--card-background-color) 20%);
      border-color: color-mix(in srgb, #4ade80 45%, var(--divider-color) 55%);
      color: #d8fbe6;
    }

    .state-pill.state-returning {
      background: color-mix(in srgb, #2d2a15 82%, var(--card-background-color) 18%);
      border-color: color-mix(in srgb, #facc15 45%, var(--divider-color) 55%);
      color: #fff2bf;
    }

    .state-pill.state-paused {
      background: color-mix(in srgb, #2a2235 82%, var(--card-background-color) 18%);
      border-color: color-mix(in srgb, #c084fc 45%, var(--divider-color) 55%);
      color: #f0ddff;
    }

    .state-pill.state-docked {
      background: color-mix(in srgb, #182431 82%, var(--card-background-color) 18%);
      border-color: color-mix(in srgb, #60a5fa 45%, var(--divider-color) 55%);
      color: #d8ecff;
    }

    .state-pill.state-error {
      background: color-mix(in srgb, #351b1b 82%, var(--card-background-color) 18%);
      border-color: color-mix(in srgb, #f87171 45%, var(--divider-color) 55%);
      color: #ffd9d9;
    }

    .map {
      position: relative;
      border: 1px solid var(--divider-color);
      border-radius: 14px;
      overflow: hidden;
      background:
        radial-gradient(circle at 20% 10%, color-mix(in srgb, var(--primary-color) 18%, transparent), transparent 45%),
        color-mix(in srgb, var(--card-background-color) 84%, black 16%);
      min-height: 180px;
      display: grid;
      place-items: center;
      box-shadow: inset 0 1px 0 color-mix(in srgb, white 10%, transparent);
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
      color: var(--secondary-text-color);
      padding: 16px;
      text-align: center;
    }

    .point-cloud-panel {
      min-height: 320px;
      overflow: hidden;
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      background: #080b09;
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
      color: rgba(247, 250, 247, 0.76);
      text-align: center;
    }

    .point-cloud-placeholder ha-icon {
      --mdc-icon-size: 36px;
      color: #9fca8b;
    }

    .point-cloud-placeholder p {
      margin: 0;
    }

    .selectors {
      display: grid;
      gap: 10px;
    }

    .preference-panel {
      border: 1px solid color-mix(in srgb, var(--primary-color) 28%, var(--divider-color));
      border-radius: 12px;
      overflow: hidden;
      background: color-mix(in srgb, var(--card-background-color) 96%, var(--primary-color) 4%);
    }

    .preference-panel summary {
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

    .preference-panel summary::-webkit-details-marker {
      display: none;
    }

    .preference-panel summary::after {
      content: "›";
      color: var(--primary-color);
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
      color: var(--secondary-text-color);
      font-weight: 500;
    }

    .preference-controls {
      padding: 0 12px 12px;
    }

    .selector-card {
      display: grid;
      gap: 6px;
      padding: 12px;
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      background: color-mix(in srgb, var(--card-background-color) 94%, var(--primary-color) 6%);
    }

    .selector-label {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .selector-card select {
      color-scheme:inherit;
      width: 100%;
      box-sizing: border-box;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 10px 12px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
    }

    .selector-card select:focus-visible {
      outline:2px solid var(--primary-color);
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
      color: var(--primary-text-color);
      white-space: nowrap;
    }

    .selector-switch-body {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      color: var(--primary-text-color);
      font-weight: 600;
    }

    .selector-card input[type="range"] {
      width: 100%;
      margin: 4px 0 0;
      accent-color: var(--primary-color);
    }

    .zone-option-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(138px, 1fr));
      gap: 8px;
    }

    .zone-option {
      display: flex;
      align-items: center;
      gap: 9px;
      min-width: 0;
      padding: 9px 10px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      cursor: pointer;
    }

    .zone-option.selected {
      border-color: color-mix(in srgb, var(--primary-color) 62%, var(--divider-color));
      background: color-mix(in srgb, var(--card-background-color) 88%, var(--primary-color) 12%);
    }

    .zone-option input {
      flex: 0 0 auto;
      margin: 0;
      accent-color: var(--primary-color);
    }

    .zone-option span {
      min-width: 0;
      line-height: 1.25;
      overflow-wrap: anywhere;
    }

    .zone-selection-note {
      color: var(--secondary-text-color);
      font-size: 0.78rem;
      line-height: 1.35;
    }

    .target-panel {
      display: grid;
      gap: 12px;
      padding: 14px;
      border: 1px solid color-mix(in srgb, var(--primary-color) 22%, var(--divider-color) 78%);
      border-radius: 12px;
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--card-background-color) 93%, var(--primary-color) 7%),
          color-mix(in srgb, var(--card-background-color) 98%, var(--primary-color) 2%)
        );
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
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .target-badge {
      border: 1px solid color-mix(in srgb, var(--primary-color) 28%, var(--divider-color) 72%);
      border-radius: 999px;
      padding: 4px 8px;
      font-size: 0.76rem;
      color: var(--secondary-text-color);
      background: color-mix(in srgb, var(--card-background-color) 92%, var(--primary-color) 8%);
      white-space: nowrap;
    }

    .target-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 10px;
    }

    .target-metric {
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      padding: 10px;
      background: color-mix(in srgb, var(--card-background-color) 96%, var(--primary-color) 4%);
      min-width: 0;
    }

    .target-metric-label {
      color: var(--secondary-text-color);
      font-size: 0.76rem;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .target-metric-value {
      font-size: 0.98rem;
      font-weight: 600;
      line-height: 1.25;
      word-break: break-word;
    }

    .target-note {
      color: var(--secondary-text-color);
      font-size: 0.84rem;
      line-height: 1.4;
    }

    .session-panel {
      display: grid;
      gap: 12px;
      padding: 14px;
      border: 1px solid color-mix(in srgb, #4ade80 32%, var(--divider-color) 68%);
      border-radius: 12px;
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, #153527 18%, var(--card-background-color) 82%),
          color-mix(in srgb, var(--card-background-color) 95%, #153527 5%)
        );
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
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: color-mix(in srgb, var(--primary-text-color) 86%, #4ade80 14%);
    }

    .session-badge {
      border: 1px solid color-mix(in srgb, #4ade80 34%, var(--divider-color) 66%);
      border-radius: 999px;
      padding: 4px 8px;
      font-size: 0.76rem;
      color: color-mix(in srgb, var(--primary-text-color) 78%, #4ade80 22%);
      background: color-mix(in srgb, #153527 24%, var(--card-background-color) 76%);
      white-space: nowrap;
    }

    .session-subtitle {
      color: var(--secondary-text-color);
      font-size: 0.85rem;
      line-height: 1.4;
    }

    .session-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 10px;
    }

    .session-metric {
      border: 1px solid color-mix(in srgb, #4ade80 16%, var(--divider-color) 84%);
      border-radius: 10px;
      padding: 10px;
      background: color-mix(in srgb, var(--card-background-color) 95%, #4ade80 5%);
      min-width: 0;
    }

    .session-metric-label {
      color: var(--secondary-text-color);
      font-size: 0.76rem;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
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
      border: 1px solid color-mix(in srgb, var(--success-color, #67b55b) 42%, transparent);
      border-radius: 10px;
      padding: 9px 11px;
      background: color-mix(in srgb, var(--success-color, #67b55b) 13%, transparent);
      color: var(--primary-text-color);
      font-size: 0.8rem;
    }

    .action-feedback.error {
      border-color: color-mix(in srgb, var(--error-color, #db4437) 48%, transparent);
      background: color-mix(in srgb, var(--error-color, #db4437) 13%, transparent);
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
      color: var(--secondary-text-color);
      font-size: 0.8rem;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    button {
      font: inherit;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      color: var(--primary-text-color);
      background: color-mix(in srgb, var(--card-background-color) 92%, var(--primary-color) 8%);
      cursor: pointer;
    }

    button:hover {
      background: color-mix(in srgb, var(--card-background-color) 82%, var(--primary-color) 18%);
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
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 12px;
      min-width: 0;
    }

    .tile-label {
      color: var(--secondary-text-color);
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

    @media (max-width: 480px) {
      .actions {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 900px) {
      .wrap.layout-wide {
        grid-template-columns: 1fr;
      }
    }
  `, schedulePanelStyles, deviceSettingsPanelStyles, heroLayoutStyles, customizationStyles, heroThemeStyles];
