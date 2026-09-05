import { expect, test } from '@playwright/test';
import { openApp } from './helpers';

test.describe('Homepage', () => {
  test('boots and shows the brand, workspace and editor', async ({ page }) => {
    await openApp(page);

    await expect(page.locator('.shell__title')).toHaveText('TextTools');
    await expect(page.getByRole('toolbar', { name: 'Open documents' })).toBeVisible();
    await expect(page.getByRole('toolbar', { name: 'Document actions' })).toBeVisible();
  });
});
