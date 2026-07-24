import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://simonsynapse.net",
  output: "static",
  integrations: [sitemap()],
  markdown: {
    processor: unified(),
  },
  trailingSlash: "never",
});
