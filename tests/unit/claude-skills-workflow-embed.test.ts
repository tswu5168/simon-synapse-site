import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const articlePath = path.join(
  projectRoot,
  "src",
  "content",
  "insights",
  "claude-skills-prompt-workflow.md",
);
const headersPath = path.join(projectRoot, "public", "_headers");

describe("Claude Skills workflow embed", () => {
  it("permits only the same-origin learning asset to be framed", async () => {
    const [article, headers] = await Promise.all([
      readFile(articlePath, "utf8"),
      readFile(headersPath, "utf8"),
    ]);

    expect(article).toContain(
      'src="/learning/claude-skills-workflow/index.html"',
    );
    expect(headers).toMatch(
      /\/\*\r?\n(?:.*\r?\n)*?\s+X-Frame-Options: DENY/,
    );
    expect(headers).toMatch(
      /\/learning\/claude-skills-workflow\/\*\r?\n\s*! X-Frame-Options\r?\n\s*X-Frame-Options: SAMEORIGIN\r?\n\s*Content-Security-Policy: frame-ancestors 'self'/,
    );
  });
});
