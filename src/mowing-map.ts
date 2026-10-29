import { LitElement, html, nothing, svg, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { createTranslator, type SupportedLocale, type TranslationKey } from "./localization";
import { abortable, fetchPrivateApi } from "./private-api";
import type { HomeAssistant } from "./card-config";
import { actionErrorDetail } from "./action-error";
import { DREAME_LAWN_MOWER_SERVICE_DOMAIN } from "./card-logic";
import { mapControlIcon, mowerMapMarker, mowingMapStyles } from "./mowing-map-presentation";
import {
  availableMapBackgrounds, constrainViewport, DEFAULT_MOWER_SIZE, gardenEmphasis, mowerMarkerTransform, worldDim, effectiveMapBackground, fitMap, isWorldBackground,
  mowingMapPath, viewLimits, normalizeMapBackground, overlayIsFresh, positionStatusKey,
  readMowingMapScene, zoomMap, nextRefreshDelay, SCENE_TIMEOUT_MS, backgroundRequestPath, cardDrawsZoneLabels,
  type MapBackground, type MapPoint, type MapViewport, type MowerSize, type MowingMapScene,
} from "./mowing-map-logic";
import {
  adjustmentMatrix, alignedGeoreference, clientToMap, colorSchemeFor, composeAdjustment, defaultGeoreference,
  georeferenceServiceData, IDENTITY_ADJUSTMENT, mapCentre, metresPerMapPixel, sameGeoreference,
  screenMatrix, tileUrl, tileZoomFor, visibleTiles, worldTileSource, tileZoomLimit, lowerTileZoomLimit,
  alignGesture, alignHandlePositions, dragHandle, pointOnMap, pullAboutPivot, unadjustPoint, adjustPoint, mapToScreen,
  nativeToPixel, placeZoneLabels,
  type AlignGesture, type AlignHandle, type GeoPoint, type MapAdjustment, type MapGeoreference, type WorldBackground, type WorldTileOptions, type TileFallback,
} from "./map-georeference-logic";

/** Tile options per geographic background, from the card configuration. */
export type WorldTileConfig = Partial<Record<WorldBackground, WorldTileOptions>>;

type AlignSession = {
  /** Freeze the entity, native revision and displayed projection for this editor. */
  context: string;
  /** Alignment the tiles are drawn with while the mower map moves over them. */
  base: MapGeoreference;
  adjustment: MapAdjustment;
  /** No alignment was saved yet; the base is the Home Assistant home. */
  fresh: boolean;
};

const ROTATE_STEP = 0.5;
const SCALE_STEP = 1.005;
const SAVED_GRACE_MS = 60_000;
/** Zone names keep this on-screen size whatever the zoom. */
const ZONE_LABEL_PX = 14;

/** Interactive 2D viewport. Only map delivery is polled; no mower commands. */
@customElement("lawn-mower-mowing-map")
export class LawnMowerMowingMap extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property() public path?: string;
  @property() public fallbackUrl?: string;
  @property({ type: Boolean }) public fallbackSaved = false;
  @property({ type: Boolean }) public active = false;
  @property({ attribute: false }) public locale: SupportedLocale = "en";
  /** Configured default; the toolbar picker overrides it for this view. */
  @property() public background?: string;
  /** Mower entity targeted by the integration's set_georeference service. */
  @property() public entityId?: string;
  @property({ attribute: false }) public tiles?: WorldTileConfig;
  /** Real mower footprint in mm, or null for the fixed-size icon. */
  @property({ attribute: false }) public mowerSize: MowerSize | null = DEFAULT_MOWER_SIZE;
  /** Custom mower picture from the card; otherwise the integration's, if it sends one. */
  @property({ attribute: false }) public markerImage?: string;
  /** A picture that failed to load falls back to the built-in artwork. */
  @state() private _markerImageFailed?: string;
  /** world_background_dim (0–100): how much geographic tiles are softened. */
  @property({ attribute: false }) public worldDim?: unknown;
  /** Stable parent configuration identity; changes can alter inherited colours. */
  @property({ attribute: false }) public appearanceContext?: object;
  /** Parent render identity: sibling content can move the canvas. */
  @property({ attribute: false }) public layoutContext?: object;

  @state() private _scene?: MowingMapScene;
  @state() private _image?: string;
  /** Background request the current image came from (with or without labels). */
  private _imagePath?: string;
  @state() private _photo?: string;
  @state() private _backgroundChoice?: MapBackground;
  @state() private _align?: AlignSession;
  /** What the current one-pointer drag does while aligning. */
  private _drag?: AlignGesture | "pull";
  /** Map point held by a "pull" drag (map pixels). */
  private _grab?: MapPoint;
  /**
   * "Align from the base": step "move" drags the whole map until the base
   * (pivot) sits on its real place; step "pull" keeps it fixed while any
   * pulled point turns and resizes the map about it. Without a known base
   * position, the first press on the map picks it.
   */
  @state() private _baseTool?: { step: "move" | "pull"; pivot?: MapPoint };
  @state() private _saving = false;
  @state() private _alignError?: string;
  @state() private _notice?: TranslationKey;
  /** Temporary fallback; periodic scene renders probe full detail after expiry. */
  @state() private _tileCaps: Record<string, TileFallback> = {};
  /** Just-saved alignment shown until the integration reports it back. */
  private _saved?: { reference: MapGeoreference; at: number; context: string };
  private _noticeTimer?: number;
  private _holdTimer?: number;
  private _photoPath?: string;
  @state() private _view: MapViewport = fitMap(1, 1);
  @state() private _error = false;
  @state() private _loading = false;
  /** Consecutive failed polls, for the retry delay. */
  private _failures = 0;
  @state() private _fallbackFailed = false;
  @state() private _size = { width: 500, height: 300 };
  private _resize?: ResizeObserver;
  /** The canvas moves into a dialog while aligning, so the observer follows it. */
  private _observed?: Element;
  private _abort?: AbortController;
  private _photoAbort?: AbortController;
  private _timer?: number;
  private _expiryTimer?: number;
  private _pointers = new Map<number, MapPoint>();
  /** Canvas box for the current gesture. */
  private _rect?: DOMRect;
  /** Theme the color-scheme was last derived for. */
  private _themeKey?: string;
  private _themes?: HomeAssistant["themes"];
  private _invalidateCanvasRect = (): void => { this._rect = undefined; };
  private _scrollRoots: ShadowRoot[] = [];

  private get _t() { return createTranslator(this.locale); }

  protected updated(changed: PropertyValues): void {
    if (!this.isConnected) return;
    // Parent summaries/headings can move the canvas without changing its size.
    if (changed.has("hass") || changed.has("appearanceContext") || changed.has("layoutContext")) this._invalidateCanvasRect();
    if (changed.has("fallbackUrl")) this._fallbackFailed = false;
    const viewport = this.renderRoot.querySelector(".canvas");
    const viewportChanged = viewport && viewport !== this._observed;
    if (viewportChanged) {
      this._invalidateCanvasRect();
      this._resize ??= new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && (width !== this._size.width || height !== this._size.height)) {
          this._invalidateCanvasRect();
          this._size = { width, height };
        }
      });
      if (this._observed) this._resize.unobserve(this._observed);
      this._resize.observe(viewport);
      this._observed = viewport;
    }
    // Native pickers follow color-scheme, not the card's colours: match the theme surface.
    // Reading the computed colour forces a style recalculation, so it is done only when
    // the theme may have changed, never on every pan step, poll or state update.
    const themes = this.hass?.themes;
    const themeKey = `${themes?.darkMode}|${themes?.theme}`;
    const surface = viewportChanged || changed.has("appearanceContext") || themes !== this._themes || themeKey !== this._themeKey
      ? this.renderRoot.querySelector<HTMLElement>(".viewport") : null;
    if (surface) {
      this._themeKey = themeKey;
      this._themes = themes;
      const scheme = colorSchemeFor(getComputedStyle(surface).backgroundColor);
      if (scheme && this.style.colorScheme !== scheme) this.style.colorScheme = scheme;
    }
    // Aligning happens full screen on phones: a modal dialog escapes the card's height.
    const dialog = this.renderRoot.querySelector<HTMLDialogElement>("dialog.align-dialog");
    if (dialog && !dialog.open) {
      try { dialog.showModal(); } catch { dialog.setAttribute("open", ""); }
    }
    if (changed.has("path") || changed.has("entityId")) {
      this._stop();
      this._cancelAlign();
      this._saved = undefined;
      this._releaseImage();
      this._releasePhoto();
      this._scene = undefined;
      this._error = false;
    }
    if (!this.active) {
      this._stop();
    } else if (!this._abort && this._timer === undefined && mowingMapPath(this.path)) {
      if (this._scene) this._expireOverlay(this._scene);
      void this._refresh();
    }
  }

  public connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("scroll", this._invalidateCanvasRect, {capture: true, passive: true});
    window.addEventListener("resize", this._invalidateCanvasRect);
    // Native scroll events do not cross a shadow boundary. HA embeds cards in
    // nested shadow roots, any of which can contain a scrolling ancestor.
    let root = this.getRootNode();
    while (root instanceof ShadowRoot) {
      root.addEventListener("scroll", this._invalidateCanvasRect, {capture: true, passive: true});
      this._scrollRoots.push(root);
      root = root.host.getRootNode();
    }
    this.requestUpdate();
  }

  public disconnectedCallback(): void {
    window.removeEventListener("scroll", this._invalidateCanvasRect, true);
    window.removeEventListener("resize", this._invalidateCanvasRect);
    for (const root of this._scrollRoots) root.removeEventListener("scroll", this._invalidateCanvasRect, true);
    this._scrollRoots = [];
    this._stop();
    if (this._noticeTimer !== undefined) window.clearTimeout(this._noticeTimer);
    this._noticeTimer = undefined;
    this._notice = undefined;
    this._resize?.disconnect();
    this._resize = undefined;
    this._observed = undefined;
    this._releaseImage();
    this._releasePhoto();
    this._scene = undefined;
    this._align = undefined;
    this._saved = undefined;
    super.disconnectedCallback();
  }

  private _stop(): void {
    this._stopHold();
    // An interrupted first load must not keep claiming "Loading map…".
    this._loading = false;
    this._photoAbort?.abort();
    this._photoAbort = undefined;
    this._abort?.abort();
    this._abort = undefined;
    if (this._timer !== undefined) window.clearTimeout(this._timer);
    this._timer = undefined;
    this._clearExpiry();
    this._pointers.clear();
    this._rect = undefined;
  }

  private _clearExpiry(): void {
    if (this._expiryTimer !== undefined) window.clearTimeout(this._expiryTimer);
    this._expiryTimer = undefined;
  }

  private _expireOverlay(scene: MowingMapScene): void {
    this._clearExpiry();
    if (!overlayIsFresh(scene)) return;
    const remaining = Date.parse(scene.overlay.updated_at || "") +
      scene.overlay.max_age_seconds * 1000 - Date.now();
    this._expiryTimer = window.setTimeout(() => {
      this._expiryTimer = undefined;
      this.requestUpdate();
    }, Math.max(1, remaining + 1));
  }

  private _releaseImage(): void {
    if (this._image) URL.revokeObjectURL(this._image);
    this._image = undefined;
    this._imagePath = undefined;
  }

  private _releasePhoto(): void {
    if (this._photo) URL.revokeObjectURL(this._photo);
    this._photo = undefined;
    this._photoPath = undefined;
  }

  private get _home(): GeoPoint | undefined {
    const config = this.hass?.config;
    return typeof config?.latitude === "number" && typeof config.longitude === "number" &&
      Number.isFinite(config.latitude) && Number.isFinite(config.longitude)
      ? { latitude: config.latitude, longitude: config.longitude } : undefined;
  }

  private get _serviceAvailable(): boolean {
    return Boolean(this.entityId &&
      this.hass?.services?.[DREAME_LAWN_MOWER_SERVICE_DOMAIN]?.set_georeference);
  }

  /** Without a saved alignment, geographic backgrounds are offered only when one can be made. */
  private get _backgrounds(): MapBackground[] {
    return availableMapBackgrounds(this._scene, Boolean(this._home) &&
      this._serviceAvailable && Boolean(this._scene?.map_revision));
  }

  /** What is drawn: the picker choice, else the configured default, when the scene allows it. */
  private get _background(): MapBackground {
    return effectiveMapBackground(
      this._backgroundChoice ?? normalizeMapBackground(this.background), this._backgrounds);
  }

  private get _photoWanted(): boolean {
    return this._background === "real_scene";
  }

  private get _world(): WorldBackground | undefined {
    const background = this._background;
    return isWorldBackground(background) ? background : undefined;
  }

  private get _limits() {
    return viewLimits(Boolean(this._world), Boolean(this._scene?.projection));
  }

  /** The saved alignment, a just-saved one, or the home as a starting point. */
  private get _reference(): MapGeoreference | undefined {
    const scene = this._scene;
    if (!scene?.projection) return undefined;
    if (this._align) return this._align.base;
    if (this._saved) return this._saved.reference;
    if (scene.georeference) return scene.georeference;
    const home = this._home;
    return home ? defaultGeoreference(scene.projection, scene.width, scene.height, home) ?? undefined : undefined;
  }

  private get _aligned(): boolean {
    return Boolean(this._saved || this._scene?.georeference);
  }

  private get _canAlign(): boolean {
    return Boolean(this._serviceAvailable && this._scene?.projection &&
      this._scene.map_revision && this._reference);
  }

  private _alignmentContext(scene: MowingMapScene): string {
    return `${this.path}:${this.entityId}:${scene.map_index}:${scene.map_revision}:${scene.revision}`;
  }

  private _chooseBackground = (event: Event): void => {
    const value = normalizeMapBackground((event.currentTarget as HTMLSelectElement).value);
    this._backgroundChoice = value;
    const scene = this._scene;
    if (!isWorldBackground(value)) {
      this._cancelAlign();
      if (scene && this._view.width > scene.width) this._fit();
    } else if (!this._aligned && !this._align && this._canAlign) {
      this._startAlign();
    }
    if (value === "real_scene" && scene) void this._refreshPhoto(scene);
  };

  private _startAlign = (): void => {
    const base = this._reference;
    if (!base || !this._canAlign) return;
    this._align = { base, adjustment: { ...IDENTITY_ADJUSTMENT }, fresh: !this._aligned,
      context: this._alignmentContext(this._scene!) };
    this._alignError = undefined;
    this._baseTool = undefined;
    // Leave room around the frame so its corner and rotate handles are reachable.
    const scene = this._scene;
    if (scene) {
      this._view = zoomMap(fitMap(scene.width, scene.height), 1 / 1.6,
        mapCentre(scene.width, scene.height), scene.width, scene.height, this._limits);
    }
  };

  private _cancelAlign = (): void => {
    this._stopHold();
    this._baseTool = undefined;
    if (this._align) this._fit();
    this._align = undefined;
    this._alignError = undefined;
  };

  private _saveAlign = async (): Promise<void> => {
    const scene = this._scene, align = this._align, hass = this.hass, entityId = this.entityId;
    if (!scene?.projection || !scene.map_revision || !align || !hass || !entityId || this._saving) return;
    if (align.context !== this._alignmentContext(scene)) {
      this._cancelAlign();
      return;
    }
    this._stopHold();
    const reference = alignedGeoreference(scene.projection, align.base, align.adjustment,
      scene.width, scene.height);
    this._saving = true;
    this._alignError = undefined;
    try {
      await hass.callService(DREAME_LAWN_MOWER_SERVICE_DOMAIN, "set_georeference",
        georeferenceServiceData(entityId, reference, scene.map_index, scene.map_revision));
      if (!this.isConnected || !this._scene ||
          align.context !== this._alignmentContext(this._scene)) return;
      this._saved = { reference, at: Date.now(), context: align.context };
      this._baseTool = undefined;
      if (this._align === align) {
        this._align = undefined;
        this._fit();
      }
      this._showNotice("mowingMap.alignSaved");
    } catch (error) {
      if (this._align?.context === align.context) {
        this._alignError = this._t("mowingMap.alignFailed", { detail: actionErrorDetail(error) ?? "" }).trim();
      }
    } finally {
      this._saving = false;
    }
  };

  /** The base's map pixel when the integration has observed the mower docked there. */
  private get _knownBase(): MapPoint | undefined {
    const overlay = this._scene?.overlay;
    return overlay?.position_status === "known_dock" && overlay.position
      ? { x: overlay.position.x, y: overlay.position.y } : undefined;
  }

  private _toggleBaseTool = (): void => {
    this._baseTool = this._baseTool ? undefined : { step: "move", pivot: this._knownBase };
  };

  private _baseToolNext = (): void => {
    if (this._baseTool?.pivot) this._baseTool = { ...this._baseTool, step: "pull" };
  };

  private _baseToolRestart = (): void => {
    this._baseTool = { step: "move", pivot: this._knownBase };
  };

  private _showNotice(key: TranslationKey): void {
    if (this._noticeTimer !== undefined) window.clearTimeout(this._noticeTimer);
    this._notice = key;
    this._noticeTimer = window.setTimeout(() => {
      this._noticeTimer = undefined;
      this._notice = undefined;
    }, 4000);
  }

  private _adjust(change: (adjustment: MapAdjustment, centre: MapPoint) => MapAdjustment): void {
    const scene = this._scene, align = this._align;
    if (!scene || !align) return;
    this._align = { ...align, adjustment: change(align.adjustment, mapCentre(scene.width, scene.height)) };
  }

  /** Buttons turn and resize the map about its drawn centre. */
  private _adjustAboutCentre(factor: number, rotation: number): void {
    this._adjust((adjustment, centre) => composeAdjustment(adjustment, centre,
      { x: centre.x + adjustment.dx, y: centre.y + adjustment.dy }, factor, rotation));
  }

  /**
   * A held step button repeats after a short delay and speeds up the longer
   * it is held (up to ten steps per tick); the click itself does one step.
   */
  private _hold(step: (multiplier: number) => void) {
    return (event: PointerEvent) => {
      if (event.button !== 0) return;
      this._stopHold();
      let ticks = 0;
      this._holdTimer = window.setTimeout(() => {
        this._holdTimer = window.setInterval(() => {
          ticks += 1;
          step(Math.min(10, 1 + Math.floor(ticks / 8)));
        }, 90);
      }, 450);
    };
  }

  private _stopHold = (): void => {
    if (this._holdTimer !== undefined) {
      window.clearTimeout(this._holdTimer);
      window.clearInterval(this._holdTimer);
    }
    this._holdTimer = undefined;
  };

  private _tileFailed(template: string, zoom: number): void {
    const cap = this._tileCaps[template];
    const next = lowerTileZoomLimit(cap, zoom);
    if (next && next !== cap) {
      this._tileCaps = { ...this._tileCaps, [template]: next };
    }
  }

  /** Optional photography never delays delivery of the usable standard map. */
  private async _refreshPhoto(scene: MowingMapScene): Promise<void> {
    if (!this._photoWanted || !scene.real_scene_path || this._photoAbort ||
        this._photoPath === scene.real_scene_path || !this.active || !this.isConnected) return;
    const controller = new AbortController();
    this._photoAbort = controller;
    const timeout = window.setTimeout(() => controller.abort(), 10_000);
    let photo: string | undefined;
    try {
      photo = await this._loadPhoto(scene, controller.signal);
      if (photo && this._photoAbort === controller && !controller.signal.aborted &&
          this.active && this.isConnected && this._scene?.real_scene_path === scene.real_scene_path) {
        this._releasePhoto();
        this._photo = photo;
        this._photoPath = scene.real_scene_path;
        photo = undefined;
      }
    } catch { /* Optional photo failures leave the standard map available. */ }
    finally {
      window.clearTimeout(timeout);
      if (photo) URL.revokeObjectURL(photo);
      if (this._photoAbort === controller) this._photoAbort = undefined;
    }
  }

  /** Load the optional photo layer; any failure keeps the standard map. */
  private async _loadPhoto(
    scene: MowingMapScene, signal: AbortSignal,
  ): Promise<string | undefined> {
    if (!scene.real_scene_path) return undefined;
    let photo: string | undefined;
    try {
      const response = await this._fetch(scene.real_scene_path, signal);
      const blob = await response.blob();
      if (blob.type !== "image/png" || blob.size > 16 * 1024 * 1024) return undefined;
      photo = URL.createObjectURL(blob);
      const decoded = new Image();
      decoded.src = photo;
      await abortable(decoded.decode(), signal);
      if (decoded.naturalWidth !== scene.width || decoded.naturalHeight !== scene.height) {
        URL.revokeObjectURL(photo);
        return undefined;
      }
      return photo;
    } catch (error) {
      if (photo) URL.revokeObjectURL(photo);
      if (signal.aborted) throw error;
      return undefined;
    }
  }

  private async _fetch(path: string, signal: AbortSignal): Promise<Response> {
    const hass = this.hass;
    if (!hass) throw new Error("Home Assistant is unavailable");
    return fetchPrivateApi(hass, path, signal);
  }

  private async _refresh(): Promise<void> {
    const path = mowingMapPath(this.path);
    if (!path || !this.hass || !this.active || !this.isConnected || this._abort) return;
    const controller = new AbortController();
    this._abort = controller;
    this._loading = !this._scene;
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    // A stalled scene request is abandoned quickly and retried (see nextRefreshDelay).
    const sceneTimeout = window.setTimeout(() => controller.abort(), SCENE_TIMEOUT_MS);
    let image: string | undefined;
    try {
      const response = await this._fetch(path, controller.signal);
      const scene = readMowingMapScene(await response.json(), path);
      window.clearTimeout(sceneTimeout);
      const backgroundPath = backgroundRequestPath(scene);
      if (backgroundPath !== this._imagePath || !this._image) {
        const background = await this._fetch(backgroundPath, controller.signal);
        const blob = await background.blob();
        if (blob.type !== "image/png" || blob.size > 4 * 1024 * 1024) {
          throw new Error("Invalid map background");
        }
        image = URL.createObjectURL(blob);
        // Verify decoding before publishing this background and its overlay.
        const decoded = new Image();
        decoded.src = image;
        await abortable(decoded.decode(), controller.signal);
        if (decoded.naturalWidth !== scene.width || decoded.naturalHeight !== scene.height) {
          throw new Error("Map dimensions do not match");
        }
      }
      if (this._abort !== controller || controller.signal.aborted || !this.active || !this.isConnected) return;
      if (scene.real_scene_path !== this._scene?.real_scene_path) {
        this._photoAbort?.abort();
        this._photoAbort = undefined;
        this._releasePhoto();
      }
      if (image) {
        this._releaseImage();
        this._image = image;
        this._imagePath = backgroundPath;
        image = undefined;
        this._view = fitMap(scene.width, scene.height);
      }
      this._scene = scene;
      if (this._align && this._align.context !== this._alignmentContext(scene)) this._cancelAlign();
      if (this._saved && (this._saved.context !== this._alignmentContext(scene) ||
          sameGeoreference(scene.georeference, this._saved.reference) ||
          Date.now() - this._saved.at > SAVED_GRACE_MS)) this._saved = undefined;
      if (this._align && !scene.projection) this._cancelAlign();
      this._expireOverlay(scene);
      this._error = false;
      this._failures = 0;
      void this._refreshPhoto(scene);
    } catch {
      if (this._abort === controller) {
        this._clearExpiry();
        this._error = true;
        this._failures += 1;
      }
    } finally {
      window.clearTimeout(timeout);
      window.clearTimeout(sceneTimeout);
      if (image) URL.revokeObjectURL(image);
      if (this._abort === controller) {
        this._abort = undefined;
        this._loading = false;
        if (this.active && this.isConnected) {
          this._timer = window.setTimeout(() => {
            this._timer = undefined;
            void this._refresh();
          }, nextRefreshDelay(Boolean(this._scene), this._error ? this._failures : 0));
        }
      }
    }
  }

  /**
   * Client pixel to map pixel. Reuse the gesture's canvas box until scrolling,
   * resize or canvas replacement invalidates it; apply the view arithmetically.
   */
  private _point(client: MapPoint): MapPoint {
    const rect = this._pointers.size ? this._rect ?? this._canvasRect() : this._canvasRect();
    if (!rect) return { x: this._view.x + this._view.width / 2, y: this._view.y + this._view.height / 2 };
    return clientToMap(client, rect, this._view);
  }

  private _canvasRect(): DOMRect | undefined {
    const rect = this.renderRoot.querySelector<SVGSVGElement>(".map-canvas")?.getBoundingClientRect();
    if (this._pointers.size) this._rect = rect;
    return rect;
  }

  private _zoom(factor: number, anchor?: MapPoint): void {
    const scene = this._scene;
    if (!scene) return;
    this._view = zoomMap(this._view, factor, anchor || {
      x: this._view.x + this._view.width / 2, y: this._view.y + this._view.height / 2,
    }, scene.width, scene.height, this._limits);
  }

  private _pan(dx: number, dy: number): void {
    if (!this._scene) return;
    this._view = constrainViewport({ ...this._view, x: this._view.x + dx, y: this._view.y + dy },
      this._scene.width, this._scene.height, this._limits);
  }

  private _fit(): void {
    if (this._scene) this._view = fitMap(this._scene.width, this._scene.height);
  }

  private _centre(): void {
    const scene = this._scene;
    if (!scene || this._error || !overlayIsFresh(scene) || !scene.overlay.position) return;
    this._view = constrainViewport({ ...this._view,
      x: scene.overlay.position.x - this._view.width / 2,
      y: scene.overlay.position.y - this._view.height / 2,
    }, scene.width, scene.height, this._limits);
  }

  /** Touches on the map are gestures: no text selection, callout or emulated mouse. */
  private _noTouchDefault = { handleEvent: (event: TouchEvent) => event.preventDefault(), passive: false };
  private _noDefault = (event: Event) => event.preventDefault();

  private _down(event: PointerEvent): void {
    const scene = this._scene;
    if (event.button !== 0 || !scene) return;
    event.preventDefault();
    (event.currentTarget as SVGElement).setPointerCapture(event.pointerId);
    this._pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this._align && this._pointers.size === 1) {
      const handle = (event.target as Element | null)?.closest?.("[data-handle]")
        ?.getAttribute("data-handle") as AlignHandle | null | undefined;
      const onMap = pointOnMap(this._align.adjustment, scene.width, scene.height,
        this._point({ x: event.clientX, y: event.clientY }));
      this._drag = alignGesture(1, handle ?? undefined, onMap);
      const tool = this._baseTool;
      if (tool && this._drag === "move-map") {
        const grabbed = unadjustPoint(this._align.adjustment, mapCentre(scene.width, scene.height),
          this._point({ x: event.clientX, y: event.clientY }));
        if (!tool.pivot) this._baseTool = { ...tool, pivot: grabbed };
        else if (tool.step === "pull") { this._drag = "pull"; this._grab = grabbed; }
      }
    }
  }

  private _move(event: PointerEvent): void {
    if (!this._pointers.has(event.pointerId)) return;
    const before = [...this._pointers.values()];
    this._pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const after = [...this._pointers.values()];
    const centre = (points: MapPoint[]) => ({
      x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
      y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
    });
    const oldCentre = this._point(centre(before)), newCentre = this._point(centre(after));
    // Aligning: two fingers always move the view; one pointer moves the map,
    // drags a handle, or pans the view when it started off the map.
    const gesture = this._align ? (after.length >= 2 ? "view" : this._drag ?? "view") : "view";
    if (gesture === "move-map") {
      this._adjust((adjustment) => ({ ...adjustment,
        dx: adjustment.dx + newCentre.x - oldCentre.x, dy: adjustment.dy + newCentre.y - oldCentre.y }));
      return;
    }
    if (gesture === "pull") {
      const pivot = this._baseTool?.pivot, grab = this._grab;
      const minimum = 24 * Math.max(this._view.width / this._size.width, this._view.height / this._size.height);
      if (pivot && grab) {
        this._adjust((adjustment, mapMiddle) =>
          pullAboutPivot(adjustment, mapMiddle, pivot, grab, newCentre, minimum) ?? adjustment);
      }
      return;
    }
    if (gesture === "scale" || gesture === "rotate") {
      this._adjust((adjustment, mapMiddle) => dragHandle(adjustment, mapMiddle, gesture, oldCentre, newCentre));
      return;
    }
    this._pan(oldCentre.x - newCentre.x, oldCentre.y - newCentre.y);
    if (before.length === 2) {
      const distance = (points: MapPoint[]) => Math.hypot(
        points[0].x - points[1].x, points[0].y - points[1].y,
      );
      const initialDistance = distance(before);
      if (initialDistance > 0) this._zoom(distance(after) / initialDistance, oldCentre);
    }
  }

  private _up(event: PointerEvent): void {
    this._pointers.delete(event.pointerId);
    if (!this._pointers.size) this._rect = undefined;
    // Lifting one of two fingers continues as a view pan, never as a map move.
    if (this._pointers.size === 0) this._drag = undefined;
    else this._drag = "view";
    this._grab = undefined;
  }

  private _wheel(event: WheelEvent): void {
    if (!this._scene) return;
    event.preventDefault();
    // The wheel always zooms the view, aligning or not.
    this._zoom(event.deltaY < 0 ? 1.15 : 1 / 1.15, this._point({ x: event.clientX, y: event.clientY }));
  }

  private _key(event: KeyboardEvent): void {
    const step = this._view.width / 10;
    if (this._align && event.key.startsWith("Arrow")) {
      const nudge = this._view.width / 100;
      const [dx, dy] = ({ ArrowLeft: [-nudge, 0], ArrowRight: [nudge, 0],
        ArrowUp: [0, -nudge], ArrowDown: [0, nudge] } as Record<string, number[]>)[event.key] ?? [0, 0];
      event.preventDefault();
      this._adjust((adjustment) => ({ ...adjustment, dx: adjustment.dx + dx, dy: adjustment.dy + dy }));
      return;
    }
    const actions: Record<string, () => void> = {
      "+": () => this._zoom(1.25), "=": () => this._zoom(1.25),
      "-": () => this._zoom(0.8), Home: () => this._fit(),
      ArrowLeft: () => this._pan(-step, 0), ArrowRight: () => this._pan(step, 0),
      ArrowUp: () => this._pan(0, -step), ArrowDown: () => this._pan(0, step),
    };
    if (actions[event.key]) { event.preventDefault(); actions[event.key](); }
  }

  private _backgroundLabel(background: MapBackground): string {
    const keys: Record<MapBackground, TranslationKey> = {
      standard: "mowingMap.backgroundStandard", real_scene: "mowingMap.realScene",
      map: "mowingMap.backgroundMap", satellite: "mowingMap.backgroundSatellite",
    };
    return this._t(keys[background]);
  }

  private _renderBackgroundPicker(scene: MowingMapScene | undefined) {
    const choices = this._backgrounds;
    if (!scene || choices.length < 2) return nothing;
    const current = this._background;
    return html`
      <label class="background-picker" title=${this._t("mowingMap.background")}>
        ${mapControlIcon("layers")}
        <select aria-label=${this._t("mowingMap.background")} @change=${this._chooseBackground}>
          ${choices.map((choice) => html`
            <option value=${choice} ?selected=${choice === current}>${this._backgroundLabel(choice)}</option>`)}
        </select>
      </label>`;
  }

  /**
   * Geographic tiles under the SVG, one affine per tile. They are HTML images
   * so they can send an origin-only Referer, which tile servers such as
   * OpenStreetMap require and Home Assistant pages otherwise suppress.
   */
  private _renderTiles(scene: MowingMapScene, world: WorldBackground, reference: MapGeoreference) {
    const projection = scene.projection;
    if (!projection) return nothing;
    const source = worldTileSource(world, this.tiles?.[world]);
    const unitsPerScreenPixel = Math.max(this._view.width / this._size.width, this._view.height / this._size.height);
    const density = Math.min(2, Math.max(1, globalThis.devicePixelRatio || 1));
    const metresPerScreenPixel = unitsPerScreenPixel * metresPerMapPixel(projection, reference) / density;
    const maxZoom = Math.min(source.maxZoom, tileZoomLimit(this._tileCaps[source.template]) ?? source.maxZoom);
    const zoom = tileZoomFor(metresPerScreenPixel, reference.latitude, maxZoom);
    // The SVG letterboxes its viewBox; cover the whole visible canvas, not just the viewBox.
    const shown = {
      width: this._size.width * unitsPerScreenPixel, height: this._size.height * unitsPerScreenPixel,
    };
    const tiles = visibleTiles(projection, reference, {
      x: this._view.x - (shown.width - this._view.width) / 2,
      y: this._view.y - (shown.height - this._view.height) / 2, ...shown,
    }, zoom);
    // Outside Align, tiles step back (veil + less colour) so the garden stands out;
    // while aligning they stay crisp because the map is matched to the photo.
    const dim = this._align ? undefined : worldDim(this.worldDim);
    return html`<div class="world-tiles" aria-hidden="true"
      style=${dim ? `filter:saturate(${dim.saturate})` : ""}>${repeat(tiles, (tile) => `${tile.z}/${tile.x}/${tile.y}`,
      (tile) => {
        const href = tileUrl(source.template, tile.z, tile.x, tile.y);
        return href ? html`<img src=${href} alt="" draggable="false" decoding="async"
          referrerpolicy="strict-origin-when-cross-origin"
          style=${`transform:matrix(${screenMatrix(tile.matrix, this._view, this._size).join(",")})`}
          @error=${() => this._tileFailed(source.template, tile.z)} />` : nothing;
      })}</div>
      ${dim?.veil ? html`<div class="world-veil" aria-hidden="true" style=${`opacity:${dim.veil}`}></div>` : nothing}`;
  }

  /**
   * Zone names (when the integration lists them) as upright HTML text at a
   * constant screen size over every background; they follow the mower map,
   * also while aligning.
   */
  private _renderOverlayText(scene: MowingMapScene, align: AlignSession | undefined) {
    const projection = scene.projection;
    if (!projection) return nothing;
    const centre = mapCentre(scene.width, scene.height);
    const toScreen = (pixel: MapPoint) => mapToScreen(
      align ? adjustPoint(align.adjustment, centre, pixel) : pixel, this._view, this._size);
    const labels = cardDrawsZoneLabels(scene) ? placeZoneLabels((scene.zones ?? []).map((zone) => ({
      name: zone.name, ...toScreen(nativeToPixel(projection, { x: zone.label_x, y: zone.label_y })),
    })), this._size, ZONE_LABEL_PX) : [];
    if (!labels.some((label) => label.visible)) return nothing;
    return html`<div class="map-text" aria-hidden="true">
      ${labels.filter((label) => label.visible).map((label) => html`
        <span class="zone-label" style=${`left:${label.x}px;top:${label.y}px;font-size:${ZONE_LABEL_PX}px`}
          >${label.name}</span>`)}
    </div>`;
  }

  /** The base pin (pivot) of "Align from the base", and the pull line while pulling. */
  private _renderBasePin(scene: MowingMapScene, align: AlignSession) {
    const pivot = this._baseTool?.pivot;
    if (!pivot) return nothing;
    const centre = mapCentre(scene.width, scene.height);
    const at = (point: MapPoint) => mapToScreen(adjustPoint(align.adjustment, centre, point), this._view, this._size);
    const pin = at(pivot);
    const grab = this._drag === "pull" && this._grab ? at(this._grab) : undefined;
    const fixed = this._baseTool?.step === "pull";
    return html`<div class="map-text" aria-hidden="true">
      ${grab ? html`<svg class="pull-line" width=${this._size.width} height=${this._size.height}>
        <line x1=${pin.x} y1=${pin.y} x2=${grab.x} y2=${grab.y} /><circle cx=${grab.x} cy=${grab.y} r="9" /></svg>` : nothing}
      <span class=${`base-pin${fixed ? " fixed" : ""}`} style=${`left:${pin.x}px;top:${pin.y}px`}>
        <svg viewBox="-12 -12 24 24"><circle r="9" /><circle class="core" r="3.5" /></svg>
        <span>${this._t("mowingMap.basePin")}</span></span>
    </div>`;
  }

  private _renderAttribution(world: WorldBackground) {
    const source = worldTileSource(world, this.tiles?.[world]);
    if (!source.attribution) return nothing;
    return html`<div class="tile-attribution">${source.attributionUrl
      ? html`<a href=${source.attributionUrl} target="_blank" rel="noopener noreferrer">${source.attribution}</a>`
      : source.attribution}</div>`;
  }

  private _renderAlignBar(align: AlignSession) {
    const { rotation, scale } = align.adjustment;
    const number = (options: Intl.NumberFormatOptions) => new Intl.NumberFormat(this.locale, options);
    const degrees = number({ minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: "exceptZero" })
      .format(rotation);
    const size = number({ style: "percent", maximumFractionDigits: 1 }).format(scale);
    const signedDegrees = (value: number) =>
      `${number({ minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: "always" }).format(value)}°`;
    const signedPercent = (value: number) =>
      number({ style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: "always" })
        .format(value);
    const rotateLeft = (times = 1) => this._adjustAboutCentre(1, -ROTATE_STEP * times);
    const rotateRight = (times = 1) => this._adjustAboutCentre(1, ROTATE_STEP * times);
    const shrink = (times = 1) => this._adjustAboutCentre(SCALE_STEP ** -times, 0);
    const grow = (times = 1) => this._adjustAboutCentre(SCALE_STEP ** times, 0);
    const step = (label: TranslationKey, action: (times?: number) => void, content: string) => html`
      <button class="step" @click=${() => action()} @pointerdown=${this._hold(action)}
        @pointerup=${this._stopHold} @pointerleave=${this._stopHold} @pointercancel=${this._stopHold}
        aria-label=${this._t(label)} title=${this._t(label)}>${content}</button>`;
    return html`
      <div class="align-bar" role="group" aria-label=${this._t("mowingMap.alignTools")}>
        ${this._baseTool ? nothing : html`<p class="align-help">${this._t("mowingMap.alignHint")}</p>`}
        <div class="align-row base-tool">
          <button aria-pressed=${this._baseTool ? "true" : "false"} @click=${this._toggleBaseTool}
            >${this._t("mowingMap.baseTool")}</button>
          ${this._baseTool ? html`
            <span class="align-step" role="status">${this._t(!this._baseTool.pivot ? "mowingMap.baseToolPick"
              : this._baseTool.step === "move" ? "mowingMap.baseToolMove" : "mowingMap.baseToolPull")}</span>
            ${this._baseTool.step === "move"
              ? html`<button class="primary" ?disabled=${!this._baseTool.pivot} @click=${this._baseToolNext}
                  >${this._t("mowingMap.baseToolNext")}</button>`
              : html`<button @click=${this._baseToolRestart}>${this._t("mowingMap.baseToolRestart")}</button>`}` : nothing}
        </div>
        <div class="align-row">
          <div class="stepper" role="group" aria-label=${this._t("mowingMap.alignRotation", { value: degrees })}>
            <span class="stepper-label">${this._t("mowingMap.rotationLabel")}</span>
            ${step("mowingMap.rotateLeft", rotateLeft, signedDegrees(-ROTATE_STEP))}
            <span class="readout" aria-hidden="true">${degrees}°</span>
            ${step("mowingMap.rotateRight", rotateRight, signedDegrees(ROTATE_STEP))}
          </div>
          <div class="stepper" role="group" aria-label=${this._t("mowingMap.alignScale", { value: size })}>
            <span class="stepper-label">${this._t("mowingMap.sizeLabel")}</span>
            ${step("mowingMap.scaleDown", shrink, signedPercent(-(SCALE_STEP - 1)))}
            <span class="readout" aria-hidden="true">${size}</span>
            ${step("mowingMap.scaleUp", grow, signedPercent(SCALE_STEP - 1))}
          </div>
        </div>
        <div class="align-row">
          ${this._alignError || align.fresh ? html`
            <span class=${`align-hint${this._alignError ? " error" : ""}`} role="status">${this._alignError ||
              this._t("mowingMap.alignNew")}</span>` : html`<span class="align-hint"></span>`}
          <div class="align-actions">
            <button @click=${this._cancelAlign} ?disabled=${this._saving}>${this._t("mowingMap.alignCancel")}</button>
            <button class="primary" @click=${this._saveAlign} ?disabled=${this._saving}>
              ${this._t(this._saving ? "mowingMap.alignSaving" : "mowingMap.alignSave")}</button>
          </div>
        </div>
      </div>`;
  }

  /** Resize corners and a rotate knob, constant on screen whatever the zoom. */
  private _renderHandles(scene: MowingMapScene, align: AlignSession, unitsPerScreenPixel: number) {
    const u = unitsPerScreenPixel;
    const { corners, top, rotate } = alignHandlePositions(align.adjustment, scene.width, scene.height, 40 * u);
    const knob = (point: MapPoint, kind: AlignHandle, label: string, extra = "") => svg`
      <g class=${`handle ${kind}${extra}`} data-handle=${kind} transform=${`translate(${point.x} ${point.y})`}>
        <title>${label}</title>
        <circle class="handle-hit" r=${22 * u} />
        <circle class="handle-dot" r=${kind === "rotate" ? 11 * u : 9 * u} stroke-width=${2.5 * u} />
        ${kind === "rotate" ? svg`<path class="handle-glyph" stroke-width=${1.8 * u}
          d=${`M ${-4.5 * u} ${-2 * u} A ${5 * u} ${5 * u} 0 1 0 ${0} ${-5 * u} M ${-1.5 * u} ${-8 * u} L 0 ${-5 * u} L ${-3 * u} ${-2.5 * u}`} />` : nothing}
      </g>`;
    return svg`
      <g class="align-handles">
        <line class="handle-stem" x1=${top.x} y1=${top.y} x2=${rotate.x} y2=${rotate.y} stroke-width=${2 * u} />
        ${corners.map((corner, index) => knob(corner, "scale", this._t("mowingMap.sizeLabel"),
          index % 2 ? " nesw" : " nwse"))}
        ${knob(rotate, "rotate", this._t("mowingMap.rotationLabel"))}
      </g>`;
  }

  private _markerImage(scene: MowingMapScene): string | undefined {
    const image = this.markerImage ?? scene.marker_image_path ?? undefined;
    if (!image || image === this._markerImageFailed) return undefined;
    // SVG <image> has no error event in every browser, so the picture is probed once.
    if (image !== this._markerProbe) {
      this._markerProbe = image;
      const probe = new Image();
      probe.onerror = () => { if (this._markerProbe === image) this._markerImageFailed = image; };
      probe.src = image;
    }
    return image;
  }

  private _markerProbe?: string;

  protected render() {
    const scene = this._scene;
    const fresh = Boolean(scene && this.active && !this._error && overlayIsFresh(scene));
    const position = fresh ? scene?.overlay.position : undefined;
    const unitsPerScreenPixel = Math.max(this._view.width / this._size.width, this._view.height / this._size.height);
    const zoom = scene ? scene.width / this._view.width : 1;
    const world = scene ? this._world : undefined;
    const reference = world ? this._reference : undefined;
    const align = world ? this._align : undefined;
    const adjustment = scene && align
      ? `matrix(${adjustmentMatrix(align.adjustment, mapCentre(scene.width, scene.height)).join(" ")})` : undefined;
    const minZoom = scene ? 1 / this._limits.maxWidth : 1;
    // Over street map or satellite (not while aligning), the garden is emphasised.
    const emphasis = world && !align ? gardenEmphasis(unitsPerScreenPixel) : undefined;
    // Inside an aligning map, map pixels are drawn larger by the adjustment's size.
    const marker = mowerMarkerTransform(unitsPerScreenPixel / (align?.adjustment.scale ?? 1),
      scene?.projection?.scale, this.mowerSize);
    const body = html`
      <div class="viewport" data-map-state=${this._error ? "error" : scene ? "ready" : "loading"}>
        <div class="toolbar" aria-label=${this._t("mowingMap.tools")}>
          <span class="map-name">${scene?.name || this._t("mowingMap.garden")}</span>
          <div class="tool-actions">
            <button class="zoom" @click=${() => this._zoom(1.4)} ?disabled=${!scene || zoom >= this._limits.maxZoom - 1e-6}
              title=${this._t("mowingMap.zoomIn")} aria-label=${this._t("mowingMap.zoomIn")}>+</button>
            <button class="zoom" @click=${() => this._zoom(1 / 1.4)} ?disabled=${!scene || zoom <= minZoom}
              title=${this._t("mowingMap.zoomOut")} aria-label=${this._t("mowingMap.zoomOut")}>−</button>
            ${this._renderBackgroundPicker(scene)}
            ${world && !align && this._canAlign ? html`
              <button class="align-button" @click=${this._startAlign}
                aria-label=${this._t("mowingMap.align")} title=${this._t("mowingMap.align")}
                >${mapControlIcon("align")}<span>${this._t("mowingMap.align")}</span></button>` : nothing}
            <button @click=${this._fit} ?disabled=${!scene} aria-label=${this._t("mowingMap.fit")}
              title=${this._t("mowingMap.fit")}>${mapControlIcon("fit")}<span>${this._t("mowingMap.fit")}</span></button>
            <button class="centre-button" @click=${this._centre} ?disabled=${!position}
              aria-label=${this._t("mowingMap.centre")} title=${this._t("mowingMap.centre")}
              >${mapControlIcon("centre")}<span>${this._t("mowingMap.centre")}</span></button>
          </div>
        </div>
        ${align ? this._renderAlignBar(align) : nothing}
        <div class=${`canvas${world ? " world" : ""}`}>
        ${scene && this._image ? html`
          ${world && reference ? this._renderTiles(scene, world, reference) : nothing}
          <svg class=${`map-canvas${align ? " aligning" : ""}`}
            viewBox=${`${this._view.x} ${this._view.y} ${this._view.width} ${this._view.height}`}
            tabindex="0" role="img" aria-label=${this._t("mowingMap.mapLabel")}
            @pointerdown=${this._down} @pointermove=${this._move} @pointerup=${this._up}
            @pointercancel=${this._up} @lostpointercapture=${this._up}
            @wheel=${this._wheel} @keydown=${this._key}
            @touchstart=${this._noTouchDefault} @contextmenu=${this._noDefault} @selectstart=${this._noDefault}>
            <g class=${`mower-layer${world ? " over-world" : ""}${align ? " aligning" : ""}`}
              transform=${adjustment ?? nothing}>
            ${this._photoWanted && this._photo && this._photoPath === scene.real_scene_path ? svg`
              <image class="real-scene" href=${this._photo} x="0" y="0"
                width=${scene.width} height=${scene.height} />` : nothing}
            ${emphasis ? svg`<defs>
              <filter id="garden-emphasis" x="-5%" y="-5%" width="110%" height="110%"
                color-interpolation-filters="sRGB">
                <feComponentTransfer in="SourceGraphic" result="solid">
                  <feFuncA type="linear" slope=${emphasis.alphaSlope} /></feComponentTransfer>
                <feMorphology in="SourceAlpha" operator="dilate" radius=${emphasis.halo} result="spread" />
                <feFlood class="garden-halo" result="tint" />
                <feComposite in="tint" in2="spread" operator="in" result="halo" />
                <feMerge><feMergeNode in="halo" /><feMergeNode in="solid" /></feMerge>
              </filter></defs>` : nothing}
            <image href=${this._image} x="0" y="0" width=${scene.width} height=${scene.height}
              filter=${emphasis ? "url(#garden-emphasis)" : nothing} />
            ${align ? svg`<rect class="align-frame" x="0" y="0" width=${scene.width} height=${scene.height}
              fill="none" vector-effect="non-scaling-stroke" />` : nothing}
            ${fresh ? scene.overlay.trail.map((segment) => svg`
              <polyline class="trail-outline" points=${segment.map((point) => point.join(",")).join(" ")}
                fill="none" stroke-width="5" vector-effect="non-scaling-stroke"
                stroke-linecap="round" stroke-linejoin="round" />
              <polyline class="trail" points=${segment.map((point) => point.join(",")).join(" ")}
                fill="none" stroke-width="2.5" vector-effect="non-scaling-stroke"
                stroke-linecap="round" stroke-linejoin="round" />`) : nothing}
            ${position ? svg`
              <g transform=${`translate(${position.x} ${position.y}) scale(${marker.scale})`}
                data-mower-position=${scene.overlay.position_status}
                data-marker-size=${marker.realSize ? "real" : "fixed"}
                opacity=${scene.overlay.position_status === "last_known" ? "0.55" : "1"}>
                ${mowerMapMarker(position.heading, marker, this._markerImage(scene))}
              </g>` : nothing}
            </g>
            ${align ? this._renderHandles(scene, align, unitsPerScreenPixel) : nothing}
          </svg>
          ${this._renderOverlayText(scene, align)}
          ${align ? this._renderBasePin(scene, align) : nothing}
          ${world ? this._renderAttribution(world) : nothing}
          ${world && !align && !this._aligned ? html`
            <div class="map-notice">${this._t("mowingMap.notAligned")}</div>` : this._notice ? html`
            <div class="map-notice" role="status">${this._t(this._notice)}</div>` : nothing}` : this.fallbackUrl && !this._fallbackFailed ? html`
          <img class="fallback" src=${this.fallbackUrl} alt=${this._t("mowingMap.garden")}
            @error=${() => { this._fallbackFailed = true; }} />` : html`
          <div class="map-empty">${this._t(this._loading ? "mowingMap.loading" : "mowingMap.unavailable")}</div>`}
        </div>
        <div class="legend">
          <span class="legend-item"><span class="swatch" aria-hidden="true"></span>${this._t("mowingMap.garden")}</span>
          ${fresh && scene?.overlay.trail.length ? html`
            <span class="legend-item"><span class="swatch route" aria-hidden="true"></span>${this._t("mowingMap.thisRun")}</span>` : nothing}
          <span class=${`status${position ? " current" : ""}${this._error ? " error" : ""}`} role="status">
          <span class="status-dot" aria-hidden="true"></span>
          ${this._loading ? this._t("mowingMap.loading") : this._error
            ? this._t("mowingMap.unavailable") : this._t(positionStatusKey(scene, Boolean(position)))}
          ${!scene && this.fallbackSaved && !this._fallbackFailed ? html` · ${this._t("card.savedPreview")}` : nothing}
          </span>
          <span class="coverage-note">${this._t("mowingMap.coverageUnavailable")}</span>
        </div>
      </div>`;
    return align ? html`
      <dialog class="align-dialog" aria-label=${this._t("mowingMap.alignTools")}
        @cancel=${(event: Event) => { event.preventDefault(); this._cancelAlign(); }}>${body}</dialog>` : body;
  }

  static styles = mowingMapStyles;
}
