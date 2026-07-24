import { describe, expect, it } from "vitest";
import { buildRedirectLines } from "../../scripts/build-redirects.mjs";
import { extractLegacyPathname } from "../../scripts/audit-legacy-routes.mjs";

describe("legacy redirects", () => {
  it("redirects lottery content and preserves brand routes", () => {
    const lines = buildRedirectLines([
      "/articles/randomness",
      "/about",
      "/contact",
      "/privacy",
      "/faq",
    ]);

    expect(lines).toContain(
      "/articles/randomness https://lotto.simonsynapse.net/articles/randomness 301",
    );
    expect(lines).toContain("/faq https://lotto.simonsynapse.net/faq 301");
    expect(lines.join("\n")).not.toContain("/about ");
    expect(lines.join("\n")).not.toContain("/contact ");
    expect(lines.join("\n")).not.toContain("/privacy ");
  });

  it("accepts only the root and verified lottery origins", () => {
    expect(
      extractLegacyPathname("https://simonsynapse.net/guide-randomness.html"),
    ).toBe("/guide-randomness.html");
    expect(
      extractLegacyPathname(
        "https://lotto.simonsynapse.net/guide-randomness.html",
      ),
    ).toBe("/guide-randomness.html");
    expect(extractLegacyPathname("https://example.com/guide.html")).toBe(
      undefined,
    );
  });

  it("sends legacy html paths directly to their canonical lottery target", () => {
    expect(buildRedirectLines(["/faq.html"])).toEqual([
      "/faq.html https://lotto.simonsynapse.net/faq 301",
    ]);
  });
});
