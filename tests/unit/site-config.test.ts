import { describe, expect, it } from "vitest";
import { ADS, SITE, isAdEligible } from "../../src/config/site";

describe("site configuration", () => {
  it("locks approved brand copy", () => {
    expect(SITE.name).toBe("Simon Synapse");
    expect(SITE.tagline).toBe("用 AI 實現財富自由");
    expect(SITE.author).toBe("賽腦耶");
  });

  it("uses the approved publisher account", () => {
    expect(ADS.publisherId).toBe("pub-7384783799477371");
    expect(ADS.clientId).toBe("ca-pub-7384783799477371");
  });

  it("allows ads only on detail pages when enabled", () => {
    expect(isAdEligible("/insights/example", true)).toBe(true);
    expect(isAdEligible("/projects/example/", true)).toBe(true);
    expect(isAdEligible("/", true)).toBe(false);
    expect(isAdEligible("/privacy", true)).toBe(false);
    expect(isAdEligible("/insights/example", false)).toBe(false);
  });
});
