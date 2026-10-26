import assert from "node:assert/strict";
import { test } from "node:test";
import {
  initialData, readAutomationSteps, sameSections, saveAutomationSteps, submittedData,
  type FlowApi, type FlowSection,
} from "../src/automation-options-flow.ts";

const steps = {
  mowing_automation: [
    { type: "boolean", name: "enabled", required: true, default: true },
    { selector: { entity: { domain: ["schedule"] } }, name: "schedule_entity", required: true, default: "schedule.garden" },
  ],
  mowing_conditions: [
    { selector: { entity: {} }, name: "soil_entity", optional: true, description: { suggested_value: "" } },
    { selector: { entity: {} }, name: "permission_entity", optional: true, description: { suggested_value: "input_boolean.trial" } },
    { selector: { number: {} }, name: "wet_threshold", required: true, default: 65 },
    { selector: { number: {} }, name: "dry_threshold", required: true, default: 55 },
  ],
  mowing_review: [{ type: "boolean", name: "native_plans_disabled", required: true, default: true }],
};
const order = ["mowing_automation", "mowing_conditions", "mowing_review"] as const;

/** A fake options flow: menu, three forms, a dry/wet check, then create_entry. */
function fakeFlow() {
  const calls: Array<[string, string, Record<string, unknown> | undefined]> = [];
  let position = -1;
  let flows = 0;
  const api: FlowApi = async <T>(method: "POST" | "DELETE", path: string, data?: Record<string, unknown>) => {
    calls.push([method, path, data]);
    const form = (index: number, errors: Record<string, string> | null = null) => ({
      type: "form", flow_id: `f${flows}`, step_id: order[index], data_schema: steps[order[index]], errors,
    }) as T;
    if (method === "DELETE") return { message: "aborted" } as T;
    if (path.endsWith("/options/flow")) { flows += 1; position = -1; return { type: "menu", flow_id: `f${flows}` } as T; }
    if (data && "next_step_id" in data) { position = 0; return form(0); }
    if (order[position] === "mowing_conditions" && Number(data?.dry_threshold) >= Number(data?.wet_threshold)) {
      return form(position, { dry_threshold: "dry_threshold_below_wet" });
    }
    position += 1;
    return position < order.length ? form(position) : { type: "create_entry" } as T;
  };
  return { api, calls };
}

test("current values come from defaults and suggested values", () => {
  assert.deepEqual(initialData(steps.mowing_conditions as never), {
    permission_entity: "input_boolean.trial", wet_threshold: 65, dry_threshold: 55,
  });
});

test("reading walks every form, never submits the review step and aborts the flow", async () => {
  const { api, calls } = fakeFlow();
  const sections = await readAutomationSteps(api, "entry");
  assert.deepEqual(sections.map(section => section.stepId), [...order]);
  assert.equal(sections[2].data.native_plans_disabled, true);
  assert.ok(!calls.some(([, , data]) => data && "native_plans_disabled" in data));
  assert.deepEqual(calls.at(-1)?.slice(0, 2), ["DELETE", "config/config_entries/options/flow/f1"]);
});

test("saving replays the flow with edits and the switch's enabled state", async () => {
  const { api, calls } = fakeFlow();
  const sections = await readAutomationSteps(api, "entry");
  const edited: FlowSection[] = sections.map(section => section.stepId === "mowing_conditions"
    ? { ...section, data: { ...section.data, soil_entity: "sensor.soil", permission_entity: "" } } : section);
  assert.ok(!sameSections(sections, edited));
  assert.deepEqual(await saveAutomationSteps(api, "entry", edited, false), { ok: true });
  const posts = calls.filter(([method, path]) => method === "POST" && path.includes("/f2"));
  assert.deepEqual(posts[1][2], { enabled: false, schedule_entity: "schedule.garden" });
  assert.deepEqual(posts[2][2], { soil_entity: "sensor.soil", wet_threshold: 65, dry_threshold: 55 });
  assert.deepEqual(posts[3][2], { native_plans_disabled: true });
  assert.ok(!calls.some(([method, path]) => method === "DELETE" && path.endsWith("/f2")));
});

test("a refused step returns its errors and aborts without saving", async () => {
  const { api, calls } = fakeFlow();
  const sections = await readAutomationSteps(api, "entry");
  const bad = sections.map(section => section.stepId === "mowing_conditions"
    ? { ...section, data: { ...section.data, dry_threshold: 70 } } : section);
  assert.deepEqual(await saveAutomationSteps(api, "entry", bad, true), {
    ok: false, stepId: "mowing_conditions", errors: { dry_threshold: "dry_threshold_below_wet" },
  });
  assert.deepEqual(calls.at(-1)?.slice(0, 2), ["DELETE", "config/config_entries/options/flow/f2"]);
  assert.ok(!calls.some(([, , data]) => data && "native_plans_disabled" in data));
});

test("unknown fields are never submitted", () => {
  const section = { stepId: "x", schema: [{ name: "a" }], data: { a: 1, injected: 2, b: "" } } as FlowSection;
  assert.deepEqual(submittedData(section), { a: 1 });
});

test("a failure right after opening the flow still aborts it", async () => {
  const calls: string[] = [];
  const api: FlowApi = async <T>(method: "POST" | "DELETE", path: string) => {
    calls.push(`${method} ${path}`);
    if (method === "DELETE") return {} as T;
    if (path.endsWith("/options/flow")) return { type: "menu", flow_id: "f9" } as T;
    throw new Error("network");
  };
  await assert.rejects(readAutomationSteps(api, "entry"), /network/);
  assert.deepEqual(calls.at(-1), "DELETE config/config_entries/options/flow/f9");
});
