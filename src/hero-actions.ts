import { html, nothing, type TemplateResult } from "lit";
import type { HeroLayoutModel, HeroView } from "./hero-layout";
import { isHeroViewAvailable, showHeroViewTabs } from "./hero-views.ts";

/** The command result follows its controls in each composition. */
export function renderHeroActionFeedback(model: HeroLayoutModel) {
  return html`${model.actionFeedback
          ? html`
              <div
                class=${`hero-action-feedback${
                  model.actionFeedback.error ? " error" : ""
                }`}
                role=${model.actionFeedback.error ? "alert" : "status"}
                aria-live=${model.actionFeedback.error ? "assertive" : "polite"}
              >
                <ha-icon
                  icon=${model.actionFeedback.error
                    ? "mdi:alert-circle-outline"
                    : "mdi:wifi-sync"}
                ></ha-icon>
                <span>${model.actionFeedback.message}</span>
              </div>
            `
          : nothing}`;
}

function renderAction(
  label: string,
  icon: string,
  handler: () => void | Promise<void>,
  options: { disabled?: boolean; active?: boolean; primary?: boolean; expanded?: boolean; more?: boolean } = {},
): TemplateResult {
  return html`
    <button
      class=${`hero-action${options.active ? " active" : ""}${options.primary ? " primary" : ""}${options.more ? " more" : ""}`}
      aria-haspopup=${options.more ? "menu" : nothing}
      aria-label=${label}
      aria-expanded=${options.expanded === undefined ? nothing : String(options.expanded)}
      title=${label}
      ?disabled=${options.disabled}
      @click=${handler}
    >
      <ha-icon .icon=${icon}></ha-icon>
      <span>${label}</span>
    </button>
  `;
}

type ActionEntry = {
  label: string;
  icon: string;
  handler: () => void | Promise<void>;
  options?: { disabled?: boolean; active?: boolean; primary?: boolean; expanded?: boolean };
};

/** The row holds this many buttons, More included, until the card's width is known. */
export const HERO_ACTION_ROW = 5;

/**
 * Readable buttons that fit in a card this wide: 80px buttons (room for "Maintenance"
 * on one line), 8px gaps and 12px side gutters.
 */
export function actionRowCapacity(cardWidth: number): number {
  return Math.max(3, Math.floor((cardWidth - 2 * 12 + 8) / (80 + 8)));
}

/** One row: when commands, helpers and More don't fit, the helpers move into the More menu. */
export function helpersInMenu(commands: number, helpers: number, capacity = HERO_ACTION_ROW): boolean {
  return helpers > 0 && commands + helpers + 1 > capacity;
}

/** Mower commands always stay on the row; helpers and views join them only while everything fits. */
export function heroActionEntries(model: HeroLayoutModel): { commands: ActionEntry[]; helpers: ActionEntry[] } {
  const { visible, primary } = model.commands;
  // The tab bar already switches views; the action row only repeats them when there are no tabs.
  const viewButtons = !showHeroViewTabs(model.availableViews);
  const commands: ActionEntry[] = [];
  if (model.showDefaultActions) {
    if (model.supportsStart && (visible.has("start") || model.startMenuOpen)) {
      commands.push({
        label: model.startMenuOpen ? model.t("custom.cancel") : model.t("action.start"),
        icon: model.startMenuOpen ? "mdi:chevron-down" : "mdi:play",
        handler: model.onStart,
        options: { disabled: !model.canStart, primary: primary === "start", expanded: model.startMenuOpen },
      });
    }
    if (model.supportsPause && visible.has("pause")) {
      commands.push({ label: model.t("action.pause"), icon: "mdi:pause", handler: model.onPause,
        options: { disabled: !model.canPause, primary: primary === "pause" } });
    }
    if (model.supportsCancelTask && visible.has("cancel")) {
      commands.push({ label: model.t("action.cancelTask"), icon: "mdi:stop-circle-outline",
        handler: model.onCancelTask, options: { disabled: !model.canCancelTask } });
    }
    if (model.supportsDock && visible.has("dock")) {
      commands.push({ label: model.dockActionLabel, icon: "mdi:home-import-outline",
        handler: model.onDock, options: { disabled: !model.canDock } });
    }
    for (const action of model.patrolActions || []) {
      commands.push({ label: action.label, icon: action.icon || "mdi:shield-outline",
        handler: action.handler, options: { disabled: action.disabled } });
    }
  }
  const helpers: ActionEntry[] = [];
  if (model.showHelperActions) {
    for (const action of model.helperActions || []) {
      helpers.push({ label: action.label, icon: action.icon || "mdi:information-outline",
        handler: action.handler, options: { disabled: action.disabled } });
    }
    const views: Array<[HeroView, string, string]> = [
      ["camera", model.t("action.camera"), "mdi:video-wireless-outline"],
      ["map", model.t("action.map"), "mdi:map-outline"],
      ["photos", model.t("hero.photos"), "mdi:image-multiple-outline"],
      ["point-cloud", model.t("action.pointCloud"), "mdi:rotate-3d-variant"],
    ];
    for (const [view, label, icon] of views) {
      if (viewButtons && isHeroViewAvailable(view, model.availableViews)) {
        helpers.push({ label, icon, handler: () => model.onView(view), options: { active: model.activeView === view } });
      }
    }
    if (model.onMaintenancePoint) {
      helpers.push({ label: model.t("action.maintenance"), icon: "mdi:map-marker-wrench",
        handler: model.onMaintenancePoint, options: { disabled: !model.maintenancePointAvailable } });
    }
  }
  return { commands, helpers };
}

/**
 * Menu keyboard model: arrows, Home and End move between items, Escape closes and
 * returns to More, and Tab or focus leaving the menu closes it.
 */
function menuKeydown(event: KeyboardEvent, close: (restoreFocus: boolean) => void): void {
  const menu = event.currentTarget as HTMLElement;
  const items = [...menu.querySelectorAll<HTMLElement>(".hero-menu-item:not(:disabled)")];
  const index = items.indexOf(event.target as HTMLElement);
  const target = {
    ArrowDown: items[(index + 1) % items.length],
    ArrowUp: items[(index - 1 + items.length) % items.length],
    Home: items[0],
    End: items[items.length - 1],
  }[event.key];
  if (target) {
    event.preventDefault();
    target.focus();
  } else if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    close(true);
  } else if (event.key === "Tab") {
    close(false);
  }
}

function menuFocusout(event: FocusEvent, close: (restoreFocus: boolean) => void): void {
  const next = event.relatedTarget as HTMLElement | null;
  const menu = event.currentTarget as HTMLElement;
  // Moving to More is its own toggle; anywhere else outside the menu closes it.
  if (!next || (!menu.contains(next) && !next.classList.contains("more"))) close(false);
}

function renderMenuItem(entry: ActionEntry, close: () => void): TemplateResult {
  return html`
    <button type="button" class=${`hero-menu-item${entry.options?.active ? " active" : ""}`} role="menuitem"
      tabindex="-1"
      ?disabled=${entry.options?.disabled}
      @click=${() => { close(); void entry.handler(); }}>
      <ha-icon .icon=${entry.icon}></ha-icon>
      <span>${entry.label}</span>
    </button>
  `;
}

/** Shared action handlers, availability and feedback remain owned by the card. */
export function renderHeroActions(model: HeroLayoutModel): TemplateResult {
  const { commands, helpers } = heroActionEntries(model);
  // The dashboard layout has its own multi-column command grid, so it keeps every button.
  const menu = !model.dashboard && Boolean(model.onMoreMenu) && helpersInMenu(commands.length, helpers.length, model.actionRowCapacity);
  const inline = menu ? commands : [...commands, ...helpers];
  const open = menu && Boolean(model.moreMenuOpen);
  const close = (restoreFocus = true) => model.onMoreMenu?.(false, restoreFocus);
  return html`
        <div class="hero-actions" aria-label=${model.t("hero.controlsLabel")}
          @keydown=${(event: KeyboardEvent) => { if (open && event.key === "Escape") { event.stopPropagation(); close(); } }}>
          ${inline.map(entry => renderAction(entry.label, entry.icon, entry.handler, entry.options))}
          ${menu
            ? renderAction(model.t("action.more"), "mdi:dots-horizontal", () => model.onMoreMenu?.(!open), { expanded: open, more: true })
            : renderAction(model.t("action.more"), "mdi:dots-horizontal", model.onMoreInfo)}
        </div>
        ${open ? html`
          <div class="hero-menu" role="menu" aria-label=${model.t("action.more")}
            @keydown=${(event: KeyboardEvent) => menuKeydown(event, close)}
            @focusout=${(event: FocusEvent) => menuFocusout(event, close)}>
            ${helpers.map(entry => renderMenuItem(entry, () => close()))}
            ${renderMenuItem({ label: model.t("action.details"), icon: "mdi:information-outline", handler: model.onMoreInfo }, () => close())}
          </div>` : nothing}
        ${model.confirmation || nothing}
  `;
}
