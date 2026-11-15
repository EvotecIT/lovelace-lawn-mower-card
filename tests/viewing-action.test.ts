import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { ViewingAction, validateViewingAction } from "../src/viewing-action.ts";
import type { HomeAssistant, LawnMowerCardConfig } from "../src/card-config.ts";

function fixture(t: TestContext) {
  const previous = { document: globalThis.document, window: globalThis.window,
    observer: globalThis.IntersectionObserver };
  const document = Object.assign(new EventTarget(), { visibilityState: "visible" });
  const window = new EventTarget();
  const host = {} as Element;
  let receive: (entries: IntersectionObserverEntry[]) => void;
  let observerDisconnected = false;
  globalThis.document = document as unknown as Document;
  globalThis.window = window as unknown as Window & typeof globalThis;
  globalThis.IntersectionObserver = class {
    constructor(callback: typeof receive) { receive = callback; }
    observe() { observerDisconnected = false; }
    disconnect() { observerDisconnected = true; }
  } as unknown as typeof IntersectionObserver;
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 1000 });
  const calls: unknown[][] = [], errors: unknown[] = [];
  let response = () => Promise.resolve();
  const hass = {
    states: { "lawn_mower.goat": { entity_id: "lawn_mower.goat", state: "mowing", attributes: {} } },
    connection: { connected: true }, user: { id: "user" },
    callService: (...args: unknown[]) => { calls.push(args); return response(); },
  } as unknown as HomeAssistant;
  const config: LawnMowerCardConfig = {
    type: "custom:lawn-mower-card", entity: "lawn_mower.goat",
    viewing_action: { service: "ecovacs_mower.app_ping",
      service_data: { entity_id: "lawn_mower.goat" }, interval: 10 },
  };
  const action = new ViewingAction(host, (...args) => errors.push(args));
  t.after(() => {
    action.disconnect();
    globalThis.document = previous.document;
    globalThis.window = previous.window;
    globalThis.IntersectionObserver = previous.observer;
  });
  const advance = async (ms = 0) => {
    t.mock.timers.tick(ms);
    await Promise.resolve();
    await Promise.resolve();
  };
  return { action, hass, config, calls, errors, document, window, advance,
    respond: (value: typeof response) => { response = value; },
    intersect: (visible: boolean) => receive!([{ target: host, isIntersecting: visible,
      intersectionRatio: visible ? 1 : 0 } as IntersectionObserverEntry]),
    disconnected: () => observerDisconnected };
}

test("viewing calls require an opted-in, visible card and stop with its lifecycle", async t => {
  const f = fixture(t);
  f.action.connect();
  f.action.sync(f.hass, { ...f.config, viewing_action: undefined });
  f.intersect(true);
  await f.advance(60000);
  assert.equal(f.calls.length, 0);
  f.action.sync(f.hass, f.config);
  await f.advance();
  assert.deepEqual(f.calls, [["ecovacs_mower", "app_ping", { entity_id: "lawn_mower.goat" }]]);
  await f.advance(10000);
  assert.equal(f.calls.length, 2);
  f.intersect(false);
  await f.advance(10000);
  assert.equal(f.calls.length, 2);
  f.intersect(true);
  await f.advance();
  assert.equal(f.calls.length, 3);
  f.document.visibilityState = "hidden";
  f.document.dispatchEvent(new Event("visibilitychange"));
  await f.advance(20000);
  assert.equal(f.calls.length, 3);
  f.document.visibilityState = "visible";
  f.document.dispatchEvent(new Event("visibilitychange"));
  await f.advance();
  assert.equal(f.calls.length, 4);
  f.window.dispatchEvent(new Event("pagehide"));
  await f.advance(20000);
  assert.equal(f.calls.length, 4);
  f.window.dispatchEvent(new Event("pageshow"));
  await f.advance();
  assert.equal(f.calls.length, 5);
  f.action.disconnect();
  assert.ok(f.disconnected());
  await f.advance(60000);
  f.document.dispatchEvent(new Event("visibilitychange"));
  await f.advance();
  assert.equal(f.calls.length, 5);
});

test("a card below the viewport waits for an observation and quick returns keep the interval", async t => {
  const f = fixture(t);
  f.action.sync(f.hass, f.config);
  f.action.connect();
  await f.advance(30000);
  assert.equal(f.calls.length, 0);
  f.intersect(false);
  await f.advance();
  assert.equal(f.calls.length, 0);
  f.intersect(true);
  await f.advance();
  assert.equal(f.calls.length, 1);
  f.intersect(false);
  f.intersect(true);
  f.action.sync({ ...f.hass }, { ...f.config });
  await f.advance(9999);
  assert.equal(f.calls.length, 1);
  await f.advance(1);
  assert.equal(f.calls.length, 2);
});

test("slow and failed calls remain serial, survive reconnect and retire stale errors", async t => {
  const f = fixture(t);
  let reject!: (reason: Error) => void;
  f.respond(() => new Promise<void>((_, fail) => { reject = fail; }));
  f.action.sync(f.hass, f.config);
  f.action.connect();
  f.intersect(true);
  await f.advance();
  await f.advance(30000);
  assert.equal(f.calls.length, 1);
  f.action.disconnect();
  f.action.connect();
  f.intersect(true);
  await f.advance();
  assert.equal(f.calls.length, 1);
  f.document.visibilityState = "hidden";
  f.document.dispatchEvent(new Event("visibilitychange"));
  reject(new Error("offline"));
  await f.advance();
  assert.equal(f.errors.length, 0);
  f.respond(() => Promise.reject(new Error("service failed")));
  f.document.visibilityState = "visible";
  f.document.dispatchEvent(new Event("visibilitychange"));
  await f.advance();
  assert.equal(f.calls.length, 2);
  assert.equal(f.errors.length, 1);
  await f.advance(9999);
  assert.equal(f.calls.length, 2);
  f.respond(() => Promise.resolve());
  await f.advance(1);
  assert.equal(f.calls.length, 3);
});

test("connection loss, unavailable mower and configuration removal suspend calls", async t => {
  const f = fixture(t);
  f.action.sync(f.hass, f.config);
  f.action.connect();
  f.intersect(true);
  await f.advance();
  assert.equal(f.calls.length, 1);
  f.action.sync({ ...f.hass, connection: { connected: false } }, f.config);
  await f.advance(10000);
  assert.equal(f.calls.length, 1);
  const unavailable = { ...f.hass, states: { "lawn_mower.goat": {
    entity_id: "lawn_mower.goat", state: "unavailable", attributes: {} } } };
  f.action.sync(unavailable, f.config);
  await f.advance(10000);
  assert.equal(f.calls.length, 1);
  f.action.sync(f.hass, { ...f.config, viewing_action: { service: "button.press",
    service_data: { entity_id: "button.goat_refresh" }, interval: 10 } });
  await f.advance();
  assert.deepEqual(f.calls[1], ["button", "press", { entity_id: "button.goat_refresh" }]);
  f.action.sync(f.hass, { ...f.config, viewing_action: undefined });
  await f.advance(10000);
  assert.equal(f.calls.length, 2);
});

test("viewing action configuration rejects malformed services, intervals and data", () => {
  validateViewingAction(undefined);
  validateViewingAction({ service: "button.press", interval: 60 });
  for (const value of [null, [], { service: "https://example.test" },
    { service: "button.press", interval: 0 }, { service: "button.press", interval: Infinity },
    { service: "button.press", service_data: [] }]) {
    assert.throws(() => validateViewingAction(value as never), /viewing_action/);
  }
});
