import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { SITE } from "../config/site";
import { selectVisibleEntries, sortNewestFirst } from "../lib/content";

export async function GET(context: APIContext) {
  const entries = await getCollection("insights");
  const visible = sortNewestFirst(
    selectVisibleEntries(entries, {
      showDrafts: import.meta.env.PUBLIC_SHOW_DRAFTS === "true",
    }),
  );

  return rss({
    title: `${SITE.name}｜觀點與教學`,
    description: SITE.description,
    site: context.site ?? SITE.origin,
    customData: `<language>${SITE.locale}</language>`,
    items: visible.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.publishedAt,
      link: `/insights/${entry.id.replace(/\.(md|mdx)$/, "")}`,
    })),
  });
}
