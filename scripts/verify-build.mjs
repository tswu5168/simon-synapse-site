import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parseHTML } from "linkedom";

const DIST_DIR = path.resolve("dist");
const SITE_ORIGIN = "https://simonsynapse.net";
const REQUIRED_OUTPUTS = [
  "robots.txt",
  "sitemap-index.xml",
  "rss.xml",
  "ads.txt",
  "kakeya/interactive/index.html",
  "kakeya/immersive/index.html",
  "kakeya/learn/index.html",
  "projects/kakeya-3d-lab/index.html",
];
const ROUTES_WITHOUT_ADS = new Set([
  "/",
  "/insights",
  "/projects",
  "/kakeya/interactive",
  "/kakeya/immersive",
  "/kakeya/learn",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/editorial-policy",
  "/disclaimer",
  "/404",
]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(absolute)));
    else files.push(absolute);
  }
  return files;
}

function routeFromHtml(file) {
  const relative = path.relative(DIST_DIR, file).replaceAll("\\", "/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) {
    return `/${relative.slice(0, -"/index.html".length)}`;
  }
  return `/${relative.slice(0, -".html".length)}`;
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function loadRedirectRoutes() {
  const redirectsFile = path.join(DIST_DIR, "_redirects");
  if (!(await exists(redirectsFile))) return new Set();
  const text = await readFile(redirectsFile, "utf8");
  return new Set(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.split(/\s+/)[0]),
  );
}

async function resolvesToOutput(pathname, redirects) {
  if (redirects.has(pathname)) return true;
  const clean = decodeURIComponent(pathname).replace(/^\/+/, "");
  if (!clean) return exists(path.join(DIST_DIR, "index.html"));
  return (
    (await exists(path.join(DIST_DIR, clean))) ||
    (await exists(path.join(DIST_DIR, `${clean}.html`))) ||
    (await exists(path.join(DIST_DIR, clean, "index.html")))
  );
}

function fail(file, rule, detail) {
  const relative = path.relative(process.cwd(), file).replaceAll("\\", "/");
  throw new Error(`${relative}: ${rule}${detail ? ` — ${detail}` : ""}`);
}

function countDetailPages(files, section) {
  const prefix = `${section}/`;
  return files.filter((file) => {
    const relative = path.relative(DIST_DIR, file).replaceAll("\\", "/");
    return (
      relative.startsWith(prefix) &&
      relative.endsWith(".html") &&
      relative !== `${section}/index.html`
    );
  }).length;
}

const files = await walk(DIST_DIR);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const redirects = await loadRedirectRoutes();

for (const required of REQUIRED_OUTPUTS) {
  const file = path.join(DIST_DIR, required);
  if (!(await exists(file))) fail(file, "required-output", "missing");
}

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const { document } = parseHTML(html);
  const route = routeFromHtml(file);

  if (document.querySelectorAll("main").length !== 1) {
    fail(file, "main-landmark", "expected exactly one <main>");
  }
  const canonicals = document.querySelectorAll('link[rel="canonical"]');
  if (canonicals.length !== 1 || !canonicals[0].getAttribute("href")?.trim()) {
    fail(file, "canonical", "expected exactly one non-empty canonical URL");
  }
  if (!document.querySelector("title")?.textContent?.trim()) {
    fail(file, "title", "missing or empty");
  }
  if (!document.querySelector('meta[name="description"]')?.getAttribute("content")?.trim()) {
    fail(file, "meta-description", "missing or empty");
  }

  if (
    ROUTES_WITHOUT_ADS.has(route) &&
    (document.querySelector(".adsbygoogle") ||
      document.querySelector('script[src*="pagead2.googlesyndication.com"]'))
  ) {
    fail(file, "ads-exclusion", `AdSense markup found on ${route}`);
  }

  for (const image of document.querySelectorAll("img")) {
    if (!image.hasAttribute("alt")) {
      fail(file, "image-alt", `missing alt on ${image.getAttribute("src") ?? "image"}`);
    }
    const alt = image.getAttribute("alt")?.trim() ?? "";
    const decorative =
      image.getAttribute("role") === "presentation" ||
      image.getAttribute("aria-hidden") === "true" ||
      image.hasAttribute("data-decorative");
    if (!alt && !decorative) {
      fail(
        file,
        "image-alt",
        `empty alt requires decorative semantics on ${image.getAttribute("src") ?? "image"}`,
      );
    }
  }

  for (const anchor of document.querySelectorAll("a[href]")) {
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#")) continue;
    let url;
    try {
      url = new URL(href, new URL(route, SITE_ORIGIN));
    } catch {
      fail(file, "internal-link", `invalid href ${href}`);
    }
    if (url.origin !== SITE_ORIGIN) continue;
    if (!(await resolvesToOutput(url.pathname, redirects))) {
      fail(file, "internal-link", `${href} has no output or declared redirect`);
    }
  }
}

for (const [environmentName, section] of [
  ["EXPECTED_INSIGHTS", "insights"],
  ["EXPECTED_PROJECTS", "projects"],
]) {
  const expectedValue = process.env[environmentName];
  if (expectedValue === undefined) continue;
  const expected = Number.parseInt(expectedValue, 10);
  const actual = countDetailPages(htmlFiles, section);
  if (!Number.isInteger(expected) || expected < 0 || actual !== expected) {
    fail(
      DIST_DIR,
      "content-count",
      `${environmentName} expected ${expectedValue}, received ${actual}`,
    );
  }
}

console.log(`Build verification passed: ${htmlFiles.length} HTML files checked.`);
