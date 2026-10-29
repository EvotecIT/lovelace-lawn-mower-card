import { LitElement, html, nothing, svg, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "./card-config";
import { createTranslator, type SupportedLocale } from "./localization";
import { fetchPrivateApi } from "./private-api";
import {
  historyMapBounds, historyPath, readHistoryDetail, readHistoryList,
  historyDirection, historyPreferenceRows,
  type HistoryTask, type HistoryDetail,
} from "./task-history-logic";
import { taskHistoryStyles } from "./task-history-styles";

/** Read-only task history. Leaving the view retires all private requests/media. */
@customElement("lawn-mower-task-history")
export class LawnMowerTaskHistory extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property() public path?: string;
  @property({ type: Boolean }) public active = false;
  @property({ attribute: false }) public locale: SupportedLocale = "en";
  @state() private _cached = false;
  @state() private _tasks: HistoryTask[] = [];
  @state() private _selected?: HistoryTask;
  @state() private _detail?: HistoryDetail;
  @state() private _status: "idle" | "loading" | "ready" | "error" = "idle";
  @state() private _photoIndex = 0;
  @state() private _photoUrl?: string;
  @state() private _photoError = false;
  @state() private _photoLoading = false;
  private _abort?: AbortController;
  private _generation = 0;

  static styles = taskHistoryStyles;
  private get _t() { return createTranslator(this.locale); }

  protected updated(changed: PropertyValues): void {
    const previous = changed.get("hass") as HomeAssistant | undefined;
    const sessionChanged = changed.has("hass") && (
      previous?.connection !== this.hass?.connection || previous?.user?.id !== this.hass?.user?.id ||
      previous?.callWS !== this.hass?.callWS || previous?.hassUrl !== this.hass?.hassUrl);
    if (changed.has("path") || sessionChanged || (changed.has("active") && !this.active)) {
      this._stop(); this._tasks = []; this._selected = undefined;
      this._detail = undefined; this._status = "idle";
    }
    if (this.active && this.isConnected && this._status === "idle" && historyPath(this.path)) void this._load();
  }

  public connectedCallback(): void { super.connectedCallback(); this.requestUpdate(); }
  public disconnectedCallback(): void {
    this._stop(); this._tasks = []; this._selected = undefined; this._detail = undefined; this._status = "idle";
    super.disconnectedCallback();
  }
  private _stop(): void {
    this._generation += 1; this._abort?.abort(); this._abort = undefined;
    this._releasePhoto();
  }
  private _releasePhoto(): void {
    if (this._photoUrl) URL.revokeObjectURL(this._photoUrl);
    this._photoUrl = undefined; this._photoLoading = false; this._photoError = false;
  }
  private _current(generation: number): boolean {
    return generation === this._generation && this.active && this.isConnected;
  }

  private async _load(task?: HistoryTask, focus = Boolean(task)): Promise<void> {
    const path = historyPath(this.path), hass = this.hass;
    if (!path || !hass || !this.active || !this.isConnected) return;
    this._stop();
    const generation = this._generation, controller = new AbortController();
    this._abort = controller; this._selected = task; this._detail = undefined;
    this._status = "loading"; this._photoIndex = 0;
    const timeout = window.setTimeout(() => controller.abort(), 40_000);
    try {
      const response = await fetchPrivateApi(hass, task?.detail_path ?? path, controller.signal);
      const data: unknown = await response.json();
      if (!this._current(generation)) return;
      if (task) this._detail = readHistoryDetail(data, path, task.id);
      else { const list = readHistoryList(data, path); this._tasks = list.tasks; this._cached = list.stale; }
      this._status = "ready";
      if (task) {
        await this.updateComplete;
        this.renderRoot.querySelector<HTMLElement>(".detail-title")?.focus();
        if (this._current(generation)) void this._loadPhoto();
      } else if (focus) {
        await this.updateComplete;
        if (this._current(generation)) this.renderRoot.querySelector<HTMLElement>(".list-title")?.focus();
      }
    } catch {
      if (this._current(generation)) {
        this._status = "error";
        if (focus) {
          await this.updateComplete;
          if (this._current(generation)) this.renderRoot.querySelector<HTMLElement>(".message")?.focus();
        }
      }
    } finally {
      window.clearTimeout(timeout);
      if (this._abort === controller) this._abort = undefined;
    }
  }

  private _back = (): void => {
    const selected = this._selected?.id;
    this._stop(); this._selected = undefined; this._detail = undefined; this._status = "ready";
    void this.updateComplete.then(() => {
      this.renderRoot.querySelector<HTMLElement>(`[data-task="${selected}"]`)?.focus();
    });
  };

  private async _loadPhoto(index = 0, restoreFocus = false): Promise<void> {
    const path = this._detail?.photo_paths[index], hass = this.hass;
    if (!path || !hass || !this.active) return;
    this._abort?.abort();
    const generation = ++this._generation, controller = new AbortController();
    this._abort = controller; this._releasePhoto(); this._photoLoading = true; this._photoIndex = index;
    const timeout = window.setTimeout(() => controller.abort(), 40_000);
    try {
      const response = await fetchPrivateApi(hass, path, controller.signal);
      const blob = await response.blob();
      if (!this._current(generation)) return;
      if (!["image/png", "image/jpeg"].includes(blob.type) || blob.size > 8 * 1024 * 1024) throw new Error("Invalid photo");
      this._photoUrl = URL.createObjectURL(blob);
    } catch { if (this._current(generation)) this._photoError = true; }
    finally {
      window.clearTimeout(timeout);
      if (this._current(generation)) this._photoLoading = false;
      if (this._abort === controller) this._abort = undefined;
      if (restoreFocus && this._current(generation)) {
        await this.updateComplete;
        if (this._current(generation)) this.renderRoot.querySelector<HTMLElement>(".photo")?.focus();
      }
    }
  }

  private _photoDecodeFailed = (event: Event): void => {
    const image = event.currentTarget as HTMLImageElement;
    if (!this.active || !this.isConnected || !this._photoUrl || image.getAttribute("src") !== this._photoUrl) return;
    this._releasePhoto(); this._photoError = true;
  };

  private _navigatePhoto(index: number): void {
    if (!this._photoLoading && index >= 0 && index < (this._detail?.photo_paths.length ?? 0)) void this._loadPhoto(index);
  }

  private _date(epoch: number | null): string {
    return epoch ? new Intl.DateTimeFormat(this.locale, { dateStyle: "medium", timeStyle: "short" }).format(epoch * 1000) : this._t("common.unknown");
  }
  private _number(value: number | null, unit: string, digits = 2): string {
    return value === null ? this._t("common.unavailable")
      : `${new Intl.NumberFormat(this.locale, { maximumFractionDigits: digits }).format(value)} ${unit}`;
  }
  private _kind(mode: number | null): string {
    switch (mode) {
      case 0: return this._t("option.allArea"); case 1: return this._t("option.edgeMowing");
      case 2: return this._t("option.zoneMowing"); case 3: return this._t("common.spot");
      default: return this._t("common.task");
    }
  }
  private _result(result: number | null): string {
    return this._t(result === 1 ? "history.complete" : result === 3 ? "history.stopped"
      : result === 0 || result === 2 ? "history.incomplete" : "common.unknown");
  }

  protected render() {
    if (!this.active) return nothing;
    const task = this._selected, detail = this._detail;
    return html`<section aria-label=${this._t("history.title")} aria-busy=${this._status === "loading"}>
      <header>
        ${task ? html`<button class="back" @click=${this._back}><ha-icon icon="mdi:arrow-left"></ha-icon>${this._t("history.back")}</button>`
          : html`<div><h3 class="list-title" tabindex="-1">${this._t("history.title")}</h3><p>${this._t("history.latest")}</p></div>`}
        <button class="icon-button" aria-label=${this._t("pointCloud.refresh")} title=${this._t("pointCloud.refresh")}
          ?disabled=${this._status === "loading"} @click=${() => this._load(task, true)}><ha-icon icon="mdi:refresh"></ha-icon></button>
      </header>
      ${(detail?.stale ?? this._cached) ? html`<p class="cache-note" role="status">${this._t("history.cached")}</p>` : nothing}
      ${this._status === "loading" ? html`<p class="message" role="status">${this._t("history.loading")}</p>`
        : this._status === "error" ? html`<div class="message" tabindex="-1" role="alert"><p>${this._t("history.error")}</p><button @click=${() => this._load(task, true)}>${this._t("pointCloud.tryAgain")}</button></div>`
        : detail ? this._renderDetail(detail)
        : this._tasks.length ? html`<ol class="task-list">${this._tasks.map((row) => html`<li><button data-task=${row.id} @click=${() => this._load(row)}>
          <span class="task-icon"><ha-icon icon="mdi:grass"></ha-icon></span>
          <span class="task-copy"><strong>${this._kind(row.mode)}</strong><span>${this._date(row.started_at ?? row.reported_at)}</span>
            <span>${this._number(row.area_sqm, "m²")} · ${this._number(row.duration_minutes, "min")}</span></span>
          <span class=${`outcome result-${row.result}`}><span>${this._result(row.result)}</span><ha-icon icon="mdi:chevron-right"></ha-icon></span>
        </button></li>`)}</ol>` : html`<p class="message">${this._t("history.empty")}</p>`}
    </section>`;
  }

  private _renderDetail(detail: HistoryDetail) {
    const battery = detail.battery, bounds = historyMapBounds(detail.features);
    const points = (data: [number, number][]) => data.map(([x, y]) => `${-x},${y}`).join(" ");
    return html`<div class="detail">
      <h3 class="detail-title" tabindex="-1">${this._kind(detail.mode)} <span class=${`outcome result-${detail.result}`}>${this._result(detail.result)}</span></h3>
      <p>${this._date(detail.started_at)}${detail.ended_at ? html`<span> — ${this._date(detail.ended_at)}</span>` : nothing}</p>
      <dl class="metrics"><div><dt>${this._t("runtime.cutArea")}</dt><dd>${this._number(detail.area_sqm, "m²")}</dd></div>
        <div><dt>${this._t("common.time")}</dt><dd>${this._number(detail.duration_minutes, "min")}</dd></div></dl>
      <figure class="historical-map"><figcaption>${this._t("history.recordedMap")}</figcaption>
        ${bounds ? svg`<svg viewBox=${bounds.join(" ")} role="img" aria-label=${this._t("history.recordedMap")}>
          ${detail.features.map((feature) => svg`${feature.points.length >= 3 ? svg`<polygon class=${feature.kind === 0 ? "lawn" : "boundary"} points=${points(feature.points)}></polygon>` : nothing}
            ${feature.tracks.map((run) => svg`<polyline class="track" points=${points(run)}></polyline>`)}`)}
        </svg>` : html`<p class="message">${this._t("history.noMap")}</p>`}
      </figure>
      <section class="panel"><h4>${this._t("history.batteryUse")}</h4>
        ${battery ? html`<div class="battery-summary"><strong>${this._number(battery.percentage_points, this._t("history.pp"))}</strong>
          <span>${this._number(battery.percentage_points_per_sqm, `${this._t("history.pp")}/m²`, 4)}</span></div>
          <p>${this._t(battery.source === "recorder" ? "history.recorder" : "history.observed")}${battery.coverage === "partial" ? html` · ${this._t("history.partial")}` : nothing}</p>
          <p>${this._t("history.percentagePoints")}</p>
          ${this._renderBattery(detail)}` : html`<p>${this._t("history.noBattery")}</p>`}
      </section>
      <section class="panel"><h4>${this._t("history.recordedSettings")}</h4>
        ${Object.keys(detail.recorded_settings).length ? html`<p>${this._t("history.summarySettings")}${detail.per_zone_settings ? html` · ${this._t("common.zones")}` : nothing}</p>${this._settings(detail.recorded_settings)}` : nothing}
        ${detail.per_zone_settings ? html`<p>${this._t("history.zoneOverrides")}</p>` : nothing}
        ${battery?.settings.zones.length ? html`<p>${this._t(battery.settings_timing === "at_start" ? "history.atStart" : "history.firstObserved")} · ${this._date(battery.settings_observed_at)}</p>
          <p>${this._t("planner.preferenceMode")}: ${this._t(battery.settings.mode === 0 ? "option.global" : battery.settings.mode === 1 ? "option.custom" : "common.unknown")}</p>
          ${historyPreferenceRows(battery.settings).map((zone) => html`<div class="zone-settings"><strong>${zone.area_id === 0 ? this._t("history.global") : `${this._t("common.zone")} ${zone.area_id ?? "—"}`}</strong>${this._settings(zone)}</div>`)}`
          : !Object.keys(detail.recorded_settings).length ? html`<p>${this._t("history.noSettings")}</p>` : nothing}
      </section>
      ${detail.zone_results.length ? html`<details><summary>${this._t("common.zones")}</summary><ul>${detail.zone_results.map(([id, result]) => html`<li>${this._t("common.zone")} ${id}: ${result === 2 ? this._t("history.complete") : this._t("history.incomplete")}</li>`)}</ul></details>` : nothing}
      ${detail.faults.length ? html`<details><summary>${this._t("history.faults")} (${detail.faults.length})</summary><ul>${detail.faults.map(([at, code]) => html`<li>${this._date(at)} · ${this._t("common.error")} ${code}</li>`)}</ul></details>` : nothing}
      ${detail.photo_paths.length ? html`<section class="panel"><h4>${this._t("hero.photos")} (${detail.photo_paths.length})</h4>
        <div class="photo" tabindex="-1" role="group" aria-label=${`${this._t("hero.photos")} ${this._photoIndex + 1} / ${detail.photo_paths.length}`}>${this._photoUrl ? html`<img src=${this._photoUrl} @error=${this._photoDecodeFailed} alt=${`${this._t("hero.photos")} ${this._photoIndex + 1}`} />`
          : html`<p role="status">${this._t(this._photoError ? "photos.unavailable" : "photos.loading")}</p>`}</div>
        <nav class="photo-nav" aria-label=${this._t("hero.photos")}><button aria-label=${this._t("photos.previous")} aria-disabled=${this._photoIndex === 0 || this._photoLoading} @click=${() => this._navigatePhoto(this._photoIndex - 1)}>‹</button>
          <span>${this._photoIndex + 1} / ${detail.photo_paths.length}</span>
          ${this._photoError ? html`<button @click=${() => this._loadPhoto(this._photoIndex, true)}>${this._t("pointCloud.tryAgain")}</button>` : nothing}
          <button aria-label=${this._t("photos.next")} aria-disabled=${this._photoIndex + 1 >= detail.photo_paths.length || this._photoLoading} @click=${() => this._navigatePhoto(this._photoIndex + 1)}>›</button></nav>
      </section>` : nothing}
    </div>`;
  }

  private _settings(settings: Record<string, number | boolean>) {
    const height = typeof settings.mowing_height_cm === "number" ? settings.mowing_height_cm : null;
    const efficiency = settings.efficient_mode;
    const direction = historyDirection(settings);
    return html`<dl class="settings-values">${height !== null ? html`<div><dt>${this._t("planner.mowingHeight")}</dt><dd>${this._number(height, "cm")}</dd></div>` : nothing}
      ${typeof efficiency === "number" ? html`<div><dt>${this._t("planner.efficiency")}</dt><dd>${efficiency === 3 ? this._t("history.rush") : this._t(efficiency === 0 ? "option.standard" : efficiency === 1 ? "option.efficient" : "common.unknown")}</dd></div>` : nothing}
      ${settings.mowing_direction_mode !== undefined || settings.mowing_direction_degrees !== undefined ? html`<div><dt>${this._t("planner.directionMode")}</dt><dd>${this._t(direction.mode === 0 ? "option.none" : direction.mode === 1 ? "option.mowAtAngle" : direction.mode === 2 ? "option.checkerboard" : "common.unknown")}</dd></div>` : nothing}
      ${direction.degrees !== null ? html`<div><dt>${this._t("planner.direction")}</dt><dd>${this._number(direction.degrees, "°")}</dd></div>` : nothing}
      ${typeof settings.edge_mowing_walk_mode === "number" ? html`<div><dt>${this._t("planner.turningMethod")}</dt><dd>${this._t(settings.edge_mowing_walk_mode === 0 ? "option.lawnCare" : settings.edge_mowing_walk_mode === 1 ? "option.efficient" : "common.unknown")}</dd></div>` : nothing}</dl>`;
  }

  private _renderBattery(detail: HistoryDetail) {
    const samples = detail.battery?.samples ?? [], start = detail.started_at, end = detail.ended_at;
    if (!start || !end || start >= end || !samples.length) return nothing;
    const x = (at: number) => 30 + (at - start) / (end - start) * 530;
    const y = (level: number) => 18 + (100 - level) * 1.1;
    return html`<div class="battery-plot" role="img" aria-label=${`${this._t("history.batteryUse")}: ${samples[0].level}% – ${samples[samples.length - 1].level}%`}>
      <div class="chart-scale" aria-hidden="true"><span>100%</span><span>50%</span><span>0%</span></div>
      <svg class="battery-chart" viewBox="30 0 540 145" preserveAspectRatio="none" aria-hidden="true">
      ${svg`<path class="chart-grid" d="M30 18H560M30 73H560M30 128H560"></path>
        ${samples.slice(1).map((sample, index) => {
          const before = samples[index];
          return sample.continuous && sample.at - before.at <= 300 ? svg`<line class=${before.charging || sample.charging || sample.level > before.level ? "charge" : "battery-line"} x1=${x(before.at)} y1=${y(before.level)} x2=${x(sample.at)} y2=${y(sample.level)}></line>` : nothing;
        })}
        ${samples.map((sample) => svg`<circle cx=${x(sample.at)} cy=${y(sample.level)} r="2"><title>${this._date(sample.at)}: ${sample.level}%</title></circle>`)}`}
    </svg></div>`;
  }
}
