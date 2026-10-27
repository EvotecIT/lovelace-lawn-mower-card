import { css, html, nothing, svg, type TemplateResult } from "lit";

// Drawn inline so the close and chevron glyphs show even where ha-icon is not loaded.
const icon = (path: string) => html`<svg class="settings-glyph" viewBox="0 0 24 24" aria-hidden="true">${svg`<path d=${path}></path>`}</svg>`;
const closePath = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z";
const chevronPath = "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z";

export type ControlsLayout = "sheet" | "inline";

/** The sheet is the default; `inline` keeps every control on the card as before. */
export function controlsLayout(value: unknown): ControlsLayout {
  return value === "inline" ? "inline" : "sheet";
}

/** One line under the settings button: the first few current values, then how many more. */
export function settingsSummary(parts: ReadonlyArray<string | undefined>, shown = 3): string {
  const values = [...new Set(parts.map(part => part?.trim()).filter((part): part is string => Boolean(part)))];
  const rest = values.length - shown;
  return [...values.slice(0, shown), ...(rest > 0 ? [`+${rest}`] : [])].join(" · ");
}

export const settingsSheetStyles = css`
  .settings-entry {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    min-height: 56px;
    margin: 0;
    padding: 8px 12px 8px 14px;
    border: 1px solid var(--mower-border);
    border-radius: var(--mower-radius-inner);
    color: var(--mower-text);
    background: var(--mower-fill);
    font: inherit;
    text-align: start;
    cursor: pointer;
  }

  .settings-entry:hover {
    background: var(--mower-fill-strong);
  }

  .settings-entry:focus-visible {
    outline: 2px solid var(--mower-accent);
    outline-offset: 2px;
  }

  .settings-glyph {
    width: 24px;
    height: 24px;
    flex: none;
    fill: currentColor;
  }

  .settings-entry > ha-icon,
  .settings-entry > .settings-glyph {
    flex: none;
    color: var(--mower-muted);
  }

  .settings-entry-copy {
    display: grid;
    flex: 1;
    min-width: 0;
    gap: 2px;
  }

  .settings-entry-title {
    font-size: 0.95rem;
    font-weight: 500;
  }

  .settings-entry-summary {
    overflow: hidden;
    color: var(--mower-muted);
    font-size: 0.8125rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .settings-sheet {
    box-sizing: border-box;
    width: min(560px, calc(100vw - 32px));
    max-width: none;
    max-height: min(760px, calc(100dvh - 32px));
    margin: auto;
    padding: 0;
    border: 1px solid var(--mower-border);
    border-radius: var(--ha-dialog-border-radius, 24px);
    color: var(--mower-text);
    background: var(--mower-dialog);
    box-shadow: var(--dialog-box-shadow, 0 12px 40px rgba(0, 0, 0, 0.35));
    overflow: hidden;
  }

  .settings-sheet[open] {
    display: flex;
    flex-direction: column;
  }

  .settings-sheet::backdrop {
    background: var(--mdc-dialog-scrim-color, rgba(0, 0, 0, 0.45));
  }

  .settings-sheet-header {
    display: flex;
    flex: none;
    align-items: center;
    gap: 12px;
    padding: 14px 12px 12px 20px;
    border-bottom: 1px solid var(--mower-hairline);
  }

  .settings-sheet-header ha-icon {
    color: var(--mower-muted);
  }

  .settings-sheet-header h2 {
    flex: 1;
    min-width: 0;
    margin: 0;
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.3;
  }

  .settings-sheet-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 50%;
    color: var(--mower-text);
    background: transparent;
    cursor: pointer;
  }

  .settings-sheet-close:hover {
    background: var(--mower-fill-strong);
  }

  .settings-sheet-body {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    align-content: start;
    gap: 10px;
    min-height: 0;
    padding: 16px 20px 20px;
    overflow: auto;
    overscroll-behavior: contain;
  }

  .settings-sheet-body > .mowing-automation,
  .settings-sheet-body > .schedule-panel,
  .settings-sheet-body > .device-settings-panel,
  .settings-sheet-body > .preference-panel {
    grid-column: 1 / -1;
  }

  /* On a phone the sheet rises from the bottom edge, like HA's own sheets. */
  @media (max-width: 600px) {
    .settings-sheet {
      width: 100vw;
      max-height: 88dvh;
      margin: auto 0 0;
      border-width: 1px 0 0;
      border-radius: var(--ha-dialog-border-radius, 24px) var(--ha-dialog-border-radius, 24px) 0 0;
    }

    .settings-sheet-body {
      grid-template-columns: minmax(0, 1fr);
      padding: 12px 16px calc(16px + env(safe-area-inset-bottom));
    }
  }
`;

export type SettingsEntryModel = {
  title: string;
  summary: string;
  open: boolean;
  onOpen(event: Event): void;
};

export function renderSettingsEntry(model: SettingsEntryModel): TemplateResult {
  return html`
    <button type="button" class="settings-entry" aria-haspopup="dialog" aria-expanded=${String(model.open)} @click=${model.onOpen}>
      <ha-icon icon="mdi:tune-variant"></ha-icon>
      <span class="settings-entry-copy">
        <span class="settings-entry-title">${model.title}</span>
        ${model.summary ? html`<span class="settings-entry-summary">${model.summary}</span>` : nothing}
      </span>
      ${icon(chevronPath)}
    </button>
  `;
}

export type SettingsSheetModel = {
  title: string;
  closeLabel: string;
  body: TemplateResult;
  onClose(): void;
};

export function renderSettingsSheet(model: SettingsSheetModel): TemplateResult {
  return html`
    <dialog
      class="settings-sheet"
      aria-labelledby="settings-sheet-title"
      @cancel=${(event: Event) => { event.preventDefault(); model.onClose(); }}
      @click=${(event: Event) => { if (event.target === event.currentTarget) model.onClose(); }}
    >
      <div class="settings-sheet-header">
        <ha-icon icon="mdi:tune-variant"></ha-icon>
        <h2 id="settings-sheet-title">${model.title}</h2>
        <button type="button" class="settings-sheet-close" aria-label=${model.closeLabel} @click=${model.onClose}>
          ${icon(closePath)}
        </button>
      </div>
      <div class="settings-sheet-body">${model.body}</div>
    </dialog>
  `;
}
