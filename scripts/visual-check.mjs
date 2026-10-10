import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.CHECK_URL || "http://127.0.0.1:4322";
const routes = [
  "/",
  "/services/",
  "/services/skilled-construction/",
  "/services/site-support/",
  "/services/hospitality/",
  "/services/domestic-workers/",
  "/employers/",
  "/about/",
  "/contact/",
  "/privacy/",
  "/404.html",
];
const capture = new Map([
  ["1440:/", "home-desktop"],
  ["1440:/contact/", "contact-desktop"],
  ["1440:/about/", "about-desktop"],
  ["390:/", "home-mobile"],
  ["390:/services/", "services-mobile"],
  ["390:/contact/", "contact-mobile"],
  ["390:/services/hospitality/", "hospitality-mobile"],
  ["768:/employers/", "employers-tablet"],
  ["320:/", "home-narrow"],
  ["320:/contact/", "contact-narrow"],
]);
await mkdir("docs/screenshots", { recursive: true });
await mkdir("docs/reports", { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
  reducedMotion: "reduce",
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const results = [];
for (const width of [1440, 768, 390, 320]) {
  await page.setViewportSize({ width, height: width >= 768 ? 1000 : 844 });
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      images: [...document.images].every(
        (i) => i.complete && i.naturalWidth > 0,
      ),
    }));
    results.push({ route, ...result });
    const filename = capture.get(`${width}:${route}`);
    if (filename) {
      await page.screenshot({
        path: `docs/screenshots/${filename}.png`,
        fullPage: true,
      });
      if (route === "/")
        await page.screenshot({ path: `docs/screenshots/${filename}-top.png` });
    }
  }
}
await browser.close();
await writeFile(
  "docs/reports/responsive.json",
  JSON.stringify(results, null, 2),
);
const failed = results.filter((r) => r.scrollWidth > r.width || !r.images);
console.log(
  `${results.length} page / viewport combinations checked; ${failed.length} failures.`,
);
if (failed.length) {
  console.error(failed);
  process.exitCode = 1;
}
