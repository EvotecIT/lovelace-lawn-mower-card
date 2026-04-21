import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

type HassEntity = {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
};

type HomeAssistant = {
  states: Record<string, HassEntity>;
  callService(domain: string, service: string, data?: Record<string, unknown>): Promise<void>;
};

type LawnMowerTileConfig = {
  entity: string;
  label?: string;
  icon?: string;
};

type LawnMowerActionConfig = {
  type?: "start" | "pause" | "dock" | "more-info" | "service";
  label?: string;
  icon?: string;
  entity?: string;
  service?: string;
  service_data?: Record<string, unknown>;
};

type LawnMowerCardConfig = {
  type: string;
  entity: string;
  name?: string;
  layout?: "default" | "compact" | "wide";
  map_entity?: string;
  show_map?: boolean;
  status_entity?: string;
  battery_entity?: string;
  progress_entity?: string;
  show_default_actions?: boolean;
  show_helper_actions?: boolean;
  control_entities?: string[];
  summary_entities?: string[];
  actions?: LawnMowerActionConfig[];
  tiles?: LawnMowerTileConfig[];
};

type ConfigChangedDetail = {
  config: LawnMowerCardConfig;
};

type RuntimeSessionDetails = {
  trailLengthM?: number;
  pointCount?: number;
  segmentCount?: number;
  headingDeg?: number;
  positionX?: number;
  positionY?: number;
  source?: string;
};

type PlannedRunDetails = {
  action?: string;
  selectedMap?: string;
  activeMap?: string;
  target?: string;
  needsMapSwitch?: boolean;
};

declare global {
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }
}

const FRIENDLY_STATE: Record<string, string> = {
  mowing: "Mowing",
  docked: "Docked",
  paused: "Paused",
  returning: "Returning",
  error: "Error",
  unavailable: "Unavailable",
  unknown: "Unknown",
};

const VALUE_ALIASES: Record<string, string> = {
  "charging completed": "charging completed",
  "rain protection enabled": "rain protection enabled",
  "rain protection disabled": "rain protection disabled",
  "rain delay active": "rain delay active",
  "rain delay inactive": "rain delay inactive",
  "no error": "no error",
  "task unknown": "task unknown",
};

@customElement("lawn-mower-card")
export class LawnMowerCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: LawnMowerCardConfig;

  public static styles = css`
    :host {
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
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      overflow: hidden;
      background: color-mix(in srgb, var(--card-background-color) 90%, black 10%);
      min-height: 180px;
    }

    .map img {
      display: block;
      width: 100%;
      height: auto;
    }

    .map-placeholder {
      min-height: 180px;
      display: grid;
      place-items: center;
      color: var(--secondary-text-color);
      padding: 16px;
      text-align: center;
    }

    .selectors {
      display: grid;
      gap: 10px;
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
      width: 100%;
      box-sizing: border-box;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 10px 12px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
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
  `;

  public static getStubConfig(): LawnMowerCardConfig {
    return {
      type: "custom:lawn-mower-card",
      entity: "lawn_mower.my_mower",
    };
  }

  public setConfig(config: LawnMowerCardConfig): void {
    if (!config.entity) {
      throw new Error("The 'entity' option is required.");
    }
    this._config = config;
  }

  public static async getConfigElement(): Promise<HTMLElement> {
    return document.createElement("lawn-mower-card-editor");
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    const mower = this.hass.states[this._config.entity];
    if (!mower) {
      return html`
        <ha-card>
          <div class="wrap">Entity not found: ${this._config.entity}</div>
        </ha-card>
      `;
    }

    const title =
      this._config.name ||
      this._friendlyName(mower) ||
      this._entityName(this._config.entity);
    const layout = this._config.layout || "default";
    const subtitle = this._entityState(this._config.status_entity) || this._friendlyMowerState(mower.state);
    const mapEntity = this._config.map_entity ? this.hass.states[this._config.map_entity] : undefined;
    const mapUrl = mapEntity ? this._cameraUrl(mapEntity) : undefined;
    const showMap = this._config.show_map ?? Boolean(this._config.map_entity);
    const statTiles = this._buildTiles();
    const actionGroups = this._buildActionGroups(mower.state);
    const headerSummary = this._buildHeaderSummary();
    const controlEntities = this._resolvedControlEntities();
    const plannedRun = this._plannedRunDetails(mower);
    const runtimeSession = this._runtimeSessionDetails();

    return html`
      <ha-card>
        <div class=${`wrap layout-${layout}`}>
          <div class="main">
            <div class="header">
              <div class="title-block">
                <div class="title">${title}</div>
                <div class="subtitle">${subtitle}</div>
                ${headerSummary.length
                  ? html`
                      <div class="header-summary">
                        ${headerSummary.map(
                          (item) => html`<div class="summary-chip">${item}</div>`,
                        )}
                      </div>
                    `
                  : nothing}
              </div>
              <div class=${`state-pill state-${mower.state}`}>${this._friendlyMowerState(mower.state)}</div>
            </div>

            ${showMap
              ? html`
                  <div class="map">
                    ${mapUrl
                      ? html`<img src=${mapUrl} alt=${title} />`
                      : html`<div class="map-placeholder">No mower map configured yet.</div>`}
                  </div>
                `
              : nothing}
          </div>

          <div class="side">
            ${plannedRun
              ? this._renderPlannedRunPanel(plannedRun)
              : nothing}

            ${runtimeSession
              ? this._renderRuntimeSessionPanel(runtimeSession)
              : nothing}

            ${controlEntities.length
              ? html`
                  <div class="selectors">
                    ${controlEntities.map((entityId) => this._renderSelectControl(entityId))}
                  </div>
                `
              : nothing}

            ${actionGroups.length
              ? html`
                  ${actionGroups.map(
                    (group) => html`
                      <div class="action-group">
                        ${actionGroups.length > 1
                          ? html`<div class="action-group-title">${group.title}</div>`
                          : nothing}
                        <div class="actions">
                          ${group.actions.map(
                            (action) => html`
                              <button @click=${action.handler} ?disabled=${action.disabled}>
                                <span class="button-content">
                                  ${action.icon ? html`<ha-icon .icon=${action.icon}></ha-icon>` : nothing}
                                  <span>${action.label}</span>
                                </span>
                              </button>
                            `,
                          )}
                        </div>
                      </div>
                    `,
                  )}
                `
              : nothing}

            ${statTiles.length
              ? html`
                  <div class="stats">
                    ${statTiles.map(
                      (tile) => html`
                        <div class="tile">
                          <div class="tile-label">${tile.label}</div>
                          <div class="tile-value">${tile.value}</div>
                        </div>
                      `,
                    )}
                  </div>
                `
              : nothing}
          </div>
        </div>
      </ha-card>
    `;
  }

  public getCardSize(): number {
    const showMap = this._config?.show_map ?? Boolean(this._config?.map_entity);
    const layout = this._config?.layout || "default";
    if (layout === "compact") {
      return showMap ? 8 : 6;
    }
    if (layout === "wide") {
      return showMap ? 10 : 8;
    }
    return showMap ? 9 : 7;
  }

  private _buildTiles(): Array<{ label: string; value: string }> {
    if (!this._config || !this.hass) {
      return [];
    }

    const tiles: Array<{ label: string; value: string }> = [];

    if (this._config.battery_entity) {
      tiles.push(this._tileFromEntity(this._config.battery_entity, "Battery"));
    } else {
      const fallbackBattery = this._tileFromMowerAttribute("battery_level", "Battery", "%");
      if (fallbackBattery) {
        tiles.push(fallbackBattery);
      }
    }

    if (this._config.progress_entity) {
      tiles.push(
        this._tileFromEntity(
          this._config.progress_entity,
          this._preferredEntityLabel(this._config.progress_entity, "Status"),
        ),
      );
    } else {
      const fallbackTask =
        this._tileFromMowerAttribute("task_status_name", "Task") ||
        this._tileFromMowerAttribute("activity", "Activity");
      if (fallbackTask) {
        tiles.push(fallbackTask);
      }
    }

    for (const tile of this._config.tiles || []) {
      tiles.push(this._tileFromEntity(tile.entity, tile.label, tile.icon));
    }

    if (!(this._config.tiles || []).length) {
      const runtimeAreaTile = this._runtimeCoverageTile();
      if (runtimeAreaTile) {
        tiles.push(runtimeAreaTile);
      }

      const liveTrackTile = this._runtimeLiveTrackTile();
      if (liveTrackTile) {
        tiles.push(liveTrackTile);
      }
    }

    return tiles.filter((tile) => tile.value !== "Unavailable");
  }

  private _buildHeaderSummary(): string[] {
    if (!this._config || !this.hass) {
      return [];
    }

    const summary: string[] = [];
    const mower = this.hass.states[this._config.entity];
    if (!mower) {
      return summary;
    }

    for (const entityId of this._resolvedSummaryEntities()) {
      const entity = this.hass.states[entityId];
      if (!entity) {
        continue;
      }
      const label = this._friendlyName(entity) || this._entityName(entityId);
      summary.push(`${label} ${this._friendlyState(entity)}`);
    }

    const battery =
      this._entityState(this._config.battery_entity) ||
      this._stringAttribute(mower, "battery_level", "%");
    if (battery) {
      summary.push(`Battery ${battery}`);
    }

    const activity = this._stringAttribute(mower, "activity");
    if (activity) {
      summary.push(`Activity ${activity}`);
    }

    const task = this._stringAttribute(mower, "task_status_name");
    if (task && !this._isUnknownLike(task)) {
      summary.push(`Task ${task}`);
    }

    const docked = this._companionSummaryFromBinary("docked", "Docked");
    if (docked) {
      summary.push(docked);
    }

    const charging = this._companionSummaryFromBinary("charging", "Charging");
    if (charging) {
      summary.push(charging);
    }

    const rainDelay = this._companionSummaryFromBinary("rain_delay_active", "Rain Delay");
    if (rainDelay) {
      summary.push(rainDelay);
    }

    const weatherStatus = this._companionSummaryFromEntity(
      "sensor",
      "weather_protection_status",
      "Rain protection",
    );
    if (weatherStatus) {
      summary.push(weatherStatus);
    }

    const error = this._stringAttribute(mower, "error_display") || this._stringAttribute(mower, "error_text");
    if (error && !["none", "no error"].includes(error.toLowerCase())) {
      summary.push(`Error ${error}`);
    }

    summary.push(...this._runtimeMapSummaryItems());

    return [...new Set(summary)].slice(0, 6);
  }

  private _resolvedSummaryEntities(): string[] {
    if (!this._config) {
      return [];
    }

    const configured = (this._config.summary_entities || []).filter(Boolean);
    if (configured.length) {
      return configured;
    }

    return this._autoDetectedSummaryEntities(this._config.entity);
  }

  private _autoDetectedSummaryEntities(entityId?: string): string[] {
    if (!entityId || !this.hass?.states) {
      return [];
    }

    const objectId = entityId.split(".", 2)[1];
    if (!objectId) {
      return [];
    }

    const firstAvailable = (...candidates: string[]): string[] => {
      const match = candidates.find((candidate) => Boolean(this.hass.states[candidate]));
      return match ? [match] : [];
    };

    return [
      `sensor.${objectId}_runtime_mission_progress`,
      `sensor.${objectId}_runtime_current_area`,
      `sensor.${objectId}_runtime_total_area`,
      `sensor.${objectId}_current_zone`,
      `sensor.${objectId}_current_cleaned_area`,
      `sensor.${objectId}_current_cleaning_time`,
      `sensor.${objectId}_active_segment_count`,
      ...firstAvailable(
        `sensor.${objectId}_current_app_map_trajectory_length`,
        `sensor.${objectId}_current_app_map_mow_path_length`,
        `sensor.${objectId}_current_app_map_trajectory_point_count`,
      ),
    ].filter((candidate) => Boolean(this.hass.states[candidate]));
  }

  private _resolvedControlEntities(): string[] {
    if (!this._config) {
      return [];
    }

    const configured = (this._config.control_entities || []).filter(Boolean);
    if (configured.length) {
      return configured;
    }

    return this._autoDetectedControlEntities(this._config.entity);
  }

  private _autoDetectedControlEntities(entityId?: string): string[] {
    if (!entityId || !this.hass?.states) {
      return [];
    }

    const objectId = entityId.split(".", 2)[1];
    if (!objectId) {
      return [];
    }

    return ["map", "mowing_action", "edge", "zone", "spot"]
      .map((suffix) => `select.${objectId}_${suffix}`)
      .filter((candidate) => Boolean(this.hass.states[candidate]));
  }

  private _renderSelectControl(entityId: string) {
    const entity = this.hass.states[entityId];
    if (!entity) {
      return nothing;
    }

    const options = Array.isArray(entity.attributes.options)
      ? entity.attributes.options.filter((option): option is string => typeof option === "string")
      : [];
    if (!options.length) {
      return nothing;
    }

    const label =
      this._friendlyName(entity) ||
      this._preferredEntityLabel(entityId) ||
      this._entityName(entityId);
    const unavailable = ["unavailable", "unknown"].includes(String(entity.state));

    return html`
      <label class="selector-card">
        <span class="selector-label">${label}</span>
        <select
          .value=${String(entity.state)}
          ?disabled=${unavailable}
          @change=${(event: Event) => this._selectOption(entityId, event)}
        >
          ${options.map(
            (option) => html`<option value=${option}>${option}</option>`,
          )}
        </select>
      </label>
    `;
  }

  private _tileFromMowerAttribute(
    attribute: string,
    label: string,
    unit?: string,
  ): { label: string; value: string } | undefined {
    const mower = this._config ? this.hass.states[this._config.entity] : undefined;
    const value = mower?.attributes[attribute];
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    return {
      label,
      value: unit ? `${String(value)} ${unit}` : this._humanizeValue(String(value)),
    };
  }

  private _runtimeCoverageTile(): { label: string; value: string } | undefined {
    const currentArea = this._companionState("sensor", "runtime_current_area");
    const totalArea = this._companionState("sensor", "runtime_total_area");

    if (currentArea && totalArea) {
      return {
        label: "Coverage",
        value: `${currentArea} / ${totalArea}`,
      };
    }

    if (currentArea) {
      return {
        label: "Current Area",
        value: currentArea,
      };
    }

    return undefined;
  }

  private _runtimeLiveTrackTile(): { label: string; value: string } | undefined {
    const runtimeSession = this._runtimeSessionDetails();
    if (!runtimeSession) {
      return undefined;
    }

    if (runtimeSession.trailLengthM !== undefined && runtimeSession.trailLengthM > 0) {
      return {
        label: "Live Trail",
        value: this._formatMeters(runtimeSession.trailLengthM),
      };
    }

    if (runtimeSession.pointCount !== undefined && runtimeSession.pointCount > 1) {
      return {
        label: "Live Points",
        value: `${Math.round(runtimeSession.pointCount)}`,
      };
    }

    return undefined;
  }

  private _buildActionGroups(
    mowerState: string,
  ): Array<{
    title: string;
    actions: Array<{
      label: string;
      icon?: string;
      disabled: boolean;
      handler: () => Promise<void> | void;
    }>;
  }> {
    if (!this._config) {
      return [];
    }

    const defaultActions: Array<{
      label: string;
      icon?: string;
      disabled: boolean;
      handler: () => Promise<void> | void;
    }> = [];

    if (this._config.show_default_actions ?? true) {
      defaultActions.push(
        {
          label: "Start",
          icon: "mdi:play",
          disabled: !this._canStart(mowerState),
          handler: () => this._startMowing(),
        },
        {
          label: "Pause",
          icon: "mdi:pause",
          disabled: !this._canPause(mowerState),
          handler: () => this._pauseMowing(),
        },
        {
          label: "Dock",
          icon: "mdi:home-import-outline",
          disabled: !this._canDock(mowerState),
          handler: () => this._dockMower(),
        },
      );
    }

    const helperActions: Array<{
      label: string;
      icon?: string;
      disabled: boolean;
      handler: () => Promise<void> | void;
    }> = [];
    if (this._config.show_helper_actions ?? true) {
      helperActions.push(...this._buildHelperActions());
    }

    const customActions: Array<{
      label: string;
      icon?: string;
      disabled: boolean;
      handler: () => Promise<void> | void;
    }> = [];
    for (const action of this._config.actions || []) {
      const built = this._buildConfiguredAction(action, mowerState);
      if (built) {
        customActions.push(built);
      }
    }

    return [
      { title: "Controls", actions: defaultActions },
      { title: "Helpers", actions: helperActions },
      { title: "Custom", actions: customActions },
    ].filter((group) => group.actions.length);
  }

  private _buildConfiguredAction(
    action: LawnMowerActionConfig,
    mowerState: string,
  ):
    | {
        label: string;
        icon?: string;
        disabled: boolean;
        handler: () => Promise<void> | void;
      }
    | undefined {
    const type = action.type || "more-info";

    if (type === "start") {
      return {
        label: action.label || "Start",
        icon: action.icon || "mdi:play",
        disabled: !this._canStart(mowerState),
        handler: () => this._startMowing(),
      };
    }

    if (type === "pause") {
      return {
        label: action.label || "Pause",
        icon: action.icon || "mdi:pause",
        disabled: !this._canPause(mowerState),
        handler: () => this._pauseMowing(),
      };
    }

    if (type === "dock") {
      return {
        label: action.label || "Dock",
        icon: action.icon || "mdi:home-import-outline",
        disabled: !this._canDock(mowerState),
        handler: () => this._dockMower(),
      };
    }

    if (type === "more-info") {
      return {
        label: action.label || "Details",
        icon: action.icon || "mdi:information-outline",
        disabled: false,
        handler: () => this._showMoreInfo(action.entity),
      };
    }

    if (type === "service" && action.service) {
      return {
        label: action.label || action.service,
        icon: action.icon || "mdi:flash-outline",
        disabled: false,
        handler: () => this._callConfiguredService(action.service!, action.service_data),
      };
    }

    return undefined;
  }

  private _buildHelperActions(): Array<{
    label: string;
    icon?: string;
    disabled: boolean;
    handler: () => Promise<void> | void;
  }> {
    const helpers: Array<{
      label: string;
      icon?: string;
      disabled: boolean;
      handler: () => Promise<void> | void;
    }> = [];

    const schedule = this._companionEntityId("calendar", "schedule");
    if (schedule) {
      helpers.push({
        label: "Schedule",
        icon: "mdi:calendar",
        disabled: false,
        handler: () => this._showMoreInfo(schedule),
      });
    }

    const allSchedules = this._companionEntityId("calendar", "all_schedules");
    if (allSchedules) {
      helpers.push({
        label: "All Schedules",
        icon: "mdi:calendar-multiselect",
        disabled: false,
        handler: () => this._showMoreInfo(allSchedules),
      });
    }

    const mapDiagnostics = this._companionEntityId("camera", "map_data");
    if (mapDiagnostics) {
      helpers.push({
        label: "Map Diagnostics",
        icon: "mdi:map-search-outline",
        disabled: false,
        handler: () => this._showMoreInfo(mapDiagnostics),
      });
    }

    const allMaps = this._companionEntityId("camera", "all_maps");
    if (allMaps) {
      helpers.push({
        label: "All Maps",
        icon: "mdi:map-multiple-outline",
        disabled: false,
        handler: () => this._showMoreInfo(allMaps),
      });
    }

    const weatherProbe = this._companionEntityId("button", "capture_weather_probe");
    if (weatherProbe) {
      helpers.push({
        label: "Weather",
        icon: "mdi:weather-rainy",
        disabled: false,
        handler: () => this._pressButton(weatherProbe),
      });
    }

    const scheduleProbe = this._companionEntityId("button", "capture_schedule_probe");
    if (scheduleProbe) {
      helpers.push({
        label: "Refresh Schedules",
        icon: "mdi:calendar-search",
        disabled: false,
        handler: () => this._pressButton(scheduleProbe),
      });
    }

    const mapProbe = this._companionEntityId("button", "capture_map_probe");
    if (mapProbe) {
      helpers.push({
        label: "Probe Map",
        icon: "mdi:map-search",
        disabled: false,
        handler: () => this._pressButton(mapProbe),
      });
    }

    const operationSnapshot = this._companionEntityId(
      "button",
      "capture_operation_snapshot",
    );
    if (operationSnapshot) {
      helpers.push({
        label: "Snapshot",
        icon: "mdi:clipboard-pulse-outline",
        disabled: false,
        handler: () => this._pressButton(operationSnapshot),
      });
    }

    return helpers;
  }

  private _tileFromEntity(entityId: string, fallbackLabel?: string, icon?: string) {
    const entity = this.hass.states[entityId];
    if (!entity) {
      return {
        label: fallbackLabel || this._preferredEntityLabel(entityId),
        value: "Unavailable",
      };
    }

    const label =
      fallbackLabel ||
      this._friendlyName(entity) ||
      this._preferredEntityLabel(entityId);
    const value = this._friendlyState(entity);
    return {
      label: icon ? `${icon} ${label}` : label,
      value,
    };
  }

  private _friendlyState(entity: HassEntity): string {
    const unit = entity.attributes.unit_of_measurement;
    if (typeof unit === "string" && unit) {
      return `${entity.state} ${unit}`;
    }
    return this._humanizeEntityState(entity.entity_id, String(entity.state));
  }

  private _entityState(entityId?: string): string | undefined {
    if (!entityId) {
      return undefined;
    }
    const entity = this.hass.states[entityId];
    return entity ? this._friendlyState(entity) : undefined;
  }

  private _stringAttribute(
    entity: HassEntity,
    attribute: string,
    unit?: string,
  ): string | undefined {
    const value = entity.attributes[attribute];
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    return unit ? `${String(value)} ${unit}` : this._humanizeValue(String(value));
  }

  private _humanizeValue(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
      return trimmed;
    }

    const direct = FRIENDLY_STATE[trimmed];
    if (direct) {
      return direct;
    }

    const normalized = trimmed.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
    if (!normalized) {
      return trimmed;
    }

    const lowered = normalized.toLowerCase();
    const mapped = VALUE_ALIASES[lowered] || lowered;
    return mapped.charAt(0).toUpperCase() + mapped.slice(1);
  }

  private _humanizeEntityState(entityId: string, value: string): string {
    const normalized = value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

    if (entityId.endsWith("_weather_protection_status")) {
      if (normalized === "rain protection enabled" || normalized === "enabled") {
        return "Enabled";
      }
      if (normalized === "rain protection disabled" || normalized === "disabled") {
        return "Disabled";
      }
    }

    if (entityId.endsWith("_task_status") || entityId.endsWith("_task_status_name")) {
      if (this._isUnknownLike(value)) {
        return "Unknown";
      }
    }

    return this._humanizeValue(value);
  }

  private _isUnknownLike(value: string): boolean {
    const normalized = value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
    return ["unknown", "unavailable", "none", "task unknown"].includes(normalized);
  }

  private _preferredEntityLabel(entityId: string, fallback?: string): string {
    if (entityId.endsWith("_weather_protection_status")) {
      return "Rain protection";
    }
    if (entityId.endsWith("_state_name")) {
      return "State";
    }
    if (entityId.endsWith("_task_status") || entityId.endsWith("_task_status_name")) {
      return "Task";
    }
    if (entityId.endsWith("_battery")) {
      return "Battery";
    }
    if (entityId.endsWith("_mowing_action")) {
      return "Mowing Action";
    }
    if (entityId.endsWith("_zone")) {
      return "Zone";
    }
    if (entityId.endsWith("_spot")) {
      return "Spot";
    }
    if (entityId.endsWith("_map")) {
      return "Map";
    }
    if (entityId.endsWith("_mowing_progress")) {
      return "Progress";
    }
    if (entityId.endsWith("_runtime_mission_progress")) {
      return "Mission Progress";
    }
    if (entityId.endsWith("_runtime_current_area")) {
      return "Current Area";
    }
    if (entityId.endsWith("_runtime_total_area")) {
      return "Total Area";
    }
    if (entityId.endsWith("_runtime_position_x")) {
      return "Position X";
    }
    if (entityId.endsWith("_runtime_position_y")) {
      return "Position Y";
    }
    if (entityId.endsWith("_runtime_heading")) {
      return "Heading";
    }
    if (entityId.endsWith("_current_cleaned_area")) {
      return "Cut Area";
    }
    if (entityId.endsWith("_current_cleaning_time")) {
      return "Time";
    }
    if (entityId.endsWith("_current_zone")) {
      return "Current Zone";
    }
    if (entityId.endsWith("_active_segment_count")) {
      return "Active Segments";
    }
    if (entityId.endsWith("_current_app_map_area")) {
      return "Map Area";
    }
    if (entityId.endsWith("_current_app_map_zone_count")) {
      return "Zones";
    }
    if (entityId.endsWith("_current_app_map_spot_count")) {
      return "Spots";
    }
    if (entityId.endsWith("_current_app_map_trajectory_point_count")) {
      return "Path Points";
    }
    if (entityId.endsWith("_current_app_map_trajectory_length")) {
      return "Path Length";
    }
    if (entityId.endsWith("_current_app_map_mow_path_length")) {
      return "Trail Length";
    }
    if (entityId.endsWith("_current_app_map_cut_relation_count")) {
      return "Cut Links";
    }
    if (entityId.endsWith("_error")) {
      return "Error";
    }
    return fallback || this._entityName(entityId);
  }

  private _friendlyName(entity: HassEntity): string | undefined {
    const value = entity.attributes.friendly_name;
    return typeof value === "string" ? value : undefined;
  }

  private _entityName(entityId: string): string {
    return entityId.split(".")[1]?.replace(/_/g, " ") || entityId;
  }

  private _friendlyMowerState(state: string): string {
    return this._humanizeValue(state);
  }

  private _cameraUrl(entity: HassEntity): string {
    const entityPicture = entity.attributes.entity_picture;
    if (typeof entityPicture === "string" && entityPicture) {
      return entityPicture;
    }

    const entityId = entity.entity_id;
    return `/api/camera_proxy/${entityId}?v=${Date.now()}`;
  }

  private _mapEntity(): HassEntity | undefined {
    if (!this._config?.map_entity) {
      return undefined;
    }
    return this.hass.states[this._config.map_entity];
  }

  private _entityAttributeString(entity: HassEntity, attribute: string): string | undefined {
    const value = entity.attributes[attribute];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  }

  private _entityAttributeInteger(entity: HassEntity, attribute: string): number | undefined {
    const value = entity.attributes[attribute];
    return typeof value === "number" && Number.isInteger(value) ? value : undefined;
  }

  private _numberAttribute(entity: HassEntity, attribute: string): number | undefined {
    const value = entity.attributes[attribute];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return undefined;
  }

  private _formatMeters(value: number): string {
    const decimals = value >= 10 ? 1 : 2;
    return `${value.toFixed(decimals)} m`;
  }

  private _formatCoordinate(value: number): string {
    return Number.isInteger(value) ? `${value}` : value.toFixed(1);
  }

  private _plannedRunDetails(mower: HassEntity): PlannedRunDetails | undefined {
    const action =
      this._entityAttributeString(mower, "selected_mowing_action_label") ||
      this._entityAttributeString(mower, "task_status_name");
    const selectedMap = this._entityAttributeString(mower, "selected_map_label");
    const activeMap = this._entityAttributeString(mower, "app_current_map_label");
    const selectedZoneId = this._entityAttributeInteger(mower, "selected_zone_id");
    const selectedSpotId = this._entityAttributeInteger(mower, "selected_spot_id");
    const selectedContourLabel = this._entityAttributeString(mower, "selected_contour_label");
    const needsMapSwitch = mower.attributes.selected_map_matches_active_app_map === false;

    let target: string | undefined;
    if (selectedContourLabel) {
      target = selectedContourLabel;
    } else if (selectedZoneId !== undefined) {
      target = `Zone ${selectedZoneId}`;
    } else if (selectedSpotId !== undefined) {
      target = `Spot #${selectedSpotId}`;
    }

    if (!action && !selectedMap && !activeMap && !target && !needsMapSwitch) {
      return undefined;
    }

    return {
      action,
      selectedMap,
      activeMap,
      target,
      needsMapSwitch,
    };
  }

  private _runtimeSessionDetails(): RuntimeSessionDetails | undefined {
    const mapEntity = this._mapEntity();
    if (!mapEntity) {
      return undefined;
    }

    const trailLengthM = this._numberAttribute(mapEntity, "runtime_track_length_m");
    const pointCount = this._numberAttribute(mapEntity, "runtime_track_point_count");
    const segmentCount = this._numberAttribute(mapEntity, "runtime_track_segment_count");
    const headingDeg = this._numberAttribute(mapEntity, "runtime_heading_deg");
    const positionX = this._numberAttribute(mapEntity, "runtime_pose_x");
    const positionY = this._numberAttribute(mapEntity, "runtime_pose_y");
    const source =
      typeof mapEntity.attributes.source === "string" && mapEntity.attributes.source
        ? mapEntity.attributes.source
        : undefined;

    const hasLiveRuntimeTrail =
      (trailLengthM !== undefined && trailLengthM > 0) ||
      (pointCount !== undefined && pointCount > 1) ||
      (segmentCount !== undefined && segmentCount > 0);
    if (!hasLiveRuntimeTrail) {
      return undefined;
    }

    return {
      trailLengthM,
      pointCount,
      segmentCount,
      headingDeg,
      positionX,
      positionY,
      source,
    };
  }

  private _runtimeMapSummaryItems(): string[] {
    const runtimeSession = this._runtimeSessionDetails();
    if (!runtimeSession) {
      return [];
    }

    const summary: string[] = [];
    const liveTrackLength = runtimeSession.trailLengthM;
    const liveTrackPoints = runtimeSession.pointCount;
    const hasLiveRuntimeTrail =
      (liveTrackLength !== undefined && liveTrackLength > 0) ||
      (liveTrackPoints !== undefined && liveTrackPoints > 1);

    if (liveTrackLength !== undefined && liveTrackLength > 0) {
      summary.push(`Live trail ${this._formatMeters(liveTrackLength)}`);
    } else {
      if (liveTrackPoints !== undefined && liveTrackPoints > 1) {
        summary.push(`Live points ${Math.round(liveTrackPoints)}`);
      }
    }

    const heading = runtimeSession.headingDeg;
    if (heading !== undefined && hasLiveRuntimeTrail) {
      summary.push(`Heading ${Math.round(heading)}°`);
    }

    return summary;
  }

  private _renderPlannedRunPanel(plannedRun: PlannedRunDetails) {
    const metrics: Array<{ label: string; value: string }> = [];

    if (plannedRun.action) {
      metrics.push({
        label: "Action",
        value: plannedRun.action,
      });
    }

    if (plannedRun.selectedMap) {
      metrics.push({
        label: "Selected Map",
        value: plannedRun.selectedMap,
      });
    }

    if (plannedRun.activeMap && plannedRun.activeMap !== plannedRun.selectedMap) {
      metrics.push({
        label: "Active Map",
        value: plannedRun.activeMap,
      });
    }

    if (plannedRun.target) {
      metrics.push({
        label: "Target",
        value: plannedRun.target,
      });
    }

    if (!metrics.length && !plannedRun.needsMapSwitch) {
      return nothing;
    }

    return html`
      <div class="target-panel">
        <div class="target-header">
          <div class="target-title">Planned Run</div>
          <div class="target-badge">Start Preview</div>
        </div>
        <div class="target-grid">
          ${metrics.map(
            (metric) => html`
              <div class="target-metric">
                <div class="target-metric-label">${metric.label}</div>
                <div class="target-metric-value">${metric.value}</div>
              </div>
            `,
          )}
        </div>
        ${plannedRun.needsMapSwitch
          ? html`
              <div class="target-note">
                The selected map does not match the mower's active app map yet. Switch maps before
                starting a scoped run.
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _renderRuntimeSessionPanel(runtimeSession: RuntimeSessionDetails) {
    const metrics: Array<{ label: string; value: string }> = [];

    if (runtimeSession.trailLengthM !== undefined && runtimeSession.trailLengthM > 0) {
      metrics.push({
        label: "Live Trail",
        value: this._formatMeters(runtimeSession.trailLengthM),
      });
    }

    if (runtimeSession.pointCount !== undefined && runtimeSession.pointCount > 1) {
      metrics.push({
        label: "Points",
        value: `${Math.round(runtimeSession.pointCount)}`,
      });
    }

    if (runtimeSession.segmentCount !== undefined && runtimeSession.segmentCount > 0) {
      metrics.push({
        label: "Segments",
        value: `${Math.round(runtimeSession.segmentCount)}`,
      });
    }

    if (runtimeSession.headingDeg !== undefined) {
      metrics.push({
        label: "Heading",
        value: `${Math.round(runtimeSession.headingDeg)}°`,
      });
    }

    if (runtimeSession.positionX !== undefined && runtimeSession.positionY !== undefined) {
      metrics.push({
        label: "Position",
        value: `${this._formatCoordinate(runtimeSession.positionX)}, ${this._formatCoordinate(runtimeSession.positionY)}`,
      });
    }

    if (runtimeSession.source) {
      metrics.push({
        label: "Source",
        value: this._humanizeValue(runtimeSession.source),
      });
    }

    if (!metrics.length) {
      return nothing;
    }

    return html`
      <div class="session-panel">
        <div class="session-header">
          <div class="session-title">Live Session</div>
          <div class="session-badge">Runtime Overlay</div>
        </div>
        <div class="session-subtitle">
          Current mowing telemetry from the live runtime map stream.
        </div>
        <div class="session-grid">
          ${metrics.map(
            (metric) => html`
              <div class="session-metric">
                <div class="session-metric-label">${metric.label}</div>
                <div class="session-metric-value">${metric.value}</div>
              </div>
            `,
          )}
        </div>
      </div>
    `;
  }

  private _showMoreInfo(entityId?: string) {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId: entityId || this._config?.entity },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private async _callConfiguredService(
    service: string,
    serviceData?: Record<string, unknown>,
  ) {
    const [domain, name] = service.split(".", 2);
    if (!domain || !name) {
      throw new Error(`Invalid service '${service}'. Use domain.service format.`);
    }

    await this.hass.callService(domain, name, serviceData || {});
  }

  private async _pressButton(entityId: string) {
    await this.hass.callService("button", "press", {
      entity_id: entityId,
    });
  }

  private async _selectOption(entityId: string, event: Event) {
    const target = event.currentTarget as HTMLSelectElement;
    const option = target.value;
    if (!option) {
      return;
    }

    await this.hass.callService("select", "select_option", {
      entity_id: entityId,
      option,
    });
  }

  private _companionEntityId(domain: string, suffix: string): string | undefined {
    if (!this._config) {
      return undefined;
    }

    const objectId = this._config.entity.split(".", 2)[1];
    if (!objectId) {
      return undefined;
    }

    const entityId = `${domain}.${objectId}_${suffix}`;
    return this.hass.states[entityId] ? entityId : undefined;
  }

  private _companionSummaryFromBinary(
    suffix: string,
    label: string,
  ): string | undefined {
    const entityId = this._companionEntityId("binary_sensor", suffix);
    if (!entityId) {
      return undefined;
    }
    const entity = this.hass.states[entityId];
    if (!entity) {
      return undefined;
    }
    if (entity.state === "on") {
      return label;
    }
    return undefined;
  }

  private _companionSummaryFromEntity(
    domain: string,
    suffix: string,
    label: string,
  ): string | undefined {
    const entityId = this._companionEntityId(domain, suffix);
    if (!entityId) {
      return undefined;
    }
    const entity = this.hass.states[entityId];
    if (!entity || ["unknown", "unavailable", ""].includes(entity.state)) {
      return undefined;
    }
    return `${label} ${this._friendlyState(entity)}`;
  }

  private _companionState(domain: string, suffix: string): string | undefined {
    const entityId = this._companionEntityId(domain, suffix);
    if (!entityId) {
      return undefined;
    }
    return this._entityState(entityId);
  }

  private _canStart(state: string): boolean {
    return !["mowing", "returning", "unavailable", "unknown"].includes(state);
  }

  private _canPause(state: string): boolean {
    return ["mowing", "returning"].includes(state);
  }

  private _canDock(state: string): boolean {
    return !["docked", "unavailable", "unknown"].includes(state);
  }

  private async _startMowing() {
    await this.hass.callService("lawn_mower", "start_mowing", {
      entity_id: this._config?.entity,
    });
  }

  private async _pauseMowing() {
    await this.hass.callService("lawn_mower", "pause", {
      entity_id: this._config?.entity,
    });
  }

  private async _dockMower() {
    await this.hass.callService("lawn_mower", "dock", {
      entity_id: this._config?.entity,
    });
  }
}

@customElement("lawn-mower-card-editor")
export class LawnMowerCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _config?: LawnMowerCardConfig;
  @state() private _serviceDataDrafts: Record<number, string> = {};

  public static styles = css`
    :host {
      display: block;
    }

    .editor {
      display: grid;
      gap: 12px;
      padding: 16px;
    }

    label {
      display: grid;
      gap: 6px;
      font-size: 0.95rem;
    }

    .hint {
      color: var(--secondary-text-color);
      font-size: 0.8rem;
    }

    input {
      box-sizing: border-box;
      width: 100%;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 10px 12px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
    }

    select {
      box-sizing: border-box;
      width: 100%;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 10px 12px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
    }

    .toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 10px 12px;
    }

    .toggle input {
      width: auto;
    }

    .section {
      display: grid;
      gap: 10px;
      padding: 14px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
    }

    .section-header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 12px;
    }

    .section-title {
      display: grid;
      gap: 4px;
    }

    .section-title strong {
      font-size: 0.95rem;
    }

    .collection {
      display: grid;
      gap: 12px;
    }

    .row {
      display: grid;
      gap: 10px;
      padding: 12px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background: color-mix(in srgb, var(--card-background-color) 92%, white 8%);
    }

    .row-grid {
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .row-grid.single {
      grid-template-columns: 1fr;
    }

    .row-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    button {
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 10px 12px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
      cursor: pointer;
    }

    button.danger {
      color: #ffd7d7;
      border-color: color-mix(in srgb, #f87171 45%, var(--divider-color) 55%);
    }

    textarea {
      box-sizing: border-box;
      width: 100%;
      min-height: 110px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 10px 12px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
      resize: vertical;
    }

    .error {
      color: #ffb4b4;
    }

    @media (max-width: 640px) {
      .row-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        display: grid;
      }
    }
  `;

  public setConfig(config: LawnMowerCardConfig): void {
    this._config = config;
  }

  protected render() {
    const config = this._config || LawnMowerCard.getStubConfig();

    return html`
      <div class="editor">
        <div class="hint">
          Select a mower first. The editor will prefill common companion entities such as map, state,
          battery, and status tiles when they can be derived safely.
        </div>
        ${this._field(
          "Mower entity",
          config.entity,
          "entity",
          "lawn_mower.my_mower",
          "Required lawn_mower entity.",
          ["lawn_mower"],
        )}
        ${this._field(
          "Title",
          config.name,
          "name",
          "Backyard mower",
          "Optional card title override.",
        )}
        ${this._layoutField(config.layout || "default")}
        ${this._field(
          "Map camera",
          config.map_entity,
          "map_entity",
          "camera.my_mower_map",
          "Optional camera entity used for the map preview.",
          ["camera"],
        )}
        ${this._toggle(
          "Show map section",
          config.show_map ?? Boolean(config.map_entity),
          "show_map",
        )}
        ${this._field(
          "Status entity",
          config.status_entity,
          "status_entity",
          "sensor.my_mower_state_name",
          "Optional entity shown under the title.",
          ["sensor", "binary_sensor", "calendar", "camera", "lawn_mower"],
        )}
        ${this._field(
          "Battery entity",
          config.battery_entity,
          "battery_entity",
          "sensor.my_mower_battery",
          "Optional entity shown as a stat tile.",
          ["sensor", "number", "input_number", "binary_sensor"],
        )}
        ${this._field(
          "Progress or status tile",
          config.progress_entity,
          "progress_entity",
          "sensor.my_mower_progress",
          "Optional entity shown as a second stat tile.",
          ["sensor", "binary_sensor", "calendar", "camera", "lawn_mower"],
        )}
        ${this._toggle(
          "Show default actions",
          config.show_default_actions ?? true,
          "show_default_actions",
        )}
        ${this._toggle(
          "Show helper actions",
          config.show_helper_actions ?? true,
          "show_helper_actions",
        )}
        ${this._controlEntitiesSection(config.control_entities || [])}
        ${this._summaryEntitiesSection(config.summary_entities || [])}
        ${this._tilesSection(config.tiles || [])}
        ${this._actionsSection(config.actions || [])}
      </div>
    `;
  }

  private _layoutField(value: "default" | "compact" | "wide") {
    return html`
      <label>
        <span>Layout</span>
        <select .value=${value} @change=${this._layoutChanged}>
          <option value="default">Default</option>
          <option value="compact">Compact</option>
          <option value="wide">Wide</option>
        </select>
        <span class="hint">Choose how the card balances map, actions, and stats.</span>
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
    key: "show_map" | "show_default_actions" | "show_helper_actions",
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

  private _controlEntitiesSection(controlEntities: string[]) {
    return html`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <strong>Control selectors</strong>
            <span class="hint">
              Add Home Assistant select entities for map, mowing action, zone, spot, or edge controls.
            </span>
          </div>
          <button type="button" @click=${this._addControlEntity}>Add selector</button>
        </div>
        ${controlEntities.length
          ? html`
              <div class="collection">
                ${controlEntities.map(
                  (entityId, index) => html`
                    <div class="row">
                      <div class="row-grid single">
                        <label>
                          <span>Select entity</span>
                          <input
                            .value=${entityId || ""}
                            data-index=${String(index)}
                            placeholder="select.my_mower_mowing_action"
                            list="lawn-mower-card-editor-control-entities"
                            @input=${this._controlEntityChanged}
                          />
                        </label>
                      </div>
                      <div class="row-actions">
                        <button
                          type="button"
                          class="danger"
                          data-index=${String(index)}
                          @click=${this._removeControlEntity}
                        >
                          Remove selector
                        </button>
                      </div>
                    </div>
                  `,
                )}
              </div>
            `
          : html`
              <div class="hint">
                No explicit control selectors yet. The card will auto-detect common mower select companions
                like map, mowing action, zone, and spot when they exist.
              </div>
            `}
        ${this._entityDatalist("lawn-mower-card-editor-control-entities", ["select"])}
      </div>
    `;
  }

  private _summaryEntitiesSection(summaryEntities: string[]) {
    return html`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <strong>Header summary chips</strong>
            <span class="hint">Add specific entities when you want tighter control over the header summary.</span>
          </div>
          <button type="button" @click=${this._addSummaryEntity}>Add summary entity</button>
        </div>
        ${summaryEntities.length
          ? html`
              <div class="collection">
                ${summaryEntities.map(
                  (entityId, index) => html`
                    <div class="row">
                      <div class="row-grid single">
                        <label>
                          <span>Entity</span>
                          <input
                            .value=${entityId || ""}
                            data-index=${String(index)}
                            placeholder="sensor.my_mower_weather_protection_status"
                            list="lawn-mower-card-editor-summary-entities"
                            @input=${this._summaryEntityChanged}
                          />
                        </label>
                      </div>
                      <div class="row-actions">
                        <button
                          type="button"
                          class="danger"
                          data-index=${String(index)}
                          @click=${this._removeSummaryEntity}
                        >
                          Remove summary entity
                        </button>
                      </div>
                    </div>
                  `,
                )}
              </div>
            `
          : html`
              <div class="hint">
                No explicit summary entities yet. The card will continue to build summary chips from battery,
                activity, task, weather, and common companion sensors automatically.
              </div>
            `}
        ${this._entityDatalist("lawn-mower-card-editor-summary-entities", [
          "sensor",
          "binary_sensor",
          "calendar",
          "camera",
          "lawn_mower",
        ])}
      </div>
    `;
  }

  private _tilesSection(tiles: LawnMowerTileConfig[]) {
    return html`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <strong>Extra tiles</strong>
            <span class="hint">Add companion entities as extra stat tiles.</span>
          </div>
          <button type="button" @click=${this._addTile}>Add tile</button>
        </div>
        ${tiles.length
          ? html`
              <div class="collection">
                ${tiles.map(
                  (tile, index) => html`
                    <div class="row">
                      <div class="row-grid">
                        <label>
                          <span>Entity</span>
                          <input
                            .value=${tile.entity || ""}
                            data-index=${String(index)}
                            data-key="entity"
                            placeholder="sensor.my_mower_error"
                            list="lawn-mower-card-editor-tile-entities"
                            @input=${this._tileChanged}
                          />
                        </label>
                        <label>
                          <span>Label</span>
                          <input
                            .value=${tile.label || ""}
                            data-index=${String(index)}
                            data-key="label"
                            placeholder="Error"
                            @input=${this._tileChanged}
                          />
                        </label>
                      </div>
                      <div class="row-grid">
                        <label>
                          <span>Icon</span>
                          <input
                            .value=${tile.icon || ""}
                            data-index=${String(index)}
                            data-key="icon"
                            placeholder="mdi:alert-circle-outline"
                            @input=${this._tileChanged}
                          />
                          <span class="hint">Optional MDI icon for future richer tile rendering.</span>
                        </label>
                      </div>
                      <div class="row-actions">
                        <button
                          type="button"
                          class="danger"
                          data-index=${String(index)}
                          @click=${this._removeTile}
                        >
                          Remove tile
                        </button>
                      </div>
                    </div>
                  `,
                )}
              </div>
            `
          : html`<div class="hint">No extra tiles yet.</div>`}
        ${this._entityDatalist("lawn-mower-card-editor-tile-entities")}
      </div>
    `;
  }

  private _actionsSection(actions: LawnMowerActionConfig[]) {
    return html`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <strong>Custom actions</strong>
            <span class="hint">Add extra control chips beyond the built-in mower and helper actions.</span>
          </div>
          <button type="button" @click=${this._addAction}>Add action</button>
        </div>
        ${actions.length
          ? html`
              <div class="collection">
                ${actions.map((action, index) => {
                  const type = action.type || "more-info";
                  const serviceDataError = this._serviceDataDraftError(index, action);
                  return html`
                    <div class="row">
                      <div class="row-grid">
                        <label>
                          <span>Type</span>
                          <select
                            .value=${type}
                            data-index=${String(index)}
                            @change=${this._actionTypeChanged}
                          >
                            <option value="more-info">More info</option>
                            <option value="service">Service</option>
                            <option value="start">Start</option>
                            <option value="pause">Pause</option>
                            <option value="dock">Dock</option>
                          </select>
                        </label>
                        <label>
                          <span>Label</span>
                          <input
                            .value=${action.label || ""}
                            data-index=${String(index)}
                            data-key="label"
                            placeholder="Details"
                            @input=${this._actionChanged}
                          />
                        </label>
                      </div>
                      <div class="row-grid">
                        <label>
                          <span>Icon</span>
                          <input
                            .value=${action.icon || ""}
                            data-index=${String(index)}
                            data-key="icon"
                            placeholder="mdi:information-outline"
                            @input=${this._actionChanged}
                          />
                        </label>
                        ${type === "more-info"
                          ? html`
                              <label>
                                <span>Target entity</span>
                                <input
                                  .value=${action.entity || ""}
                                  data-index=${String(index)}
                                  data-key="entity"
                                  placeholder="camera.my_mower_map"
                                  list="lawn-mower-card-editor-action-targets"
                                  @input=${this._actionChanged}
                                />
                                <span class="hint">Optional. Defaults to the mower entity.</span>
                              </label>
                            `
                          : type === "service"
                            ? html`
                                <label>
                                  <span>Service</span>
                                  <input
                                    .value=${action.service || ""}
                                    data-index=${String(index)}
                                    data-key="service"
                                    placeholder="button.press"
                                    @input=${this._actionChanged}
                                  />
                                </label>
                              `
                            : html`<div></div>`}
                      </div>
                      ${type === "service"
                        ? html`
                            <div class="row-grid single">
                              <label>
                                <span>Service data</span>
                                <textarea
                                  data-index=${String(index)}
                                  placeholder='{"entity_id":"button.my_probe"}'
                                  @input=${this._actionServiceDataChanged}
                                >${this._serviceDataValue(index, action)}</textarea>
                                <span class=${`hint ${serviceDataError ? "error" : ""}`}>
                                  ${serviceDataError
                                    ? "Enter valid JSON before this service data can be saved."
                                    : "Optional JSON object passed to the service call."}
                                </span>
                              </label>
                            </div>
                          `
                        : nothing}
                      <div class="row-actions">
                        <button
                          type="button"
                          class="danger"
                          data-index=${String(index)}
                          @click=${this._removeAction}
                        >
                          Remove action
                        </button>
                      </div>
                    </div>
                  `;
                })}
              </div>
            `
          : html`<div class="hint">No custom actions yet.</div>`}
        ${this._entityDatalist("lawn-mower-card-editor-action-targets")}
      </div>
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
    const target = event.currentTarget as HTMLInputElement;
    const key = target.dataset.key as keyof LawnMowerCardConfig | undefined;
    if (!key) {
      return;
    }

    const previous = this._config || LawnMowerCard.getStubConfig();
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
      next.entity = LawnMowerCard.getStubConfig().entity;
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
    const previousDetected = this._autoDetectedCompanions(previous.entity);
    const nextDetected = this._autoDetectedCompanions(next.entity);

    this._replaceAutoEntityField("map_entity", next, previousDetected, nextDetected);
    this._replaceAutoEntityField("status_entity", next, previousDetected, nextDetected);
    this._replaceAutoEntityField("battery_entity", next, previousDetected, nextDetected);
    this._replaceAutoEntityField("progress_entity", next, previousDetected, nextDetected);
    this._replaceAutoControlEntities(next, previousDetected, nextDetected);
    this._replaceAutoSummaryEntities(next, previousDetected, nextDetected);

    const previousAutoShowMap = Boolean(previousDetected.map_entity);
    if (next.show_map === undefined || next.show_map === previousAutoShowMap) {
      if (nextDetected.map_entity) {
        next.show_map = true;
      } else {
        delete next.show_map;
      }
    }
  }

  private _replaceAutoControlEntities(
    next: LawnMowerCardConfig,
    previousDetected: Partial<LawnMowerCardConfig>,
    nextDetected: Partial<LawnMowerCardConfig>,
  ) {
    const current = (next.control_entities || []).filter(Boolean);
    const previousAuto = Array.isArray(previousDetected.control_entities)
      ? previousDetected.control_entities.filter(Boolean)
      : [];
    const nextAuto = Array.isArray(nextDetected.control_entities)
      ? nextDetected.control_entities.filter(Boolean)
      : [];

    if (!current.length || this._sameEntityList(current, previousAuto)) {
      if (nextAuto.length) {
        next.control_entities = nextAuto;
      } else {
        delete next.control_entities;
      }
    }
  }

  private _replaceAutoSummaryEntities(
    next: LawnMowerCardConfig,
    previousDetected: Partial<LawnMowerCardConfig>,
    nextDetected: Partial<LawnMowerCardConfig>,
  ) {
    const current = (next.summary_entities || []).filter(Boolean);
    const previousAuto = Array.isArray(previousDetected.summary_entities)
      ? previousDetected.summary_entities.filter(Boolean)
      : [];
    const nextAuto = Array.isArray(nextDetected.summary_entities)
      ? nextDetected.summary_entities.filter(Boolean)
      : [];

    if (!current.length || this._sameEntityList(current, previousAuto)) {
      if (nextAuto.length) {
        next.summary_entities = nextAuto;
      } else {
        delete next.summary_entities;
      }
    }
  }

  private _replaceAutoEntityField(
    key: "map_entity" | "status_entity" | "battery_entity" | "progress_entity",
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

  private _autoDetectedCompanions(entityId?: string): Partial<LawnMowerCardConfig> {
    if (!entityId || !this.hass?.states) {
      return {};
    }

    const objectId = entityId.split(".", 2)[1];
    if (!objectId) {
      return {};
    }

    const companion = (domain: string, suffix: string): string | undefined => {
      const candidate = `${domain}.${objectId}_${suffix}`;
      return this.hass.states[candidate] ? candidate : undefined;
    };

    const first = (...values: Array<string | undefined>): string | undefined =>
      values.find((value) => Boolean(value));

    const mapEntity = first(
      companion("camera", "map"),
      companion("camera", "all_maps"),
      companion("camera", "map_data"),
    );

    return {
      map_entity: mapEntity,
      status_entity: first(
        companion("sensor", "state_name"),
        companion("sensor", "activity"),
        companion("sensor", "error"),
      ),
      battery_entity: companion("sensor", "battery"),
      progress_entity: first(
        companion("sensor", "runtime_mission_progress"),
        companion("sensor", "mowing_progress"),
        companion("sensor", "weather_protection_status"),
        companion("sensor", "task_status_name"),
        companion("sensor", "task_status"),
        companion("sensor", "error"),
      ),
      control_entities: [
        companion("select", "map"),
        companion("select", "mowing_action"),
        companion("select", "edge"),
        companion("select", "zone"),
        companion("select", "spot"),
      ].filter((value): value is string => Boolean(value)),
      summary_entities: [
        companion("sensor", "runtime_mission_progress"),
        companion("sensor", "runtime_current_area"),
        companion("sensor", "runtime_total_area"),
        companion("sensor", "current_zone"),
        companion("sensor", "current_cleaned_area"),
        companion("sensor", "current_cleaning_time"),
        companion("sensor", "active_segment_count"),
        first(
          companion("sensor", "current_app_map_trajectory_length"),
          companion("sensor", "current_app_map_mow_path_length"),
          companion("sensor", "current_app_map_trajectory_point_count"),
        ),
      ].filter((value): value is string => Boolean(value)),
    };
  }

  private _sameEntityList(left: string[], right: string[]) {
    return left.length === right.length && left.every((value, index) => value === right[index]);
  }

  private _toggleChanged(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const key = target.dataset.key as
      | "show_map"
      | "show_default_actions"
      | "show_helper_actions"
      | undefined;
    if (!key) {
      return;
    }

    const next: LawnMowerCardConfig = {
      ...(this._config || LawnMowerCard.getStubConfig()),
      [key]: target.checked,
    };

    if (!next.entity) {
      next.entity = LawnMowerCard.getStubConfig().entity;
    }

    this._emitConfigChanged(next);
  }

  private _layoutChanged(event: Event) {
    const target = event.currentTarget as HTMLSelectElement;
    const next: LawnMowerCardConfig = {
      ...(this._config || LawnMowerCard.getStubConfig()),
      layout: target.value as "default" | "compact" | "wide",
    };

    if (!next.entity) {
      next.entity = LawnMowerCard.getStubConfig().entity;
    }

    this._emitConfigChanged(next);
  }

  private _addSummaryEntity() {
    const next = this._nextConfig();
    next.summary_entities = [...(next.summary_entities || []), ""];
    this._emitConfigChanged(next);
  }

  private _addControlEntity() {
    const next = this._nextConfig();
    next.control_entities = [...(next.control_entities || []), ""];
    this._emitConfigChanged(next);
  }

  private _removeControlEntity(event: Event) {
    const index = this._indexFromEvent(event);
    if (index === undefined) {
      return;
    }
    const next = this._nextConfig();
    next.control_entities = (next.control_entities || []).filter(
      (_, itemIndex) => itemIndex !== index,
    );
    if (!next.control_entities.length) {
      delete next.control_entities;
    }
    this._emitConfigChanged(next);
  }

  private _controlEntityChanged(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const index = this._indexFromEvent(event);
    if (index === undefined) {
      return;
    }
    const next = this._nextConfig();
    const controlEntities = [...(next.control_entities || [])];
    controlEntities[index] = target.value.trim();
    const cleaned = controlEntities.filter(Boolean);
    if (cleaned.length) {
      next.control_entities = cleaned;
    } else {
      delete next.control_entities;
    }
    this._emitConfigChanged(next);
  }

  private _removeSummaryEntity(event: Event) {
    const index = this._indexFromEvent(event);
    if (index === undefined) {
      return;
    }
    const next = this._nextConfig();
    next.summary_entities = (next.summary_entities || []).filter(
      (_, itemIndex) => itemIndex !== index,
    );
    if (!next.summary_entities.length) {
      delete next.summary_entities;
    }
    this._emitConfigChanged(next);
  }

  private _summaryEntityChanged(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const index = this._indexFromEvent(event);
    if (index === undefined) {
      return;
    }
    const next = this._nextConfig();
    const summaryEntities = [...(next.summary_entities || [])];
    summaryEntities[index] = target.value.trim();
    const cleaned = summaryEntities.filter(Boolean);
    if (cleaned.length) {
      next.summary_entities = cleaned;
    } else {
      delete next.summary_entities;
    }
    this._emitConfigChanged(next);
  }

  private _addTile() {
    const next = this._nextConfig();
    next.tiles = [...(next.tiles || []), { entity: "" }];
    this._emitConfigChanged(next);
  }

  private _removeTile(event: Event) {
    const index = this._indexFromEvent(event);
    if (index === undefined) {
      return;
    }
    const next = this._nextConfig();
    next.tiles = (next.tiles || []).filter((_, itemIndex) => itemIndex !== index);
    if (!next.tiles.length) {
      delete next.tiles;
    }
    this._emitConfigChanged(next);
  }

  private _tileChanged(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const index = this._indexFromEvent(event);
    const key = target.dataset.key as keyof LawnMowerTileConfig | undefined;
    if (index === undefined || !key) {
      return;
    }
    const next = this._nextConfig();
    const tiles = [...(next.tiles || [])];
    const current = { ...(tiles[index] || { entity: "" }) };
    const value = target.value.trim();
    if (value) {
      current[key] = value;
    } else {
      delete current[key];
    }
    tiles[index] = current;
    next.tiles = tiles;
    this._emitConfigChanged(next);
  }

  private _addAction() {
    const next = this._nextConfig();
    next.actions = [...(next.actions || []), { type: "more-info" }];
    this._emitConfigChanged(next);
  }

  private _removeAction(event: Event) {
    const index = this._indexFromEvent(event);
    if (index === undefined) {
      return;
    }
    const next = this._nextConfig();
    next.actions = (next.actions || []).filter((_, itemIndex) => itemIndex !== index);
    if (!next.actions.length) {
      delete next.actions;
    }
    delete this._serviceDataDrafts[index];
    this._serviceDataDrafts = this._reindexDrafts(this._serviceDataDrafts, index);
    this._emitConfigChanged(next);
  }

  private _actionChanged(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const index = this._indexFromEvent(event);
    const key = target.dataset.key as keyof LawnMowerActionConfig | undefined;
    if (index === undefined || !key) {
      return;
    }
    const next = this._nextConfig();
    const actions = [...(next.actions || [])];
    const current = { ...(actions[index] || { type: "more-info" }) };
    const value = target.value.trim();
    if (value) {
      current[key] = key === "service_data" ? undefined : (value as never);
    } else {
      delete current[key];
    }
    actions[index] = current;
    next.actions = actions;
    this._emitConfigChanged(next);
  }

  private _actionTypeChanged(event: Event) {
    const target = event.currentTarget as HTMLSelectElement;
    const index = this._indexFromEvent(event);
    if (index === undefined) {
      return;
    }
    const next = this._nextConfig();
    const actions = [...(next.actions || [])];
    const current = { ...(actions[index] || {}) };
    current.type = target.value as LawnMowerActionConfig["type"];
    if (current.type !== "service") {
      delete current.service;
      delete current.service_data;
      delete this._serviceDataDrafts[index];
      this._serviceDataDrafts = { ...this._serviceDataDrafts };
    }
    if (current.type !== "more-info") {
      delete current.entity;
    }
    actions[index] = current;
    next.actions = actions;
    this._emitConfigChanged(next);
  }

  private _actionServiceDataChanged(event: Event) {
    const target = event.currentTarget as HTMLTextAreaElement;
    const index = this._indexFromEvent(event);
    if (index === undefined) {
      return;
    }
    const raw = target.value.trim();
    this._serviceDataDrafts = {
      ...this._serviceDataDrafts,
      [index]: target.value,
    };

    const next = this._nextConfig();
    const actions = [...(next.actions || [])];
    const current = { ...(actions[index] || { type: "service" }) };

    if (!raw) {
      delete current.service_data;
      delete this._serviceDataDrafts[index];
      this._serviceDataDrafts = { ...this._serviceDataDrafts };
      actions[index] = current;
      next.actions = actions;
      this._emitConfigChanged(next);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        this.requestUpdate();
        return;
      }
      current.service_data = parsed as Record<string, unknown>;
      actions[index] = current;
      next.actions = actions;
      this._emitConfigChanged(next);
    } catch {
      this.requestUpdate();
    }
  }

  private _serviceDataValue(index: number, action: LawnMowerActionConfig): string {
    if (index in this._serviceDataDrafts) {
      return this._serviceDataDrafts[index];
    }
    if (!action.service_data) {
      return "";
    }
    return JSON.stringify(action.service_data, null, 2);
  }

  private _serviceDataDraftError(index: number, action: LawnMowerActionConfig): boolean {
    const raw = this._serviceDataValue(index, action).trim();
    if (!raw) {
      return false;
    }
    try {
      const parsed = JSON.parse(raw);
      return !parsed || typeof parsed !== "object" || Array.isArray(parsed);
    } catch {
      return true;
    }
  }

  private _nextConfig(): LawnMowerCardConfig {
    const next: LawnMowerCardConfig = {
      ...(this._config || LawnMowerCard.getStubConfig()),
    };
    if (!next.entity) {
      next.entity = LawnMowerCard.getStubConfig().entity;
    }
    return next;
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

  private _indexFromEvent(event: Event): number | undefined {
    const target = event.currentTarget as HTMLElement | undefined;
    const value = target?.dataset.index;
    if (value === undefined) {
      return undefined;
    }
    const index = Number(value);
    return Number.isInteger(index) ? index : undefined;
  }

  private _reindexDrafts(
    drafts: Record<number, string>,
    removedIndex: number,
  ): Record<number, string> {
    const next: Record<number, string> = {};
    for (const [key, value] of Object.entries(drafts)) {
      const index = Number(key);
      if (Number.isNaN(index) || index === removedIndex) {
        continue;
      }
      next[index > removedIndex ? index - 1 : index] = value;
    }
    return next;
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "lawn-mower-card",
  name: "Lawn Mower Card",
  description: "A mower-native Home Assistant card with controls, map, and status tiles.",
});
