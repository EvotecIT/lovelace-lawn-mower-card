import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { DisplayCondition, HomeAssistant, LawnMowerActionConfig, LawnMowerCardConfig, LawnMowerTileConfig } from "./card-config";
import { HERO_SECTIONS, heroSections, summaryConfig, type HeroSection } from "./card-customization";
import { createTranslator, type SupportedLocale, type TranslationKey } from "./localization";
import { lawnMowerCardEditorStyles } from "./lawn-mower-card-editor-styles";

type Collection = "control_entities" | "summary_entities" | "tiles" | "actions";
const titles: Record<Collection, TranslationKey> = {
  control_entities: "editor.controls", summary_entities: "editor.summaries", tiles: "editor.tiles", actions: "editor.actions",
};
const sectionTitles: Record<HeroSection, TranslationKey> = {
  controls: "editor.controls", tiles: "editor.tiles", actions: "editor.actions", details: "editor.showAdvanced",
};

/** Owns collection editing for every layout; draft JSON never reaches the card. */
@customElement("lawn-mower-customization-editor")
export class CustomizationEditor extends LitElement {
  @property({ attribute: false }) config!: LawnMowerCardConfig;
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) locale: SupportedLocale = "en";
  @property({ attribute: false }) onChange!: (config: LawnMowerCardConfig) => void;
  @state() private drafts: Record<number, string> = {};
  private draftActions?: LawnMowerCardConfig["actions"];

  static styles = [lawnMowerCardEditorStyles, css`
    :host { display:grid; gap:12px; container-type:inline-size; }
    .row-actions { flex-wrap:wrap; }
    .row-actions button { min-height:44px; }
    button:disabled { opacity:.4; cursor:default; }
    button:focus-visible, input:focus-visible, select:focus-visible { outline:2px solid var(--primary-color); outline-offset:2px; }
    button.danger { color:var(--error-color,#b83d3d); }
    .section-order { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; }
    .section-order label { display:flex; gap:8px; align-items:center; min-width:0; }
    .section-order input { width:auto; }
    details > summary { cursor:pointer; padding:8px 0; color:var(--secondary-text-color); }
    .detail-fields { display:grid; gap:10px; padding-top:10px; }
    @container (max-width:480px) { .row-grid { grid-template-columns:1fr; } .section-header { display:grid; } }
  `];

  private get t() { return createTranslator(this.locale); }

  private change(config: LawnMowerCardConfig) {
    this.draftActions = config.actions;
    this.config = config;
    this.onChange(config);
  }

  protected willUpdate(changed: PropertyValues) {
    if (changed.has("config") && this.config?.actions !== this.draftActions) {
      this.drafts = {};
      this.draftActions = this.config?.actions;
    }
  }

  protected render() {
    if (!this.config) return nothing;
    return html`
      ${this.appearance()}
      ${(["control_entities", "summary_entities", "tiles", "actions"] as Collection[]).map(key => this.collection(key))}
      <datalist id="custom-entities">${Object.keys(this.hass?.states || {}).sort().map(id => html`<option value=${id}></option>`)}</datalist>
      <datalist id="custom-controls">${Object.keys(this.hass?.states || {}).filter(id => /^(select|number|switch|time)\./.test(id)).sort().map(id => html`<option value=${id}></option>`)}</datalist>
    `;
  }

  private select(label: string, value: string, options: Array<[string, string]>, changed: (value: string) => void) {
    return html`<label><span>${label}</span><select @change=${(event: Event) => changed((event.currentTarget as HTMLSelectElement).value)}>
      ${options.map(([id, text]) => html`<option value=${id} ?selected=${value === id}>${text}</option>`)}
    </select></label>`;
  }

  private appearance() {
    const config = this.config;
    const sections = heroSections(config.hero_sections);
    const rows = [...sections, ...HERO_SECTIONS.filter(section => !sections.includes(section))];
    return html`<div class="section">
      <strong>${this.t("custom.appearance")}</strong>
      <div class="row-grid">
        ${this.select(this.t("appearance.preset"), config.appearance || "legacy", [["legacy", this.t("custom.existingDefault")], ["native", this.t("appearance.native")], ["modern", this.t("appearance.modern")], ["minimal", this.t("appearance.minimal")]], value => { const next = { ...config }; if (value === "legacy") delete next.appearance; else next.appearance = value as LawnMowerCardConfig["appearance"]; this.change(next); })}
        ${config.appearance ? this.select(this.t("appearance.surface"), config.surface || "solid", [["solid", this.t("appearance.solid")], ["tinted", this.t("appearance.tinted")], ["translucent", this.t("appearance.translucent")]], value => this.change({ ...config, surface: value as LawnMowerCardConfig["surface"] })) : nothing}
        ${config.layout === "hero" ? this.select(this.t("custom.density"), config.hero_density || "comfortable", [["comfortable", this.t("custom.comfortable")], ["compact", this.t("editor.layoutCompact")]], value => this.change({ ...config, hero_density: value as LawnMowerCardConfig["hero_density"] })) : nothing}
        ${config.layout === "hero" && !config.appearance ? this.select(this.t("custom.theme"), config.hero_theme || "dark", [["dark", this.t("custom.original")], ["auto", this.t("custom.followTheme")]], value => this.change({ ...config, hero_theme: value as LawnMowerCardConfig["hero_theme"] })) : nothing}
        ${this.select(this.t("custom.columns"), String(config.tile_columns || "auto"), [["auto", this.t("common.automatic")], ...[1,2,3,4].map(n => [String(n), String(n)] as [string,string])], value => {
          const next = { ...config };
          if (value === "auto") delete next.tile_columns;
          else next.tile_columns = Number(value) as LawnMowerCardConfig["tile_columns"];
          this.change(next);
        })}
      </div>
      ${config.appearance ? html`<span class="hint">${this.t("appearance.hint")}</span>
        <details><summary>${this.t("appearance.advanced")}</summary><div class="detail-fields">
          ${this.textField(this.t("appearance.accent"), config.accent_color, value => { const next={...config}; if (!value) delete next.accent_color; else next.accent_color=value; this.change(next); })}
          <span class="hint">${this.t("appearance.accentHint")}</span>
          ${this.numberField("appearance.radius", "corner_radius", 0, 32)}
          ${this.select(this.t("appearance.shadow"), config.card_shadow || "preset", [["preset", this.t("appearance.presetDefault")], ["theme", this.t("custom.followTheme")], ["none", this.t("appearance.none")], ["soft", this.t("appearance.soft")]], value => { const next={...config}; if(value === "preset") delete next.card_shadow; else next.card_shadow=value as LawnMowerCardConfig["card_shadow"]; this.change(next); })}
          ${config.surface === "translucent" ? this.numberField("appearance.opacity", "surface_opacity", 60, 100) : nothing}
        </div></details>` : nothing}
      ${config.layout === "hero" ? html`
      ${this.select(this.t("appearance.artwork"), config.hero_artwork || "auto", [["auto", this.t("appearance.presetDefault")], ["image", this.t("appearance.image")], ["none", this.t("appearance.none")]], value => this.change({ ...config, hero_artwork: value as LawnMowerCardConfig["hero_artwork"] }))}
      ${this.numberField("appearance.overlay", "hero_overlay", 0, 100)}
      <strong>${this.t("custom.sectionOrder")}</strong>
      <span class="hint">${this.t("custom.sectionHint")}</span>
      ${rows.map(section => html`<div class="section-order">
        <label><input type="checkbox" .checked=${sections.includes(section)} @change=${(event: Event) => this.change({ ...config, hero_sections: (event.currentTarget as HTMLInputElement).checked ? [...sections, section] : sections.filter(item => item !== section) })}>${this.t(sectionTitles[section])}</label>
        ${this.moveButtons(sections.indexOf(section), sections.length, this.t(sectionTitles[section]), direction => {
          const ordered = [...sections]; const index = ordered.indexOf(section);
          [ordered[index], ordered[index + direction]] = [ordered[index + direction], ordered[index]];
          this.change({ ...config, hero_sections: ordered });
        })}
      </div>`)}
      <button type="button" @click=${() => { const next = { ...config }; delete next.hero_sections; this.change(next); }}>${this.t("custom.resetOrder")}</button>` : nothing}
    </div>`;
  }

  private numberField(label: TranslationKey, key: "corner_radius" | "surface_opacity" | "hero_overlay", min: number, max: number) {
    return html`<label><span>${this.t(label)}</span><input type="number" min=${min} max=${max} step="1" placeholder=${this.t("appearance.presetDefault")} .value=${this.config[key] === undefined ? "" : String(this.config[key])} @input=${(event: Event) => {
      const input=event.currentTarget as HTMLInputElement;
      if (!input.validity.valid) return;
      const next={...this.config};
      if (input.value === "") delete next[key]; else next[key]=Number(input.value);
      this.change(next);
    }}></label>`;
  }

  private collection(key: Collection) {
    const items = this.config[key] || [];
    const modeKey = key === "control_entities" ? "controls_mode" : key === "summary_entities" ? "summary_mode" : undefined;
    return html`<section class="section" aria-label=${this.t(titles[key])}>
      <div class="section-header"><div class="section-title"><strong>${this.t(titles[key])}</strong></div>
        <button type="button" @click=${() => this.add(key)}>${this.t(key === "control_entities" ? "editor.addControl" : key === "summary_entities" ? "editor.addSummary" : key === "tiles" ? "editor.addTile" : "editor.addAction")}</button>
      </div>
      ${modeKey ? this.select(this.t("custom.contentMode"), this.config[modeKey] || "legacy", [
        ["legacy", this.t("custom.existingDefault")], ["auto", this.t("common.automatic")], ["append", this.t("custom.append")], ["custom", this.t("custom.only")], ["hidden", this.t("custom.hidden")],
      ], value => { const next = { ...this.config }; if (value === "legacy") delete next[modeKey]; else next[modeKey] = value as LawnMowerCardConfig[typeof modeKey]; this.change(next); }) : nothing}
      ${modeKey ? html`<span class="hint">${this.t("custom.modeHint")}</span>` : nothing}
      ${!items.length ? html`<span class="hint">${this.t("custom.empty")}</span>` : nothing}
      <div class="collection">${items.map((item, index) => html`<div class="row">
        ${key === "control_entities" ? this.textField(this.t("editor.controlEntity"), String(item), value => this.updateItem(key, index, value), "custom-controls")
          : key === "actions" ? this.actionFields(item as LawnMowerActionConfig, index)
          : this.tileFields(summaryConfig(item as string | LawnMowerTileConfig), key, index)}
        <div class="row-actions">
          ${this.moveButtons(index, items.length, `${this.t(titles[key])} ${index + 1}`, direction => this.move(key, index, direction))}
          <button type="button" class="danger" @click=${() => this.removeItem(key, index)}>${this.t(key === "control_entities" ? "editor.removeControl" : key === "summary_entities" ? "editor.removeSummary" : key === "tiles" ? "editor.removeTile" : "editor.removeAction")}</button>
        </div>
      </div>`)}</div>
    </section>`;
  }

  private textField(label: string, value: string | undefined, changed: (value: string) => void, list?: string) {
    return html`<label><span>${label}</span><input .value=${value || ""} list=${list || nothing} @input=${(event: Event) => changed((event.currentTarget as HTMLInputElement).value)}></label>`;
  }

  private tileFields(tile: LawnMowerTileConfig, key: "summary_entities" | "tiles", index: number) {
    const update = (field: "entity" | "label" | "icon" | "attribute" | "unit", value: string) => {
      const next = { ...tile }; if (value || field === "entity") next[field] = value; else delete next[field]; this.updateItem(key, index, next);
    };
    return html`<div class="row-grid">
      ${this.textField(this.t("common.entity"), tile.entity, value => update("entity", value), "custom-entities")}
      ${this.textField(this.t("common.label"), tile.label, value => update("label", value))}
      ${this.textField(this.t("common.icon"), tile.icon, value => update("icon", value))}
    </div>
    <details><summary>${this.t("custom.valueVisibility")}</summary><div class="detail-fields">
      <div class="row-grid">
        ${this.textField(this.t("custom.attribute"), tile.attribute, value => update("attribute", value))}
        ${this.textField(this.t("custom.unit"), tile.unit, value => update("unit", value))}
      </div>
      <label class="toggle"><span>${this.t("custom.showUnavailable")}</span><input type="checkbox" .checked=${tile.show_unavailable === true} @change=${(event: Event) => this.updateItem(key, index, { ...tile, show_unavailable: (event.currentTarget as HTMLInputElement).checked })}></label>
      ${this.visibility(tile.visibility, visibility => this.updateItem(key, index, { ...tile, visibility }))}
    </div></details>`;
  }

  private actionFields(action: LawnMowerActionConfig, index: number) {
    const update = (field: "label" | "icon" | "entity" | "service" | "confirmation", value: string) => {
      const next = { ...action }; if (value) next[field] = value; else delete next[field]; this.updateItem("actions", index, next);
    };
    const type = action.type || "more-info";
    const raw = this.drafts[index] ?? (action.service_data ? JSON.stringify(action.service_data, null, 2) : "");
    const invalid = !validServiceData(raw);
    return html`<div class="row-grid">
      ${this.select(this.t("common.type"), type, [
        ["more-info", this.t("action.moreInfo")], ["service", this.t("common.service")], ["start", this.t("action.start")], ["pause", this.t("action.pause")], ["dock", this.t("action.dock")],
      ], value => {
        const next = { ...action, type: value as LawnMowerActionConfig["type"] };
        if (value !== "service") { delete next.service; delete next.service_data; delete this.drafts[index]; }
        if (value !== "more-info") delete next.entity;
        this.updateItem("actions", index, next);
      })}
      ${this.textField(this.t("common.label"), action.label, value => update("label", value))}
      ${this.textField(this.t("common.icon"), action.icon, value => update("icon", value))}
      ${type === "more-info" ? this.textField(this.t("editor.targetEntity"), action.entity, value => update("entity", value), "custom-entities") : nothing}
      ${type === "service" ? this.textField(this.t("common.service"), action.service, value => update("service", value)) : nothing}
    </div>
    ${type === "service" ? html`<label><span>${this.t("editor.serviceData")}</span>
      <textarea .value=${raw} aria-invalid=${invalid ? "true" : "false"} @input=${(event: Event) => this.serviceData(index, action, (event.currentTarget as HTMLTextAreaElement).value)}></textarea>
      <span class=${invalid ? "hint error" : "hint"}>${this.t(invalid ? "editor.serviceDataInvalid" : "editor.serviceDataHint")}</span>
    </label>` : nothing}
    <details><summary>${this.t("custom.visibilityConfirmation")}</summary><div class="detail-fields">
      ${this.textField(this.t("custom.confirmation"), action.confirmation, value => update("confirmation", value))}
      ${this.visibility(action.visibility, visibility => this.updateItem("actions", index, { ...action, visibility }))}
    </div></details>`;
  }

  private visibility(condition: DisplayCondition | undefined, changed: (value: DisplayCondition | undefined) => void) {
    return html`<div class="row-grid">
      ${this.textField(this.t("custom.conditionEntity"), condition?.entity, entity => changed(entity ? { entity, state: condition?.state || "" } : undefined), "custom-entities")}
      ${this.textField(this.t("custom.conditionState"), condition?.state, state => changed({ entity: condition?.entity || "", state }))}
    </div><span class="hint">${this.t("custom.conditionHint")}</span>`;
  }

  private moveButtons(index: number, length: number, label: string, moved: (direction: number) => void) {
    return html`<span class="row-actions">
      <button type="button" aria-label=${`${this.t("custom.moveUp")}: ${label}`} title=${this.t("custom.moveUp")} ?disabled=${index <= 0} @click=${() => moved(-1)}>↑</button>
      <button type="button" aria-label=${`${this.t("custom.moveDown")}: ${label}`} title=${this.t("custom.moveDown")} ?disabled=${index < 0 || index >= length - 1} @click=${() => moved(1)}>↓</button>
    </span>`;
  }

  private updateItem(key: Collection, index: number, value: string | LawnMowerTileConfig | LawnMowerActionConfig) {
    const items = [...(this.config[key] || [])]; items[index] = value;
    this.change({ ...this.config, [key]: items });
  }

  private add(key: Collection) {
    const item = key === "control_entities" || key === "summary_entities" ? "" : key === "tiles" ? { entity: "" } : { type: "more-info" };
    this.change({ ...this.config, [key]: [...(this.config[key] || []), item] });
  }

  private removeItem(key: Collection, index: number) {
    const items = [...(this.config[key] || [])]; items.splice(index, 1);
    if (key === "actions") this.drafts = Object.fromEntries(Object.entries(this.drafts).filter(([id]) => Number(id) !== index).map(([id, value]) => [Number(id) > index ? Number(id) - 1 : Number(id), value]));
    const next = { ...this.config, [key]: items };
    if (!items.length) delete next[key];
    this.change(next);
  }

  private move(key: Collection, index: number, direction: number) {
    const items = [...(this.config[key] || [])]; const other = index + direction;
    if (other < 0 || other >= items.length) return;
    [items[index], items[other]] = [items[other], items[index]];
    if (key === "actions") {
      const drafts = { ...this.drafts }; delete drafts[index]; delete drafts[other];
      if (this.drafts[index] !== undefined) drafts[other] = this.drafts[index];
      if (this.drafts[other] !== undefined) drafts[index] = this.drafts[other];
      this.drafts = drafts;
    }
    this.change({ ...this.config, [key]: items });
  }

  private serviceData(index: number, action: LawnMowerActionConfig, raw: string) {
    this.drafts = { ...this.drafts, [index]: raw };
    if (!validServiceData(raw)) return;
    const next = { ...action };
    if (raw.trim()) next.service_data = JSON.parse(raw);
    else delete next.service_data;
    this.updateItem("actions", index, next);
  }
}

function validServiceData(raw: string): boolean {
  if (!raw.trim()) return true;
  try { const value = JSON.parse(raw); return Boolean(value && typeof value === "object" && !Array.isArray(value)); }
  catch { return false; }
}
