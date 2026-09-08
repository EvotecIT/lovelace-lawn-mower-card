import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createTranslator, type SupportedLocale } from "./localization";

/** An inline confirmation stays usable in HA webviews that suppress native dialogs. */
@customElement("lawn-mower-action-confirmation")
export class ActionConfirmation extends LitElement {
  @property({ attribute:false }) message = "";
  @property({ attribute:false }) locale: SupportedLocale = "en";
  @property({ attribute:false }) onCancel!: () => void;
  @property({ attribute:false }) onConfirm!: () => void;
  static styles = css`
    :host { display:block; margin-top:10px; }
    section { padding:14px; border:1px solid var(--mower-accent,var(--primary-color)); border-radius:12px; background:var(--mower-surface,var(--card-background-color)); color:var(--mower-text,var(--primary-text-color)); }
    p { margin:0 0 12px; overflow-wrap:anywhere; }
    div { display:flex; flex-wrap:wrap; gap:8px; }
    button { min-height:44px; padding:8px 16px; border:1px solid var(--mower-border,var(--divider-color)); border-radius:8px; background:transparent; color:inherit; font:inherit; cursor:pointer; }
    button.confirm { border-color:var(--mower-accent,var(--primary-color)); font-weight:600; }
    button:focus-visible { outline:2px solid var(--mower-accent,var(--primary-color)); outline-offset:2px; }
  `;
  protected firstUpdated() { this.renderRoot.querySelector<HTMLButtonElement>("button")?.focus(); }
  protected render() {
    const t=createTranslator(this.locale);
    return html`<section role="alertdialog" aria-label=${t("custom.confirmAction")} aria-describedby="confirmation-message" @keydown=${(event: KeyboardEvent) => { if (event.key === "Escape") { event.stopPropagation(); this.onCancel(); } }}>
      <p id="confirmation-message">${this.message}</p>
      <div><button type="button" @click=${this.onCancel}>${t("custom.cancel")}</button><button type="button" class="confirm" @click=${this.onConfirm}>${t("custom.confirmAction")}</button></div>
    </section>`;
  }
}
