type MutationLock = {
  key: string;
  token: symbol;
};

type MutationListener = (entityId: string) => void;

const mutationLocks = new Map<string, MutationLock>();
const mutationListeners = new Set<MutationListener>();

export function acquireMowerMutation(
  entityId: string,
  key: string,
): symbol | undefined {
  if (mutationLocks.has(entityId)) {
    return undefined;
  }
  const token = Symbol(key);
  mutationLocks.set(entityId, { key, token });
  notifyMutationListeners(entityId);
  return token;
}

export function currentMowerMutation(entityId: string): string | undefined {
  return mutationLocks.get(entityId)?.key;
}

export function releaseMowerMutation(entityId: string, token: symbol): void {
  if (mutationLocks.get(entityId)?.token !== token) {
    return;
  }
  mutationLocks.delete(entityId);
  notifyMutationListeners(entityId);
}

export function subscribeMowerMutations(
  listener: MutationListener,
): () => void {
  mutationListeners.add(listener);
  return () => mutationListeners.delete(listener);
}

function notifyMutationListeners(entityId: string): void {
  for (const listener of mutationListeners) {
    listener(entityId);
  }
}
