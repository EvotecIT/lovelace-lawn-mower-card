import assert from "node:assert/strict";
import { test } from "node:test";
import {
  sameSchedule, scheduleDraft, scheduleProblems, scheduleUpdateMessage, shortTime,
  withBlock, withBlockTime, withoutBlock,
} from "../src/schedule-editor.ts";

const item = {
  id: "tonte_essai", name: "Tonte essai", icon: "mdi:robot-mower",
  monday: [{ from: "10:45:00", to: "11:00:00" }],
  wednesday: [{ from: "13:00:00", to: "15:00:00", data: { zone: 6 } }, { from: "09:00:00", to: "12:00:00" }],
};

test("a Schedule helper becomes a draft and saves back unchanged", () => {
  const draft = scheduleDraft(item)!;
  assert.equal(draft.days.monday[0].from, "10:45:00");
  assert.deepEqual(draft.days.tuesday, []);
  const message = scheduleUpdateMessage(draft);
  assert.equal(message.type, "schedule/update");
  assert.equal(message.schedule_id, "tonte_essai");
  assert.equal(message.name, "Tonte essai");
  assert.equal(message.icon, "mdi:robot-mower");
  assert.deepEqual(message.wednesday, [
    { from: "09:00:00", to: "12:00:00" },
    { from: "13:00:00", to: "15:00:00", data: { zone: 6 } },
  ]);
  assert.deepEqual(message.sunday, []);
  assert.equal(shortTime("10:45:00"), "10:45");
});

test("unexpected helper data yields no draft", () => {
  assert.equal(scheduleDraft(undefined), undefined);
  assert.equal(scheduleDraft({ id: "x" }), undefined);
  assert.equal(scheduleDraft({ id: "x", name: "X", monday: "10:00" }), undefined);
  assert.equal(scheduleDraft({ id: "x", name: "X", monday: [{ from: "25:00:00", to: "26:00:00" }] }), undefined);
});

test("blocks can be added, edited and removed per day", () => {
  let draft = scheduleDraft(item)!;
  draft = withBlock(draft, "tuesday");
  assert.deepEqual(draft.days.tuesday, [{ from: "09:00:00", to: "12:00:00" }]);
  draft = withBlock(draft, "tuesday");
  assert.deepEqual(draft.days.tuesday[1], { from: "13:00:00", to: "16:00:00" });
  draft = withBlockTime(draft, "tuesday", 1, "to", "17:30");
  assert.equal(draft.days.tuesday[1].to, "17:30:00");
  draft = withBlockTime(draft, "tuesday", 1, "to", "00:00");
  assert.equal(draft.days.tuesday[1].to, "24:00:00");
  assert.equal(withBlockTime(draft, "tuesday", 1, "from", "nope"), draft);
  draft = withoutBlock(draft, "tuesday", 0);
  assert.deepEqual(draft.days.tuesday, [{ from: "13:00:00", to: "24:00:00" }]);
  const late = withBlock(withBlock(scheduleDraft({ id: "x", name: "X", friday: [{ from: "21:00:00", to: "23:30:00" }] })!, "friday"), "friday");
  assert.ok(late.days.friday.every(block => block.to <= "24:00:00"));
});

test("reversed and overlapping blocks are reported before saving", () => {
  let draft = scheduleDraft(item)!;
  assert.deepEqual(scheduleProblems(draft), []);
  draft = withBlockTime(draft, "monday", 0, "to", "10:00");
  assert.deepEqual(scheduleProblems(draft), [{ day: "monday", index: 0 }]);
  draft = withBlockTime(draft, "wednesday", 1, "to", "13:30");
  assert.deepEqual(scheduleProblems(draft), [
    { day: "monday", index: 0 }, { day: "wednesday", index: 0 }, { day: "wednesday", index: 1 },
  ]);
});

test("unchanged drafts compare equal regardless of block order", () => {
  const draft = scheduleDraft(item)!;
  const reordered = { ...draft, days: { ...draft.days, wednesday: [...draft.days.wednesday].reverse() } };
  assert.ok(sameSchedule(draft, reordered));
  assert.ok(!sameSchedule(draft, withBlock(draft, "sunday")));
});
