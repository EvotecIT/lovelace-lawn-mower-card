/** Own one mower's management draft and the lifetime of its asynchronous work. */
import type { HomeAssistant } from "./card-config";
import type { MowingAutomationStatus } from "./mowing-automation";
import type { ScheduleDialogActions, ScheduleDialogState } from "./mowing-automation-panel";
import {
  MENU_STEP, readAutomationSteps, sameSections, saveAutomationSteps, type FlowApi,
} from "./automation-options-flow.ts";
import {
  sameSchedule, scheduleDraft, scheduleProblems, scheduleUpdateMessage,
  withBlock, withBlockTime, withoutBlock, type ScheduleDraft,
} from "./schedule-editor.ts";
import { acquireMowerMutation, releaseMowerMutation } from "./mower-mutation-lock.ts";

type DialogContext = {
  hass: () => HomeAssistant;
  entityId: () => string | undefined;
  automation: () => MowingAutomationStatus | undefined;
  changed: (state: ScheduleDialogState | undefined) => void;
  savedMessage: () => string;
  openHelper: (entityId: string) => void;
};

type Session = {
  entityId: string;
  entryId: string;
  hass: HomeAssistant;
  userId?: string;
};

export class AutomationDialogController {
  private session?: Session;
  private state?: ScheduleDialogState;
  private scheduleRead = 0;

  private context: DialogContext;

  constructor(context: DialogContext) { this.context = context; }

  close = (): void => {
    this.session = undefined;
    this.publish(undefined);
  };

  /** Drop results after a card, account, connection or mower change. */
  reconcile(): void {
    if (this.session && !this.current(this.session)) this.close();
  }

  private current(session: Session): boolean {
    const hass = this.context.hass();
    return this.session === session && this.context.entityId() === session.entityId &&
      this.context.automation()?.entryId === session.entryId &&
      hass.connection === session.hass.connection && hass.user?.id === session.userId &&
      hass.user?.is_admin === true;
  }

  private publish(state: ScheduleDialogState | undefined): void {
    this.state = state;
    this.context.changed(state);
  }

  async open(automation: MowingAutomationStatus): Promise<void> {
    this.close();
    const hass = this.context.hass();
    const entityId = this.context.entityId();
    if (!hass.user?.is_admin) { this.publish({ status: "readonly" }); return; }
    if (!entityId || !automation.scheduleEntity) {
      this.publish({ status: "error", error: "no schedule" }); return;
    }
    const session = { entityId, entryId: automation.entryId, hass, userId: hass.user.id };
    this.session = session;
    this.publish({ status: "loading", optionsStatus: "loading" });
    void this.loadOptions(session);
    await this.loadSchedule(session, automation.scheduleEntity);
  }

  private api(session: Session): FlowApi | undefined {
    const api = session.hass.callApi?.bind(session.hass);
    return api ? (method, path, data) => {
      // Always allow cleanup of a flow opened by this session.
      if (method !== "DELETE" && !this.current(session)) throw new Error("Dialog closed");
      return api(method, path, data);
    } : undefined;
  }

  private async loadOptions(session: Session): Promise<void> {
    try {
      const api = this.api(session);
      if (!api) throw new Error("callApi");
      await Promise.all(["options", "selector"].map(category =>
        session.hass.loadBackendTranslation?.(category, "dreame_lawn_mower")));
      const options = await readAutomationSteps(api, session.entryId);
      if (this.current(session) && this.state) this.publish({
        ...this.state, options, optionsOriginal: options, optionsStatus: "ready",
      });
    } catch {
      if (this.current(session) && this.state) this.publish({ ...this.state, optionsStatus: "unavailable" });
    }
  }

  private async loadSchedule(session: Session, schedule: string): Promise<void> {
    const read = ++this.scheduleRead;
    if (!this.current(session) || !this.state) return;
    this.publish({ ...this.state, status: "loading", draft: undefined, original: undefined, error: undefined });
    try {
      const entry = await session.hass.callWS<{ unique_id?: unknown }>({
        type: "config/entity_registry/get", entity_id: schedule,
      });
      if (!this.current(session) || read !== this.scheduleRead) return;
      const items = await session.hass.callWS<unknown[]>({ type: "schedule/list" });
      const draft = scheduleDraft((Array.isArray(items) ? items : [])
        .find(item => (item as { id?: unknown })?.id === entry?.unique_id));
      if (!this.current(session) || read !== this.scheduleRead || !this.state) return;
      this.publish(draft
        ? { ...this.state, status: "ready", draft, original: draft }
        : { ...this.state, status: "error", error: schedule });
    } catch (error) {
      if (this.current(session) && read === this.scheduleRead && this.state) this.publish({
        ...this.state, status: "error", error: String(error),
      });
    }
  }

  actions(): ScheduleDialogActions {
    const edit = (change: (draft: ScheduleDraft) => ScheduleDraft) => {
      if (this.state?.draft && this.state.status !== "saving") this.publish({
        ...this.state, status: "ready", error: undefined, draft: change(this.state.draft),
      });
    };
    return {
      close: this.close,
      addBlock: day => edit(draft => withBlock(draft, day)),
      removeBlock: (day, index) => edit(draft => withoutBlock(draft, day, index)),
      setTime: (day, index, end, value) => edit(draft => withBlockTime(draft, day, index, end, value)),
      openHelper: () => {
        const schedule = this.selectedSchedule();
        this.close();
        if (schedule) this.context.openHelper(schedule);
      },
      setTab: tab => { if (this.state) this.publish({ ...this.state, tab }); },
      setOptions: (stepId, data) => {
        if (!this.session || !this.state?.options || this.state.status === "saving") return;
        const previous = this.selectedSchedule();
        this.publish({ ...this.state, optionsMessage: undefined,
          options: this.state.options.map(section => section.stepId === stepId
            ? { ...section, data: { ...data }, errors: undefined } : section),
        });
        const schedule = this.selectedSchedule();
        if (stepId === MENU_STEP && schedule !== previous) {
          this.scheduleRead++;
          if (schedule) void this.loadSchedule(this.session, schedule);
          else this.publish({ ...this.state!, draft: undefined, original: undefined, status: "error", error: "no schedule" });
        }
      },
      save: () => this.save(),
    };
  }

  private selectedSchedule(): string | undefined {
    const menu = this.state?.options?.find(section => section.stepId === MENU_STEP);
    const selected = menu?.data.schedule_entity;
    return typeof selected === "string" ? selected : menu ? undefined : this.context.automation()?.scheduleEntity;
  }

  private async save(): Promise<void> {
    const session = this.session;
    let state = this.state;
    if (!session || !this.current(session) || !state || state.status === "saving" ||
      state.status === "loading" || state.optionsStatus === "loading" ||
      (state.draft && scheduleProblems(state.draft).length)) return;
    const lock = acquireMowerMutation(session.entityId, "automation_options");
    if (!lock) return;
    this.publish({ ...state, status: "saving" });
    try {
      if (state.draft && state.original && !sameSchedule(state.draft, state.original)) {
        await session.hass.callWS(scheduleUpdateMessage(state.draft));
        state = { ...state, original: state.draft };
      }
      if (!this.current(session)) return;
      const api = this.api(session);
      if (api && state.options && !sameSections(state.options, state.optionsOriginal)) {
        const enabled = this.context.automation()!.enabled;
        const saved = await saveAutomationSteps(api, session.entryId, state.options, enabled,
          () => this.current(session) && this.context.automation()?.enabled === enabled);
        state = saved.ok
          ? { ...state, optionsOriginal: state.options, optionsMessage: this.context.savedMessage() }
          : { ...state, tab: `step:${saved.stepId}`, options: state.options.map(section =>
            section.stepId === saved.stepId ? { ...section, errors: saved.errors } : section) };
      }
      if (this.current(session)) this.publish({ ...state, status: "ready", error: undefined });
    } catch (error) {
      if (this.current(session)) this.publish({ ...state, status: "error", error: String(error) });
    } finally {
      releaseMowerMutation(session.entityId, lock);
    }
  }
}
