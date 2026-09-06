import { LitElement, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "./lawn-mower-card-editor";
import { mowerHassChanged } from "./card-update-scope";
import { MediaVisibility } from "./media-visibility";
import { mowingMapPath } from "./mowing-map-logic";
import { mowingAreaProgress, type MowingAreaProgress } from "./mowing-progress";

import {
  getStubConfig,
  type HassEntity,
  type HomeAssistant,
  type LawnMowerActionConfig,
  type LawnMowerCardConfig,
} from "./card-config";

import {
  cameraBlockReason,
  cameraCanBePresented,
  cameraImageUrl,
  cameraReconnectDelayMs,
  cameraRecoveryMarker,
  cameraRecoveryVerified,
  configuredCameraCanBePresented,
  configuredHeaderSummaryEntities,
  defaultHelperEntities,
  entitySummaryLabel,
  firstAvailableEntity,
  heroViewRestorationAllowed,
  isPreferenceControlEntity,
  numberControlSettings,
  prioritizedHeaderSummary,
  resolvedControlEntities,
  resolvedCoverageEntityIds,
  resolvedMowerCompanionEntity,
  resolvedOwnedMowerCompanionEntity,
} from "./card-logic";
import {
  isDeviceSettingControlEntity,
  timeInputStep,
  timeInputValue,
  timeServiceValue,
} from "./device-settings-controls";
import { renderDeviceSettingsPanel } from "./device-settings-panel";
import { renderHeroLayout, type HeroView } from "./hero-layout";
import { availableHeroViews, resolveHeroView } from "./hero-views";
import { lawnMowerCardStyles } from "./lawn-mower-card-styles";
import {
  normalizeHeroImage,
  normalizeHeroImagePosition,
} from "./hero-image";
import {
  mapPresentationClasses,
  mapIsLive,
  normalizeMapFit,
  normalizeMapPosition,
} from "./map-presentation";
import {
  createTranslator,
  resolveLocale,
  type SupportedLocale,
  type TranslationKey,
} from "./localization";
import {
  acquireMowerMutation,
  currentMowerMutation,
  releaseMowerMutation,
  subscribeMowerMutations,
} from "./mower-mutation-lock";
import {
  LawnMowerFeature,
  mowerSupportsFeature,
} from "./mower-capabilities";
import {
  pointCloudActivationErrorIsCurrent,
  pointCloudPathFromEntity,
} from "./point-cloud-logic";
import { loadPointCloudModule } from "./point-cloud-loader";
import type { PointCloudHomeAssistant } from "./point-cloud-view";
import {
  discoverScheduleControls,
  type ScheduleControl,
} from "./schedule-controls";
import { renderSchedulePanel } from "./schedule-panel";
import {
  normalizedZoneSelection,
  reconciledZoneSelectionKeys,
  selectedMapIsCurrent,
  supportsDreameMultiZoneMowing,
  zoneChoices,
  zoneMowingServiceData,
  zonePreferenceChoice,
  zoneSelectionFallbackId,
  zoneSelectionKeys,
  zoneSelectionLabels,
  type ZoneChoice,
  type ZoneSelectionKeys,
} from "./zone-selection";
const CAMERA_VIEW_GRACE_MS = 15_000;
const HERO_VIEW_RECONNECT_TTL_MS = 30_000;

const transientHeroViews = new Map<
  string,
  { view: Exclude<HeroView, "overview">; route: string; storedAt: number }
>();

function transientHeroViewKey(
  entityId: string,
  route: string,
  cardSlot: string,
): string {
  return JSON.stringify([entityId, route, cardSlot]);
}

function connectedCardSlot(element: Element): string | undefined {
  if (!element.isConnected) {
    return undefined;
  }

  const segments: string[] = [];
  let current: Node | null = element;
  while (current && current !== document) {
    const parent: ParentNode | null = current.parentNode;
    if (
      !parent ||
      (!(parent instanceof Element) &&
        !(parent instanceof Document) &&
        !(parent instanceof ShadowRoot))
    ) {
      return undefined;
    }

    const currentElement = current instanceof Element ? current : undefined;
    if (!currentElement) {
      return undefined;
    }
    const index = Array.from(parent.children).indexOf(currentElement);
    if (index < 0) {
      return undefined;
    }
    segments.push(`${currentElement.localName}:${index}`);
    current = parent instanceof ShadowRoot ? parent.host : parent;
  }

  return segments.reverse().join("/");
}

type RuntimeSessionDetails = {
  missionProgress?: string;
  currentArea?: string;
  totalArea?: string;
  currentZone?: string;
  bluetoothState?: string;
  trailLengthM?: number;
  pointCount?: number;
  segmentCount?: number;
  headingDeg?: number;
  positionX?: number;
  positionY?: number;
  source?: string;
};

type HeroMetric = {
  label: string;
  value?: string;
  area?: MowingAreaProgress;
};

type PlannedRunDetails = {
  action?: string;
  selectedMap?: string;
  activeMap?: string;
  target?: string;
  needsMapSwitch?: boolean;
  selectedMapPreferences?: SelectedMapPreferenceDetails;
  selectedZonePreferences?: SelectedZonePreferenceDetails;
};

type SelectedMapPreferenceDetails = {
  modeLabel?: string;
  modeKey?: string;
  areaCount?: string;
  preferenceCount?: string;
};

type SelectedZonePreferenceDetails = {
  zoneLabel?: string;
  mowingHeight?: string;
  efficiencyMode?: string;
  directionMode?: string;
  obstacleAvoidance?: string;
  obstacleDistance?: string;
  obstacleHeight?: string;
  obstacleClasses?: string;
};

type ZoneSelectionState = {
  keys: ZoneSelectionKeys;
  zoneIds: number[];
};

declare global {
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }
}

const FRIENDLY_STATE: Record<string, TranslationKey> = {
  mowing: "state.mowing",
  docked: "state.docked",
  paused: "state.paused",
  returning: "state.returning",
  error: "common.error",
  unavailable: "common.unavailable",
  unknown: "common.unknown",
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
  @state() private _heroView: HeroView = "overview";
  @state() private _heroViewChosen = false;
  @state() private _pointCloudMounted = false;
  @state() private _traditionalPointCloudActive = false;
  @state() private _traditionalPointCloudLoading = false;
  @state() private _pointCloudLoadError?: string;
  @state() private _cameraMounted = false;
  @state() private _mediaVisible = true;
  private _visibleMapUrl?: string;
  private _mediaVisibility = new MediaVisibility(this, (visible) => {
    this._mediaVisible = visible;
    if (!visible) this._resetCameraRecovery();
  });
  @state() private _cameraRenderGeneration = 0;
  @state() private _cameraReconnecting = false;
  @state() private _actionFeedback?: {
    message: string;
    error: boolean;
  };
  private _cameraUnmountTimer?: number;
  private _cameraReconnectTimer?: number;
  private _cameraReconnectAttempt = 0;
  private _lastCameraRecoveryMarker?: string;
  private _heroViewRoute?: string;
  private _heroViewSlot?: string;
  private _actionFeedbackTimer?: number;
  private _actionGeneration = 0;
  private _heroPointCloudGeneration = 0;
  private _mutationSubscription?: () => void;
  private _traditionalPointCloudGeneration = 0;
  @state() private _zoneSelection?: ZoneSelectionState;

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

  private get _mutationInFlight(): string | undefined {
    return this._config?.entity
      ? currentMowerMutation(this._config.entity)
      : undefined;
  }

  public static styles = lawnMowerCardStyles;

  public static getStubConfig(): LawnMowerCardConfig {
    return getStubConfig();
  }

  public setConfig(config: LawnMowerCardConfig): void {
    if (!config.entity) {
      throw new Error("The 'entity' option is required.");
    }
    const previousEntity = this._config?.entity;
    const previousLayout = this._config?.layout || "default";
    const nextLayout = config.layout || "default";
    if (this._config?.entity !== config.entity) {
      this._actionGeneration += 1;
      this._actionFeedback = undefined;
      this._clearActionFeedbackTimer();
      this._zoneSelection = undefined;
      this._resetTraditionalPointCloudState();
      this._resetHeroMediaState();
    } else if (previousLayout === "hero" && nextLayout !== "hero") {
      this._resetHeroMediaState();
    }
    this._config = config;
    if (previousEntity === undefined && this.isConnected) {
      this._restoreRetainedHeroView();
    }
  }

  public connectedCallback(): void {
    super.connectedCallback();
    this._mediaVisibility.connect();
    this._mutationSubscription ??= subscribeMowerMutations((entityId) => {
      if (entityId === this._config?.entity) {
        this.requestUpdate();
      }
    });
    this._heroViewSlot = connectedCardSlot(this);
    if (
      this._heroView !== "overview" &&
      this._heroViewRoute !== window.location.pathname
    ) {
      this._resetHeroMediaState();
      return;
    }
    this._restoreRetainedHeroView();
    if (this._heroView === "camera") {
      this._cameraMounted = true;
    }
  }

  public disconnectedCallback(): void {
    this._mediaVisibility.disconnect();
    const entityId = this._config?.entity;
    if (
      entityId &&
      this._heroViewSlot &&
      this._heroView !== "overview" &&
      this._heroViewRoute === window.location.pathname
    ) {
      const key = transientHeroViewKey(
        entityId,
        this._heroViewRoute,
        this._heroViewSlot,
      );
      const retained = {
        view: this._heroView,
        route: this._heroViewRoute,
        storedAt: Date.now(),
      } as const;
      transientHeroViews.set(key, retained);
      window.setTimeout(() => {
        if (transientHeroViews.get(key) === retained) {
          transientHeroViews.delete(key);
        }
      }, HERO_VIEW_RECONNECT_TTL_MS);
    } else if (entityId && this._heroViewSlot) {
      transientHeroViews.delete(
        transientHeroViewKey(
          entityId,
          this._heroViewRoute || window.location.pathname,
          this._heroViewSlot,
        ),
      );
    }
    this._actionGeneration += 1;
    this._actionFeedback = undefined;
    this._clearActionFeedbackTimer();
    this._clearCameraUnmountTimer();
    this._resetCameraRecovery();
    this._cameraMounted = false;
    this._mutationSubscription?.();
    this._mutationSubscription = undefined;
    super.disconnectedCallback();
  }

  protected updated(): void {
    if (!this.hass || !this._config) {
      return;
    }
    if (this._config.layout === "hero") {
      this._syncCameraRecovery();
      return;
    }
    this._resetCameraRecovery();
  }

  protected shouldUpdate(changed: PropertyValues): boolean {
    if (changed.size === 0 || [...changed.keys()].some((key) => key !== "hass")) {
      return true;
    }
    return mowerHassChanged(changed.get("hass"), this.hass, this._config);
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
        <ha-card lang=${this._locale}>
          <div class="wrap">${this._t("card.entityNotFound", { entity: this._config.entity })}</div>
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
    if (this._mediaVisible) {
      this._visibleMapUrl = mapEntity ? this._cameraUrl(mapEntity) : undefined;
    }
    const mapUrl = this._visibleMapUrl;
    const showMap = this._config.show_map ?? Boolean(this._config.map_entity);
    const pointCloudPath = pointCloudPathFromEntity(mapEntity);
    const showPointCloud =
      this._config.show_point_cloud ?? Boolean(pointCloudPath);
    const statTiles = this._buildTiles();
    const actionGroups = this._buildActionGroups(mower);
    const headerSummary = this._buildHeaderSummary();
    const scheduleControls = discoverScheduleControls(
      this.hass.states,
      this._config.entity,
    );
    const scheduleEntityIds = new Set(
      scheduleControls.map((control) => control.entityId),
    );
    const controlEntities = this._resolvedControlEntities().filter(
      (entityId) => !scheduleEntityIds.has(entityId),
    );
    const preferenceControlEntities = controlEntities.filter(
      isPreferenceControlEntity,
    );
    const deviceSettingControlEntities = controlEntities.filter(
      isDeviceSettingControlEntity,
    );
    const primaryControlEntities = controlEntities.filter(
      (entityId) =>
        !isPreferenceControlEntity(entityId) &&
        !isDeviceSettingControlEntity(entityId),
    );
    const plannedRun = this._plannedRunDetails(mower);
    const runtimeSession = this._runtimeSessionDetails();
    const showAdvancedDetails = this._config.show_advanced_details ?? false;
    const visibleActionFeedback =
      this._actionFeedback || this._connectionFeedback(mower);

    if (layout === "hero") {
      return this._renderHeroCard(
        mower,
        title,
        subtitle,
        showMap ? mapUrl : undefined,
        showPointCloud ? pointCloudPath : undefined,
        controlEntities,
        scheduleControls,
      );
    }

    return html`
      <ha-card lang=${this._locale}>
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
                    ${mowingMapPath(mapEntity?.attributes.mowing_map_api_path)
                      ? html`<lawn-mower-mowing-map style="height:320px"
                          .hass=${this.hass} .locale=${this._locale}
                          .path=${mowingMapPath(mapEntity?.attributes.mowing_map_api_path)}
                          .fallbackUrl=${mapUrl} .fallbackSaved=${mapEntity?.attributes.restart_preview === true}
                          .active=${this._mediaVisible}></lawn-mower-mowing-map>`
                      : mapUrl
                      ? html`<img
                          class=${mapPresentationClasses(
                            this._config.map_fit,
                            this._config.map_position,
                          )}
                          src=${mapUrl}
                          alt=${title}
                          @click=${() => this._showMoreInfo(mapEntity?.entity_id)}
                        />`
                      : html`<div class="map-placeholder">${this._t("card.mapMissing")}</div>`}
                    ${mapEntity && !mowingMapPath(mapEntity.attributes.mowing_map_api_path)
                      ? this._renderMapStatus(mapEntity, mower.state) : nothing}
                  </div>
                `
              : nothing}
            ${showPointCloud
              ? html`
                  <div class="point-cloud-panel">
                    ${!pointCloudPath
                      ? html`
                          <div class="point-cloud-placeholder" role="status">
                            <ha-icon icon="mdi:cube-off-outline"></ha-icon>
                            <p>${this._t("pointCloud.notConfigured")}</p>
                          </div>
                        `
                      : this._pointCloudLoadError
                        ? html`
                            <div role="alert">
                              <p>${this._pointCloudLoadError}</p>
                              <button
                                type="button"
                                @click=${this._retryPointCloudModule}
                              >
                                ${this._t("pointCloud.rendererRetry")}
                              </button>
                            </div>
                          `
                        : this._traditionalPointCloudActive
                        ? html`
                          <lawn-mower-point-cloud
                            .hass=${this.hass as PointCloudHomeAssistant}
                            .path=${pointCloudPath}
                            .active=${this._mediaVisible}
                            .autoLoad=${true}
                            .compact=${layout === "compact"}
                            .locale=${this._locale}
                          ></lawn-mower-point-cloud>
                        `
                        : html`
                            <div class="point-cloud-placeholder">
                              <ha-icon icon="mdi:cube-scan"></ha-icon>
                              <p>
                                ${this._t("pointCloud.lazyDescription")}
                              </p>
                              <button
                                type="button"
                                ?disabled=${this._traditionalPointCloudLoading}
                                @click=${this._activateTraditionalPointCloud}
                              >
                                ${this._traditionalPointCloudLoading
                                  ? this._t("pointCloud.rendererLoading")
                                  : this._t("pointCloud.load")}
                              </button>
                            </div>
                          `}
                  </div>
                `
              : nothing}
          </div>

          <div class="side">
            ${showAdvancedDetails && plannedRun
              ? this._renderPlannedRunPanel(plannedRun)
              : nothing}

            ${showAdvancedDetails && runtimeSession
              ? this._renderRuntimeSessionPanel(runtimeSession)
              : nothing}

            ${scheduleControls.length
              ? renderSchedulePanel(
                  scheduleControls.map((control) => ({
                    ...control,
                    available:
                      control.available && !Boolean(this._mutationInFlight),
                  })),
                  (entityId, enabled) => this._toggleSwitch(entityId, enabled),
                  this._t,
                )
              : nothing}

            ${primaryControlEntities.length
              ? html`
                  <div class="selectors">
                    ${primaryControlEntities.map((entityId) => this._renderEntityControl(entityId))}
                  </div>
                `
              : nothing}
            ${this._renderDeviceSettingsControls(deviceSettingControlEntities)}
            ${this._renderPreferenceControls(preferenceControlEntities)}

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

            ${visibleActionFeedback
              ? html`
                  <div
                    class=${`action-feedback${
                      visibleActionFeedback.error ? " error" : ""
                    }`}
                    role=${visibleActionFeedback.error ? "alert" : "status"}
                    aria-live=${visibleActionFeedback.error
                      ? "assertive"
                      : "polite"}
                  >
                    <ha-icon
                      icon=${visibleActionFeedback.error
                        ? "mdi:alert-circle-outline"
                        : "mdi:wifi-sync"}
                    ></ha-icon>
                    <span>${visibleActionFeedback.message}</span>
                  </div>
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
    const mapEntity = this._config?.map_entity
      ? this.hass?.states[this._config.map_entity]
      : undefined;
    const showPointCloud =
      this._config?.show_point_cloud ??
      Boolean(pointCloudPathFromEntity(mapEntity));
    const layout = this._config?.layout || "default";
    if (layout === "hero") {
      return 8;
    }
    if (layout === "compact") {
      return showMap || showPointCloud ? 8 : 6;
    }
    if (layout === "wide") {
      return showMap || showPointCloud ? 10 : 8;
    }
    return showMap || showPointCloud ? 9 : 7;
  }

  private _renderHeroCard(
    mower: HassEntity,
    title: string,
    subtitle: string,
    mapUrl?: string,
    pointCloudPath?: string,
    controlEntities: string[] = [],
    scheduleControls: ScheduleControl[] = [],
  ) {
    if (!this._config) {
      return nothing;
    }

    const candidateCameraEntity = this._cameraCandidate();
    const cameraEntity =
      candidateCameraEntity &&
      (this._config.camera_entity
        ? configuredCameraCanBePresented(
            candidateCameraEntity,
            this._cameraMounted,
          )
        : cameraCanBePresented(
            candidateCameraEntity,
            this._cameraMounted,
            mower,
          ))
        ? candidateCameraEntity
        : undefined;
    const maintenancePointButton = defaultHelperEntities(
      this.hass.states,
      this._config.entity,
      this.hass.entities,
    ).find((helper) => helper.action === "press");
    const configuredMapEntity = this._config.map_entity
      ? this.hass.states[this._config.map_entity]
      : undefined;
    const battery =
      this._entityState(this._config.battery_entity) ||
      this._stringAttribute(mower, "battery_level", "%");
    const progress = this._heroMissionMetric();
    const coverage = this._heroCoverageMetric();
    const controls = controlEntities.length || scheduleControls.length
      ? html`
          ${scheduleControls.length
            ? renderSchedulePanel(
                scheduleControls.map((control) => ({
                  ...control,
                  available:
                    control.available && !Boolean(this._mutationInFlight),
                })),
                (entityId, enabled) => this._toggleSwitch(entityId, enabled),
                this._t,
              )
            : nothing}
          ${controlEntities
            .filter(
              (entityId) =>
                !isPreferenceControlEntity(entityId) &&
                !isDeviceSettingControlEntity(entityId),
            )
            .map((entityId) => this._renderEntityControl(entityId))}
          ${this._renderDeviceSettingsControls(
            controlEntities.filter(isDeviceSettingControlEntity),
          )}
          ${this._renderPreferenceControls(
            controlEntities.filter(isPreferenceControlEntity),
          )}
        `
      : undefined;
    const scenePath = this._config.show_map === false ? undefined
      : mowingMapPath(configuredMapEntity?.attributes.mowing_map_api_path);
    const availableViews = availableHeroViews({
      map: Boolean(mapUrl || scenePath),
      pointCloud: Boolean(pointCloudPath),
      camera: Boolean(cameraEntity),
    });
    const activeView = resolveHeroView(
      !this._heroViewChosen && this._heroView === "overview" && mower.state === "mowing" && scenePath
        ? "map" : this._heroView,
      availableViews,
    );
    const cameraBlockedReason = cameraEntity
      ? cameraBlockReason(cameraEntity)
      : undefined;

    return renderHeroLayout({
      t: this._t,
      locale: this._locale,
      title,
      subtitle,
      stateLabel: this._friendlyMowerState(mower.state),
      stateKey: mower.state.toLowerCase().replace(/[^a-z0-9_-]+/g, "-"),
      battery,
      progress: progress.value,
      progressLabel: progress.label,
      coverage: coverage.value,
      coverageLabel: coverage.label,
      area: coverage.area,
      mowingMapPath: scenePath,
      mapSavedPreview: configuredMapEntity?.attributes.restart_preview === true,
      heroImage: normalizeHeroImage(this._config.hero_image),
      heroImagePosition: normalizeHeroImagePosition(this._config.hero_image_position),
      activeView,
      availableViews,
      mapUrl,
      mapFit: normalizeMapFit(this._config.map_fit),
      mapPosition: normalizeMapPosition(this._config.map_position),
      mapStatus: configuredMapEntity
        ? this._renderMapStatus(configuredMapEntity, mower.state)
        : undefined,
      pointCloudPath,
      pointCloudMounted: this._pointCloudMounted,
      mediaVisible: this._mediaVisible,
      pointCloudLoadError: this._pointCloudLoadError,
      cameraEntity,
      cameraMounted: this._cameraMounted && this._mediaVisible,
      cameraRenderKey: cameraEntity
        ? `${cameraEntity.entity_id}:${this._cameraRenderGeneration}`
        : undefined,
      cameraReconnecting: this._cameraReconnecting,
      cameraBlockReason: cameraBlockedReason,
      cameraPreviewUrl: cameraEntity && !cameraBlockedReason
        ? cameraImageUrl(cameraEntity.entity_id, cameraEntity)
        : undefined,
      controls,
      hass: this.hass,
      supportsStart: mowerSupportsFeature(
        mower,
        LawnMowerFeature.START_MOWING,
      ),
      supportsPause: mowerSupportsFeature(mower, LawnMowerFeature.PAUSE),
      supportsDock: mowerSupportsFeature(mower, LawnMowerFeature.DOCK),
      canStart:
        !this._mutationInFlight &&
        this._canStart(mower.state) &&
        this._canStartSelectedTarget(),
      canPause: !this._mutationInFlight && this._canPause(mower.state),
      canDock: !this._mutationInFlight && this._canDock(mower.state),
      maintenancePointAvailable:
        !this._mutationInFlight &&
        maintenancePointButton !== undefined &&
        this.hass.states[maintenancePointButton.entityId]?.state !== "unavailable",
      showDefaultActions: this._config.show_default_actions ?? true,
      showHelperActions: this._config.show_helper_actions ?? true,
      actionFeedback: this._actionFeedback || this._connectionFeedback(mower),
      onView: (view) => this._selectHeroView(view),
      onStart: () => this._startMowing(),
      onPause: () => this._pauseMowing(),
      onDock: () => this._dockMower(),
      onMaintenancePoint: maintenancePointButton
        ? () => this._pressButton(maintenancePointButton.entityId)
        : undefined,
      onMoreInfo: () => this._showMoreInfo(),
    });
  }

  private _selectHeroView(view: HeroView): void {
    this._heroViewChosen = true;
    this._deleteRetainedHeroView();
    const previous = this._heroView;
    const pointCloudGeneration = ++this._heroPointCloudGeneration;
    this._heroView = view;
    this._heroViewRoute =
      view === "overview" ? undefined : window.location.pathname;
    if (view === "point-cloud") {
      if (!this._currentPointCloudPath()) {
        this._pointCloudMounted = false;
        this._pointCloudLoadError = undefined;
        return;
      }
      this._pointCloudLoadError = undefined;
      void loadPointCloudModule().then(() => {
        // Mount only after registration so initial reactive properties are not
        // shadowed by assignments to an unupgraded custom element.
        if (
          pointCloudActivationErrorIsCurrent(
            pointCloudGeneration,
            this._heroPointCloudGeneration,
            this._config?.layout,
            this._heroView,
            this._currentPointCloudPath(),
          )
        ) {
          this._pointCloudMounted = true;
        }
      }).catch(() => {
        if (
          !pointCloudActivationErrorIsCurrent(
            pointCloudGeneration,
            this._heroPointCloudGeneration,
            this._config?.layout,
            this._heroView,
            this._currentPointCloudPath(),
          )
        ) {
          return;
        }
        this._pointCloudMounted = false;
        this._pointCloudLoadError = this._t("pointCloud.rendererFailed");
      });
    }
    if (view === "camera") {
      this._clearCameraUnmountTimer();
      this._cameraMounted = true;
    } else if (previous === "camera" && this._cameraMounted) {
      this._resetCameraRecovery();
      this._clearCameraUnmountTimer();
      this._cameraUnmountTimer = window.setTimeout(() => {
        this._cameraUnmountTimer = undefined;
        if (this._heroView !== "camera") {
          this._cameraMounted = false;
        }
      }, CAMERA_VIEW_GRACE_MS);
    }
  }

  private _retryPointCloudModule = (): void => {
    this._pointCloudLoadError = undefined;
    this._activateTraditionalPointCloud();
  };

  private _activateTraditionalPointCloud = (): void => {
    if (!this._currentPointCloudPath()) {
      this._pointCloudLoadError = undefined;
      return;
    }
    if (
      this._traditionalPointCloudActive ||
      this._traditionalPointCloudLoading
    ) {
      return;
    }
    const generation = ++this._traditionalPointCloudGeneration;
    this._pointCloudLoadError = undefined;
    this._traditionalPointCloudLoading = true;
    void loadPointCloudModule()
      .then(() => {
        if (generation === this._traditionalPointCloudGeneration) {
          this._traditionalPointCloudActive = true;
        }
      })
      .catch(() => {
        if (generation === this._traditionalPointCloudGeneration) {
          this._pointCloudLoadError = this._t("pointCloud.rendererFailed");
        }
      })
      .finally(() => {
        if (generation === this._traditionalPointCloudGeneration) {
          this._traditionalPointCloudLoading = false;
        }
      });
  };

  private _resetTraditionalPointCloudState(): void {
    this._traditionalPointCloudGeneration += 1;
    this._traditionalPointCloudActive = false;
    this._traditionalPointCloudLoading = false;
  };

  private _resetHeroMediaState(): void {
    this._heroViewChosen = false;
    this._deleteRetainedHeroView();
    this._heroPointCloudGeneration += 1;
    this._heroView = "overview";
    this._heroViewRoute = undefined;
    this._pointCloudMounted = false;
    this._pointCloudLoadError = undefined;
    this._cameraMounted = false;
    this._clearCameraUnmountTimer();
    this._resetCameraRecovery();
  }

  private _currentPointCloudPath(): string | undefined {
    const mapEntity = this._config?.map_entity
      ? this.hass?.states[this._config.map_entity]
      : undefined;
    return pointCloudPathFromEntity(mapEntity);
  }

  private _deleteRetainedHeroView(): void {
    if (!this._config?.entity || !this._heroViewSlot) {
      return;
    }
    transientHeroViews.delete(
      transientHeroViewKey(
        this._config.entity,
        this._heroViewRoute || window.location.pathname,
        this._heroViewSlot,
      ),
    );
  }

  private _restoreRetainedHeroView(): void {
    if (!this._config?.entity || !this._heroViewSlot) {
      return;
    }
    const route = window.location.pathname;
    const key = transientHeroViewKey(
      this._config.entity,
      route,
      this._heroViewSlot,
    );
    const retained = transientHeroViews.get(key);
    transientHeroViews.delete(key);
    if (!heroViewRestorationAllowed(this._config.layout)) {
      return;
    }
    if (
      this._heroView === "overview" &&
      retained &&
      retained.route === route &&
      Date.now() - retained.storedAt <= HERO_VIEW_RECONNECT_TTL_MS
    ) {
      this._selectHeroView(retained.view);
    }
  }

  private _clearCameraUnmountTimer(): void {
    if (this._cameraUnmountTimer !== undefined) {
      window.clearTimeout(this._cameraUnmountTimer);
      this._cameraUnmountTimer = undefined;
    }
  }

  private _cameraCandidate(): HassEntity | undefined {
    if (!this._config || !this.hass) {
      return undefined;
    }
    const cameraEntityId =
      this._config.camera_entity ||
      defaultHelperEntities(
        this.hass.states,
        this._config.entity,
        this.hass.entities,
      ).find(
        (helper) => helper.label === "Live Video",
      )?.entityId;
    return cameraEntityId ? this.hass.states[cameraEntityId] : undefined;
  }

  private _syncCameraRecovery(): void {
    const camera = this._cameraCandidate();
    if (
      this._heroView !== "camera" ||
      !this._mediaVisible ||
      !this._cameraMounted ||
      !camera
    ) {
      this._resetCameraRecovery();
      return;
    }
    if (cameraRecoveryVerified(camera)) {
      this._resetCameraRecovery();
      return;
    }
    const marker = cameraRecoveryMarker(camera);
    if (!marker) {
      if (
        this._cameraReconnecting ||
        this._cameraReconnectTimer !== undefined
      ) {
        this._resetCameraRecovery();
      }
      return;
    }
    if (marker === this._lastCameraRecoveryMarker) {
      return;
    }
    this._lastCameraRecoveryMarker = marker;
    this._cameraReconnecting = true;
    if (this._cameraReconnectTimer !== undefined) {
      window.clearTimeout(this._cameraReconnectTimer);
    }
    const delay = cameraReconnectDelayMs(this._cameraReconnectAttempt);
    this._cameraReconnectAttempt += 1;
    this._cameraReconnectTimer = window.setTimeout(() => {
      this._cameraReconnectTimer = undefined;
      if (
        this.isConnected &&
        this._heroView === "camera" &&
        this._cameraMounted
      ) {
        this._cameraRenderGeneration += 1;
      }
    }, delay);
  }

  private _resetCameraRecovery(): void {
    if (this._cameraReconnectTimer !== undefined) {
      window.clearTimeout(this._cameraReconnectTimer);
      this._cameraReconnectTimer = undefined;
    }
    this._cameraReconnectAttempt = 0;
    this._lastCameraRecoveryMarker = undefined;
    this._cameraReconnecting = false;
  }

  private _buildTiles(): Array<{ label: string; value: string }> {
    if (!this._config || !this.hass) {
      return [];
    }

    return (this._config.tiles || [])
      .filter((tile) => {
        const entity = this.hass.states[tile.entity];
        return Boolean(entity && !this._isUnavailableEntity(entity));
      })
      .map((tile) => this._tileFromEntity(tile.entity, tile.label, tile.icon));
  }

  private _buildHeaderSummary(): string[] {
    if (!this._config || !this.hass) {
      return [];
    }

    const automaticSummary: string[] = [];
    const configuredSummary: string[] = [];
    const mower = this.hass.states[this._config.entity];
    if (!mower) {
      return automaticSummary;
    }

    const error =
      this._stringAttribute(mower, "error_display") ||
      this._stringAttribute(mower, "error_text");
    if (error && !["none", "no error"].includes(error.toLowerCase())) {
      automaticSummary.push(`${this._t("common.error")} ${error}`);
    }

    const battery =
      this._entityState(this._config.battery_entity) ||
      this._stringAttribute(mower, "battery_level", "%");
    if (battery) {
      automaticSummary.push(`${this._t("hero.battery")} ${battery}`);
    }

    const configured = configuredHeaderSummaryEntities(
      this._config.summary_entities,
    );
    if (configured.length) {
      for (const entityId of configured) {
        const entity = this.hass.states[entityId];
        if (!entity || this._isUnavailableEntity(entity)) {
          continue;
        }
        const label = entitySummaryLabel(
          entityId,
          entity,
          this._preferredEntityLabel(entityId),
        );
        configuredSummary.push(`${label} ${this._friendlyState(entity)}`);
      }
    } else {
      const progressEntityId = this._config.progress_entity;
      const progressEntity = progressEntityId
        ? this.hass.states[progressEntityId]
        : undefined;
      const configuredProgress = this._entityState(progressEntityId);
      const progress =
        configuredProgress ||
        this._companionState("sensor", "runtime_mission_progress") ||
        this._companionState("sensor", "mowing_progress");
      if (progress) {
        const label =
          configuredProgress && progressEntity && progressEntityId
            ? entitySummaryLabel(
                progressEntityId,
                progressEntity,
                this._preferredEntityLabel(progressEntityId),
              )
            : this._t("metric.progress");
        automaticSummary.push(`${label} ${progress}`);
      }
      const currentArea = this._companionState("sensor", "runtime_current_area");
      const totalArea = this._companionState("sensor", "runtime_total_area");
      if (currentArea && totalArea) {
        automaticSummary.push(`${this._t("metric.coverage")} ${currentArea} / ${totalArea}`);
      }
    }

    const rainDelay = this._companionSummaryFromBinary("rain_delay_active", this._t("settings.rainDelayLabel"));
    if (rainDelay) {
      automaticSummary.push(rainDelay);
    }

    return prioritizedHeaderSummary(configuredSummary, automaticSummary);
  }

  private _resolvedControlEntities(): string[] {
    if (!this._config) {
      return [];
    }

    const configured = (this._config.control_entities || []).filter(Boolean);
    if (!this._config.entity || !this.hass?.states) {
      return [];
    }
    return resolvedControlEntities(
      this.hass.states,
      this._config.entity,
      configured,
      this.hass.entities,
    );
  }

  private _renderEntityControl(entityId: string) {
    if (entityId.startsWith("switch.")) {
      return this._renderSwitchControl(entityId);
    }
    if (entityId.startsWith("number.")) {
      return this._renderNumberControl(entityId);
    }
    if (entityId.startsWith("time.")) {
      return this._renderTimeControl(entityId);
    }
    if (this._zoneStartContext()?.entityId === entityId) {
      return this._renderZoneControl(entityId);
    }
    return this._renderSelectControl(entityId);
  }

  private _renderZoneControl(entityId: string) {
    const entity = this.hass.states[entityId];
    const choices = this._zoneChoices(entityId);
    if (!entity || choices.length < 2) {
      return this._renderSelectControl(entityId);
    }

    const selectedIds = this._selectedZoneIds(entityId, choices);
    const selected = new Set(selectedIds);
    const unavailable = ["unavailable", "unknown"].includes(
      String(entity.state).trim().toLowerCase(),
    );
    const label =
      this._friendlyName(entity) ||
      this._preferredEntityLabel(entityId) ||
      this._entityName(entityId);
    const labelId = `zone-selector-${entityId.replace(/[^a-z0-9_-]+/gi, "-")}`;
    const count = selectedIds.length;

    return html`
      <div class="selector-card">
        <span class="selector-label" id=${labelId}>${label}</span>
        <div class="zone-option-list" role="group" aria-labelledby=${labelId}>
          ${choices.map((choice) => {
            const checked = selected.has(choice.id);
            return html`
              <label class=${`zone-option ${checked ? "selected" : ""}`.trim()}>
                <input
                  type="checkbox"
                  .checked=${checked}
                  ?disabled=${unavailable || Boolean(this._mutationInFlight)}
                  @change=${(event: Event) =>
                    this._toggleZone(entityId, choice, event)}
                />
                <span>${choice.label}</span>
              </label>
            `;
          })}
        </div>
        <span class="zone-selection-note" aria-live="polite">
          ${count
            ? this._t("card.zoneSelection", { count })
            : this._t("card.selectZone")}
        </span>
      </div>
    `;
  }

  private _renderSwitchControl(entityId: string) {
    const entity = this.hass.states[entityId];
    if (!entity) {
      return nothing;
    }
    const label =
      this._friendlyName(entity) ||
      this._preferredEntityLabel(entityId) ||
      this._entityName(entityId);
    const enabled = entity.state === "on";
    const available = !this._isUnavailableEntity(entity);
    if (!available) {
      return html`
        <div class="selector-card">
          <span class="selector-label">${label}</span>
          <div class="selector-switch-body">
            <span>${this._t("common.unavailable")}</span>
          </div>
        </div>
      `;
    }
    return html`
      <div class="selector-card">
        <span class="selector-label">${label}</span>
        <div class="selector-switch-body">
          <span>${this._t(enabled ? "common.on" : "common.off")}</span>
          <button
            class="schedule-toggle"
            role="switch"
            aria-label=${`${label}: ${this._t(enabled ? "common.on" : "common.off")}`}
            aria-checked=${String(enabled)}
            ?disabled=${Boolean(this._mutationInFlight)}
            @click=${() => this._toggleSwitch(entityId, enabled)}
          ></button>
        </div>
      </div>
    `;
  }

  private _renderMapStatus(entity: HassEntity, mowerState: string) {
    const details = entity.attributes;
    const mapName =
      this._stringValue(details.map_name) ||
      this._stringValue(details.name);
    const live = mapIsLive(details, mowerState);
    const invalidPosition = details.runtime_position_valid === false;
    return html`
      <div class="map-status">
        ${mapName ? html`<span class="map-badge">${mapName}</span>` : nothing}
        ${live ? html`<span class="map-badge live">${this._t("card.live")}</span>` : nothing}
        ${details.restart_preview === true
          ? html`<span class="map-badge warning">${this._t("card.savedPreview")}</span>`
          : nothing}
        ${invalidPosition
          ? html`<span class="map-badge warning">${this._t("card.positionWithheld")}</span>`
          : nothing}
      </div>
    `;
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
          ?disabled=${unavailable || Boolean(this._mutationInFlight)}
          @change=${(event: Event) => this._selectOption(entityId, event)}
        >
          ${unavailable
            ? html`<option selected disabled>${this._t("common.unavailable")}</option>`
            : nothing}
          ${options.map(
            (option) => html`
              <option
                value=${option}
                ?selected=${option === String(entity.state)}
              >${option}</option>
            `,
          )}
        </select>
      </label>
    `;
  }

  private _renderNumberControl(entityId: string) {
    const entity = this.hass.states[entityId];
    if (!entity) {
      return nothing;
    }
    const settings = numberControlSettings(entity);
    const label =
      this._friendlyName(entity) ||
      this._preferredEntityLabel(entityId) ||
      this._entityName(entityId);
    const unavailable = ["unavailable", "unknown"].includes(
      String(entity.state).trim().toLowerCase(),
    );
    const valueLabel = settings
      ? `${settings.value}${settings.unit ? ` ${settings.unit}` : ""}`
      : this._t("common.unavailable");

    return html`
      <label class="selector-card">
        <span class="selector-number-header">
          <span class="selector-label">${label}</span>
          <span class="selector-number-value">${valueLabel}</span>
        </span>
        <input
          type="range"
          min=${settings?.min ?? 0}
          max=${settings?.max ?? 1}
          step=${settings?.step ?? 1}
          .value=${settings ? String(settings.value) : "0"}
          ?disabled=${unavailable || !settings || Boolean(this._mutationInFlight)}
          @change=${(event: Event) => this._setNumberValue(entityId, event)}
        />
      </label>
    `;
  }

  private _renderTimeControl(entityId: string) {
    const entity = this.hass.states[entityId];
    if (!entity) {
      return nothing;
    }
    const value = timeInputValue(entity.state);
    const available = !this._isUnavailableEntity(entity);
    const label =
      this._friendlyName(entity) ||
      this._preferredEntityLabel(entityId) ||
      this._entityName(entityId);
    if (!available || !value) {
      const status = available
        ? `${timeServiceValue(entity.state) || this._t("common.unsupportedValue")} · ${this._t("common.readOnly")}`
        : this._t("common.unavailable");
      return html`
        <div class="selector-card">
          <span class="selector-label">${label}</span>
          <div class="selector-switch-body">
            <span>${status}</span>
          </div>
        </div>
      `;
    }
    return html`
      <label class="selector-card">
        <span class="selector-label">${label}</span>
        <input
          type="time"
          step=${timeInputStep(value || "")}
          .value=${value}
          ?disabled=${Boolean(this._mutationInFlight)}
          @change=${(event: Event) => this._setTimeValue(entityId, event)}
        />
      </label>
    `;
  }

  private _renderDeviceSettingsControls(entityIds: string[]) {
    return renderDeviceSettingsPanel(
      entityIds,
      this.hass.states,
      (entityId) => this._renderEntityControl(entityId),
      this._t,
    );
  }

  private _renderPreferenceControls(entityIds: string[]) {
    if (!entityIds.length) {
      return nothing;
    }
    const modeEntityId = entityIds.find((entityId) =>
      entityId.endsWith("_selected_map_preference_mode"),
    );
    const heightEntityId = entityIds.find(
      (entityId) =>
        entityId.endsWith("_selected_map_mowing_height") ||
        entityId.endsWith("_selected_zone_mowing_height"),
    );
    const mode = modeEntityId ? this._entityState(modeEntityId) : undefined;
    const height = heightEntityId ? this._entityState(heightEntityId) : undefined;
    const summary = [mode, height].filter(Boolean).join(" · ");
    return html`
      <details class="preference-panel">
        <summary>
          <span class="preference-summary">
            <span>${this._t("card.preferences")}</span>
            ${summary ? html`<small>${summary}</small>` : nothing}
          </span>
        </summary>
        <div class="selectors preference-controls">
          ${entityIds.map((entityId) => this._renderEntityControl(entityId))}
        </div>
      </details>
    `;
  }

  private _buildActionGroups(
    mower: HassEntity,
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
      if (mowerSupportsFeature(mower, LawnMowerFeature.START_MOWING)) {
        defaultActions.push({
          label: this._t("action.start"),
          icon: "mdi:play",
          disabled:
            Boolean(this._mutationInFlight) ||
            !this._canStart(mower.state) ||
            !this._canStartSelectedTarget(),
          handler: () => this._startMowing(),
        });
      }
      if (mowerSupportsFeature(mower, LawnMowerFeature.PAUSE)) {
        defaultActions.push({
          label: this._t("action.pause"),
          icon: "mdi:pause",
          disabled:
            Boolean(this._mutationInFlight) || !this._canPause(mower.state),
          handler: () => this._pauseMowing(),
        });
      }
      if (mowerSupportsFeature(mower, LawnMowerFeature.DOCK)) {
        defaultActions.push({
          label: this._t("action.dock"),
          icon: "mdi:home-import-outline",
          disabled:
            Boolean(this._mutationInFlight) || !this._canDock(mower.state),
          handler: () => this._dockMower(),
        });
      }
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
      const built = this._buildConfiguredAction(action, mower);
      if (built) {
        customActions.push(built);
      }
    }

    return [
      { title: this._t("action.controls"), actions: defaultActions },
      { title: this._t("action.helpers"), actions: helperActions },
      { title: this._t("action.custom"), actions: customActions },
    ].filter((group) => group.actions.length);
  }

  private _buildConfiguredAction(
    action: LawnMowerActionConfig,
    mower: HassEntity,
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
      if (!mowerSupportsFeature(mower, LawnMowerFeature.START_MOWING)) {
        return undefined;
      }
      return {
        label: action.label || this._t("action.start"),
        icon: action.icon || "mdi:play",
        disabled:
          Boolean(this._mutationInFlight) ||
          !this._canStart(mower.state) || !this._canStartSelectedTarget(),
        handler: () => this._startMowing(),
      };
    }

    if (type === "pause") {
      if (!mowerSupportsFeature(mower, LawnMowerFeature.PAUSE)) {
        return undefined;
      }
      return {
        label: action.label || this._t("action.pause"),
        icon: action.icon || "mdi:pause",
        disabled:
          Boolean(this._mutationInFlight) || !this._canPause(mower.state),
        handler: () => this._pauseMowing(),
      };
    }

    if (type === "dock") {
      if (!mowerSupportsFeature(mower, LawnMowerFeature.DOCK)) {
        return undefined;
      }
      return {
        label: action.label || this._t("action.dock"),
        icon: action.icon || "mdi:home-import-outline",
        disabled:
          Boolean(this._mutationInFlight) || !this._canDock(mower.state),
        handler: () => this._dockMower(),
      };
    }

    if (type === "more-info") {
      return {
        label: action.label || this._t("action.moreInfo"),
        icon: action.icon || "mdi:information-outline",
        disabled: false,
        handler: () => this._showMoreInfo(action.entity),
      };
    }

    if (type === "service" && action.service) {
      return {
        label: action.label || action.service,
        icon: action.icon || "mdi:flash-outline",
        disabled: Boolean(this._mutationInFlight),
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
    if (!this._config) {
      return [];
    }
    return defaultHelperEntities(
      this.hass.states,
      this._config.entity,
      this.hass.entities,
    ).map((helper) => ({
      label: this._t(({
        "Live Video": "action.liveVideo",
        Schedule: "action.schedule",
        "Live Map": "action.liveMap",
        "All Maps": "action.allMaps",
        "Maintenance Point": "action.maintenancePoint",
      } as Record<string, TranslationKey>)[helper.label] || "action.moreInfo"),
      icon: helper.icon,
      disabled:
        helper.action === "press" &&
        (Boolean(this._mutationInFlight) ||
          this.hass.states[helper.entityId]?.state === "unavailable"),
      handler: () =>
        helper.action === "press"
          ? this._pressButton(helper.entityId)
          : this._showMoreInfo(helper.entityId),
    }));
  }

  private _tileFromEntity(entityId: string, fallbackLabel?: string, icon?: string) {
    const entity = this.hass.states[entityId];
    if (!entity || this._isUnavailableEntity(entity)) {
      return {
        label: fallbackLabel || this._preferredEntityLabel(entityId),
        value: this._t("common.unavailable"),
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
    return entity && !this._isUnavailableEntity(entity)
      ? this._friendlyState(entity)
      : undefined;
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

  private _stringValue(value: unknown): string | undefined {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  }

  private _humanizeValue(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
      return trimmed;
    }

    const direct = FRIENDLY_STATE[trimmed];
    if (direct) {
      return this._t(direct);
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
        return this._t("common.enabled");
      }
      if (normalized === "rain protection disabled" || normalized === "disabled") {
        return this._t("common.disabled");
      }
    }

    if (entityId.endsWith("_task_status") || entityId.endsWith("_task_status_name")) {
      if (this._isUnknownLike(value)) {
        return this._t("common.unknown");
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
      return this._t("settings.rainProtection");
    }
    if (entityId.endsWith("_state_name")) {
      return this._t("common.state");
    }
    if (entityId.endsWith("_task_status") || entityId.endsWith("_task_status_name")) {
      return this._t("common.task");
    }
    if (entityId.endsWith("_battery")) {
      return this._t("hero.battery");
    }
    if (entityId.endsWith("_selected_mowing_action")) {
      return this._t("planner.selectedAction");
    }
    if (entityId.endsWith("_selected_target")) {
      return this._t("planner.selectedTarget");
    }
    if (entityId.endsWith("_selected_map")) {
      return this._t("planner.selectedMap");
    }
    if (entityId.endsWith("_selected_zone_mowing_height")) {
      return this._t("planner.mowingHeight");
    }
    if (entityId.endsWith("_selected_map_mowing_height")) {
      return this._t("planner.globalMowingHeight");
    }
    if (entityId.endsWith("_selected_map_preference_mode")) {
      return this._t("planner.preferenceMode");
    }
    if (
      entityId.endsWith("_selected_mowing_efficiency") ||
      entityId.endsWith("_selected_efficient_mode")
    ) {
      return this._t("planner.mowingEfficiency");
    }
    if (entityId.endsWith("_selected_mowing_direction_mode")) {
      return this._t("planner.directionMode");
    }
    if (
      entityId.endsWith("_selected_mowing_direction") ||
      entityId.endsWith("_selected_mowing_direction_degrees")
    ) {
      return this._t("planner.direction");
    }
    if (
      entityId.endsWith("_selected_turning_method") ||
      entityId.endsWith("_selected_edge_cutting_style") ||
      entityId.endsWith("_selected_edge_mowing_walk_mode")
    ) {
      return this._t("planner.turningMethod");
    }
    if (
      entityId.endsWith("_selected_obstacle_height") ||
      entityId.endsWith("_selected_obstacle_avoidance_height_cm")
    ) {
      return this._t("planner.obstacleHeight");
    }
    if (
      entityId.endsWith("_selected_obstacle_distance") ||
      entityId.endsWith("_selected_obstacle_avoidance_distance_cm")
    ) {
      return this._t("planner.obstacleDistance");
    }
    if (
      entityId.endsWith("_selected_automatic_edge_cutting") ||
      entityId.endsWith("_selected_edge_mowing_auto")
    ) {
      return this._t("planner.automaticEdge");
    }
    if (
      entityId.endsWith("_selected_safe_edge_cutting") ||
      entityId.endsWith("_selected_edge_mowing_safe")
    ) {
      return this._t("planner.safeEdge");
    }
    if (
      entityId.endsWith("_selected_edgemaster") ||
      entityId.endsWith("_selected_edge_cutting_attachment")
    ) {
      return "EdgeMaster";
    }
    if (
      entityId.endsWith("_selected_edge_obstacle_avoidance") ||
      entityId.endsWith("_selected_edge_mowing_obstacle_avoidance")
    ) {
      return this._t("planner.edgeAvoidance");
    }
    if (
      entityId.endsWith("_selected_lidar_obstacle_recognition") ||
      entityId.endsWith("_selected_obstacle_avoidance_enabled")
    ) {
      return this._t("planner.lidar");
    }
    if (
      entityId.endsWith("_selected_avoid_people") ||
      entityId.endsWith("_selected_people")
    ) {
      return this._t("planner.avoidPeople");
    }
    if (
      entityId.endsWith("_selected_avoid_animals") ||
      entityId.endsWith("_selected_animals")
    ) {
      return this._t("planner.avoidAnimals");
    }
    if (
      entityId.endsWith("_selected_avoid_objects") ||
      entityId.endsWith("_selected_objects")
    ) {
      return this._t("planner.avoidObjects");
    }
    if (entityId.endsWith("_maintenance_point")) {
      return this._t("action.maintenancePoint");
    }
    if (entityId.endsWith("_selected_zone_efficiency_mode")) {
      return this._t("planner.efficiency");
    }
    if (entityId.endsWith("_selected_zone_direction_mode")) {
      return this._t("planner.directionShort");
    }
    if (entityId.endsWith("_selected_zone_obstacle_avoidance")) {
      return this._t("planner.obstacleAvoidance");
    }
    if (entityId.endsWith("_selected_zone_obstacle_distance")) {
      return this._t("planner.obstacleDistance");
    }
    if (entityId.endsWith("_selected_zone_obstacle_height")) {
      return this._t("planner.obstacleHeight");
    }
    if (entityId.endsWith("_selected_zone_obstacle_classes")) {
      return this._t("planner.obstacleClasses");
    }
    if (entityId.endsWith("_mowing_action")) {
      return this._t("planner.mowingAction");
    }
    if (entityId.endsWith("_zone")) {
      return this._t("common.zone");
    }
    if (entityId.endsWith("_spot")) {
      return this._t("common.spot");
    }
    if (entityId.endsWith("_map")) {
      return this._t("action.map");
    }
    if (entityId.endsWith("_mowing_progress")) {
      return this._t("metric.progress");
    }
    if (entityId.endsWith("_runtime_mission_progress")) {
      return this._t("runtime.missionProgress");
    }
    if (entityId.endsWith("_runtime_current_area")) {
      return this._t("runtime.currentArea");
    }
    if (entityId.endsWith("_runtime_total_area")) {
      return this._t("runtime.totalArea");
    }
    if (entityId.endsWith("_runtime_position_x")) {
      return this._t("runtime.positionX");
    }
    if (entityId.endsWith("_runtime_position_y")) {
      return this._t("runtime.positionY");
    }
    if (entityId.endsWith("_runtime_heading")) {
      return this._t("runtime.heading");
    }
    if (entityId.endsWith("_runtime_live_track_length")) {
      return this._t("runtime.liveTrail");
    }
    if (entityId.endsWith("_runtime_live_track_point_count")) {
      return this._t("runtime.livePoints");
    }
    if (entityId.endsWith("_runtime_live_track_segment_count")) {
      return this._t("runtime.liveSegments");
    }
    if (entityId.endsWith("_current_cleaned_area")) {
      return this._t("runtime.cutArea");
    }
    if (entityId.endsWith("_current_cleaning_time")) {
      return this._t("common.time");
    }
    if (entityId.endsWith("_current_zone")) {
      return this._t("runtime.currentZone");
    }
    if (entityId.endsWith("_active_segment_count")) {
      return this._t("runtime.activeSegments");
    }
    if (entityId.endsWith("_current_app_map_area")) {
      return this._t("runtime.mapArea");
    }
    if (entityId.endsWith("_current_app_map_zone_count")) {
      return this._t("common.zones");
    }
    if (entityId.endsWith("_current_app_map_spot_count")) {
      return this._t("common.spots");
    }
    if (entityId.endsWith("_current_app_map_trajectory_point_count")) {
      return this._t("runtime.pathPoints");
    }
    if (entityId.endsWith("_current_app_map_trajectory_length")) {
      return this._t("runtime.pathLength");
    }
    if (entityId.endsWith("_current_app_map_mow_path_length")) {
      return this._t("runtime.trailLength");
    }
    if (entityId.endsWith("_current_app_map_cut_relation_count")) {
      return this._t("runtime.cutLinks");
    }
    if (entityId.endsWith("_error")) {
      return this._t("common.error");
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
    return cameraImageUrl(entity.entity_id, entity);
  }

  private _heroMissionMetric(): HeroMetric {
    const configuredId = this._config?.progress_entity;
    const configured = configuredId ? this.hass.states[configuredId] : undefined;
    const configuredUnit = configured?.attributes.unit_of_measurement;
    const configuredIsProgress = Boolean(
      configuredId &&
        configured &&
        !this._isUnavailableEntity(configured) &&
        (configuredUnit === "%" || configuredId.endsWith("_progress")),
    );
    const entity = configuredIsProgress
      ? configured
      : firstAvailableEntity([
          this._companionEntity("sensor", "runtime_mission_progress"),
          this._companionEntity("sensor", "mowing_progress"),
        ]);
    return {
      label: this._t(entity?.attributes.cached === true ? "metric.lastMission" : "hero.mission"),
      value: entity ? this._friendlyState(entity) : undefined,
    };
  }

  private _heroCoverageMetric(): HeroMetric {
    const coverageEntities = resolvedCoverageEntityIds(
      this.hass.states,
      this._config?.entity || "",
      this._config?.coverage_entity,
      this._config?.coverage_total_entity,
    );
    const current = coverageEntities.current
      ? this.hass.states[coverageEntities.current]
      : undefined;
    const total = coverageEntities.total
      ? this.hass.states[coverageEntities.total]
      : undefined;
    const currentValue =
      current && !this._isUnavailableEntity(current) ? this._friendlyState(current) : undefined;
    const totalValue =
      total && !this._isUnavailableEntity(total) ? this._friendlyState(total) : undefined;
    const currentUnit = current?.attributes.unit_of_measurement;
    const totalUnit = total?.attributes.unit_of_measurement;
    const combinedValue =
      currentValue &&
      totalValue &&
      typeof currentUnit === "string" &&
      currentUnit &&
      currentUnit === totalUnit
        ? `${current?.state} / ${total?.state} ${currentUnit}`
        : currentValue && totalValue
          ? `${currentValue} / ${totalValue}`
          : currentValue || totalValue;
    return {
      label:
        current?.attributes.cached === true || total?.attributes.cached === true
          ? this._t("metric.lastCoverage")
          : this._t("metric.coverage"),
      value: combinedValue,
      area: mowingAreaProgress(current, total),
    };
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

  private _entityAttributeRecord(
    entity: HassEntity,
    attribute: string,
  ): Record<string, unknown> | undefined {
    const value = entity.attributes[attribute];
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : undefined;
  }

  private _recordString(
    record: Record<string, unknown> | undefined,
    attribute: string,
  ): string | undefined {
    const value = record?.[attribute];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  }

  private _recordNumber(
    record: Record<string, unknown> | undefined,
    attribute: string,
  ): number | undefined {
    const value = record?.[attribute];
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
  }

  private _recordBoolean(
    record: Record<string, unknown> | undefined,
    attribute: string,
  ): boolean | undefined {
    const value = record?.[attribute];
    return typeof value === "boolean" ? value : undefined;
  }

  private _recordStringArray(
    record: Record<string, unknown> | undefined,
    attribute: string,
  ): string[] | undefined {
    const value = record?.[attribute];
    return Array.isArray(value) && value.every((item) => typeof item === "string")
      ? value
      : undefined;
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

  private _formatCentimeters(value: number): string {
    const normalized = Number.isInteger(value) ? `${Math.round(value)}` : value.toFixed(1);
    return `${normalized} cm`;
  }

  private _formatOptionalCentimeters(value: number | undefined): string | undefined {
    return value !== undefined ? this._formatCentimeters(value) : undefined;
  }

  private _humanizedOptionalBoolean(value: boolean | undefined): string | undefined {
    if (value === undefined) {
      return undefined;
    }
    return this._t(value ? "common.enabled" : "common.disabled");
  }

  private _humanizedOptionalList(values: string[] | undefined): string | undefined {
    if (!values?.length) {
      return undefined;
    }
    return values.map((value) => this._humanizeValue(value)).join(", ");
  }

  private _humanizedOptionalValue(value: string | undefined): string | undefined {
    return value ? this._humanizeValue(value) : undefined;
  }

  private _formatOptionalCount(value: number | undefined): string | undefined {
    if (value === undefined) {
      return undefined;
    }
    return `${Math.round(value)}`;
  }

  private _selectedZoneDirectionLabel(
    preference: Record<string, unknown> | undefined,
  ): string | undefined {
    const mode = this._recordString(preference, "mowing_direction_mode_name");
    const degrees = this._recordNumber(preference, "mowing_direction_degrees");
    const modeLabel = this._humanizedOptionalValue(mode);
    if (modeLabel && degrees !== undefined) {
      return `${modeLabel} (${Math.round(degrees)}°)`;
    }
    if (modeLabel) {
      return modeLabel;
    }
    if (degrees !== undefined) {
      return `${Math.round(degrees)}°`;
    }
    return undefined;
  }

  private _selectedZonePreferenceDetails(
    mower: HassEntity,
    target?: string,
  ): SelectedZonePreferenceDetails | undefined {
    const selectedZoneId = this._entityAttributeInteger(mower, "selected_zone_id");
    const selectedAction = this._entityAttributeString(mower, "selected_mowing_action");
    const preference = this._entityAttributeRecord(mower, "selected_zone_preference");
    const targetLabel = target?.toLowerCase();
    const hasZoneContext =
      selectedAction === "zone" ||
      (targetLabel?.includes("zone") ?? false);
    if (!hasZoneContext) {
      return undefined;
    }

    const mowingHeight =
      this._companionState("sensor", "selected_zone_mowing_height") ||
      this._formatOptionalCentimeters(this._recordNumber(preference, "mowing_height_cm"));
    const efficiencyMode =
      this._companionState("sensor", "selected_zone_efficiency_mode") ||
      this._humanizedOptionalValue(this._recordString(preference, "efficient_mode_name"));
    const directionMode =
      this._companionState("sensor", "selected_zone_direction_mode") ||
      this._selectedZoneDirectionLabel(preference);
    const obstacleAvoidance =
      this._companionState("sensor", "selected_zone_obstacle_avoidance") ||
      this._humanizedOptionalBoolean(this._recordBoolean(preference, "obstacle_avoidance_enabled"));
    const obstacleDistance =
      this._companionState("sensor", "selected_zone_obstacle_distance") ||
      this._formatOptionalCentimeters(
        this._recordNumber(preference, "obstacle_avoidance_distance_cm"),
      );
    const obstacleHeight =
      this._companionState("sensor", "selected_zone_obstacle_height") ||
      this._formatOptionalCentimeters(
        this._recordNumber(preference, "obstacle_avoidance_height_cm"),
      );
    const obstacleClasses =
      this._companionState("sensor", "selected_zone_obstacle_classes") ||
      this._humanizedOptionalList(
        this._recordStringArray(preference, "obstacle_avoidance_ai_classes"),
      );
    const zoneLabel =
      this._recordString(preference, "label") ||
      (selectedZoneId !== undefined ? `${this._t("common.zone")} #${selectedZoneId}` : undefined);

    if (
      !zoneLabel &&
      !mowingHeight &&
      !efficiencyMode &&
      !directionMode &&
      !obstacleAvoidance &&
      !obstacleDistance &&
      !obstacleHeight &&
      !obstacleClasses
    ) {
      return undefined;
    }

    return {
      zoneLabel,
      mowingHeight,
      efficiencyMode,
      directionMode,
      obstacleAvoidance,
      obstacleDistance,
      obstacleHeight,
      obstacleClasses,
    };
  }

  private _selectedMapPreferenceDetails(
    mower: HassEntity,
  ): SelectedMapPreferenceDetails | undefined {
    const preference = this._entityAttributeRecord(mower, "selected_map_preference");
    const modeSensor = this._companionState("sensor", "selected_map_preference_mode");
    const modeKey =
      this._recordString(preference, "mode_name") ||
      this._entityAttributeString(mower, "selected_map_preference_mode");
    const modeLabel = modeSensor || this._humanizedOptionalValue(modeKey);
    const areaCount =
      this._companionState("sensor", "selected_map_preference_area_count") ||
      this._formatOptionalCount(this._recordNumber(preference, "area_count"));
    const preferenceCount =
      this._companionState("sensor", "selected_map_preference_count") ||
      this._formatOptionalCount(this._recordNumber(preference, "preference_count"));

    if (!modeLabel && !areaCount && !preferenceCount) {
      return undefined;
    }

    return {
      modeLabel,
      modeKey: modeKey?.trim().toLowerCase(),
      areaCount,
      preferenceCount,
    };
  }

  private _plannedRunDetails(mower: HassEntity): PlannedRunDetails | undefined {
    const selectedActionKey = this._entityAttributeString(mower, "selected_mowing_action");
    const action =
      this._companionState("sensor", "selected_mowing_action") ||
      this._entityAttributeString(mower, "selected_mowing_action_label") ||
      this._entityAttributeString(mower, "task_status_name");
    const selectedMap =
      this._companionState("sensor", "selected_map") ||
      this._entityAttributeString(mower, "selected_map_label");
    const activeMap = this._entityAttributeString(mower, "app_current_map_label");
    const selectedTarget = this._companionState("sensor", "selected_target");
    const selectedZoneId = this._entityAttributeInteger(mower, "selected_zone_id");
    const selectedSpotId = this._entityAttributeInteger(mower, "selected_spot_id");
    const selectedContourLabel = this._entityAttributeString(mower, "selected_contour_label");
    const needsMapSwitch = mower.attributes.selected_map_matches_active_app_map === false;

    let target = selectedTarget;
    if (!target) {
      if (selectedActionKey === "edge" && selectedContourLabel) {
        target = selectedContourLabel;
      } else if (selectedActionKey === "spot" && selectedSpotId !== undefined) {
        target = `${this._t("common.spot")} #${selectedSpotId}`;
      } else if (selectedZoneId !== undefined) {
        target = `${this._t("planner.zone")} #${selectedZoneId}`;
      } else if (selectedContourLabel) {
        target = selectedContourLabel;
      } else if (selectedSpotId !== undefined) {
        target = `${this._t("common.spot")} #${selectedSpotId}`;
      }
    }

    const zoneContext = this._zoneStartContext();
    if (zoneContext) {
      const selectedLabels = zoneSelectionLabels(
        zoneContext.choices,
        zoneContext.zoneIds,
      );
      target = selectedLabels.length
        ? selectedLabels.join(", ")
        : this._t("card.noZones");
    }

    const selectedMapPreferences = this._selectedMapPreferenceDetails(mower);

    if (!action && !selectedMap && !activeMap && !target && !needsMapSwitch && !selectedMapPreferences) {
      return undefined;
    }

    const selectedZonePreferences = this._selectedZonePreferenceDetails(mower, target);

    return {
      action,
      selectedMap,
      activeMap,
      target,
      needsMapSwitch,
      selectedMapPreferences,
      selectedZonePreferences,
    };
  }

  private _runtimeSessionDetails(): RuntimeSessionDetails | undefined {
    const mapEntity = this._mapEntity();
    const missionProgress =
      this._companionState("sensor", "runtime_mission_progress") ||
      this._companionState("sensor", "mowing_progress");
    const currentArea =
      this._companionState("sensor", "runtime_current_area") ||
      this._companionState("sensor", "current_cleaned_area");
    const totalArea = this._companionState("sensor", "runtime_total_area");
    const currentZone = this._companionState("sensor", "current_zone");
    const bluetoothState =
      this._companionBinaryStateLabel(
        "bluetooth_connected",
        this._t("common.connected"),
        this._t("common.disconnected"),
      ) ||
      undefined;

    const trailLengthM = mapEntity
      ? this._numberAttribute(mapEntity, "runtime_track_length_m")
      : undefined;
    const pointCount = mapEntity
      ? this._numberAttribute(mapEntity, "runtime_track_point_count")
      : undefined;
    const segmentCount = mapEntity
      ? this._numberAttribute(mapEntity, "runtime_track_segment_count")
      : undefined;
    const headingDeg = mapEntity
      ? this._numberAttribute(mapEntity, "runtime_heading_deg")
      : undefined;
    const positionX = mapEntity ? this._numberAttribute(mapEntity, "runtime_pose_x") : undefined;
    const positionY = mapEntity ? this._numberAttribute(mapEntity, "runtime_pose_y") : undefined;
    const source =
      mapEntity &&
      typeof mapEntity.attributes.source === "string" &&
      mapEntity.attributes.source
        ? mapEntity.attributes.source
        : undefined;

    const hasAnyRuntimeData =
      missionProgress !== undefined ||
      currentArea !== undefined ||
      totalArea !== undefined ||
      currentZone !== undefined ||
      (trailLengthM !== undefined && trailLengthM > 0) ||
      (pointCount !== undefined && pointCount > 1) ||
      (segmentCount !== undefined && segmentCount > 0) ||
      headingDeg !== undefined ||
      (positionX !== undefined && positionY !== undefined);
    if (!hasAnyRuntimeData) {
      return undefined;
    }

    return {
      missionProgress,
      currentArea,
      totalArea,
      currentZone,
      bluetoothState,
      trailLengthM,
      pointCount,
      segmentCount,
      headingDeg,
      positionX,
      positionY,
      source,
    };
  }

  private _renderPlannedRunPanel(plannedRun: PlannedRunDetails) {
    const metrics: Array<{ label: string; value: string }> = [];

    if (plannedRun.action) {
      metrics.push({
        label: this._t("planner.action"),
        value: plannedRun.action,
      });
    }

    if (plannedRun.selectedMap) {
      metrics.push({
        label: this._t("planner.selectedMap"),
        value: plannedRun.selectedMap,
      });
    }

    if (plannedRun.activeMap && plannedRun.activeMap !== plannedRun.selectedMap) {
      metrics.push({
        label: this._t("planner.activeMap"),
        value: plannedRun.activeMap,
      });
    }

    if (plannedRun.target) {
      metrics.push({
        label: this._t("planner.target"),
        value: plannedRun.target,
      });
    }

    const mapPreferences = plannedRun.selectedMapPreferences;
    if (mapPreferences?.modeLabel) {
      metrics.push({
        label: this._t("planner.preferenceMode"),
        value: mapPreferences.modeLabel,
      });
    }
    if (mapPreferences?.areaCount) {
      metrics.push({
        label: this._t("planner.preferenceAreas"),
        value: mapPreferences.areaCount,
      });
    }
    if (mapPreferences?.preferenceCount) {
      metrics.push({
        label: this._t("planner.storedPreferences"),
        value: mapPreferences.preferenceCount,
      });
    }

    const zonePreferences = plannedRun.selectedZonePreferences;
    if (zonePreferences?.zoneLabel && zonePreferences.zoneLabel !== plannedRun.target) {
      metrics.push({
        label: this._t("planner.zone"),
        value: zonePreferences.zoneLabel,
      });
    }
    if (zonePreferences?.mowingHeight) {
      metrics.push({
        label: this._t("planner.mowingHeight"),
        value: zonePreferences.mowingHeight,
      });
    }
    if (zonePreferences?.efficiencyMode) {
      metrics.push({
        label: this._t("planner.efficiency"),
        value: zonePreferences.efficiencyMode,
      });
    }
    if (zonePreferences?.directionMode) {
      metrics.push({
        label: this._t("planner.directionShort"),
        value: zonePreferences.directionMode,
      });
    }
    if (zonePreferences?.obstacleAvoidance) {
      metrics.push({
        label: this._t("planner.obstacleAvoidance"),
        value: zonePreferences.obstacleAvoidance,
      });
    }
    if (zonePreferences?.obstacleDistance) {
      metrics.push({
        label: this._t("planner.obstacleDistance"),
        value: zonePreferences.obstacleDistance,
      });
    }
    if (zonePreferences?.obstacleHeight) {
      metrics.push({
        label: this._t("planner.obstacleHeight"),
        value: zonePreferences.obstacleHeight,
      });
    }
    if (zonePreferences?.obstacleClasses) {
      metrics.push({
        label: this._t("planner.obstacleAi"),
        value: zonePreferences.obstacleClasses,
      });
    }

    if (!metrics.length && !plannedRun.needsMapSwitch) {
      return nothing;
    }

    return html`
      <div class="target-panel">
        <div class="target-header">
          <div class="target-title">${this._t("card.plannedRun")}</div>
          <div class="target-badge">${this._t("card.startPreview")}</div>
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
        ${mapPreferences?.modeKey === "global" && zonePreferences
          ? html`
              <div class="target-note">
                ${this._t("planner.globalModeNote")}
              </div>
            `
          : nothing}
        ${plannedRun.needsMapSwitch
          ? html`
              <div class="target-note">
                ${this._t("planner.mapMismatchNote")}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _renderRuntimeSessionPanel(runtimeSession: RuntimeSessionDetails) {
    const metrics: Array<{ label: string; value: string }> = [];

    if (runtimeSession.missionProgress) {
      metrics.push({
        label: this._t("metric.progress"),
        value: runtimeSession.missionProgress,
      });
    }

    if (runtimeSession.currentArea && runtimeSession.totalArea) {
      metrics.push({
        label: this._t("metric.coverage"),
        value: `${runtimeSession.currentArea} / ${runtimeSession.totalArea}`,
      });
    } else if (runtimeSession.currentArea) {
      metrics.push({
        label: this._t("runtime.currentArea"),
        value: runtimeSession.currentArea,
      });
    }

    if (runtimeSession.currentZone) {
      metrics.push({
        label: this._t("runtime.currentZone"),
        value: runtimeSession.currentZone,
      });
    }

    if (runtimeSession.bluetoothState) {
      metrics.push({
        label: this._t("runtime.bluetooth"),
        value: runtimeSession.bluetoothState,
      });
    }

    if (runtimeSession.trailLengthM !== undefined && runtimeSession.trailLengthM > 0) {
      metrics.push({
        label: this._t("runtime.liveTrail"),
        value: this._formatMeters(runtimeSession.trailLengthM),
      });
    }

    if (runtimeSession.pointCount !== undefined && runtimeSession.pointCount > 1) {
      metrics.push({
        label: this._t("runtime.points"),
        value: `${Math.round(runtimeSession.pointCount)}`,
      });
    }

    if (runtimeSession.segmentCount !== undefined && runtimeSession.segmentCount > 0) {
      metrics.push({
        label: this._t("runtime.segments"),
        value: `${Math.round(runtimeSession.segmentCount)}`,
      });
    }

    if (runtimeSession.headingDeg !== undefined) {
      metrics.push({
        label: this._t("runtime.heading"),
        value: `${Math.round(runtimeSession.headingDeg)}°`,
      });
    }

    if (runtimeSession.positionX !== undefined && runtimeSession.positionY !== undefined) {
      metrics.push({
        label: this._t("runtime.position"),
        value: `${this._formatCoordinate(runtimeSession.positionX)}, ${this._formatCoordinate(runtimeSession.positionY)}`,
      });
    }

    if (runtimeSession.source) {
      metrics.push({
        label: this._t("runtime.source"),
        value: this._humanizeValue(runtimeSession.source),
      });
    }

    if (!metrics.length) {
      return nothing;
    }

    return html`
      <div class="session-panel">
        <div class="session-header">
          <div class="session-title">${this._t("card.liveSession")}</div>
          <div class="session-badge">${this._t("card.runtimeOverlay")}</div>
        </div>
        <div class="session-subtitle">
          ${this._t("runtime.subtitle")}
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

  private _clearActionFeedbackTimer(): void {
    if (this._actionFeedbackTimer !== undefined) {
      window.clearTimeout(this._actionFeedbackTimer);
      this._actionFeedbackTimer = undefined;
    }
  }

  private async _runMowerAction(
    key: string,
    label: string,
    operation: () => Promise<void>,
  ): Promise<void> {
    const entityId = this._config?.entity;
    if (!entityId) {
      return;
    }
    const mutationToken = acquireMowerMutation(entityId, key);
    if (!mutationToken) {
      return;
    }
    const generation = this._actionGeneration;
    this._clearActionFeedbackTimer();
    this._actionFeedback = {
      message: this._t("card.waitingConfirmation", { action: label }),
      error: false,
    };
    try {
      await operation();
      if (generation !== this._actionGeneration) {
        return;
      }
      this._actionFeedback = {
        message: this._t("card.confirmed", { action: label }),
        error: false,
      };
      this._actionFeedbackTimer = window.setTimeout(() => {
        this._actionFeedbackTimer = undefined;
        if (generation === this._actionGeneration) {
          this._actionFeedback = undefined;
        }
      }, 3_000);
    } catch (error) {
      if (generation !== this._actionGeneration) {
        return;
      }
      const detail =
        error instanceof Error && error.message
          ? error.message.replace(/[\r\n\t]+/g, " ").slice(0, 240)
          : this._t("card.actionUnconfirmed");
      this._actionFeedback = {
        message: this._t("card.notConfirmed", { action: label, detail }),
        error: true,
      };
    } finally {
      releaseMowerMutation(entityId, mutationToken);
    }
  }

  private async _callConfiguredService(
    service: string,
    serviceData?: Record<string, unknown>,
  ) {
    const [domain, name] = service.split(".", 2);
    if (!domain || !name) {
      await this._runMowerAction(`service:${service}`, this._t("card.runService", { service }), async () => {
        throw new Error(this._t("card.invalidService", { service }));
      });
      return;
    }

    await this._runMowerAction(
      `service:${service}`,
      this._t("card.runService", { service }),
      () => this.hass.callService(domain, name, serviceData || {}),
    );
  }

  private async _selectOption(entityId: string, event: Event) {
    const target = event.currentTarget as HTMLSelectElement;
    const option = target.value;
    if (!option) {
      return;
    }

    await this._selectOptionValue(entityId, option);
  }

  private async _selectOptionValue(entityId: string, option: string) {
    await this._runMowerAction(
      `select:${entityId}`,
      this._t("action.set", { name: this._entityName(entityId) }),
      () =>
        this.hass.callService("select", "select_option", {
          entity_id: entityId,
          option,
        }),
    );
  }

  private _zoneChoices(entityId: string): ZoneChoice[] {
    const mower = this._config
      ? this.hass.states[this._config.entity]
      : undefined;
    return zoneChoices(mower, this.hass.states[entityId]);
  }

  private _zoneSelectionKeys(
    entityId: string,
    choices: readonly ZoneChoice[],
  ): ZoneSelectionKeys | undefined {
    const mower = this._config
      ? this.hass.states[this._config.entity]
      : undefined;
    const mapEntityId = this._config
      ? resolvedOwnedMowerCompanionEntity(
          this.hass.states,
          this._config.entity,
          this.hass.entities,
          "select",
          "map",
        )
      : undefined;
    return this._config
      ? zoneSelectionKeys(
          this._config.entity,
          entityId,
          mower,
          mapEntityId ? this.hass.states[mapEntityId] : undefined,
          choices,
        )
      : undefined;
  }

  private _selectedZoneIds(
    entityId: string,
    choices = this._zoneChoices(entityId),
  ): number[] {
    const keys = this._zoneSelectionKeys(entityId, choices);
    const reconciledKeys =
      keys && this._zoneSelection
        ? reconciledZoneSelectionKeys(this._zoneSelection.keys, keys)
        : undefined;
    if (reconciledKeys && this._zoneSelection) {
      this._zoneSelection.keys = reconciledKeys;
    }
    const selectedIds = reconciledKeys
      ? this._zoneSelection?.zoneIds
      : undefined;
    const mower = this._config
      ? this.hass.states[this._config.entity]
      : undefined;
    const selectedZoneId = mower
      ? this._entityAttributeInteger(mower, "selected_zone_id")
      : undefined;
    return normalizedZoneSelection(
      choices,
      selectedIds,
      zoneSelectionFallbackId(
        choices,
        selectedZoneId,
        this.hass.states[entityId]?.state,
      ),
    );
  }

  private async _toggleZone(
    entityId: string,
    choice: ZoneChoice,
    event: Event,
  ) {
    const target = event.currentTarget as HTMLInputElement;
    const choices = this._zoneChoices(entityId);
    const current = new Set(this._selectedZoneIds(entityId, choices));
    if (target.checked) {
      current.add(choice.id);
    } else {
      current.delete(choice.id);
    }
    const zoneIds = normalizedZoneSelection(
      choices,
      Array.from(current),
    );
    const keys = this._zoneSelectionKeys(entityId, choices);
    if (!keys) {
      return;
    }
    this._zoneSelection = {
      keys,
      zoneIds,
    };

    const preferenceChoice = zonePreferenceChoice(
      choices,
      zoneIds,
      this.hass.states[entityId]?.state,
      target.checked ? choice.id : undefined,
    );
    if (
      preferenceChoice &&
      this.hass.states[entityId]?.state !== preferenceChoice.label
    ) {
      await this._selectOptionValue(entityId, preferenceChoice.label);
    }
  }

  private _isZoneMowingAction(requireRegistryOwnership = false): boolean {
    if (!this._config) {
      return false;
    }
    const actionEntityId = (
      requireRegistryOwnership
        ? resolvedOwnedMowerCompanionEntity
        : resolvedMowerCompanionEntity
    )(
      this.hass.states,
      this._config.entity,
      this.hass.entities,
      "select",
      "mowing_action",
    );
    const actionState = actionEntityId
      ? this.hass.states[actionEntityId]?.state.trim().toLowerCase()
      : undefined;
    if (actionState) {
      return actionState.includes("zone");
    }
    const mower = this.hass.states[this._config.entity];
    return (
      this._entityAttributeString(mower, "selected_mowing_action") === "zone"
    );
  }

  private _selectedZoneMapIsCurrent(): boolean {
    if (!this._config) {
      return false;
    }
    const mower = this.hass.states[this._config.entity];
    const mapEntityId = resolvedOwnedMowerCompanionEntity(
      this.hass.states,
      this._config.entity,
      this.hass.entities,
      "select",
      "map",
    );
    return selectedMapIsCurrent(
      mower,
      mapEntityId ? this.hass.states[mapEntityId] : undefined,
    );
  }

  private _multiZoneCandidateContext():
    | {
        entityId: string;
        choices: ZoneChoice[];
      }
    | undefined {
    if (!this._config || !this._isZoneMowingAction(true)) {
      return undefined;
    }
    if (
      !supportsDreameMultiZoneMowing(
        this._config.entity,
        this.hass.entities,
        this.hass.services,
      )
    ) {
      return undefined;
    }
    const entityId = resolvedOwnedMowerCompanionEntity(
      this.hass.states,
      this._config.entity,
      this.hass.entities,
      "select",
      "zone",
    );
    if (!entityId || !this._resolvedControlEntities().includes(entityId)) {
      return undefined;
    }
    const choices = this._zoneChoices(entityId);
    if (choices.length < 2) {
      return undefined;
    }
    return {
      entityId,
      choices,
    };
  }

  private _zoneStartContext():
    | {
        entityId: string;
        choices: ZoneChoice[];
        zoneIds: number[];
      }
    | undefined {
    const candidate = this._multiZoneCandidateContext();
    if (
      !candidate ||
      !this._selectedZoneMapIsCurrent() ||
      !this._zoneSelectionKeys(candidate.entityId, candidate.choices)
    ) {
      return undefined;
    }
    return {
      ...candidate,
      zoneIds: this._selectedZoneIds(
        candidate.entityId,
        candidate.choices,
      ),
    };
  }

  private _canStartSelectedTarget(): boolean {
    if (
      this._multiZoneCandidateContext() &&
      !this._selectedZoneMapIsCurrent()
    ) {
      return false;
    }
    const context = this._zoneStartContext();
    return context ? context.zoneIds.length > 0 : true;
  }

  private async _setNumberValue(entityId: string, event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const value = Number(target.value);
    if (!Number.isFinite(value)) {
      return;
    }
    await this._runMowerAction(
      `number:${entityId}`,
      this._t("action.set", { name: this._entityName(entityId) }),
      () =>
        this.hass.callService("number", "set_value", {
          entity_id: entityId,
          value,
        }),
    );
  }

  private async _setTimeValue(entityId: string, event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const value = timeServiceValue(target.value);
    if (!value) {
      return;
    }
    await this._runMowerAction(
      `time:${entityId}`,
      this._t("action.set", { name: this._entityName(entityId) }),
      () =>
        this.hass.callService("time", "set_value", {
          entity_id: entityId,
          time: value,
        }),
    );
  }

  private async _toggleSwitch(entityId: string, enabled: boolean) {
    await this._runMowerAction(
      `switch:${entityId}`,
      this._t(enabled ? "action.disable" : "action.enable", {
        name: this._entityName(entityId),
      }),
      () =>
        this.hass.callService("switch", enabled ? "turn_off" : "turn_on", {
          entity_id: entityId,
        }),
    );
  }

  private async _pressButton(entityId: string) {
    await this._runMowerAction(
      `button:${entityId}`,
      this._entityName(entityId),
      () =>
        this.hass.callService("button", "press", {
          entity_id: entityId,
        }),
    );
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

  private _companionState(domain: string, suffix: string): string | undefined {
    const entity = this._companionEntity(domain, suffix);
    if (!entity || this._isUnavailableEntity(entity)) {
      return undefined;
    }
    return this._friendlyState(entity);
  }

  private _companionEntity(domain: string, suffix: string): HassEntity | undefined {
    const entityId = this._companionEntityId(domain, suffix);
    return entityId ? this.hass.states[entityId] : undefined;
  }

  private _connectionFeedback(
    mower: HassEntity,
  ): { message: string; error: boolean } | undefined {
    if (mower.attributes.connection_degraded !== true) {
      return undefined;
    }
    const retryAfter = Number(
      mower.attributes.connection_retry_after_seconds,
    );
    const retryText =
      Number.isFinite(retryAfter) && retryAfter > 0
        ? ` ${this._t("card.retrying", { seconds: retryAfter })}`
        : "";
    return {
      message:
        this._t("card.connectionInterrupted") +
        retryText,
      error: false,
    };
  }

  private _isUnavailableEntity(entity: HassEntity): boolean {
    return ["unknown", "unavailable", ""].includes(String(entity.state).trim().toLowerCase());
  }

  private _companionBinaryStateLabel(
    suffix: string,
    onLabel: string,
    offLabel?: string,
  ): string | undefined {
    const entityId = this._companionEntityId("binary_sensor", suffix);
    if (!entityId) {
      return undefined;
    }
    const entity = this.hass.states[entityId];
    if (!entity || this._isUnavailableEntity(entity)) {
      return undefined;
    }
    if (entity.state === "on") {
      return onLabel;
    }
    if (entity.state === "off" && offLabel) {
      return offLabel;
    }
    return this._friendlyState(entity);
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
    if (
      this._multiZoneCandidateContext() &&
      !this._selectedZoneMapIsCurrent()
    ) {
      return;
    }
    await this._runMowerAction("start", this._t("action.startMowing"), async () => {
      const zoneContext = this._zoneStartContext();
      if (zoneContext && this._config) {
        const serviceData = zoneMowingServiceData(
          this._config.entity,
          zoneContext.zoneIds,
        );
        if (!serviceData) {
          throw new Error(this._t("card.zonesChanged"));
        }
        await this.hass.callService(
          "dreame_lawn_mower",
          "start_zone_mowing",
          serviceData,
        );
        return;
      }
      await this.hass.callService("lawn_mower", "start_mowing", {
        entity_id: this._config?.entity,
      });
    });
  }

  private async _pauseMowing() {
    await this._runMowerAction("pause", this._t("action.pauseMowing"), () =>
      this.hass.callService("lawn_mower", "pause", {
        entity_id: this._config?.entity,
      }),
    );
  }

  private async _dockMower() {
    await this._runMowerAction("dock", this._t("action.returnToDock"), () =>
      this.hass.callService("lawn_mower", "dock", {
        entity_id: this._config?.entity,
      }),
    );
  }
}

const cardPickerTranslator = createTranslator(
  resolveLocale(
    "auto",
    typeof document === "undefined" ? undefined : document.documentElement.lang,
    typeof navigator === "undefined" ? undefined : navigator.language,
  ),
);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "lawn-mower-card",
  name: cardPickerTranslator("cardPicker.name"),
  description: cardPickerTranslator("cardPicker.description"),
});
