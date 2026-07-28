export type IndexedEntity = {
  state: string;
  attributes?: Record<string, unknown>;
};

export type EntityIndex<T extends IndexedEntity> = {
  ids: readonly string[];
  entries: readonly (readonly [string, T])[];
  byDomain(domain: string): readonly string[];
};

const indexes = new WeakMap<object, EntityIndex<IndexedEntity>>();

export function entityIndex<T extends IndexedEntity>(
  states: Record<string, T>,
): EntityIndex<T> {
  const existing = indexes.get(states);
  if (existing) {
    return existing as EntityIndex<T>;
  }
  const ids = Object.keys(states).sort();
  const entries = ids.map(
    (entityId) => [entityId, states[entityId]] as const,
  );
  const domains = new Map<string, string[]>();
  for (const entityId of ids) {
    const separator = entityId.indexOf(".");
    const domain = separator >= 0 ? entityId.slice(0, separator) : "";
    const current = domains.get(domain);
    if (current) {
      current.push(entityId);
    } else {
      domains.set(domain, [entityId]);
    }
  }
  const index: EntityIndex<T> = {
    ids,
    entries,
    byDomain: (domain) => domains.get(domain) || [],
  };
  indexes.set(states, index as EntityIndex<IndexedEntity>);
  return index;
}
