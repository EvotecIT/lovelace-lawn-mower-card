import assert from "node:assert/strict";
import test from "node:test";

import {
  acquireMowerMutation,
  currentMowerMutation,
  releaseMowerMutation,
  subscribeMowerMutations,
} from "../src/mower-mutation-lock.ts";

test("mower mutation locks are shared across card instances", () => {
  const entityId = "lawn_mower.shared_lock_test";
  const notifications: string[] = [];
  const unsubscribe = subscribeMowerMutations((changedEntityId) => {
    notifications.push(changedEntityId);
  });

  try {
    const firstOwner = acquireMowerMutation(entityId, "pause");
    assert.ok(firstOwner);
    assert.equal(currentMowerMutation(entityId), "pause");
    assert.equal(acquireMowerMutation(entityId, "dock"), undefined);

    releaseMowerMutation(entityId, Symbol("not-the-owner"));
    assert.equal(currentMowerMutation(entityId), "pause");

    releaseMowerMutation(entityId, firstOwner);
    assert.equal(currentMowerMutation(entityId), undefined);
    assert.deepEqual(notifications, [entityId, entityId]);
  } finally {
    unsubscribe();
  }
});
