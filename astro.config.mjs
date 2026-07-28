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
  devToolbar: {
    enabled: false,
  },
  vite: {
    build: {
      // Three.js 場景約 552 kB minified、138 kB gzip；保留 600 kB 回歸上限。
      chunkSizeWarningLimit: 600,
    },
  },
  trailingSlash: "never",
});
