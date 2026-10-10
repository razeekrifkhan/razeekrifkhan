// Test an extracted review archive served beneath a folder, not at the site root.
import { chromium, expect } from '@playwright/test';
import { readdir, readFile } from 'node:fs/promises';
const folder = process.env.REVIEW_DIR || '/tmp/Victoria review';
const base = process.env.REVIEW_URL || 'http://127.0.0.1:4330/Victoria%20review/';
const pages = (await readdir(folder, { recursive: true })).filter(p => p.endsWith('.html'));
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const failures = [];
    page.on('pageerror', e => failures.push(e.message));
    page.on('requestfailed', r => failures.push(r.url()));
    page.on('response', r => { if (r.status() >= 400) failures.push(r.url()); });
    for (const path of pages) {
      await page.goto(base + path);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => [...document.images].every(i => i.complete && i.naturalWidth > 0))).toBe(true);
      expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain('DM Sans');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const url of await page.locator('a[href]').evaluateAll(nodes => nodes.map(n => n.href))) {
        if (url.startsWith(base)) expect((await page.request.get(url)).ok(), url).toBe(true);
      }
    }
    await page.goto(base + 'index.html');
    await page.screenshot({ path: `docs/screenshots/portable-review-${width}.png`, fullPage: true });
    if (width === 390) {
      await page.getByRole('button', { name: 'Open navigation' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toBeHidden();
    }
    await page.goto(base + 'services/index.html');
    await page.getByRole('button', { name: 'Hotels & hospitality', exact: true }).click();
    await expect(page.locator('[data-role-sector]:visible')).toHaveCount(3);
    await page.locator('[data-role-sector="hospitality"]').filter({ hasText: 'Chef' }).click();
    await expect(page.getByLabel('Role or trade')).toHaveValue('Chef');
    await page.getByRole('button', { name: 'Prepare my enquiry' }).click();
    await expect(page.locator('#form-errors')).toBeVisible();
    await page.getByLabel('Company or employer name').fill('Review Company');
    await page.getByLabel('Your name', { exact: false }).fill('Reviewer');
    await page.getByLabel('Your email').fill('review@example.com');
    await page.getByLabel('Number of people').fill('8');
    await page.getByLabel('Work location').fill('Colombo');
    await page.locator('#consent').check();
    await page.getByRole('button', { name: 'Prepare my enquiry' }).click();
    await expect(page.locator('#enquiry-review')).toBeVisible();
    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download brief' }).click();
    expect(await readFile(await (await downloaded).path(), 'utf8')).toContain('Review Company');
    expect(failures).toEqual([]);
    console.log(`${width}px: ${pages.length} pages, assets, links, layout, filters, prefill, validation and download passed`);
    await page.close();
  }
} finally { await browser.close(); }
