export type PublishableEntry = {
  id: string;
  data: {
    draft: boolean;
    publishedAt: Date;
  };
};

const taipeiCalendarDateFormatter = new Intl.DateTimeFormat("en-US", {
  calendar: "iso8601",
  day: "2-digit",
  month: "2-digit",
  numberingSystem: "latn",
  timeZone: "Asia/Taipei",
  year: "numeric",
});

// Content publication dates are Asia/Taipei calendar days, not UTC instants.
function taipeiCalendarDate(value: Date): string {
  const parts = Object.fromEntries(
    taipeiCalendarDateFormatter
      .formatToParts(value)
      .filter(({ type }) => type !== "literal")
      .map(({ type, value: partValue }) => [type, partValue] as const),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function selectVisibleEntries<T extends PublishableEntry>(
  entries: T[],
  options: { showDrafts: boolean; now?: Date },
): T[] {
  const now = options.now ?? new Date();
  const today = taipeiCalendarDate(now);
  return entries.filter(
    (entry) =>
      taipeiCalendarDate(entry.data.publishedAt) <= today &&
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
