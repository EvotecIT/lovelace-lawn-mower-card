/**
 * Drive the integration's own Mowing automation options flow from the card.
 *
 * The card never lists the wizard's fields: it shows the forms the flow
 * returns and submits them back, so the flow keeps every validation and the
 * card follows any field the integration adds.
 */

export type FlowField = Record<string, unknown> & { name: string };

export type FlowSection = {
  stepId: string;
  schema: FlowField[];
  data: Record<string, unknown>;
  errors?: Record<string, string>;
};

export type FlowApi = <T>(
  method: "POST" | "DELETE", path: string, data?: Record<string, unknown>,
) => Promise<T>;

type FlowResult = {
  type?: string;
  flow_id?: string;
  step_id?: string;
  data_schema?: unknown;
  errors?: Record<string, string> | null;
  menu_options?: unknown;
  reason?: string;
};

export type SaveResult = { ok: true } | { ok: false; stepId: string; errors: Record<string, string> };

const FLOW = "config/config_entries/options/flow";
const MENU_STEP = "mowing_automation";
/** The confirmation step: submitting it saves, so reading stops before it. */
export const REVIEW_STEP = "mowing_review";
/** The wizard's on/off field; the card's switch owns it. */
export const ENABLED_FIELD = "enabled";
const MAX_STEPS = 10;

function fields(schema: unknown): FlowField[] {
  return Array.isArray(schema)
    ? schema.filter((item): item is FlowField =>
      Boolean(item) && typeof item === "object" && typeof (item as FlowField).name === "string")
    : [];
}

/** Current values as the form shows them: defaults, then suggested values. */
export function initialData(schema: FlowField[]): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const field of schema) {
    const suggested = (field.description as Record<string, unknown> | undefined)?.suggested_value;
    const value = field.default !== undefined ? field.default : suggested;
    if (value !== undefined && value !== null && value !== "") data[field.name] = value;
  }
  return data;
}

/** Leave cleared optional fields out, as Home Assistant's own form does. */
export function submittedData(section: FlowSection): Record<string, unknown> {
  return Object.fromEntries(Object.entries(section.data)
    .filter(([name, value]) => value !== undefined && value !== null && value !== "" &&
      section.schema.some(field => field.name === name)));
}

async function begin(api: FlowApi, entryId: string): Promise<FlowResult> {
  const first = await api<FlowResult>("POST", FLOW, { handler: entryId });
  if (first.type === "menu") {
    return api<FlowResult>("POST", `${FLOW}/${first.flow_id}`, { next_step_id: MENU_STEP });
  }
  return first;
}

function failure(result: FlowResult): Error {
  return new Error(result.type === "abort" ? result.reason || "aborted" : `unexpected ${result.type ?? "reply"}`);
}

/** Every form of the flow with its current values; nothing is saved. */
export async function readAutomationSteps(api: FlowApi, entryId: string): Promise<FlowSection[]> {
  let result = await begin(api, entryId);
  const flowId = result.flow_id;
  const sections: FlowSection[] = [];
  try {
    while (result.type === "form" && result.step_id && sections.length < MAX_STEPS) {
      const schema = fields(result.data_schema);
      const section = { stepId: result.step_id, schema, data: initialData(schema) };
      sections.push(section);
      if (section.stepId === REVIEW_STEP) break;
      const next = await api<FlowResult>("POST", `${FLOW}/${result.flow_id}`, submittedData(section));
      if (next.type !== "form" || next.step_id === section.stepId) break;
      result = next;
      if (sections.some(item => item.stepId === result.step_id)) break;
    }
    if (!sections.length) throw failure(result);
    return sections;
  } finally {
    if (flowId) await api("DELETE", `${FLOW}/${flowId}`).catch(() => undefined);
  }
}

/**
 * Submit edited sections in order. The flow re-showing a step means it refused
 * it: the flow is aborted and that step's errors are returned.
 */
export async function saveAutomationSteps(
  api: FlowApi, entryId: string, sections: FlowSection[], enabled: boolean,
): Promise<SaveResult> {
  let result = await begin(api, entryId);
  let finished = false;
  try {
    for (const section of sections) {
      if (result.type !== "form" || result.step_id !== section.stepId) throw failure(result);
      const data = submittedData(section);
      if (section.schema.some(field => field.name === ENABLED_FIELD)) data[ENABLED_FIELD] = enabled;
      const next = await api<FlowResult>("POST", `${FLOW}/${result.flow_id}`, data);
      if (next.type === "form" && next.step_id === section.stepId) {
        return { ok: false, stepId: section.stepId, errors: next.errors ?? { base: "invalid" } };
      }
      result = next;
    }
    if (result.type !== "create_entry") throw failure(result);
    finished = true;
    return { ok: true };
  } finally {
    if (!finished && result.flow_id) {
      await api("DELETE", `${FLOW}/${result.flow_id}`).catch(() => undefined);
    }
  }
}

export function sameSections(first: FlowSection[] | undefined, second: FlowSection[] | undefined): boolean {
  const values = (sections?: FlowSection[]) => JSON.stringify((sections ?? []).map(submittedData));
  return values(first) === values(second);
}
