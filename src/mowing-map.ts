import { LitElement, html, nothing, svg, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { createTranslator, type SupportedLocale, type TranslationKey } from "./localization";
import { signedPathFromResponse } from "./point-cloud-logic";
import type { HomeAssistant } from "./card-config";
import { actionErrorDetail } from "./action-error";
import { DREAME_LAWN_MOWER_SERVICE_DOMAIN } from "./card-logic";
import { mapControlIcon, mowerMapMarker, mowingMapStyles } from "./mowing-map-presentation";
import {
  availableMapBackgrounds, constrainViewport, effectiveMapBackground, fitMap, isWorldBackground,
  MAP_VIEW_LIMITS, mowingMapPath, normalizeMapBackground, overlayIsFresh, positionStatusKey,
  readMowingMapScene, WORLD_VIEW_LIMITS, zoomMap,
  type MapBackground, type MapPoint, type MapViewport, type MowingMapScene,
} from "./mowing-map-logic";
import {
  adjustmentMatrix, alignedGeoreference, composeAdjustment, defaultGeoreference,
  georeferenceServiceData, IDENTITY_ADJUSTMENT, mapCentre, metresPerMapPixel, sameGeoreference,
  tileUrl, tileZoomFor, visibleTiles, worldTileSource,
  type GeoPoint, type MapAdjustment, type MapGeoreference, type WorldBackground, type WorldTileOptions,
} from "./map-georeference-logic";

/** Tile options per geographic background, from the card configuration. */
export type WorldTileConfig = Partial<Record<WorldBackground, WorldTileOptions>>;

type AlignSession = {
  /** Alignment the tiles are drawn with while the mower map moves over them. */
  base: MapGeoreference;
  adjustment: MapAdjustment;
  /** No alignment was saved yet; the base is the Home Assistant home. */
  fresh: boolean;
};

const ROTATE_STEP = 0.5;
const SCALE_STEP = 1.005;
const SAVED_GRACE_MS = 60_000;

/** Abort waiting on non-cancellable HA signing and browser decoding promises. */
async function abortable<T>(pending: Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted();
  let cancel!: () => void;
  const aborted = new Promise<never>((_resolve, reject) => {
    cancel = () => reject(new DOMException("Aborted", "AbortError"));
    signal.addEventListener("abort", cancel, { once: true });
  });
  try { return await Promise.race([pending, aborted]); }
  finally { signal.removeEventListener("abort", cancel); }
}

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

  @state() private _scene?: MowingMapScene;
  @state() private _image?: string;
  @state() private _photo?: string;
  @state() private _backgroundChoice?: MapBackground;
  @state() private _align?: AlignSession;
  @state() private _gesture: "map" | "view" = "map";
  @state() private _saving = false;
  @state() private _alignError?: string;
  @state() private _notice?: TranslationKey;
  /** Highest level each tile source answered at, lowered on tile errors. */
  @state() private _tileCaps: Record<string, number> = {};
  /** Just-saved alignment shown until the integration reports it back. */
  private _saved?: { reference: MapGeoreference; at: number };
  private _noticeTimer?: number;
  private _holdTimer?: number;
  private _photoPath?: string;
  @state() private _view: MapViewport = fitMap(1, 1);
  @state() private _error = false;
  @state() private _loading = false;
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

  private get _t() { return createTranslator(this.locale); }

  protected updated(changed: PropertyValues): void {
    if (!this.isConnected) return;
    if (changed.has("fallbackUrl")) this._fallbackFailed = false;
    const viewport = this.renderRoot.querySelector(".canvas");
    if (viewport && viewport !== this._observed) {
      this._resize ??= new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && (width !== this._size.width || height !== this._size.height)) {
          this._size = { width, height };
        }
      });
      if (this._observed) this._resize.unobserve(this._observed);
      this._resize.observe(viewport);
      this._observed = viewport;
    }
    // Aligning happens full screen on phones: a modal dialog escapes the card's height.
    const dialog = this.renderRoot.querySelector<HTMLDialogElement>("dialog.align-dialog");
    if (dialog && !dialog.open) {
      try { dialog.showModal(); } catch { dialog.setAttribute("open", ""); }
    }
    if (changed.has("path")) {
      this._stop();
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
    this.requestUpdate();
  }

  public disconnectedCallback(): void {
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
    super.disconnectedCallback();
  }

  private _stop(): void {
    this._stopHold();
    this._photoAbort?.abort();
    this._photoAbort = undefined;
    this._abort?.abort();
    this._abort = undefined;
    if (this._timer !== undefined) window.clearTimeout(this._timer);
    this._timer = undefined;
    this._clearExpiry();
    this._pointers.clear();
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
    return availableMapBackgrounds(this._scene, Boolean(this._home) && this._serviceAvailable);
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
    return this._world ? WORLD_VIEW_LIMITS : MAP_VIEW_LIMITS;
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
    return Boolean(this._serviceAvailable && this._scene?.projection && this._reference);
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
    this._align = { base, adjustment: { ...IDENTITY_ADJUSTMENT }, fresh: !this._aligned };
    this._gesture = "map";
    this._alignError = undefined;
  };

  private _cancelAlign = (): void => {
    this._stopHold();
    if (this._align) this._fit();
    this._align = undefined;
    this._alignError = undefined;
  };

  private _saveAlign = async (): Promise<void> => {
    const scene = this._scene, align = this._align, hass = this.hass, entityId = this.entityId;
    if (!scene?.projection || !align || !hass || !entityId || this._saving) return;
    this._stopHold();
    const reference = alignedGeoreference(scene.projection, align.base, align.adjustment,
      scene.width, scene.height);
    this._saving = true;
    this._alignError = undefined;
    try {
      await hass.callService(DREAME_LAWN_MOWER_SERVICE_DOMAIN, "set_georeference",
        georeferenceServiceData(entityId, reference));
      this._saved = { reference, at: Date.now() };
      if (this._align === align) {
        this._align = undefined;
        this._fit();
      }
      this._showNotice("mowingMap.alignSaved");
    } catch (error) {
      this._alignError = this._t("mowingMap.alignFailed", { detail: actionErrorDetail(error) ?? "" }).trim();
    } finally {
      this._saving = false;
    }
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
    if (zoom > 1 && (cap === undefined || cap >= zoom)) {
      this._tileCaps = { ...this._tileCaps, [template]: zoom - 1 };
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
    const signed = signedPathFromResponse(await abortable(hass.callWS<unknown>({
      type: "auth/sign_path", path, expires: 60,
    }), signal));
    signal.throwIfAborted();
    // Signed URLs are credentials. Accept only the exact local requested route,
    // never render/log them, and fetch the image into a private object URL.
    if (!signed || signed.split("?", 1)[0] !== path) throw new Error("Invalid signed path");
    const response = await fetch(hass.hassUrl(signed), {
      credentials: "same-origin", signal, cache: "no-store",
    });
    if (!response.ok) throw new Error(`Map request failed (${response.status})`);
    return response;
  }

  private async _refresh(): Promise<void> {
    const path = mowingMapPath(this.path);
    if (!path || !this.hass || !this.active || !this.isConnected || this._abort) return;
    const controller = new AbortController();
    this._abort = controller;
    this._loading = !this._scene;
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    let image: string | undefined;
    try {
      const response = await this._fetch(path, controller.signal);
      const scene = readMowingMapScene(await response.json(), path);
      if (scene.revision !== this._scene?.revision || !this._image) {
        const background = await this._fetch(scene.background_path, controller.signal);
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
        image = undefined;
        this._view = fitMap(scene.width, scene.height);
      }
      this._scene = scene;
      if (this._saved && (sameGeoreference(scene.georeference, this._saved.reference) ||
          Date.now() - this._saved.at > SAVED_GRACE_MS)) this._saved = undefined;
      if (this._align && !scene.projection) this._cancelAlign();
      this._expireOverlay(scene);
      this._error = false;
      void this._refreshPhoto(scene);
    } catch {
      if (this._abort === controller) {
        this._clearExpiry();
        this._error = true;
      }
    } finally {
      window.clearTimeout(timeout);
      if (image) URL.revokeObjectURL(image);
      if (this._abort === controller) {
        this._abort = undefined;
        this._loading = false;
        if (this.active && this.isConnected) {
          this._timer = window.setTimeout(() => {
            this._timer = undefined;
            void this._refresh();
          }, this._error ? 15_000 : 5000);
        }
      }
    }
  }

  private _point(client: MapPoint): MapPoint {
    const canvas = this.renderRoot.querySelector<SVGSVGElement>(".map-canvas");
    const matrix = canvas?.getScreenCTM()?.inverse();
    if (!matrix) return { x: this._view.width / 2, y: this._view.height / 2 };
    const point = new DOMPoint(client.x, client.y).matrixTransform(matrix);
    return { x: point.x, y: point.y };
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

  private _down(event: PointerEvent): void {
    if (event.button !== 0 || !this._scene) return;
    event.preventDefault();
    (event.currentTarget as SVGElement).setPointerCapture(event.pointerId);
    this._pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
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
    if (this._align && this._gesture === "map") {
      // Align: one finger moves the mower map; two fingers also turn and resize it.
      const angle = (points: MapPoint[]) => Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x);
      const distance = (points: MapPoint[]) => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      this._adjust((adjustment, mapMiddle) => {
        const moved = { ...adjustment,
          dx: adjustment.dx + newCentre.x - oldCentre.x, dy: adjustment.dy + newCentre.y - oldCentre.y };
        if (before.length !== 2 || distance(before) <= 0) return moved;
        let turn = (angle(after) - angle(before)) * 180 / Math.PI;
        turn = ((turn + 540) % 360) - 180;
        return composeAdjustment(moved, mapMiddle, newCentre, distance(after) / distance(before), turn);
      });
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

  private _up(event: PointerEvent): void { this._pointers.delete(event.pointerId); }

  private _wheel(event: WheelEvent): void {
    if (!this._scene) return;
    event.preventDefault();
    const point = this._point({ x: event.clientX, y: event.clientY });
    if (this._align && event.shiftKey) {
      // Shift + wheel resizes the mower map under the pointer while aligning.
      const factor = (event.deltaY || event.deltaX) < 0 ? 1.01 : 1 / 1.01;
      this._adjust((adjustment, centre) => composeAdjustment(adjustment, centre, point, factor, 0));
      return;
    }
    this._zoom(event.deltaY < 0 ? 1.15 : 1 / 1.15, point);
  }

  private _key(event: KeyboardEvent): void {
    const step = this._view.width / 10;
    if (this._align && this._gesture === "map" && event.key.startsWith("Arrow")) {
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

  /** Geographic tiles in map pixels, one affine per tile, under the mower layers. */
  private _renderTiles(scene: MowingMapScene, world: WorldBackground, reference: MapGeoreference) {
    const projection = scene.projection;
    if (!projection) return nothing;
    const source = worldTileSource(world, this.tiles?.[world]);
    const unitsPerScreenPixel = Math.max(this._view.width / this._size.width, this._view.height / this._size.height);
    const density = Math.min(2, Math.max(1, globalThis.devicePixelRatio || 1));
    const metresPerScreenPixel = unitsPerScreenPixel * metresPerMapPixel(projection, reference) / density;
    const maxZoom = Math.min(source.maxZoom, this._tileCaps[source.template] ?? source.maxZoom);
    const zoom = tileZoomFor(metresPerScreenPixel, reference.latitude, maxZoom);
    // The SVG letterboxes its viewBox; cover the whole visible canvas, not just the viewBox.
    const shown = {
      width: this._size.width * unitsPerScreenPixel, height: this._size.height * unitsPerScreenPixel,
    };
    const tiles = visibleTiles(projection, reference, {
      x: this._view.x - (shown.width - this._view.width) / 2,
      y: this._view.y - (shown.height - this._view.height) / 2, ...shown,
    }, zoom);
    return svg`<g class="world-tiles" aria-hidden="true">${repeat(tiles, (tile) => `${tile.z}/${tile.x}/${tile.y}`,
      (tile) => {
        const href = tileUrl(source.template, tile.z, tile.x, tile.y);
        return href ? svg`<image href=${href} x="-0.25" y="-0.25" width="256.5" height="256.5"
          preserveAspectRatio="none" transform=${`matrix(${tile.matrix.join(" ")})`}
          @error=${() => this._tileFailed(source.template, tile.z)} />` : nothing;
      })}</g>`;
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
    const degrees = new Intl.NumberFormat(this.locale, {
      minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: "exceptZero",
    }).format(rotation);
    const size = new Intl.NumberFormat(this.locale, { style: "percent", maximumFractionDigits: 1 }).format(scale);
    const rotateLeft = (times = 1) => this._adjustAboutCentre(1, -ROTATE_STEP * times);
    const rotateRight = (times = 1) => this._adjustAboutCentre(1, ROTATE_STEP * times);
    const shrink = (times = 1) => this._adjustAboutCentre(SCALE_STEP ** -times, 0);
    const grow = (times = 1) => this._adjustAboutCentre(SCALE_STEP ** times, 0);
    const step = (label: TranslationKey, action: (times?: number) => void, content: unknown, extra = "") => html`
      <button class=${`step${extra}`} @click=${() => action()} @pointerdown=${this._hold(action)}
        @pointerup=${this._stopHold} @pointerleave=${this._stopHold} @pointercancel=${this._stopHold}
        aria-label=${this._t(label)} title=${this._t(label)}>${content}</button>`;
    return html`
      <div class="align-bar" role="group" aria-label=${this._t("mowingMap.alignTools")}>
        <div class="align-row">
          <div class="segmented" role="group" aria-label=${this._t("mowingMap.gestures")}>
            <button aria-pressed=${this._gesture === "map" ? "true" : "false"} title=${this._t("mowingMap.gestureMap")}
              @click=${() => { this._gesture = "map"; }}>${mapControlIcon("move")}<span>${this._t("mowingMap.gestureMap")}</span></button>
            <button aria-pressed=${this._gesture === "view" ? "true" : "false"} title=${this._t("mowingMap.gestureView")}
              @click=${() => { this._gesture = "view"; }}>${mapControlIcon("view")}<span>${this._t("mowingMap.gestureView")}</span></button>
          </div>
          <div class="stepper" role="group" aria-label=${this._t("mowingMap.alignRotation", { value: degrees })}>
            ${step("mowingMap.rotateLeft", rotateLeft, mapControlIcon("rotate-left"))}
            <span class="readout" aria-hidden="true">${degrees}°</span>
            ${step("mowingMap.rotateRight", rotateRight, mapControlIcon("rotate-right"))}
          </div>
          <div class="stepper" role="group" aria-label=${this._t("mowingMap.alignScale", { value: size })}>
            ${step("mowingMap.scaleDown", shrink, "−", " zoom")}
            <span class="readout" aria-hidden="true">${size}</span>
            ${step("mowingMap.scaleUp", grow, "+", " zoom")}
          </div>
        </div>
        <div class="align-row">
          <span class=${`align-hint${this._alignError ? " error" : ""}`} role="status">${this._alignError ||
            this._t(align.fresh ? "mowingMap.alignNew" : "mowingMap.alignHint")}</span>
          <div class="align-actions">
            <button @click=${this._cancelAlign} ?disabled=${this._saving}>${this._t("mowingMap.alignCancel")}</button>
            <button class="primary" @click=${this._saveAlign} ?disabled=${this._saving}>
              ${this._t(this._saving ? "mowingMap.alignSaving" : "mowingMap.alignSave")}</button>
          </div>
        </div>
      </div>`;
  }

  protected render() {
    const scene = this._scene;
    const fresh = Boolean(scene && this.active && !this._error && overlayIsFresh(scene));
    const position = fresh ? scene?.overlay.position : undefined;
    const markerSize = Math.max(this._view.width / this._size.width, this._view.height / this._size.height) * 20;
    const zoom = scene ? scene.width / this._view.width : 1;
    const world = scene ? this._world : undefined;
    const reference = world ? this._reference : undefined;
    const align = world ? this._align : undefined;
    const adjustment = scene && align
      ? `matrix(${adjustmentMatrix(align.adjustment, mapCentre(scene.width, scene.height)).join(" ")})` : undefined;
    const minZoom = scene ? 1 / this._limits.maxWidth : 1;
    const body = html`
      <div class="viewport" data-map-state=${this._error ? "error" : scene ? "ready" : "loading"}>
        <div class="toolbar" aria-label=${this._t("mowingMap.tools")}>
          <span class="map-name">${scene?.name || this._t("mowingMap.garden")}</span>
          <div class="tool-actions">
            <button class="zoom" @click=${() => this._zoom(1.4)} ?disabled=${!scene || zoom >= 12}
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
          <svg class=${`map-canvas${align && this._gesture === "map" ? " moving-map" : ""}`}
            viewBox=${`${this._view.x} ${this._view.y} ${this._view.width} ${this._view.height}`}
            tabindex="0" role="img" aria-label=${this._t("mowingMap.mapLabel")}
            @pointerdown=${this._down} @pointermove=${this._move} @pointerup=${this._up}
            @pointercancel=${this._up} @lostpointercapture=${this._up}
            @wheel=${this._wheel} @keydown=${this._key}>
            ${world && reference ? this._renderTiles(scene, world, reference) : nothing}
            <g class=${`mower-layer${world ? " over-world" : ""}${align ? " aligning" : ""}`}
              transform=${adjustment ?? nothing}>
            ${this._photoWanted && this._photo && this._photoPath === scene.real_scene_path ? svg`
              <image class="real-scene" href=${this._photo} x="0" y="0"
                width=${scene.width} height=${scene.height} />` : nothing}
            <image href=${this._image} x="0" y="0" width=${scene.width} height=${scene.height} />
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
              <g transform=${`translate(${position.x} ${position.y}) scale(${markerSize / (align?.adjustment.scale ?? 1)})`}
                data-mower-position=${scene.overlay.position_status}
                opacity=${scene.overlay.position_status === "last_known" ? "0.55" : "1"}>
                ${mowerMapMarker(position.heading)}
              </g>` : nothing}
            </g>
          </svg>
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
