import { expect, test } from '@playwright/test';
import { openApp } from './helpers';

test.describe('Theme', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  const colorScheme = (page: import('@playwright/test').Page) =>
    page.evaluate(() => document.documentElement.style.colorScheme);

  test('switches between dark and light', async ({ page }) => {
    await page.getByRole('button', { name: /Change theme/ }).click();
    await page.getByRole('menuitem', { name: 'Dark' }).click();
    await expect.poll(() => colorScheme(page)).toBe('dark');

    await page.getByRole('button', { name: /Change theme/ }).click();
    await page.getByRole('menuitem', { name: 'Light' }).click();
    await expect.poll(() => colorScheme(page)).toBe('light');
  });
});
