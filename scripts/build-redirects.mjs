import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const RESERVED = new Set([
  "/",
  "/insights",
  "/projects",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/editorial-policy",
  "/disclaimer",
  "/404",
  "/rss.xml",
]);

export function buildRedirectLines(routes) {
  return [...new Set(routes)]
    .filter(
      (route) =>
        typeof route === "string" &&
        route.startsWith("/") &&
        !route.includes("*") &&
        !RESERVED.has(route),
    )
    .sort()
    .map((route) => {
      const targetPath = route.endsWith(".html") ? route.slice(0, -5) : route;
      return `${route} https://lotto.simonsynapse.net${targetPath} 301`;
    });
}

async function main() {
  const projectRoot = fileURLToPath(new URL("../", import.meta.url));
  const dataPath = resolve(projectRoot, "data/legacy-routes.json");
  const outputPath = resolve(projectRoot, "public/_redirects");
  const data = JSON.parse(await readFile(dataPath, "utf8"));
  const lines = buildRedirectLines(data.routes ?? []);
  const output = lines.length > 0 ? `${lines.join("\n")}\n` : "";

  await writeFile(outputPath, output, "utf8");
  console.log(`Generated ${lines.length} explicit legacy redirect(s).`);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
