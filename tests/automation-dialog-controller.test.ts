import assert from "node:assert/strict";
import { test } from "node:test";
import { AutomationDialogController } from "../src/automation-dialog-controller.ts";
import { currentMowerMutation } from "../src/mower-mutation-lock.ts";

const tick = () => new Promise(resolve => setImmediate(resolve));
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

function fixture() {
  const calls: Array<Record<string, any>> = [];
  let state: any;
  let entity = "lawn_mower.dialog_test";
  const model = { entryId: "entry", scheduleEntity: "schedule.a", enabled: true };
  let delay: Promise<unknown> | undefined;
  let duringPost: (() => void) | undefined;
  let step = 0;
  const schemas = [
    [{ name: "enabled", default: true }, { name: "schedule_entity", default: "schedule.a" }],
    [{ name: "wet_threshold", default: 65 }],
    [{ name: "native_plans_disabled", default: true }],
  ];
  const steps = ["mowing_automation", "mowing_conditions", "mowing_review"];
  const hass: any = {
    user: { id: "admin", is_admin: true }, connection: {},
    callService: async (domain: string, service: string, data: Record<string, unknown>) => {
      calls.push({ domain, service, data });
      if (data.zone_id === 99) throw new Error("Set up Mowing automation first");
    },
    callWS: async (message: Record<string, any>) => {
      calls.push(message);
      if (message.type === "config/entity_registry/get") {
        if (delay) { const wait = delay; delay = undefined; await wait; }
        return { unique_id: message.entity_id.slice(9) };
      }
      if (message.type === "schedule/list") return ["a", "b"].map(id => ({
        id, name: id, monday: [{ from: id === "a" ? "09:00:00" : "13:00:00", to: "15:00:00" }],
      }));
      if (delay) { const wait = delay; delay = undefined; await wait; }
      return {};
    },
    callApi: async (method: string, path: string, data?: Record<string, unknown>) => {
      calls.push({ method, path, data });
      if (method === "DELETE") return {};
      if (path.endsWith("/flow")) { step = -1; return { type: "menu", flow_id: "f" }; }
      step++;
      duringPost?.();
      return step < steps.length
        ? { type: "form", flow_id: "f", step_id: steps[step], data_schema: schemas[step] }
        : { type: "create_entry" };
    },
  };
  const controller = new AutomationDialogController({
    hass: () => hass, entityId: () => entity, automation: () => model as any,
    changed: value => { state = value; }, savedMessage: () => "Saved", openHelper: () => {},
  });
  return { controller, model, hass, calls, state: () => state,
    delay: (value: Promise<unknown>) => { delay = value; },
    changeMower: () => { entity = "lawn_mower.other"; model.entryId = "other"; },
    duringPost: (action?: () => void) => { duringPost = action; },
  };
}

test("changing the schedule picker edits and saves the selected helper", async () => {
  const f = fixture();
  await f.controller.open(f.model as any); await tick();
  f.controller.actions().setOptions("mowing_automation", { enabled: true, schedule_entity: "schedule.b" });
  await tick();
  assert.equal(f.state().draft.id, "b");
  assert.equal(f.state().draft.days.monday[0].from, "13:00:00");
  f.controller.actions().addBlock("tuesday");
  await f.controller.actions().save();
  assert.deepEqual(f.calls.filter(call => call.type === "schedule/update").map(call => call.schedule_id), ["b"]);
  f.controller.close();
});

test("closing during a save never reopens the dialog or continues the options save", async () => {
  const f = fixture();
  await f.controller.open(f.model as any); await tick();
  f.controller.actions().addBlock("tuesday");
  f.controller.actions().setOptions("mowing_conditions", { wet_threshold: 70 });
  const wait = deferred<void>(); f.delay(wait.promise);
  const before = f.calls.filter(call => call.path?.endsWith("/flow")).length;
  const saved = f.controller.actions().save();
  assert.equal(currentMowerMutation("lawn_mower.dialog_test"), "automation_options");
  f.controller.close(); wait.resolve(); await saved;
  assert.equal(f.state(), undefined);
  assert.equal(currentMowerMutation("lawn_mower.dialog_test"), undefined);
  assert.equal(f.calls.filter(call => call.path?.endsWith("/flow")).length, before);
});

test("an earlier load cannot replace a reopened dialog", async () => {
  const f = fixture(); const wait = deferred<void>(); f.delay(wait.promise);
  const first = f.controller.open(f.model as any);
  f.controller.close();
  await f.controller.open({ ...f.model, scheduleEntity: "schedule.b" } as any);
  assert.equal(f.state().draft.id, "b");
  wait.resolve(); await first; await tick();
  assert.equal(f.state().draft.id, "b");
  f.controller.close();
});

test("changing mower invalidates the draft and prevents writes", async () => {
  const f = fixture();
  await f.controller.open(f.model as any); await tick();
  f.controller.actions().addBlock("tuesday");
  f.changeMower(); f.controller.reconcile();
  await f.controller.actions().save();
  assert.equal(f.state(), undefined);
  assert.equal(f.calls.some(call => call.type === "schedule/update"), false);
});

test("clearing the picker discards an outstanding helper read", async () => {
  const f = fixture();
  await f.controller.open(f.model as any); await tick();
  const wait = deferred<void>(); f.delay(wait.promise);
  f.controller.actions().setOptions("mowing_automation", { schedule_entity: "schedule.b" });
  f.controller.actions().setOptions("mowing_automation", {});
  wait.resolve(); await tick();
  assert.equal(f.state().draft, undefined);
  assert.equal(f.state().status, "error");
  f.controller.actions().addBlock("tuesday");
  await f.controller.actions().save();
  assert.equal(f.calls.some(call => call.type === "schedule/update"), false);
  f.controller.close();
});

test("a changed enable state aborts options replay before confirmation", async () => {
  const f = fixture();
  await f.controller.open(f.model as any); await tick();
  f.controller.actions().setOptions("mowing_conditions", { wet_threshold: 70 });
  f.calls.length = 0;
  f.duringPost(() => { f.model.enabled = false; });
  await f.controller.actions().save();
  assert.equal(f.state().status, "error");
  assert.equal(f.calls.at(-1)?.method, "DELETE");
  assert.equal(f.calls.some(call => call.data?.native_plans_disabled), false);
  f.controller.close();
});

test("what to mow is a draft: Save applies it before the schedule and options", async () => {
  const f = fixture();
  Object.assign(f.model, {
    rotation: true, defaultRestDays: 1, rotationMaxArea: 300,
    targetEntity: "select.what", restDaysEntity: "number.rest", maxAreaEntity: "number.area",
    rotationZones: [{ zoneId: 6, label: "Front", restDays: 1, customRestDays: false }],
  });
  await f.controller.open(f.model as any); await tick();
  const actions = f.controller.actions();
  actions.setZoneRestDays!(6, 0);
  actions.setRotation!({ maxArea: 0 });
  actions.addBlock("tuesday");
  actions.setOptions("mowing_conditions", { wet_threshold: 70 });
  assert.equal(f.calls.filter(call => call.service).length, 0);
  assert.deepEqual(f.state().rotation.zoneRestDays, { 6: 0 });
  const before = f.calls.length;
  await actions.save(); await tick();
  const order = f.calls.slice(before).map(call =>
    call.service ?? (call.type === "schedule/update" ? "schedule/update" : call.method === "POST" ? "options" : undefined))
    .filter(Boolean);
  assert.deepEqual(order.slice(0, 3), ["set_value", "set_rotation_zone_rest_days", "schedule/update"]);
  assert.ok(order.slice(3).every(step => step === "options") && order.length > 3);
  assert.deepEqual(f.calls.filter(call => call.service).map(call => [call.service, call.data]), [
    ["set_value", { entity_id: "number.area", value: 0 }],
    ["set_rotation_zone_rest_days", { entity_id: "lawn_mower.dialog_test", zone_id: 6, rest_days: 0 }],
  ]);
  assert.deepEqual(f.state().rotationOriginal, f.state().rotation);
  // Back to the default clears the zone's own value on the next Save.
  f.controller.actions().setZoneRestDays!(6, undefined);
  await f.controller.actions().save(); await tick();
  assert.deepEqual(f.calls.filter(call => call.service).at(-1)?.data, { entity_id: "lawn_mower.dialog_test", zone_id: 6 });
});

for (const duringSave of [false, true]) test(`a map switch invalidates zone edits (${duringSave ? "during" : "before"} Save)`, async () => {
  const f = fixture();
  Object.assign(f.model, {
    rotation: true, defaultRestDays: 1, rotationMaxArea: 300, rotationMapIndex: 0,
    targetEntity: "select.what", restDaysEntity: "number.rest", maxAreaEntity: "number.area",
    rotationZones: [{ zoneId: 6, label: "Front", restDays: 1, customRestDays: false }],
  });
  await f.controller.open(f.model as any); await tick();
  f.controller.actions().setRotation!({ restDays: 2 });
  f.controller.actions().setZoneRestDays!(6, 0);
  const changeMap = () => { Object.assign(f.model, { rotationMapIndex: 1 }); f.controller.reconcile(); };
  if (duringSave) {
    const service = f.hass.callService;
    f.hass.callService = async (...args: any[]) => { await service(...args); changeMap(); };
  } else changeMap();
  await f.controller.actions().save();
  assert.equal(f.state(), undefined);
  assert.equal(f.calls.filter(call => call.service).length, duringSave ? 1 : 0);
  assert.equal(f.calls.some(call => call.service === "set_rotation_zone_rest_days"), false);
});

for (const kind of ["default", "zone"]) test(`retry restores a successful ${kind} setting after a later write fails`, async () => {
  const f = fixture();
  Object.assign(f.model, {
    rotation: true, defaultRestDays: 1, rotationMaxArea: 300, rotationMapIndex: 0,
    targetEntity: "select.what", restDaysEntity: "number.rest", maxAreaEntity: "number.area",
    rotationZones: [1, 6].map(zoneId => ({ zoneId, label: `Zone ${zoneId}`, restDays: 1, customRestDays: false })),
  });
  let backendRest = 1;
  const backendZones: Record<number, number> = {};
  let reject = true;
  const service = f.hass.callService;
  f.hass.callService = async (domain: string, name: string, data: Record<string, any>) => {
    await service(domain, name, data);
    if (reject && (kind === "default" ? data.entity_id === "number.area" : data.zone_id === 6)) {
      reject = false;
      throw kind === "default" ? new Error("A later setting could not be saved")
        : { code: "service_validation_error", message: "A later setting could not be saved" };
    }
    if (data.entity_id === "number.rest") backendRest = data.value;
    if (name === "set_rotation_zone_rest_days") {
      if (data.rest_days === undefined) delete backendZones[data.zone_id];
      else backendZones[data.zone_id] = data.rest_days;
    }
  };
  await f.controller.open(f.model as any); await tick();
  const actions = f.controller.actions();
  if (kind === "default") actions.setRotation!({ restDays: 2, maxArea: 500 });
  else { actions.setZoneRestDays!(1, 0); actions.setZoneRestDays!(6, 2); }
  await actions.save();
  assert.equal(f.state().status, "error");
  assert.equal(f.state().error, "A later setting could not be saved");
  if (kind === "default") {
    assert.equal(backendRest, 2);
    actions.setRotation!({ restDays: 1 });
  } else {
    assert.deepEqual(backendZones, { 1: 0 });
    actions.setZoneRestDays!(1, undefined);
  }
  await actions.save();
  assert.equal(backendRest, 1);
  assert.deepEqual(backendZones, kind === "default" ? {} : { 6: 2 });
  assert.equal(f.state().status, "ready");
  assert.deepEqual(f.state().rotationOriginal, f.state().rotation);
  f.controller.close();
});

for (const missing of ["targetEntity", "restDaysEntity", "maxAreaEntity"]) {
  test(`Save rejects a changed setting whose ${missing} control disappeared`, async () => {
    const f = fixture();
    Object.assign(f.model, {
      rotation: true, defaultRestDays: 1, rotationMaxArea: 300, rotationMapIndex: 0,
      targetEntity: "select.what", restDaysEntity: "number.rest", maxAreaEntity: "number.area",
      rotationZones: [{ zoneId: 6, label: "Front", restDays: 1, customRestDays: false }],
    });
    await f.controller.open(f.model as any); await tick();
    f.controller.actions().setRotation!({ target: "all", restDays: 2, maxArea: 500 });
    f.controller.actions().setZoneRestDays!(6, 0);
    const original = f.state().rotationOriginal;
    Reflect.deleteProperty(f.model, missing);
    await f.controller.actions().save();
    assert.equal(f.state().status, "error");
    assert.match(f.state().error, /unavailable/i);
    assert.deepEqual(f.state().rotationOriginal, original);
    assert.equal(f.calls.filter(call => call.service).length, 0);
    assert.equal(currentMowerMutation("lawn_mower.dialog_test"), undefined);
    f.controller.close();
  });
}
