import { css, html, nothing, type TemplateResult } from "lit";
import type { Translator } from "./localization";

export type StandardMediaView = "map" | "point-cloud" | "camera";

/** Views the standard layouts can show, in switch order. */
export function standardMediaViews(showMap: boolean, showPointCloud: boolean, showCamera = false): StandardMediaView[] {
  return [
    ...(showMap ? ["map" as const] : []),
    ...(showPointCloud ? ["point-cloud" as const] : []),
    ...(showCamera ? ["camera" as const] : []),
  ];
}

/** Keeps the chosen view while it exists; otherwise the first one, or none. */
export function resolveStandardMedia(
  chosen: StandardMediaView, views: readonly StandardMediaView[],
): StandardMediaView | undefined {
  return views.includes(chosen) ? chosen : views[0];
}

export const mediaSwitchStyles = css`
  .media-switch {
    display: inline-grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    justify-self: start;
    gap: 2px;
    padding: 3px;
    border: 1px solid var(--mower-border);
    border-radius: var(--mower-radius-control);
    background: var(--mower-fill);
  }

  .media-switch button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 88px;
    min-height: 34px;
    margin: 0;
    padding: 4px 14px;
    border: 0;
    border-radius: calc(var(--mower-radius-control) - 2px);
    color: var(--mower-muted);
    background: transparent;
    font: inherit;
    font-size: 0.875rem;
    cursor: pointer;
  }

  .media-switch button[aria-selected="true"] {
    color: var(--mower-text);
    background: var(--mower-fill-accent-strong);
    font-weight: 500;
  }

  .media-switch button:hover {
    color: var(--mower-text);
  }

  .media-switch button:focus-visible {
    outline: 2px solid var(--mower-accent);
    outline-offset: 1px;
  }

  .media-switch ha-icon {
    --mdc-icon-size: 18px;
  }
`;

export type MediaSwitchModel = {
  views: readonly StandardMediaView[];
  active?: StandardMediaView;
  t: Translator;
  onSelect(view: StandardMediaView): void;
};

const LABELS = {
  map: { key: "hero.map", icon: "mdi:map-outline" },
  "point-cloud": { key: "action.pointCloud", icon: "mdi:rotate-3d-variant" },
  camera: { key: "hero.camera", icon: "mdi:video-wireless-outline" },
} as const;

/** Tabs follow the ARIA pattern: arrows, Home and End choose and focus a view. */
function switchKeydown(event: KeyboardEvent, model: MediaSwitchModel): void {
  const views = model.views;
  const index = views.indexOf(model.active!);
  const next = {
    ArrowRight: views[(index + 1) % views.length],
    ArrowLeft: views[(index - 1 + views.length) % views.length],
    Home: views[0],
    End: views[views.length - 1],
  }[event.key];
  if (!next) return;
  event.preventDefault();
  model.onSelect(next);
  const list = event.currentTarget as HTMLElement;
  void Promise.resolve().then(() => list.querySelector<HTMLElement>(`#media-tab-${next}`)?.focus());
}

/** Nothing to switch with a single view; it simply shows. */
export function renderMediaSwitch(model: MediaSwitchModel): TemplateResult | typeof nothing {
  if (model.views.length < 2) return nothing;
  return html`
    <div class="media-switch" role="tablist" aria-label=${model.t("hero.viewLabel")}
      @keydown=${(event: KeyboardEvent) => switchKeydown(event, model)}>
      ${model.views.map(view => {
        const selected = view === model.active;
        return html`
          <button type="button" role="tab" id=${`media-tab-${view}`} aria-controls=${`media-panel-${view}`}
            aria-selected=${String(selected)} tabindex=${selected ? "0" : "-1"}
            @click=${() => model.onSelect(view)}>
            <ha-icon icon=${LABELS[view].icon}></ha-icon>
            <span>${model.t(LABELS[view].key)}</span>
          </button>`;
      })}
    </div>
  `;
}
