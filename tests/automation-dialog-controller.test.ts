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
