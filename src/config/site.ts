export const SITE = {
  origin: "https://simonsynapse.net",
  name: "Simon Synapse",
  tagline: "創意遇見 AI，未來由此展開",
  author: "賽腦耶",
  description:
    "透過實用 AI 工具、資料研究與持續創作，建立可累積的數位資產。",
  disclaimer:
    "透過實用工具、資料研究與持續創作，建立可累積的數位資產。本站內容不構成投資、投注或收益保證。",
  githubUrl: "https://github.com/tswu5168",
  locale: "zh-Hant-TW",
  defaultSocialImage: "/images/og/simon-synapse-default.png",
} as const;

export const ADS = {
  publisherId: "pub-7384783799477371",
  clientId: "ca-pub-7384783799477371",
  enabled: import.meta.env.PUBLIC_ADS_ENABLED === "true",
} as const;

export const ROUTES_WITHOUT_ADS = new Set([
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
]);

export function isAdEligible(pathname: string, enabled = ADS.enabled): boolean {
  if (!enabled) return false;
  const normalized = pathname !== "/" ? pathname.replace(/\/$/, "") : pathname;
  if (ROUTES_WITHOUT_ADS.has(normalized)) return false;
  return /^\/(insights|projects)\/[^/]+$/.test(normalized);
}
