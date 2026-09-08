import "./customization-editor";
import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import {
  getStubConfig,
  type ConfigChangedDetail,
  type HomeAssistant,
  type LawnMowerCardConfig,
} from "./card-config";
import {
  resolvedMowerCompanionEntity,
  resolvedMowerInteractiveMapEntity,
  resolvedMowerLiveVideoEntity,
} from "./card-logic";
import {
  normalizeHeroImagePosition,
  type HeroImagePosition,
} from "./hero-image";
import { lawnMowerCardEditorStyles } from "./lawn-mower-card-editor-styles";
import {
  createTranslator,
  LOCALE_OPTIONS,
  resolveLocale,
  type LocalePreference,
  type SupportedLocale,
} from "./localization";
import {
  normalizeMapFit,
  normalizeMapPosition,
  type MapFit,
  type MapPosition,
} from "./map-presentation";
import { pointCloudPathFromEntity } from "./point-cloud-logic";

@customElement("lawn-mower-card-editor")
export class LawnMowerCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: LawnMowerCardConfig;

  private get _locale(): SupportedLocale {
    return resolveLocale(
      this._config?.locale ?? "auto",
      this.hass?.locale?.language,
      this.hass?.language,
      globalThis.navigator?.language,
    );
  }

  private get _t() {
    return createTranslator(this._locale);
  }

  public static styles = lawnMowerCardEditorStyles;

  public setConfig(config: LawnMowerCardConfig): void {
    this._config = config;
  }

  protected render() {
    const config = this._config || getStubConfig();

    return html`
      <div class="editor" lang=${this._locale}>
        <div class="hint">
          ${this._t("editor.intro")}
        </div>
        ${this._localeField(config.locale || "auto")}
        ${this._field(
          this._t("editor.mowerEntity"),
          config.entity,
          "entity",
          "lawn_mower.my_mower",
          this._t("editor.mowerEntityHint"),
          ["lawn_mower"],
        )}
        ${this._field(
          this._t("editor.title"),
          config.name,
          "name",
          this._t("editor.titlePlaceholder"),
          this._t("editor.titleHint"),
        )}
        ${this._layoutField(config.layout || "default")}
        ${config.layout === "hero" ? this._heroAppearanceSection(config) : nothing}
        ${this._field(
          this._t("editor.mapCamera"),
          config.map_entity,
          "map_entity",
          "camera.my_mower_live_path_map",
          this._t("editor.mapCameraHint"),
          ["camera"],
        )}
        ${this._field(
          this._t("editor.videoCamera"),
          config.camera_entity,
          "camera_entity",
          "camera.my_mower_live_video",
          this._t("editor.videoCameraHint"),
          ["camera"],
        )}
        ${this._toggle(
          this._t("editor.showMap"),
          config.show_map ?? Boolean(config.map_entity),
          "show_map",
        )}
        ${this._mapFitField(normalizeMapFit(config.map_fit))}
        ${this._mapPositionField(normalizeMapPosition(config.map_position))}
        ${this._toggle(
          this._t("editor.showPointCloud"),
          config.show_point_cloud ??
            Boolean(
              pointCloudPathFromEntity(
                config.map_entity
                  ? this.hass?.states[config.map_entity]
                  : undefined,
              ),
            ),
          "show_point_cloud",
        )}
        ${this._field(
          this._t("editor.statusEntity"),
          config.status_entity,
          "status_entity",
          "sensor.my_mower_state_name",
          this._t("editor.statusEntityHint"),
          ["sensor", "binary_sensor", "calendar", "camera", "lawn_mower"],
        )}
        ${this._field(
          this._t("editor.batteryEntity"),
          config.battery_entity,
          "battery_entity",
          "sensor.my_mower_battery",
          this._t("editor.batteryEntityHint"),
          ["sensor", "number", "input_number", "binary_sensor"],
        )}
        ${this._field(
          this._t("editor.progressEntity"),
          config.progress_entity,
          "progress_entity",
          "sensor.my_mower_progress",
          this._t("editor.progressEntityHint"),
          ["sensor", "binary_sensor", "calendar", "camera", "lawn_mower"],
        )}
        ${this._field(
          this._t("editor.coverageEntity"),
          config.coverage_entity,
          "coverage_entity",
          "sensor.my_mower_current_cleaned_area",
          this._t("editor.coverageEntityHint"),
          ["sensor", "number", "input_number"],
        )}
        ${this._field(
          this._t("editor.totalCoverageEntity"),
          config.coverage_total_entity,
          "coverage_total_entity",
          "sensor.my_mower_runtime_total_area",
          this._t("editor.totalCoverageEntityHint"),
          ["sensor", "number", "input_number"],
        )}
        ${this._toggle(
          this._t("editor.showDefaultActions"),
          config.show_default_actions ?? true,
          "show_default_actions",
        )}
        ${this._toggle(
          this._t("editor.showHelperActions"),
          config.show_helper_actions ?? true,
          "show_helper_actions",
        )}
        ${this._toggle(
          this._t("editor.showAdvanced"),
          config.show_advanced_details ?? false,
          "show_advanced_details",
        )}
        <lawn-mower-customization-editor .config=${config} .hass=${this.hass} .locale=${this._locale}
          .onChange=${(next: LawnMowerCardConfig) => this._emitConfigChanged(next)}></lawn-mower-customization-editor>
      </div>
    `;
  }

  private _localeField(value: LocalePreference) {
    return html`
      <label>
        <span>${this._t("editor.language")}</span>
        <select data-key="locale" @change=${this._valueChanged}>
          ${LOCALE_OPTIONS.map(
            (option) => html`<option value=${option.value} ?selected=${option.value === value}>${
              option.value === "auto" ? this._t("common.automatic") : option.label
            }</option>`,
          )}
        </select>
        <span class="hint">${this._t("editor.languageHint")}</span>
      </label>
    `;
  }

  private _layoutField(value: "default" | "compact" | "wide" | "hero") {
    return html`
      <label>
        <span>${this._t("editor.layout")}</span>
        <select .value=${value} @change=${this._layoutChanged}>
          <option value="default">${this._t("editor.layoutDefault")}</option>
          <option value="compact">${this._t("editor.layoutCompact")}</option>
          <option value="wide">${this._t("editor.layoutWide")}</option>
          <option value="hero">${this._t("editor.layoutHero")}</option>
        </select>
        <span class="hint">${this._t("editor.layoutHint")}</span>
      </label>
    `;
  }

  private _heroAppearanceSection(config: LawnMowerCardConfig) {
    return html`
      <div class="section">
        <div class="section-title">
          <strong>${this._t("editor.heroAppearance")}</strong>
          <span class="hint">${this._t("editor.heroAppearanceHint")}</span>
        </div>
        <label>
          <span>${this._t("editor.heroComposition")}</span>
          <select data-key="hero_layout" .value=${config.hero_layout === "dashboard" ? "dashboard" : "cinematic"} @change=${this._valueChanged}>
            <option value="cinematic">${this._t("editor.heroCinematic")}</option>
            <option value="dashboard">${this._t("editor.heroDashboard")}</option>
          </select>
        </label>
        ${this._field(
          this._t("editor.backgroundImage"),
          config.hero_image,
          "hero_image",
          "/local/mower/my-mower.jpg",
          this._t("editor.backgroundImageHint"),
        )}
        ${this._heroImagePositionField(
          normalizeHeroImagePosition(config.hero_image_position),
        )}
      </div>
    `;
  }

  private _mapFitField(value: MapFit) {
    return html`
      <label>
        <span>${this._t("editor.mapFit")}</span>
        <select data-key="map_fit" .value=${value} @change=${this._valueChanged}>
          <option value="contain">${this._t("editor.mapFitContain")}</option>
          <option value="cover">${this._t("editor.mapFitCover")}</option>
        </select>
        <span class="hint">
          ${this._t("editor.mapFitHint")}
        </span>
      </label>
    `;
  }

  private _mapPositionField(value: MapPosition) {
    return html`
      <label>
        <span>${this._t("editor.mapFocus")}</span>
        <select data-key="map_position" .value=${value} @change=${this._valueChanged}>
          <option value="center">${this._t("common.center")}</option>
          <option value="top">${this._t("common.top")}</option>
          <option value="bottom">${this._t("common.bottom")}</option>
          <option value="left">${this._t("common.left")}</option>
          <option value="right">${this._t("common.right")}</option>
          <option value="top-left">${this._t("common.topLeft")}</option>
          <option value="top-right">${this._t("common.topRight")}</option>
          <option value="bottom-left">${this._t("common.bottomLeft")}</option>
          <option value="bottom-right">${this._t("common.bottomRight")}</option>
        </select>
        <span class="hint">${this._t("editor.mapFocusHint")}</span>
      </label>
    `;
  }

  private _heroImagePositionField(value: HeroImagePosition) {
    return html`
      <label>
        <span>${this._t("editor.imageFocus")}</span>
        <select
          data-key="hero_image_position"
          .value=${value}
          @change=${this._valueChanged}
        >
          <option value="center">${this._t("common.center")}</option>
          <option value="left">${this._t("common.left")}</option>
          <option value="right">${this._t("common.right")}</option>
          <option value="top">${this._t("common.top")}</option>
          <option value="bottom">${this._t("common.bottom")}</option>
        </select>
        <span class="hint">${this._t("editor.imageFocusHint")}</span>
      </label>
    `;
  }

  private _field(
    label: string,
    value: string | undefined,
    key: keyof LawnMowerCardConfig,
    placeholder: string,
    hint: string,
    domains?: string[],
  ) {
    const datalistId = domains?.length ? `lawn-mower-card-editor-${String(key)}-entities` : undefined;
    return html`
      <label>
        <span>${label}</span>
        <input
          .value=${value || ""}
          data-key=${String(key)}
          placeholder=${placeholder}
          list=${datalistId || nothing}
          @input=${this._valueChanged}
        />
        <span class="hint">${hint}</span>
        ${datalistId ? this._entityDatalist(datalistId, domains) : nothing}
      </label>
    `;
  }

  private _toggle(
    label: string,
    value: boolean,
    key:
      | "show_map"
      | "show_point_cloud"
      | "show_default_actions"
      | "show_helper_actions"
      | "show_advanced_details",
  ) {
    return html`
      <label class="toggle">
        <span>${label}</span>
        <input
          type="checkbox"
          .checked=${value}
          data-key=${key}
          @change=${this._toggleChanged}
        />
      </label>
    `;
  }

  private _entityDatalist(id: string, domains?: string[]) {
    const entityIds = this._entityIds(domains);
    if (!entityIds.length) {
      return nothing;
    }
    return html`
      <datalist id=${id}>
        ${entityIds.map((entityId) => html`<option value=${entityId}></option>`)}
      </datalist>
    `;
  }

  private _entityIds(domains?: string[]): string[] {
    if (!this.hass?.states) {
      return [];
    }

    const allowed = domains?.length ? new Set(domains) : undefined;
    return Object.keys(this.hass.states)
      .filter((entityId) => {
        if (!allowed) {
          return true;
        }
        const [domain] = entityId.split(".");
        return allowed.has(domain);
      })
      .sort((left, right) => left.localeCompare(right));
  }

  private _valueChanged(event: Event) {
    const target = event.currentTarget as HTMLInputElement | HTMLSelectElement;
    const key = target.dataset.key as keyof LawnMowerCardConfig | undefined;
    if (!key) {
      return;
    }

    const previous = this._config || getStubConfig();
    const next: LawnMowerCardConfig = {
      ...previous,
    };

    const value = target.value.trim();
    if (value) {
      next[key] = value as never;
    } else {
      delete next[key];
    }

    if (!next.entity) {
      next.entity = getStubConfig().entity;
    }

    if (key === "entity" && value && value !== previous.entity) {
      this._applyEntityAutofill(next, previous);
    }

    this._emitConfigChanged(next);
  }

  private _applyEntityAutofill(
    next: LawnMowerCardConfig,
    previous: LawnMowerCardConfig,
  ) {
    const previousDetected = this._autoDetectedCompanions(
      previous.entity,
      true,
    );
    const nextDetected = this._autoDetectedCompanions(next.entity);

    this._replaceAutoEntityField("map_entity", next, previousDetected, nextDetected);
    this._replaceAutoEntityField("camera_entity", next, previousDetected, nextDetected);
    this._replaceAutoEntityField("status_entity", next, previousDetected, nextDetected);
    this._replaceAutoEntityField("battery_entity", next, previousDetected, nextDetected);
    this._replaceAutoEntityField("progress_entity", next, previousDetected, nextDetected);
    this._replaceAutoEntityField("coverage_entity", next, previousDetected, nextDetected);
    this._replaceAutoEntityField("coverage_total_entity", next, previousDetected, nextDetected);

    const previousAutoShowMap = Boolean(previousDetected.map_entity);
    if (next.show_map === undefined || next.show_map === previousAutoShowMap) {
      if (nextDetected.map_entity) {
        next.show_map = true;
      } else {
        delete next.show_map;
      }
    }
  }

  private _replaceAutoEntityField(
    key:
      | "map_entity"
      | "camera_entity"
      | "status_entity"
      | "battery_entity"
      | "progress_entity"
      | "coverage_entity"
      | "coverage_total_entity",
    next: LawnMowerCardConfig,
    previousDetected: Partial<LawnMowerCardConfig>,
    nextDetected: Partial<LawnMowerCardConfig>,
  ) {
    const current = next[key];
    const previousValue = previousDetected[key] as string | undefined;
    const nextValue = nextDetected[key] as string | undefined;

    if (!current || (previousValue !== undefined && current === previousValue)) {
      if (nextValue) {
        next[key] = nextValue as never;
      } else {
        delete next[key];
      }
    }
  }

  private _autoDetectedCompanions(
    entityId?: string,
    recognizePriorCamera = false,
  ): Partial<LawnMowerCardConfig> {
    if (!entityId || !this.hass?.states) {
      return {};
    }

    const objectId = entityId.split(".", 2)[1];
    if (!objectId) {
      return {};
    }

    const companion = (
      domain: string,
      ...roles: readonly string[]
    ): string | undefined =>
      resolvedMowerCompanionEntity(
        this.hass.states,
        entityId,
        this.hass.entities,
        domain,
        ...roles,
      );

    const first = (...values: Array<string | undefined>): string | undefined =>
      values.find((value) => Boolean(value));

    const mapEntity = first(
      resolvedMowerInteractiveMapEntity(this.hass.states, entityId, this.hass.entities),
      companion("camera", "live_path_map"),
      companion("camera", "map"),
      companion("camera", "all_maps"),
      companion("camera", "map_data"),
    );
    const cameraEntity = resolvedMowerLiveVideoEntity(
      this.hass.states,
      entityId,
      this.hass.entities,
      { includeIneligible: recognizePriorCamera },
    );

    return {
      map_entity: mapEntity,
      camera_entity: cameraEntity,
      status_entity: first(
        companion("sensor", "state_name"),
        companion("sensor", "activity"),
        companion("sensor", "error"),
      ),
      battery_entity: companion("sensor", "battery"),
      progress_entity: first(
        companion("sensor", "runtime_mission_progress"),
        companion("sensor", "mowing_progress"),
      ),
      coverage_entity: first(
        companion("sensor", "runtime_current_area"),
        companion("sensor", "current_cleaned_area"),
      ),
      coverage_total_entity: companion("sensor", "runtime_total_area"),
    };
  }

  private _toggleChanged(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const key = target.dataset.key as
      | "show_map"
      | "show_point_cloud"
      | "show_default_actions"
      | "show_helper_actions"
      | "show_advanced_details"
      | undefined;
    if (!key) {
      return;
    }

    const next: LawnMowerCardConfig = {
      ...(this._config || getStubConfig()),
      [key]: target.checked,
    };

    if (!next.entity) {
      next.entity = getStubConfig().entity;
    }

    this._emitConfigChanged(next);
  }

  private _layoutChanged(event: Event) {
    const target = event.currentTarget as HTMLSelectElement;
    const next: LawnMowerCardConfig = {
      ...(this._config || getStubConfig()),
      layout: target.value as "default" | "compact" | "wide" | "hero",
    };

    if (!next.entity) {
      next.entity = getStubConfig().entity;
    }

    this._emitConfigChanged(next);
  }

  private _emitConfigChanged(next: LawnMowerCardConfig) {
    this._config = next;
    this.dispatchEvent(
      new CustomEvent<ConfigChangedDetail>("config-changed", {
        detail: { config: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

}
