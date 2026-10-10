import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

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

test("all built pages render, have metadata, valid local links and no overflow or runtime errors", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  const failed: string[] = [];
  const checked = new Set<string>();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) failed.push(response.url());
  });
  for (const route of routes) {
    expect((await page.goto(route))?.status(), route).toBe(200);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page).toHaveTitle(/Victoria Foreign Employment/);
    expect(
      await page.locator('meta[name="description"]').getAttribute("content"),
    ).toBeTruthy();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      route,
    ).toBeTruthy();
    expect(
      await page
        .locator("img")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              image instanceof HTMLImageElement &&
              image.complete &&
              image.naturalWidth > 0,
          ),
        ),
      route,
    ).toBeTruthy();
    const links = await page
      .locator('a[href^="/"]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")!));
    for (const link of links) {
      const url = new URL(link, "http://127.0.0.1:4322");
      if (!checked.has(url.pathname)) {
        const response = await request.get(url.pathname);
        expect(response.status(), link).toBe(200);
        checked.add(url.pathname);
      }
      if (url.hash) {
        const response = await request.get(url.pathname);
        expect(await response.text()).toContain(`id="${url.hash.slice(1)}"`);
      }
    }
  }
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
});

test("WCAG A/AA automated checks on every page", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of routes) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      results.violations,
      `${route}: ${JSON.stringify(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
    ).toEqual([]);
  }
});

test("role filters update results and prefill the correct enquiry", async ({
  page,
}) => {
  await page.goto("/services/#roles");
  await page
    .getByRole("button", { name: "Hotels & hospitality", exact: true })
    .click();
  await expect(page.locator("[data-role-sector]:visible")).toHaveCount(3);
  await expect(page.getByRole("status")).toHaveText("3 role examples shown");
  await page
    .locator('[data-role-sector="hospitality"]')
    .filter({ hasText: "Chef" })
    .click();
  await expect(page.getByLabel("Area of recruitment")).toHaveValue(
    "hospitality",
  );
  await expect(page.getByLabel("Role or trade")).toHaveValue("Chef");
});

async function fillBrief(page: import("@playwright/test").Page) {
  await page.getByLabel("Company or employer name").fill("Example Hotel");
  await page.getByLabel("Your name", { exact: false }).fill("Test Employer");
  await page.getByLabel("Your email").fill("employer@example.com");
  await page.getByLabel("Area of recruitment").selectOption("hospitality");
  await page.getByLabel("Role or trade").fill("Kitchen Helper");
  await page.getByLabel("Number of people").fill("8");
  await page.getByLabel("Work location").fill("Colombo");
  await page.locator("#consent").check();
}

test("invalid input is explained, brief is reviewed without sending, and drafts use accurate details", async ({
  page,
}) => {
  await page.goto("/contact/");
  await page.getByRole("button", { name: "Prepare my enquiry" }).click();
  await expect(page.locator("#form-errors")).toBeFocused();
  await expect(page.locator('[aria-invalid="true"]')).toHaveCount(8);
  await fillBrief(page);
  await page.getByLabel("Your email").fill("invalid-email");
  await page.getByLabel("Number of people").fill("0");
  await page.getByRole("button", { name: "Prepare my enquiry" }).click();
  await expect(page.locator("#email-error")).toHaveText(
    "Please enter a valid email address.",
  );
  await expect(page.locator("#headcount-error")).toContainText("whole number");
  await page.getByLabel("Your email").fill("employer@example.com");
  await page.getByLabel("Number of people").fill("8");
  const sent: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST" || r.url().includes("wa.me")) sent.push(r.url());
  });
  await page.getByRole("button", { name: "Prepare my enquiry" }).click();
  await expect(page.locator("#enquiry-review")).toBeVisible();
  await expect(page.locator("#review-title")).toBeFocused();
  await expect(
    page.getByText("It hasn’t been sent yet.", { exact: false }),
  ).toBeVisible();
  const whatsapp = new URL(
    (await page.locator("#send-whatsapp").getAttribute("href"))!,
  );
  expect(whatsapp.hostname).toBe("wa.me");
  expect(whatsapp.pathname).toBe("/94743825222");
  expect(whatsapp.searchParams.get("text")).toContain("Number of people: 8");
  expect(whatsapp.searchParams.get("text")).toContain(
    "Recruitment area: Hotels & hospitality",
  );
  const email = (await page.locator("#send-email").getAttribute("href"))!;
  expect(email).toMatch(/^mailto:1ForeignEmployment@victoriagroup-co.com\?/);
  expect(decodeURIComponent(email)).toContain(
    "Company / employer: Example Hotel",
  );
  expect(sent).toEqual([]);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.getByRole("button", { name: "Edit details" }).click();
  await expect(page.locator("#company")).toHaveValue("Example Hotel");
  await expect(page.locator("#company")).toBeFocused();
});

test("brief download works and clipboard failure has a useful fallback", async ({
  page,
}) => {
  await page.goto("/contact/");
  await fillBrief(page);
  await page.getByRole("button", { name: "Prepare my enquiry" }).click();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download brief" }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe("victoria-workforce-enquiry.txt");
  expect(await readFile((await download.path())!, "utf-8")).toContain(
    "Role / trade: Kitchen Helper",
  );
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("denied");
        },
      },
    }),
  );
  await page.getByRole("button", { name: "Copy brief" }).click();
  await expect(page.getByRole("status")).toContainText("Copy is unavailable");
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => undefined },
    }),
  );
  await page.getByRole("button", { name: "Copy brief" }).click();
  await expect(page.getByRole("status")).toContainText("Brief copied");
});

test("navigation and FAQ work with a keyboard", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  if (testInfo.project.name.includes("mobile")) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Open navigation" }),
    ).toBeFocused();
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "For employers" })
      .click();
  } else
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "For employers" })
      .click();
  await expect(page).toHaveURL(/\/employers\//);
  const question = page
    .locator("summary")
    .filter({ hasText: "How long does recruitment take?" });
  await question.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("There is no standard timeline published", { exact: false }),
  ).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("There is no standard timeline published", { exact: false }),
  ).toBeHidden();
});

test("reduced motion leaves all content visible and query input is inert", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page
      .locator("[data-reveal]")
      .evaluateAll((nodes) =>
        nodes.every((n) => getComputedStyle(n).opacity === "1"),
      ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
  const payload = "<img src=x onerror=alert(1)>";
  await page.goto(
    `/contact/?sector=invalid&role=${encodeURIComponent(payload)}`,
  );
  await expect(page.locator("#role")).toHaveValue(payload);
  await expect(page.locator("#sector")).toHaveValue("");
  expect(await page.locator(".enquiry-panel img").count()).toBe(0);
});

test("content and contact paths are usable without JavaScript", async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: testInfo.project.use.viewport,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4322/services/");
  await expect(page.locator("[data-role-sector]")).toHaveCount(18);
  await page.goto("http://127.0.0.1:4322/contact/");
  await expect(
    page.getByText("The brief builder needs JavaScript.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator('.contact-method[href^="mailto:"]')).toBeVisible();
  await context.close();
});

test("unknown routes return the designed 404, review builds prevent indexing, and download resources exist", async ({
  page,
  request,
}) => {
  const response = await page.goto("/this-page-does-not-exist/");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toContainText("back on track");
  await page.goto("/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, follow",
  );
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /",
  );
  expect((await request.get("/images/social.jpg")).status()).toBe(200);
  expect(await (await request.get("/employer-checklist.txt")).text()).toContain(
    "Number of people:",
  );
});
