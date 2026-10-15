import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "./card-config";
import { createTranslator, type SupportedLocale } from "./localization";
import {
  MEDIA_SOURCE_ROOT, albumFolderId, collectAlbum, localMediaSource, mediaChildren,
  resolvedMediaUrl, type AlbumPhoto,
} from "./photo-album-logic";

const PAGE_SIZE = 24;
const MAX_FOLDERS = 300;
const REFRESH_MS = 120_000;

/** Read-only album of the photos the integration saved to Home Assistant media. */
@customElement("lawn-mower-photo-album")
export class LawnMowerPhotoAlbum extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property() public entityId?: string;
  @property({ type: Boolean }) public active = false;
  @property({ attribute: false }) public locale: SupportedLocale = "en";

  @state() private _photos: AlbumPhoto[] = [];
  @state() private _urls = new Map<string, string>();
  @state() private _visible = PAGE_SIZE;
  @state() private _open?: number;
  @state() private _status: "idle" | "loading" | "ready" | "error" = "idle";
  private _timer?: number;
  private _loading = false;

  private get _t() { return createTranslator(this.locale); }

  protected updated(changed: PropertyValues): void {
    if (changed.has("entityId")) {
      this._photos = [];
      this._urls = new Map();
      this._status = "idle";
    }
    if (!this.active) {
      this._stop();
    } else if (this._timer === undefined && !this._loading) {
      void this._load();
    }
  }

  public disconnectedCallback(): void {
    this._stop();
    super.disconnectedCallback();
  }

  private _stop(): void {
    if (this._timer !== undefined) window.clearTimeout(this._timer);
    this._timer = undefined;
  }

  private async _browse(id: string) {
    return mediaChildren(await this.hass!.callWS<unknown>({
      type: "media_source/browse_media", media_content_id: id,
    }));
  }

  private async _load(): Promise<void> {
    if (!this.hass || !this.entityId || this._loading) return;
    this._loading = true;
    if (!this._photos.length) this._status = "loading";
    try {
      const source = localMediaSource(await this.hass.callWS<unknown>({
        type: "media_source/browse_media", media_content_id: MEDIA_SOURCE_ROOT,
      }));
      if (!source) throw new Error("No local media source");
      this._photos = await collectAlbum(
        (id) => this._browse(id), albumFolderId(source, this.entityId), MAX_FOLDERS,
      );
      this._status = "ready";
      await this._resolve();
    } catch {
      this._status = this._photos.length ? "ready" : "error";
    } finally {
      this._loading = false;
      if (this.active && this.isConnected) {
        this._timer = window.setTimeout(() => {
          this._timer = undefined;
          void this._load();
        }, REFRESH_MS);
      }
    }
  }

  /** Sign only the photos on screen; signed paths are short-lived credentials. */
  private async _resolve(): Promise<void> {
    const wanted = this._photos.slice(0, this._visible).filter((photo) => !this._urls.has(photo.id));
    if (!wanted.length || !this.hass) return;
    const urls = new Map(this._urls);
    await Promise.all(wanted.map(async (photo) => {
      try {
        const url = resolvedMediaUrl(await this.hass!.callWS<unknown>({
          type: "media_source/resolve_media", media_content_id: photo.id, expires: 3600,
        }));
        if (url) urls.set(photo.id, this.hass!.hassUrl(url));
      } catch { /* A missing photo keeps its placeholder. */ }
    }));
    this._urls = urls;
  }

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

  private _key = (event: KeyboardEvent) => {
    if (event.key === "Escape") this._open = undefined;
    else if (event.key === "ArrowLeft") this._step(-1);
    else if (event.key === "ArrowRight") this._step(1);
    else return;
    event.preventDefault();
  };

  private _image(photo: AlbumPhoto, className: string) {
    const url = this._urls.get(photo.id);
    return url
      ? html`<img class=${className} src=${url} alt=${this._when(photo)} loading="lazy" />`
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
        <button class="latest" @click=${() => { this._open = 0; }}>
          ${this._image(latest, "latest-image")}
          <span class="caption">${t("photos.latest")} · ${this._when(latest)}
            ${latest.person ? html`<span class="badge">${t("photos.person")}</span>` : nothing}</span>
        </button>
        <div class="grid" role="list">
          ${this._photos.slice(1, this._visible).map((photo, index) => html`
            <button role="listitem" class="thumb" title=${this._when(photo)}
              @click=${() => { this._open = index + 1; }}>
              ${this._image(photo, "thumb-image")}
              ${photo.person ? html`<span class="badge">${t("photos.person")}</span>` : nothing}
            </button>`)}
        </div>
        ${this._visible < this._photos.length ? html`
          <button class="more" @click=${this._showMore}>${t("photos.showMore")}</button>` : nothing}
        ${open ? html`
          <div class="viewer" role="dialog" aria-label=${this._when(open)} tabindex="-1">
            ${this._image(open, "viewer-image")}
            <div class="viewer-bar">
              <button @click=${() => this._step(-1)} ?disabled=${this._open === 0}
                aria-label=${t("photos.previous")}>‹</button>
              <span>${this._when(open)} · ${this._open! + 1}/${this._photos.length}</span>
              <button @click=${() => this._step(1)} ?disabled=${this._open === this._photos.length - 1}
                aria-label=${t("photos.next")}>›</button>
              <button @click=${() => { this._open = undefined; }} aria-label=${t("photos.close")}>✕</button>
            </div>
          </div>` : nothing}
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
    .viewer { position:absolute; inset:0; min-height:280px; display:grid; grid-template-rows:1fr auto;
      background:rgba(0,0,0,.92); z-index:2; }
    .viewer-image { min-height:0; }
    .viewer-image { width:100%; height:100%; object-fit:contain; }
    .viewer-bar { display:flex; gap:8px; align-items:center; justify-content:center; padding:8px;
      font-size:12px; color:#fff; }
    .viewer-bar button { min-width:40px; min-height:36px; color:#fff; border-color:rgba(255,255,255,.3); }
    .viewer-bar button:disabled { opacity:.35; cursor:default; }
    .empty { display:grid; place-items:center; min-height:200px; padding:24px; font-size:13px;
      color:var(--mower-muted, var(--secondary-text-color)); }
  `;
}
