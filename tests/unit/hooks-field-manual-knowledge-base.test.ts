import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const articlePath = path.join(
  projectRoot,
  "src",
  "content",
  "insights",
  "claude-code-hooks-field-manual.md",
);
const manualPath = path.join(
  projectRoot,
  "public",
  "learning",
  "claude-code-hooks",
  "index.html",
);

describe("Claude Code Hook knowledge entry", () => {
  it("connects the published learning article and its standalone field manual", async () => {
    const [article, manual] = await Promise.all([
      readFile(articlePath, "utf8"),
      readFile(manualPath, "utf8"),
    ]);

    expect(article).toContain("title: Claude Code Hook 實作手冊");
    expect(article).toContain("/learning/claude-code-hooks/");
    expect(article).toContain("https://code.claude.com/docs/en/hooks-guide");
    expect(article).toContain("https://code.claude.com/docs/en/hooks");
    expect(article).toContain(
      "https://code.claude.com/docs/en/debug-your-config",
    );

    expect(manual).toContain(
      '<link rel="canonical" href="https://simonsynapse.net/learning/claude-code-hooks/">',
    );
    expect(manual).toContain(
      'href="/insights/claude-code-hooks-field-manual/"',
    );
    expect(manual).toContain('<main id="manual-main">');
    expect(manual).toContain(
      'Handler 是教學上的名稱；正式 JSON 會將它寫入內層 `hooks` 陣列，並以 `type` 表示。',
    );
    expect(manual).not.toMatch(/<script[^>]+\ssrc=/i);
  });
});
