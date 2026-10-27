import { css, html, nothing, type TemplateResult } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import type { CardAppearance } from "./card-appearance";
import type { MowerAlertSeverity } from "./mower-alerts";

export type CardLayout = "default" | "compact" | "wide" | "hero" | "tile";

export type GridOptions = {
  columns: number | "full";
  rows: number | "auto";
  min_columns?: number;
  max_columns?: number;
  min_rows?: number;
  max_rows?: number;
};

/**
 * Sizes in a Sections view (12 columns, 56px rows). The tile is one row and half a
 * section by default, like Home Assistant's tile card; the other layouts follow their
 * content's height and keep enough width to stay readable.
 */
export function cardGridOptions(layout: CardLayout): GridOptions {
  if (layout === "tile") return { columns: 6, rows: 1, min_columns: 6, min_rows: 1, max_rows: 1 };
  if (layout === "compact") return { columns: 12, rows: "auto", min_columns: 6 };
  return { columns: 12, rows: "auto", min_columns: 9 };
}

/** The tile's one line: the reason when something needs attention, otherwise state and numbers. */
export function tileSecondary(
  stateLabel: string, alert: string | undefined, details: ReadonlyArray<string | undefined>,
): string {
  if (alert) return alert;
  return [stateLabel, ...details].filter((part): part is string => Boolean(part?.trim())).join(" · ");
}

export const tileLayoutStyles = css`
  /* One Sections row is 56px including the card's border, so the card owns the height
     and the row only fills what is left inside it. */
  ha-card.tile-card {
    display: flex;
    height: 100%;
    min-height: 56px;
    box-sizing: border-box;
  }

  .mower-tile {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 10px;
    min-width: 0;
    padding: 0 10px;
  }

  .tile-body {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 10px;
    min-width: 0;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    color: var(--mower-text);
    background: none;
    font: inherit;
    text-align: start;
    cursor: pointer;
  }

  .tile-body:focus-visible,
  .tile-action:focus-visible {
    outline: 2px solid var(--mower-accent);
    outline-offset: -2px;
    border-radius: var(--mower-radius-control);
  }

  .tile-icon {
    display: grid;
    flex: none;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    color: var(--mower-state, var(--mower-muted));
    background: color-mix(in srgb, var(--mower-state, var(--mower-muted)) 18%, transparent);
  }

  .tile-icon.alert-error { --mower-state: var(--mower-error); }
  .tile-icon.alert-warning { --mower-state: var(--mower-warning); }

  .tile-icon ha-icon {
    --mdc-icon-size: 22px;
  }

  .tile-copy {
    display: grid;
    min-width: 0;
    line-height: 1.3;
  }

  .tile-name,
  .tile-secondary {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tile-name {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .tile-secondary {
    color: var(--mower-muted);
    font-size: 0.75rem;
  }

  .tile-secondary.error {
    color: var(--mower-error);
  }

  .tile-live {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .tile-action {
    display: grid;
    flex: none;
    place-items: center;
    width: 36px;
    height: 36px;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: var(--mower-radius-control);
    color: var(--mower-text);
    background: var(--mower-fill-strong);
    cursor: pointer;
  }

  .tile-action:hover {
    background: var(--mower-fill-accent-strong);
  }

  .tile-action:disabled {
    cursor: default;
    opacity: 0.4;
  }

  .tile-action ha-icon {
    --mdc-icon-size: 20px;
  }
`;

export type TileModel = {
  title: string;
  stateKey: string;
  secondary: string;
  alertSeverity?: MowerAlertSeverity;
  /** The result of the tile's action; it replaces the line so a failure is never silent. */
  feedback?: { message: string; error: boolean };
  appearance: CardAppearance;
  locale: string;
  action?: { label: string; icon: string; disabled: boolean; handler(): void | Promise<void> };
  onMoreInfo(): void;
};

export function renderTile(model: TileModel): TemplateResult {
  const feedback = model.feedback;
  const severity = feedback?.error ? "error" : model.alertSeverity;
  const alert = severity && severity !== "info" ? ` alert-${severity}` : "";
  return html`
    <ha-card class=${`tile-card${model.appearance.classes}`} style=${styleMap(model.appearance.styles)} lang=${model.locale}>
      <div class="mower-tile">
        <button type="button" class="tile-body" @click=${model.onMoreInfo}>
          <span class=${`tile-icon state-${model.stateKey}${alert}`} aria-hidden="true">
            <ha-icon icon=${alert ? "mdi:alert-circle-outline" : "mdi:robot-mower"}></ha-icon>
          </span>
          <span class="tile-copy">
            <span class="tile-name">${model.title}</span>
            ${feedback
              ? html`<span class=${`tile-secondary${feedback.error ? " error" : ""}`} title=${feedback.message}>${feedback.message}</span>`
              : html`<span class="tile-secondary" title=${model.secondary}>${model.secondary}</span>`}
          </span>
        </button>
        <!-- Announced from outside the button: a live region inside a button isn't read reliably. -->
        <span class="tile-live" role=${feedback?.error ? "alert" : "status"}>${feedback?.message ?? ""}</span>
        ${model.action ? html`
          <button type="button" class="tile-action" aria-label=${model.action.label} title=${model.action.label}
            ?disabled=${model.action.disabled} @click=${model.action.handler}>
            <ha-icon icon=${model.action.icon}></ha-icon>
          </button>` : nothing}
      </div>
    </ha-card>
  `;
}
