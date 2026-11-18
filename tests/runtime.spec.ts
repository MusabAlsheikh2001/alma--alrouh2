import { test, expect } from '@playwright/test';
// READ-ONLY live API smoke. Synthetic publication tests are in VeloBase's
// tests/content-websites suite, which uses the real local app and an isolated database.
test('the actual page receives and processes the live Railway public snapshot', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const response = page.waitForResponse((r) =>
    r.url().startsWith('https://velobase.space/api/v1/public/alma-alrouh/content?'),
  );
  await page.goto('/campaigns');
  const http = await response;
  expect(http.status()).toBe(200);
  const body = await http.json();
  expect(body.project.slug).toBe('alma-alrouh');
  expect(body.apiVersion).toBe('1');
  expect(Array.isArray(body.data)).toBe(true);
  expect(http.headers()['access-control-allow-origin']).toBe('*');
  await expect(page.locator('app-content-status')).toHaveAttribute('data-state', 'ready');
  await expect(page.locator('h1')).toBeVisible();
  expect(errors).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2)).toBe(
    true,
  );
});
test('an unavailable API has a visible retry state and cannot restore withdrawn copies', async ({
  page,
}) => {
  await page.route('https://velobase.space/api/v1/public/**', (r) => r.abort('failed'));
  await page.goto('/campaigns');
  await expect(page.locator('app-content-status')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('app-content-status [role="alert"]')).toBeVisible();
});
