import { describe, expect, it } from "vitest";
import { selectVisibleEntries, sortNewestFirst } from "../../src/lib/content";

const entries = [
  { id: "older", data: { draft: false, publishedAt: new Date("2026-07-20") } },
  { id: "draft", data: { draft: true, publishedAt: new Date("2026-07-24") } },
  { id: "future", data: { draft: false, publishedAt: new Date("2026-08-01") } },
  { id: "newer", data: { draft: false, publishedAt: new Date("2026-07-23") } },
];

describe("content visibility", () => {
  it("excludes drafts and future entries in production", () => {
    const visible = selectVisibleEntries(entries, {
      showDrafts: false,
      now: new Date("2026-07-24T23:59:59+08:00"),
    });
    expect(visible.map((entry) => entry.id)).toEqual(["older", "newer"]);
  });

  it("shows drafts in preview but excludes future entries", () => {
    const visible = selectVisibleEntries(entries, {
      showDrafts: true,
      now: new Date("2026-07-24T23:59:59+08:00"),
    });
    expect(visible.map((entry) => entry.id)).toEqual(["older", "draft", "newer"]);
  });

  it("sorts newest first without mutating input", () => {
    expect(sortNewestFirst(entries).map((entry) => entry.id)).toEqual([
      "future",
      "draft",
      "newer",
      "older",
    ]);
    expect(entries[0].id).toBe("older");
  });
});
