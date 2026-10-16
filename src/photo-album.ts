import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "./card-config";
import { createTranslator, type SupportedLocale } from "./localization";
import {
  MEDIA_SOURCE_ROOT, albumFolderId, collectAlbum, localMediaSource, mediaChildren,
  resolvedMediaUrl, type AlbumPhoto,
} from "./photo-album-logic";

const PAGE_SIZE = 24;
const REFRESH_MS = 120_000;
const URL_LIFETIME_MS = 55 * 60_000;
type SignedPhoto = { url: string; expiresAt: number };

/** Read-only album of the photos the integration saved to Home Assistant media. */
@customElement("lawn-mower-photo-album")
export class LawnMowerPhotoAlbum extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property() public entityId?: string;
  @property({ type: Boolean }) public active = false;
  @property({ attribute: false }) public locale: SupportedLocale = "en";

  @state() private _photos: AlbumPhoto[] = [];
  @state() private _urls = new Map<string, SignedPhoto>();
  @state() private _visible = PAGE_SIZE;
  @state() private _open?: number;
  @state() private _status: "idle" | "loading" | "ready" | "error" = "idle";
  private _timer?: number;
  @state() private _scanning = false;
  @state() private _scanFailed = false;
  private _generation = 0;
  private _loading?: number;
  private _resolving?: number;
  private _retryAt = new Map<string, number>();
  private _viewerTrigger?: HTMLElement;

  private get _t() { return createTranslator(this.locale); }

  protected updated(changed: PropertyValues): void {
    const previous = changed.get("hass") as HomeAssistant | undefined;
    const sessionChanged = changed.has("hass") &&
      (previous?.connection !== this.hass?.connection || previous?.user?.id !== this.hass?.user?.id ||
       previous?.callWS !== this.hass?.callWS || previous?.hassUrl !== this.hass?.hassUrl);
    if (changed.has("entityId") || changed.has("active") || sessionChanged) {
      this._stop();
      this._photos = [];
      this._urls = new Map();
      this._retryAt.clear();
      this._visible = PAGE_SIZE;
      this._status = "idle";
    }
    if (!this.active) {
      this._stop();
    } else if (this._timer === undefined && this._loading === undefined) {
      void this._load();
    }
    const dialog = this.renderRoot.querySelector<HTMLDialogElement>("dialog");
    if (this._open !== undefined && dialog && !dialog.open) dialog.showModal();
  }

  public connectedCallback(): void {
    super.connectedCallback();
    this.requestUpdate();
  }

  public disconnectedCallback(): void {
    this._stop();
    super.disconnectedCallback();
  }

  private _stop(): void {
    this._generation += 1;
    this._loading = undefined;
    this._resolving = undefined;
    this._open = undefined;
    this.renderRoot.querySelector<HTMLDialogElement>("dialog")?.close();
    if (this._timer !== undefined) window.clearTimeout(this._timer);
    this._timer = undefined;
  }

  private _current(generation: number): boolean {
    return generation === this._generation && this.active && this.isConnected;
  }

  private _publish(photos: AlbumPhoto[]): void {
    const openId = this._open === undefined ? undefined : this._photos[this._open]?.id;
    this._photos = photos;
    if (openId) {
      const index = photos.findIndex((photo) => photo.id === openId);
      this._open = index < 0 ? undefined : index;
    }
  }

  private async _load(): Promise<void> {
    if (!this.hass || !this.entityId || !this.active || !this.isConnected || this._loading !== undefined) return;
    const generation = this._generation;
    const hass = this.hass;
    const entityId = this.entityId;
    this._loading = generation;
    this._scanning = true;
    this._scanFailed = false;
    if (!this._photos.length) this._status = "loading";
    try {
      const source = localMediaSource(await hass.callWS<unknown>({
        type: "media_source/browse_media", media_content_id: MEDIA_SOURCE_ROOT,
      }));
      if (!this._current(generation)) return;
      if (!source) throw new Error("No local media source");
      const photos = await collectAlbum(
        async (id) => mediaChildren(await hass.callWS<unknown>({
          type: "media_source/browse_media", media_content_id: id,
        })), albumFolderId(source, entityId), 300, 10, () => this._current(generation),
        (partial) => {
          if (this._current(generation)) {
            this._publish(partial);
            this._status = "ready";
            void this._resolve();
          }
        },
      );
      if (!this._current(generation)) return;
      this._publish(photos);
      this._scanning = false;
      this._status = "ready";
      await this._resolve();
    } catch {
      if (!this._current(generation)) return;
      this._scanning = false;
      this._scanFailed = true;
      this._status = this._photos.length ? "ready" : "error";
    } finally {
      if (this._current(generation)) {
        this._loading = undefined;
        this._timer = window.setTimeout(() => {
          this._timer = undefined;
          void this._load();
        }, REFRESH_MS);
      }
    }
  }

  /** Sign only the photos on screen; signed paths are short-lived credentials. */
  private async _resolve(): Promise<void> {
    if (!this.hass || !this.active || !this.isConnected || this._resolving !== undefined) return;
    const generation = this._generation;
    const hass = this.hass;
    this._resolving = generation;
    try {
      // Repeat after each batch so Show more during a pending batch is included.
      while (this._current(generation)) {
        const now = Date.now();
        const wanted = this._photos.slice(0, this._visible).filter((photo) =>
          (this._urls.get(photo.id)?.expiresAt ?? 0) <= now &&
          (this._retryAt.get(photo.id) ?? 0) <= now).slice(0, 10);
        if (!wanted.length) break;
        await Promise.all(wanted.map(async (photo) => {
          try {
            const url = resolvedMediaUrl(await hass.callWS<unknown>({
              type: "media_source/resolve_media", media_content_id: photo.id, expires: 3600,
            }));
            if (!this._current(generation)) return;
            if (url) this._urls = new Map(this._urls).set(photo.id, {
              url: hass.hassUrl(url), expiresAt: Date.now() + URL_LIFETIME_MS,
            });
            else this._retryAt.set(photo.id, Date.now() + REFRESH_MS);
          } catch {
            if (this._current(generation)) this._retryAt.set(photo.id, Date.now() + REFRESH_MS);
          }
        }));
      }
    } finally {
      if (this._resolving === generation) this._resolving = undefined;
    }
  }

  private _openViewer(index: number, event: Event): void {
    this._viewerTrigger = event.currentTarget as HTMLElement;
    this._open = index;
  }

  private _closeViewer = async (): Promise<void> => {
    const trigger = this._viewerTrigger;
    this.renderRoot.querySelector<HTMLDialogElement>("dialog")?.close();
    this._open = undefined;
    this._viewerTrigger = undefined;
    await this.updateComplete;
    if (this.active && this.isConnected) trigger?.focus();
  };

  private _when(photo: AlbumPhoto): string {
    return photo.takenAt === null ? photo.title
      : new Date(photo.takenAt).toLocaleString(this.locale, { dateStyle: "medium", timeStyle: "short" });
  }

  private _showMore = () => {
    this._visible += PAGE_SIZE;
    void this._resolve();
  };

  private _step(delta: number): void {
    if (this._open === undefined) return;
    const next = Math.min(Math.max(this._open + delta, 0), this._photos.length - 1);
    this._open = next;
    if (next >= this._visible) this._showMore();
  }

  // The platform can close the modal itself (Android back gesture); without
  // this, updated() would reopen it on the next Home Assistant state push.
  private _viewerClosed = () => {
    if (this._open !== undefined) void this._closeViewer();
  };

  // A tap on the photo or around it closes the viewer, as in a gallery.
  private _viewerClick = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (target === event.currentTarget || target?.classList.contains("viewer-image")) {
      void this._closeViewer();
    }
  };

  private _key = (event: KeyboardEvent) => {
    if (event.key === "Escape") this._closeViewer();
    else if (event.key === "ArrowLeft") this._step(-1);
    else if (event.key === "ArrowRight") this._step(1);
    else return;
    event.preventDefault();
  };

  private _image(photo: AlbumPhoto, className: string) {
    const url = this._urls.get(photo.id)?.url;
    return url
      ? html`<img class=${className} src=${url} alt=${this._when(photo)} loading="lazy"
          @error=${() => {
            this._urls = new Map(this._urls);
            this._urls.delete(photo.id);
            this._retryAt.set(photo.id, Date.now() + REFRESH_MS);
          }} />`
      : html`<span class=${`${className} placeholder`} aria-hidden="true"></span>`;
  }

  protected render() {
    const t = this._t;
    if (this._status !== "ready" || !this._photos.length) {
      return html`<div class="empty">${t(
        this._status === "loading" || this._status === "idle" ? "photos.loading"
          : this._status === "error" ? "photos.unavailable" : "photos.empty",
      )}</div>`;
    }
    const latest = this._photos[0];
    const open = this._open === undefined ? undefined : this._photos[this._open];
    return html`
      <div class="album" @keydown=${this._key}>
        <button class="latest" @click=${(event: Event) => this._openViewer(0, event)}>
          ${this._image(latest, "latest-image")}
          <span class="caption">${t(this._scanning ? "photos.loading"
            : this._scanFailed ? "photos.unavailable" : "photos.latest")} · ${this._when(latest)}
            ${latest.person ? html`<span class="badge">${t("photos.person")}</span>` : nothing}</span>
        </button>
        <div class="grid" role="list">
          ${this._photos.slice(1, this._visible).map((photo, index) => html`
            <button role="listitem" class="thumb" title=${this._when(photo)}
              @click=${(event: Event) => this._openViewer(index + 1, event)}>
              ${this._image(photo, "thumb-image")}
              ${photo.person ? html`<span class="badge">${t("photos.person")}</span>` : nothing}
            </button>`)}
        </div>
        ${this._visible < this._photos.length ? html`
          <button class="more" @click=${this._showMore}>${t("photos.showMore")}</button>` : nothing}
        ${open ? html`
          <dialog class="viewer" aria-label=${this._when(open)} @cancel=${this._closeViewer}
            @close=${this._viewerClosed} @click=${this._viewerClick}>
            <button class="viewer-close" @click=${this._closeViewer}
              aria-label=${t("photos.close")}>✕</button>
            ${this._image(open, "viewer-image")}
            <div class="viewer-bar">
              <button @click=${() => this._step(-1)} ?disabled=${this._open === 0}
                aria-label=${t("photos.previous")}>‹</button>
              <span>${this._when(open)} · ${this._open! + 1}/${this._photos.length}</span>
              <button @click=${() => this._step(1)} ?disabled=${this._open === this._photos.length - 1}
                aria-label=${t("photos.next")}>›</button>
            </div>
          </dialog>` : nothing}
      </div>`;
  }

  static styles = css`
    :host { display:block; width:100%; box-sizing:border-box;
      color:var(--mower-text, var(--primary-text-color)); }
    .album { position:relative; display:grid; gap:10px; padding:12px; }
    button { font:inherit; color:inherit; cursor:pointer; border:1px solid var(--mower-border, var(--divider-color));
      border-radius:10px; background:transparent; padding:0; overflow:hidden; position:relative; }
    button:focus-visible { outline:2px solid var(--mower-accent, var(--primary-color)); outline-offset:2px; }
    .latest { display:grid; }
    .latest-image { width:100%; aspect-ratio:16/9; max-height:clamp(220px, 52vh, 560px);
      object-fit:cover; display:block; }
    .caption { display:flex; gap:8px; align-items:center; padding:8px 10px; font-size:12px;
      color:var(--mower-muted, var(--secondary-text-color)); text-align:left; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(110px, 1fr)); gap:8px; }
    .thumb-image { width:100%; aspect-ratio:16/9; object-fit:cover; display:block; }
    .placeholder { display:block; width:100%; aspect-ratio:16/9;
      background:color-mix(in srgb, var(--mower-border, #2b3b30) 60%, transparent); }
    .badge { position:absolute; top:6px; left:6px; padding:2px 6px; border-radius:6px; font-size:10px;
      font-weight:600; background:rgba(0,0,0,.6); color:#fff; }
    .caption .badge { position:static; }
    .more { padding:8px 12px; justify-self:center; }
    .viewer { box-sizing:border-box; width:min(1100px, calc(100vw - 24px));
      height:calc(100dvh - 24px); max-height:calc(100dvh - 24px); padding:0; border:0;
      display:grid; grid-template-rows:minmax(0, 1fr) auto; background:rgba(0,0,0,.92); }
    .viewer:not([open]) { display:none; }
    .viewer::backdrop { background:rgba(0,0,0,.65); }
    .viewer-image { min-height:0; }
    .viewer-image { width:100%; height:100%; object-fit:contain; }
    .viewer-bar { display:flex; gap:8px; align-items:center; justify-content:center;
      padding:8px 8px calc(8px + env(safe-area-inset-bottom, 0px)); font-size:12px; color:#fff; }
    .viewer { position:fixed; }
    .viewer-close { position:absolute; z-index:1; top:max(8px, env(safe-area-inset-top, 0px));
      right:8px; min-width:44px; min-height:44px; color:#fff; font-size:20px;
      background:rgba(0,0,0,.55); border-color:rgba(255,255,255,.4); }
    .viewer-bar button { min-width:40px; min-height:36px; color:#fff; border-color:rgba(255,255,255,.3); }
    .viewer-bar button:disabled { opacity:.35; cursor:default; }
    .empty { display:grid; place-items:center; min-height:200px; padding:24px; font-size:13px;
      color:var(--mower-muted, var(--secondary-text-color)); }
  `;
}
