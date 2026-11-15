import type { HomeAssistant, LawnMowerCardConfig, ViewingActionConfig } from "./card-config";
import { MediaVisibility } from "./media-visibility.ts";
import { offlineMowerConnection } from "./availability.ts";

/** Reject malformed automatic actions before installing any timer. */
export function validateViewingAction(config: ViewingActionConfig | undefined): void {
  if (config === undefined) return;
  if (!config || typeof config !== "object" || Array.isArray(config) ||
      typeof config.service !== "string" || !/^[a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*$/.test(config.service)) {
    throw new Error("viewing_action.service must be a Home Assistant service such as ecovacs_mower.app_ping.");
  }
  if (config.interval !== undefined && (typeof config.interval !== "number" ||
      !Number.isFinite(config.interval) || config.interval < 10 || config.interval > 86400)) {
    throw new Error("viewing_action.interval must be between 10 and 86400 seconds.");
  }
  if (config.service_data !== undefined && (!config.service_data ||
      typeof config.service_data !== "object" || Array.isArray(config.service_data))) {
    throw new Error("viewing_action.service_data must be an object.");
  }
}

/** Own the visibility subscription and one serial refresh loop for a card. */
export class ViewingAction {
  private visibility: MediaVisibility;
  private connected = false;
  private visible = false;
  private pageVisible = true;
  private timer?: ReturnType<typeof setTimeout>;
  private pending = false;
  private nextAttempt = 0;
  private hass?: HomeAssistant;
  private config?: LawnMowerCardConfig;
  private identity?: string;
  private connection?: object;
  private user?: string;
  private failed: (service: string, error: unknown) => void;

  constructor(host: Element, failed: (service: string, error: unknown) => void) {
    this.failed = failed;
    this.visibility = new MediaVisibility(host, visible => {
      this.visible = visible;
      this.schedule();
    }, true);
  }

  connect(): void {
    this.connected = true;
    this.pageVisible = true;
    window.addEventListener("pagehide", this.hide);
    window.addEventListener("pageshow", this.show);
    this.visibility.connect();
  }

  disconnect(): void {
    this.connected = false;
    this.visibility.disconnect();
    window.removeEventListener("pagehide", this.hide);
    window.removeEventListener("pageshow", this.show);
    this.clearTimer();
  }

  sync(hass: HomeAssistant | undefined, config: LawnMowerCardConfig | undefined): void {
    const identity = JSON.stringify([config?.entity, config?.viewing_action]);
    const connection = hass?.connection ?? hass?.callService;
    if (identity !== this.identity || connection !== this.connection || hass?.user?.id !== this.user) {
      this.clearTimer();
      this.nextAttempt = 0;
      this.identity = identity;
      this.connection = connection;
      this.user = hass?.user?.id;
    }
    this.hass = hass;
    this.config = config;
    this.schedule();
  }

  private hide = (): void => { this.pageVisible = false; this.schedule(); };
  private show = (): void => { this.pageVisible = true; this.schedule(); };

  private clearTimer(): void {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
  }

  private ready(): boolean {
    const mower = this.config && this.hass?.states[this.config.entity];
    const connection = this.hass?.connection as { connected?: boolean } | undefined;
    return Boolean(this.connected && this.visible && this.pageVisible &&
      document.visibilityState === "visible" && this.config?.viewing_action &&
      this.hass && connection?.connected !== false && mower &&
      mower.state !== "unavailable" && mower.state !== "unknown" &&
      !offlineMowerConnection(this.hass, this.config!.entity));
  }

  private schedule(): void {
    if (!this.ready()) { this.clearTimer(); return; }
    if (this.pending || this.timer !== undefined) return;
    this.timer = setTimeout(() => {
      this.timer = undefined;
      void this.invoke();
    }, Math.max(0, this.nextAttempt - Date.now()));
  }

  private async invoke(): Promise<void> {
    if (!this.ready() || this.pending) return;
    const hass = this.hass!, action = this.config!.viewing_action!;
    const identity = this.identity, connection = this.connection, user = this.user;
    const [domain, service] = action.service.split(".");
    this.pending = true;
    this.nextAttempt = Date.now() + (action.interval ?? 60) * 1000;
    try {
      await hass.callService(domain, service, action.service_data);
    } catch (error) {
      if (this.ready() && identity === this.identity && connection === this.connection && user === this.user) {
        this.failed(action.service, error);
      }
    } finally {
      this.pending = false;
      this.schedule();
    }
  }
}
