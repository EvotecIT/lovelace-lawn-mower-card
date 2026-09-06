export type MediaLoadPhase = "authorization" | "headers" | "download" | "preview_render" | "detail_render";

/** Per-load numeric diagnostics, intentionally excluding URLs and entity IDs. */
export class MediaLoadTiming {
  private clock: () => number;
  private started: number;
  private milestones: Partial<Record<MediaLoadPhase, number>> = {};

  constructor(clock: () => number = () => performance.now()) {
    this.clock = clock;
    this.started = clock();
  }

  mark(phase: MediaLoadPhase): void {
    this.milestones[phase] = this.elapsed();
  }

  private elapsed(): number {
    return Math.round(Math.max(0, this.clock() - this.started) * 10) / 10;
  }

  snapshot(outcome: "ready" | "error" | "cancelled", parseMs?: number) {
    return {
      operation: "point_cloud_display",
      outcome,
      total_ms: this.elapsed(),
      milestones_ms: { ...this.milestones },
      parse_ms: Number.isFinite(parseMs) ? Math.round(parseMs! * 10) / 10 : undefined,
    };
  }
}
