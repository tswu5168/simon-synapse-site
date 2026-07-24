import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_ORIGIN = "https://simonsynapse.net";
const LEGACY_ORIGINS = new Set([
  ROOT_ORIGIN,
  "https://lotto.simonsynapse.net",
]);
const SITEMAP_CANDIDATES = [
  `${ROOT_ORIGIN}/sitemap-index.xml`,
  `${ROOT_ORIGIN}/sitemap.xml`,
];

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

export function extractLocations(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) =>
    decodeXml(match[1].trim()),
  );
}

export function extractLegacyPathname(value) {
  try {
    const url = new URL(value);
    return LEGACY_ORIGINS.has(url.origin) ? url.pathname : undefined;
  } catch {
    return undefined;
  }
}

async function fetchXml(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "Simon-Synapse-Legacy-Route-Audit/1.0" },
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }
  return response.text();
}

async function routesFromSitemap(xml) {
  const locations = extractLocations(xml);
  if (!/<sitemapindex[\s>]/i.test(xml)) {
    return locations.map(extractLegacyPathname).filter(Boolean);
  }

  const routes = [];
  for (const location of locations) {
    const childUrl = new URL(location);
    if (childUrl.origin !== ROOT_ORIGIN) continue;
    const childXml = await fetchXml(childUrl);
    routes.push(
      ...extractLocations(childXml).map(extractLegacyPathname).filter(Boolean),
    );
  }
  return routes;
}

export async function auditLegacyRoutes() {
  const failures = [];

  for (const candidate of SITEMAP_CANDIDATES) {
    try {
      const xml = await fetchXml(candidate);
      const routes = [
        ...new Set(await routesFromSitemap(xml)),
      ].sort();
      if (routes.length === 0) {
        failures.push(`${candidate} returned zero root-domain routes`);
        continue;
      }
      return {
        capturedAt: new Date().toISOString(),
        source: candidate,
        routes,
      };
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  throw new Error(
    `Legacy route audit found no routes; existing data was not overwritten.\n${failures.join("\n")}`,
  );
}

async function main() {
  const projectRoot = fileURLToPath(new URL("../", import.meta.url));
  const outputPath = resolve(projectRoot, "data/legacy-routes.json");
  const previous = await readFile(outputPath, "utf8");

  try {
    const result = await auditLegacyRoutes();
    await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
    console.log(
      `Captured ${result.routes.length} route(s) from ${result.source}.`,
    );
  } catch (error) {
    await writeFile(outputPath, previous, "utf8");
    throw error;
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
