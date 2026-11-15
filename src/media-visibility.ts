/** Observe dashboard visibility without cycling media during a brief scroll. */
export class MediaVisibility {
  private observer?: IntersectionObserver;
  private timer?: ReturnType<typeof setTimeout>;
  private intersecting = true;
  private visible = true;
  private host: Element;
  private changed: (visible: boolean) => void;
  private strict: boolean;

  constructor(host: Element, changed: (visible: boolean) => void, strict = false) {
    this.host = host;
    this.changed = changed;
    this.strict = strict;
    this.visible = !strict;
  }

  connect(): void {
    this.disconnect();
    this.intersecting = !this.strict;
    document.addEventListener("visibilitychange", this.sync);
    if (typeof IntersectionObserver !== "undefined") {
      this.observer = new IntersectionObserver((entries) => {
        const entry = entries.find((candidate) => candidate.target === this.host);
        if (!entry) return;
        this.intersecting = entry.isIntersecting && (!this.strict || entry.intersectionRatio >= 0.001);
        this.sync();
      // A positive threshold also reports entry after a zero-area edge touch.
      }, { rootMargin: this.strict ? "0px" : "150px", threshold: this.strict ? 0.001 : 0 });
      this.observer.observe(this.host);
    }
    this.sync();
  }

  disconnect(): void {
    document.removeEventListener("visibilitychange", this.sync);
    this.observer?.disconnect();
    this.observer = undefined;
    this.clearTimer();
    if (this.strict) this.publish(false);
  }

  private clearTimer(): void {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
  }

  private publish(visible: boolean): void {
    if (this.visible === visible) return;
    this.visible = visible;
    this.changed(visible);
  }

  private sync = (): void => {
    if (document.visibilityState === "hidden") {
      this.clearTimer();
      this.publish(false);
    } else if (this.intersecting) {
      this.clearTimer();
      this.publish(true);
    } else if (this.strict) {
      this.publish(false);
    } else if (this.timer === undefined && this.visible) {
      this.timer = setTimeout(() => {
        this.timer = undefined;
        this.publish(false);
      }, 15_000);
    }
  };
}
