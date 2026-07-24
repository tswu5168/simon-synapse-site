import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const outputPath = fileURLToPath(
  new URL("../public/images/og/simon-synapse-default.png", import.meta.url),
);

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="cyan" cx="0" cy="0" r="1" gradientTransform="translate(160 70) rotate(35) scale(620 420)">
      <stop stop-color="#58e6ff" stop-opacity="0.34"/>
      <stop offset="1" stop-color="#58e6ff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="violet" cx="0" cy="0" r="1" gradientTransform="translate(1040 120) rotate(145) scale(650 430)">
      <stop stop-color="#9b7bff" stop-opacity="0.38"/>
      <stop offset="1" stop-color="#9b7bff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="magenta" cx="0" cy="0" r="1" gradientTransform="translate(780 650) rotate(-100) scale(520 500)">
      <stop stop-color="#ff5fd2" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#ff5fd2" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="signal" x1="216" y1="0" x2="984" y2="0" gradientUnits="userSpaceOnUse">
      <stop stop-color="#58e6ff"/>
      <stop offset="0.52" stop-color="#9b7bff"/>
      <stop offset="1" stop-color="#ff5fd2"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#050816"/>
  <rect width="1200" height="630" fill="url(#cyan)"/>
  <rect width="1200" height="630" fill="url(#violet)"/>
  <rect width="1200" height="630" fill="url(#magenta)"/>
  <g opacity="0.12" stroke="#58e6ff">
    <path d="M0 105H1200M0 210H1200M0 315H1200M0 420H1200M0 525H1200"/>
    <path d="M100 0V630M300 0V630M500 0V630M700 0V630M900 0V630M1100 0V630"/>
  </g>
  <rect x="82" y="72" width="1036" height="486" rx="38" fill="#0b1020" fill-opacity="0.78" stroke="#8facef" stroke-opacity="0.34" stroke-width="2"/>
  <path d="M216 430H350L410 360L490 458L580 294L666 410L760 338L842 430H984" fill="none" stroke="url(#signal)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="600" y="245" fill="#f4f7ff" font-family="Arial, sans-serif" font-size="82" font-weight="800" text-anchor="middle" letter-spacing="4">SIMON SYNAPSE</text>
  <text x="600" y="315" fill="#c4cee7" font-family="Arial, sans-serif" font-size="34" font-weight="700" text-anchor="middle" letter-spacing="8">AI × DATA × BUILD</text>
</svg>`;

await mkdir(dirname(outputPath), { recursive: true });
await sharp(Buffer.from(svg)).png().toFile(outputPath);

const metadata = await sharp(outputPath).metadata();
if (metadata.width !== 1200 || metadata.height !== 630) {
  throw new Error(
    `Unexpected OG image dimensions: ${metadata.width} × ${metadata.height}`,
  );
}

console.log(`Generated ${outputPath} (${metadata.width} × ${metadata.height})`);
