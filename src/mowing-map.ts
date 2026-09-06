import { LitElement, css, html, nothing, svg, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createTranslator, type SupportedLocale } from "./localization";
import { signedPathFromResponse } from "./point-cloud-logic";
import type { HomeAssistant } from "./card-config";
import {
  constrainViewport, fitMap, mowingMapPath, overlayIsFresh, readMowingMapScene,
  zoomMap, type MapPoint, type MapViewport, type MowingMapScene,
} from "./mowing-map-logic";

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

  @state() private _scene?: MowingMapScene;
  @state() private _image?: string;
  @state() private _view: MapViewport = fitMap(1, 1);
  @state() private _error = false;
  @state() private _loading = false;
  @state() private _size = { width: 500, height: 300 };
  private _resize?: ResizeObserver;
  private _abort?: AbortController;
  private _timer?: number;
  private _expiryTimer?: number;
  private _pointers = new Map<number, MapPoint>();

  private get _t() { return createTranslator(this.locale); }

  protected updated(changed: PropertyValues): void {
    if (!this.isConnected) return;
    if (!this._resize) {
      const viewport = this.renderRoot.querySelector(".viewport");
      if (viewport) {
        this._resize = new ResizeObserver(([entry]) => {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0 && (width !== this._size.width || height !== this._size.height)) {
            this._size = { width, height };
          }
        });
        this._resize.observe(viewport);
      }
    }
    if (changed.has("path")) {
      this._stop();
      this._releaseImage();
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
    this._resize?.disconnect();
    this._resize = undefined;
    this._releaseImage();
    this._scene = undefined;
    super.disconnectedCallback();
  }

  private _stop(): void {
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
      if (image) {
        this._releaseImage();
        this._image = image;
        image = undefined;
        this._view = fitMap(scene.width, scene.height);
      }
      this._scene = scene;
      this._expireOverlay(scene);
      this._error = false;
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
    const canvas = this.renderRoot.querySelector("svg");
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
    }, scene.width, scene.height);
  }

  private _pan(dx: number, dy: number): void {
    if (!this._scene) return;
    this._view = constrainViewport({ ...this._view, x: this._view.x + dx, y: this._view.y + dy },
      this._scene.width, this._scene.height);
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
    }, scene.width, scene.height);
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
    this._zoom(event.deltaY < 0 ? 1.15 : 1 / 1.15,
      this._point({ x: event.clientX, y: event.clientY }));
  }

  private _key(event: KeyboardEvent): void {
    const step = this._view.width / 10;
    const actions: Record<string, () => void> = {
      "+": () => this._zoom(1.25), "=": () => this._zoom(1.25),
      "-": () => this._zoom(0.8), Home: () => this._fit(),
      ArrowLeft: () => this._pan(-step, 0), ArrowRight: () => this._pan(step, 0),
      ArrowUp: () => this._pan(0, -step), ArrowDown: () => this._pan(0, step),
    };
    if (actions[event.key]) { event.preventDefault(); actions[event.key](); }
  }

  protected render() {
    const scene = this._scene;
    const fresh = Boolean(scene && this.active && !this._error && overlayIsFresh(scene));
    const position = fresh ? scene?.overlay.position : undefined;
    const markerSize = Math.max(this._view.width / this._size.width, this._view.height / this._size.height) * 12;
    const zoom = scene ? scene.width / this._view.width : 1;
    return html`
      <div class="viewport" data-map-state=${this._error ? "error" : scene ? "ready" : "loading"}>
        ${scene && this._image ? html`
          <svg viewBox=${`${this._view.x} ${this._view.y} ${this._view.width} ${this._view.height}`}
            tabindex="0" role="img" aria-label=${this._t("mowingMap.mapLabel")}
            @pointerdown=${this._down} @pointermove=${this._move} @pointerup=${this._up}
            @pointercancel=${this._up} @lostpointercapture=${this._up}
            @wheel=${this._wheel} @keydown=${this._key}>
            <image href=${this._image} x="0" y="0" width=${scene.width} height=${scene.height} />
            ${fresh ? scene.overlay.trail.map((segment) => svg`
              <polyline points=${segment.map((point) => point.join(",")).join(" ")}
                fill="none" stroke="#087bcd" stroke-width="3" vector-effect="non-scaling-stroke"
                stroke-linecap="round" stroke-linejoin="round" />`) : nothing}
            ${position ? svg`
              <g transform=${`translate(${position.x} ${position.y}) scale(${markerSize})`}
                data-mower-position="current">
                <circle r="0.7" fill="#fff" stroke="#183c30" stroke-width="0.12" />
                ${position.heading !== null ? svg`
                  <path d="M 0 -1.2 L .55 .45 L 0 .15 L -.55 .45 Z"
                    fill="#ec6d2e" stroke="#fff" stroke-width=".1"
                    transform=${`rotate(${position.heading})`} />`
                  : svg`<circle r=".4" fill="#ec6d2e" />`}
              </g>` : nothing}
          </svg>` : this.fallbackUrl ? html`
          <img class="fallback" src=${this.fallbackUrl} alt=${this._t("mowingMap.mapLabel")} />` : nothing}
        <div class="toolbar" aria-label=${this._t("mowingMap.tools")}>
          <button @click=${() => this._zoom(1.4)} ?disabled=${!scene || zoom >= 12}
            title=${this._t("mowingMap.zoomIn")} aria-label=${this._t("mowingMap.zoomIn")}>+</button>
          <button @click=${() => this._zoom(1 / 1.4)} ?disabled=${!scene || zoom <= 1}
            title=${this._t("mowingMap.zoomOut")} aria-label=${this._t("mowingMap.zoomOut")}>−</button>
          <button @click=${this._fit} ?disabled=${!scene}>${this._t("mowingMap.fit")}</button>
          <button @click=${this._centre} ?disabled=${!position}>${this._t("mowingMap.centre")}</button>
        </div>
        <div class="status" role="status">
          ${this._loading ? this._t("mowingMap.loading") : this._error
            ? this._t("mowingMap.unavailable") : position ? this._t("mowingMap.observedTrail")
            : this._t("mowingMap.noPosition")}
          ${!scene && this.fallbackSaved ? html` · ${this._t("card.savedPreview")}` : nothing}
        </div>
      </div>`;
  }

  static styles = css`
    :host { display:block; width:100%; height:100%; min-height:240px; }
    .viewport { position:relative; width:100%; height:100%; min-height:inherit;
      background:#f6f8f7; overflow:hidden; color:#19372c; }
    svg,.fallback { width:100%; height:100%; display:block; object-fit:contain; }
    svg { touch-action:none; cursor:grab; outline-offset:-3px; }
    svg:active { cursor:grabbing; }
    .toolbar { position:absolute; top:10px; right:10px; left:10px; display:flex;
      gap:6px; flex-wrap:wrap; justify-content:flex-end; pointer-events:none; }
    button { pointer-events:auto; min-height:36px; min-width:36px; padding:6px 10px;
      border:1px solid #a8bfb2; background:rgba(255,255,255,.95); color:#19372c;
      border-radius:9px; font:inherit; font-size:12px; cursor:pointer; }
    button:disabled { opacity:.5; cursor:default; }
    button:focus-visible { outline:3px solid #087bcd; outline-offset:1px; }
    .status { position:absolute; bottom:8px; left:10px; right:10px; width:fit-content;
      max-width:calc(100% - 40px); background:rgba(255,255,255,.94); border-radius:6px;
      padding:5px 8px; font-size:11px; pointer-events:none; }
    @media (prefers-reduced-motion:reduce) { * { scroll-behavior:auto; } }
  `;
}
