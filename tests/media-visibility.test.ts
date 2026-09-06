import assert from "node:assert/strict";
import test from "node:test";
import { MediaVisibility } from "../src/media-visibility.ts";

test("hidden documents suspend immediately; brief scrolling retains media", () => {
  const old = {
    document: globalThis.document,
    observer: globalThis.IntersectionObserver,
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
  };
  const doc = new EventTarget() as EventTarget & { visibilityState: string };
  doc.visibilityState = "visible";
  const host = {} as Element;
  let callback: (entries: unknown[]) => void;
  let pending: (() => void) | undefined;
  let disconnected = 0;
  globalThis.document = doc as Document;
  globalThis.IntersectionObserver = class {
    constructor(receive: typeof callback) { callback = receive; }
    observe() {}
    disconnect() { disconnected += 1; }
  } as unknown as typeof IntersectionObserver;
  globalThis.setTimeout = ((action: () => void) => {
    pending = action;
    return 1;
  }) as typeof setTimeout;
  globalThis.clearTimeout = (() => { pending = undefined; }) as typeof clearTimeout;
  try {
    const states: boolean[] = [];
    const visibility = new MediaVisibility(host, (value) => states.push(value));
    visibility.connect();
    callback!([{ target: host, isIntersecting: false }]);
    assert.deepEqual(states, []);
    callback!([{ target: host, isIntersecting: true }]);
    assert.equal(pending, undefined);
    callback!([{ target: host, isIntersecting: false }]);
    pending!();
    assert.deepEqual(states, [false]);
    callback!([{ target: host, isIntersecting: true }]);
    assert.deepEqual(states, [false, true]);
    doc.visibilityState = "hidden";
    doc.dispatchEvent(new Event("visibilitychange"));
    assert.deepEqual(states, [false, true, false]);
    doc.visibilityState = "visible";
    doc.dispatchEvent(new Event("visibilitychange"));
    assert.deepEqual(states, [false, true, false, true]);
    visibility.disconnect();
    assert.equal(disconnected, 1);
    doc.visibilityState = "hidden";
    doc.dispatchEvent(new Event("visibilitychange"));
    assert.equal(states.length, 4);
  } finally {
    globalThis.document = old.document;
    globalThis.IntersectionObserver = old.observer;
    globalThis.setTimeout = old.setTimeout;
    globalThis.clearTimeout = old.clearTimeout;
  }
});
