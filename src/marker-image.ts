type Probe = { url: string; image: ProbeImage; failedAt?: number };
type ProbeImage = { src: string; onload: ((event: Event) => void) | null; onerror: ((event: Event | string) => void) | null };

/** A failed picture is tried again after this long, in case the file appears. */
export const MARKER_RETRY_MS = 60_000;

/**
 * Checks that the custom mower picture loads, since SVG <image> has no reliable error
 * event. Only the latest check may report; a new or cleared picture starts afresh.
 */
export class MarkerImageCheck {
  /** The picture that failed to load, shown as the built-in mower instead. */
  public failed?: string;
  private probe?: Probe;
  private readonly onChange: () => void;
  private readonly createImage: () => ProbeImage;
  private readonly now: () => number;

  constructor(onChange: () => void, createImage: () => ProbeImage = () => new Image(), now: () => number = Date.now) {
    this.onChange = onChange;
    this.createImage = createImage;
    this.now = now;
  }

  /** The picture to draw, or undefined for the built-in mower. */
  public usable(wanted: string | undefined): string | undefined {
    return wanted && wanted !== this.failed ? wanted : undefined;
  }

  public sync(wanted: string | undefined): void {
    const current = this.probe;
    const retry = current?.failedAt !== undefined && this.now() - current.failedAt > MARKER_RETRY_MS;
    if (current && current.url === wanted && !retry) return;
    this.drop();
    if (current?.url !== wanted && this.failed !== undefined) { this.failed = undefined; this.onChange(); }
    if (!wanted) return;
    const probe: Probe = { url: wanted, image: this.createImage() };
    this.probe = probe;
    probe.image.onload = () => {
      if (this.probe !== probe || this.failed !== wanted) return;
      this.failed = undefined; this.onChange();
    };
    probe.image.onerror = () => {
      if (this.probe !== probe) return;
      probe.failedAt = this.now(); this.failed = wanted; this.onChange();
    };
    probe.image.src = wanted;
  }

  public drop(): void {
    if (this.probe) { this.probe.image.onload = null; this.probe.image.onerror = null; }
    this.probe = undefined;
  }

  public reset(): void { this.drop(); this.failed = undefined; }
}