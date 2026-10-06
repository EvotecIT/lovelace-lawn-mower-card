import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createTranslator, type SupportedLocale } from "./localization";

/**
 * Inline Start menu for mowers that can mow one area at a time: start
 * everything right away, or pick an area first and then start it.
 */
@customElement("lawn-mower-area-start-menu")
export class AreaStartMenu extends LitElement {
  @property({ attribute:false }) areas: string[] = [];
  @property({ attribute:false }) locale: SupportedLocale = "en";
  @property({ attribute:false }) disabled = false;
  @property({ attribute:false }) onCancel!: () => void;
  @property({ attribute:false }) onStartAll!: () => void;
  @property({ attribute:false }) onStartArea!: (area: string) => void;
  @state() private _selected?: string;
  static styles = css`
    :host { display:block; margin-top:10px; }
    section { display:grid; gap:10px; padding:14px; border:1px solid var(--mower-accent,var(--primary-color)); border-radius:12px; background:var(--mower-surface,var(--card-background-color)); color:var(--mower-text,var(--primary-text-color)); }
    h3 { margin:0; font-size:1rem; font-weight:600; }
    p { margin:0; color:var(--mower-muted,var(--secondary-text-color)); font-size:.85rem; }
    .areas { display:flex; flex-wrap:wrap; gap:8px; }
    .footer { display:flex; flex-wrap:wrap; gap:8px; }
    button { display:inline-flex; align-items:center; gap:6px; min-height:44px; padding:8px 16px; border:1px solid var(--mower-border,var(--divider-color)); border-radius:8px; background:transparent; color:inherit; font:inherit; cursor:pointer; }
    button.primary { border-color:var(--mower-accent,var(--primary-color)); font-weight:600; }
    button.area[aria-pressed="true"] { border-color:var(--mower-accent,var(--primary-color)); background:color-mix(in srgb,var(--mower-accent,var(--primary-color)) 16%,transparent); font-weight:600; }
    button:disabled { cursor:not-allowed; opacity:.55; }
    button:focus-visible { outline:2px solid var(--mower-accent,var(--primary-color)); outline-offset:2px; }
    ha-icon { --mdc-icon-size:20px; }
  `;
  protected firstUpdated() { this.renderRoot.querySelector<HTMLButtonElement>("button")?.focus(); }
  protected willUpdate() {
    if (this._selected !== undefined && !this.areas.includes(this._selected)) this._selected = undefined;
  }
  protected render() {
    const t=createTranslator(this.locale);
    const selected=this._selected;
    return html`<section role="dialog" aria-labelledby="area-menu-title" @keydown=${(event: KeyboardEvent) => { if (event.key === "Escape") { event.stopPropagation(); this.onCancel(); } }}>
      <h3 id="area-menu-title">${t("area.menuLabel")}</h3>
      <div class="footer"><button type="button" class="primary" ?disabled=${this.disabled} @click=${this.onStartAll}><ha-icon icon="mdi:play"></ha-icon>${t("area.allAreas")}</button></div>
      <p id="area-menu-choose">${t("area.chooseArea")}</p>
      <div class="areas" role="group" aria-labelledby="area-menu-choose">${this.areas.map((area) => html`<button type="button" class="area" aria-pressed=${area === selected ? "true" : "false"} @click=${() => { this._selected = area; }}>${area}</button>`)}</div>
      <div class="footer"><button type="button" @click=${this.onCancel}>${t("custom.cancel")}</button><button type="button" class="primary" ?disabled=${this.disabled || !selected} @click=${() => { if (selected) this.onStartArea(selected); }}><ha-icon icon="mdi:play-circle-outline"></ha-icon>${selected ? t("area.startArea", { area: selected }) : t("area.startSelected")}</button></div>
    </section>`;
  }
}
