import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import {
  Box3,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Sphere,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader.js";

import {
  normalizePointCloudApiPath,
  pointCloudRequestPath,
  signedPathFromResponse,
} from "./point-cloud-logic";

export type PointCloudHomeAssistant = {
  callWS<T>(message: Record<string, unknown>): Promise<T>;
  hassUrl(path: string): string;
};

type ViewerStatus = "idle" | "loading" | "ready" | "error";

@customElement("lawn-mower-point-cloud")
export class LawnMowerPointCloud extends LitElement {
  @property({ attribute: false }) public hass?: PointCloudHomeAssistant;
  @property() public path?: string;
  @property({ type: Boolean }) public active = false;
  @property({ type: Boolean, reflect: true }) public compact = false;

  @query(".viewport") private _viewport?: HTMLDivElement;

  @state() private _status: ViewerStatus = "idle";
  @state() private _error?: string;
  @state() private _pointCount?: number;
  @state() private _pointSize = 1;

  private _abortController?: AbortController;
  private _content?: ArrayBuffer;
  private _scene?: Scene;
  private _camera?: PerspectiveCamera;
  private _renderer?: WebGLRenderer;
  private _controls?: OrbitControls;
  private _points?: Points;
  private _resizeObserver?: ResizeObserver;
  private _basePointSize = 0.01;

  public static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 280px;
      color: var(--primary-text-color, #f7faf7);
    }

    .shell {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: inherit;
      overflow: hidden;
      border-radius: inherit;
      background:
        radial-gradient(circle at 50% 44%, rgba(121, 174, 95, 0.12), transparent 42%),
        #080b09;
    }

    .viewport {
      position: absolute;
      inset: 0;
    }

    .viewport canvas {
      display: block;
      width: 100%;
      height: 100%;
      touch-action: none;
    }

    .empty,
    .loading,
    .error {
      position: absolute;
      z-index: 1;
      inset: 0;
      display: grid;
      place-content: center;
      justify-items: center;
      gap: 12px;
      padding: 24px;
      text-align: center;
      color: rgba(247, 250, 247, 0.76);
    }

    .empty ha-icon,
    .error ha-icon {
      --mdc-icon-size: 36px;
      color: #9fca8b;
    }

    .error ha-icon {
      color: #ef9a91;
    }

    .empty p,
    .error p {
      max-width: 36rem;
      margin: 0;
      line-height: 1.45;
    }

    .loading-indicator {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(255, 255, 255, 0.16);
      border-top-color: #9fca8b;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .toolbar {
      position: absolute;
      z-index: 2;
      inset: auto 10px 10px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 12px;
      background: rgba(8, 12, 9, 0.76);
      backdrop-filter: blur(14px) saturate(1.2);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.3);
    }

    .point-count {
      padding: 0 5px;
      color: rgba(247, 250, 247, 0.72);
      font-size: 0.78rem;
      white-space: nowrap;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 34px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 8px;
      padding: 7px 10px;
      color: #f7faf7;
      font: inherit;
      font-size: 0.8rem;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.07);
    }

    button:hover {
      background: rgba(255, 255, 255, 0.13);
    }

    button:focus-visible {
      outline: 2px solid var(--primary-color, #86c66b);
      outline-offset: 2px;
    }

    button.primary {
      border-color: rgba(147, 196, 125, 0.42);
      background: rgba(117, 164, 94, 0.24);
    }

    button ha-icon {
      --mdc-icon-size: 18px;
    }

    label {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      color: rgba(247, 250, 247, 0.72);
      font-size: 0.78rem;
    }

    input[type="range"] {
      width: 84px;
      accent-color: #93c47d;
    }

    :host([compact]) .shell {
      min-height: 240px;
    }

    :host([compact]) .toolbar {
      inset: auto 8px 8px;
    }

    :host([compact]) .point-count,
    :host([compact]) label span,
    :host([compact]) button span {
      display: none;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .loading-indicator {
        animation-duration: 1.8s;
      }
    }
  `;

  protected render() {
    const path = normalizePointCloudApiPath(this.path);
    return html`
      <div class="shell" aria-label="Mower 3D point cloud">
        <div class="viewport"></div>
        ${this._status === "idle"
          ? html`
              <div class="empty">
                <ha-icon icon="mdi:rotate-3d-variant"></ha-icon>
                <p>
                  ${path
                    ? "Load the mower point cloud when you want to explore the lawn in 3D."
                    : "This map entity does not provide a 3D point-cloud endpoint."}
                </p>
                ${path
                  ? html`
                      <button
                        type="button"
                        class="primary"
                        @click=${() => this._load(false)}
                      >
                        <ha-icon icon="mdi:cube-scan"></ha-icon>
                        <span>Load 3D map</span>
                      </button>
                    `
                  : nothing}
              </div>
            `
          : nothing}
        ${this._status === "loading"
          ? html`
              <div class="loading" role="status" aria-live="polite">
                <span class="loading-indicator" aria-hidden="true"></span>
                <span>Generating and downloading the mower point cloud…</span>
              </div>
            `
          : nothing}
        ${this._status === "error"
          ? html`
              <div class="error" role="alert">
                <ha-icon icon="mdi:cube-off-outline"></ha-icon>
                <p>${this._error || "The 3D point cloud could not be loaded."}</p>
                ${path
                  ? html`
                      <button
                        type="button"
                        class="primary"
                        @click=${() => this._load(true)}
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                        <span>Try again</span>
                      </button>
                    `
                  : nothing}
              </div>
            `
          : nothing}
        ${this._status === "ready"
          ? html`
              <div class="toolbar" aria-label="3D map controls">
                <span class="point-count">
                  ${this._pointCount?.toLocaleString() || "0"} points
                </span>
                <label>
                  <span>Point size</span>
                  <input
                    type="range"
                    min="0.4"
                    max="3"
                    step="0.1"
                    .value=${String(this._pointSize)}
                    @input=${this._pointSizeChanged}
                  />
                </label>
                <button type="button" @click=${this._resetView}>
                  <ha-icon icon="mdi:camera-retake-outline"></ha-icon>
                  <span>Reset</span>
                </button>
                <button type="button" @click=${() => this._load(true)}>
                  <ha-icon icon="mdi:refresh"></ha-icon>
                  <span>Refresh</span>
                </button>
                <button type="button" @click=${this._download}>
                  <ha-icon icon="mdi:download"></ha-icon>
                  <span>PCD</span>
                </button>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  protected updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("path")) {
      this._abortController?.abort();
      this._disposeScene();
      this._content = undefined;
      this._status = "idle";
      this._error = undefined;
      this._pointCount = undefined;
    }
    if (
      this.active &&
      this._status === "idle" &&
      (changedProperties.has("active") || changedProperties.has("path"))
    ) {
      void this._load(false);
    }
  }

  public disconnectedCallback(): void {
    this._abortController?.abort();
    this._disposeScene();
    super.disconnectedCallback();
  }

  private async _load(refresh: boolean): Promise<void> {
    const path = normalizePointCloudApiPath(this.path);
    if (!path || !this.hass) {
      this._status = "error";
      this._error = path
        ? "Home Assistant is not ready to load this point cloud."
        : "This map entity does not provide a supported 3D point-cloud endpoint.";
      return;
    }

    this._abortController?.abort();
    const abortController = new AbortController();
    this._abortController = abortController;
    this._status = "loading";
    this._error = undefined;

    try {
      const signed = await this.hass.callWS<unknown>({
        type: "auth/sign_path",
        path: pointCloudRequestPath(path, refresh),
        expires: 60,
      });
      const signedPath = signedPathFromResponse(signed);
      if (!signedPath) {
        throw new Error("Home Assistant returned an invalid signed path.");
      }
      const response = await fetch(this.hass.hassUrl(signedPath), {
        credentials: "same-origin",
        signal: abortController.signal,
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Administrator access is required to load the mower point cloud.",
          );
        }
        throw new Error(
          `The mower point cloud is unavailable (HTTP ${response.status}).`,
        );
      }
      const content = await response.arrayBuffer();
      if (abortController.signal.aborted) {
        return;
      }

      const points = new PCDLoader().parse(content);
      this._content = content;
      this._pointCount = points.geometry.getAttribute("position")?.count || 0;
      this._status = "ready";
      await this.updateComplete;
      if (abortController.signal.aborted) {
        points.geometry.dispose();
        this._disposeMaterial(points.material);
        return;
      }
      this._mountPointCloud(points);
    } catch (error) {
      if (abortController.signal.aborted) {
        return;
      }
      this._disposeScene();
      this._content = undefined;
      this._pointCount = undefined;
      this._status = "error";
      this._error =
        error instanceof Error
          ? error.message
          : "The 3D point cloud could not be loaded.";
    }
  }

  private _mountPointCloud(points: Points): void {
    const viewport = this._viewport;
    if (!viewport) {
      points.geometry.dispose();
      this._disposeMaterial(points.material);
      this._status = "error";
      this._error = "The 3D renderer could not be initialized.";
      return;
    }

    this._disposeScene();
    points.geometry.computeBoundingBox();
    points.geometry.computeBoundingSphere();
    points.geometry.center();

    const bounds = new Box3().setFromObject(points);
    const sphere = bounds.getBoundingSphere(new Sphere());
    const radius = Math.max(sphere.radius, 0.001);
    this._basePointSize = Math.max(radius / 350, 0.001);
    const material = points.material as PointsMaterial;
    material.size = this._basePointSize * this._pointSize;
    material.sizeAttenuation = true;
    material.needsUpdate = true;

    const scene = new Scene();
    scene.add(points);
    const camera = new PerspectiveCamera(45, 1, radius / 1000, radius * 100);
    camera.up.set(0, 0, 1);
    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    viewport.replaceChildren(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.addEventListener("change", this._renderScene);

    this._scene = scene;
    this._camera = camera;
    this._renderer = renderer;
    this._controls = controls;
    this._points = points;
    this._resizeObserver = new ResizeObserver(this._resize);
    this._resizeObserver.observe(viewport);
    this._fitView();
    this._resize();
  }

  private _fitView = (): void => {
    if (!this._points || !this._camera || !this._controls) {
      return;
    }
    const bounds = new Box3().setFromObject(this._points);
    const sphere = bounds.getBoundingSphere(new Sphere());
    const radius = Math.max(sphere.radius, 0.001);
    const center = sphere.center;
    this._camera.position.copy(
      center.clone().add(new Vector3(radius * 1.55, -radius * 1.55, radius * 1.2)),
    );
    this._camera.near = Math.max(radius / 1000, 0.0001);
    this._camera.far = Math.max(radius * 100, 10);
    this._camera.updateProjectionMatrix();
    this._controls.target.copy(center);
    this._controls.update();
    this._renderScene();
  };

  private _resetView = (): void => {
    this._fitView();
  };

  private _resize = (): void => {
    const viewport = this._viewport;
    if (!viewport || !this._renderer || !this._camera) {
      return;
    }
    const width = Math.max(viewport.clientWidth, 1);
    const height = Math.max(viewport.clientHeight, 1);
    this._renderer.setSize(width, height, false);
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
    this._renderScene();
  };

  private _renderScene = (): void => {
    if (this._scene && this._camera && this._renderer) {
      this._renderer.render(this._scene, this._camera);
    }
  };

  private _pointSizeChanged = (event: Event): void => {
    const input = event.currentTarget as HTMLInputElement;
    this._pointSize = Number(input.value);
    if (this._points?.material instanceof PointsMaterial) {
      this._points.material.size = this._basePointSize * this._pointSize;
      this._points.material.needsUpdate = true;
      this._renderScene();
    }
  };

  private _download = (): void => {
    if (!this._content) {
      return;
    }
    const blob = new Blob([this._content], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const pathSegments = this.path?.split("/") || [];
    anchor.href = url;
    anchor.download = `dreame-map-${pathSegments[pathSegments.length - 1] || "0"}.pcd`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  private _disposeScene(): void {
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
    this._controls?.removeEventListener("change", this._renderScene);
    this._controls?.dispose();
    this._controls = undefined;
    if (this._points) {
      this._points.parent?.remove(this._points);
      this._points.geometry.dispose();
      this._disposeMaterial(this._points.material);
      this._points = undefined;
    }
    this._renderer?.dispose();
    this._renderer?.forceContextLoss();
    this._renderer?.domElement.remove();
    this._renderer = undefined;
    this._camera = undefined;
    this._scene = undefined;
  }

  private _disposeMaterial(material: Points["material"]): void {
    if (Array.isArray(material)) {
      for (const item of material) {
        item.dispose();
      }
      return;
    }
    material.dispose();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lawn-mower-point-cloud": LawnMowerPointCloud;
  }
}
