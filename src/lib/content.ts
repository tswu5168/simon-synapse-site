export type PublishableEntry = {
  id: string;
  data: {
    draft: boolean;
    publishedAt: Date;
  };
};

export function selectVisibleEntries<T extends PublishableEntry>(
  entries: T[],
  options: { showDrafts: boolean; now?: Date },
): T[] {
  const now = options.now ?? new Date();
  return entries.filter(
    (entry) =>
      entry.data.publishedAt.getTime() <= now.getTime() &&
      (options.showDrafts || !entry.data.draft),
  );
}

export function sortNewestFirst<T extends PublishableEntry>(entries: T[]): T[] {
  return [...entries].sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );
}

export function selectEntriesInOrder<T extends { id: string }>(
  entries: T[],
  orderedIds: readonly string[],
): T[] {
  const entriesById = new Map(
    entries.map((entry) => [entry.id.replace(/\.(md|mdx)$/, ""), entry]),
  );

  return orderedIds.map((id) => {
    const entry = entriesById.get(id);
    if (!entry) throw new Error(`Missing content entry: ${id}`);
    return entry;
  });
}
