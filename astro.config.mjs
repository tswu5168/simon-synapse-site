import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://simonsynapse.net",
  output: "static",
  integrations: [sitemap()],
  trailingSlash: "never",
});
