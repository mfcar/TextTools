import { expect, test } from '@playwright/test';
import { openApp } from './helpers';

test.describe('Multi-tab documents', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('creates, switches, renames and closes tabs', async ({ page }) => {
    const tabs = page.getByRole('toolbar', { name: 'Open documents' });

    await page.getByRole('button', { name: 'New document' }).click();
    await expect(tabs.getByRole('button', { name: 'Untitled 2', exact: true })).toBeVisible();

    await tabs.getByRole('button', { name: 'Untitled 1', exact: true }).click();
    await expect(tabs.getByRole('button', { name: 'Untitled 1', exact: true })).toHaveAttribute(
      'aria-current',
      'true',
    );

    await tabs.getByRole('button', { name: 'Untitled 1', exact: true }).dblclick();
    const input = page.getByRole('textbox', { name: 'Rename Untitled 1' });
    await input.fill('Notes');
    await input.press('Enter');
    await expect(tabs.getByRole('button', { name: 'Notes', exact: true })).toBeVisible();

    await tabs.getByRole('button', { name: 'Close Notes' }).click();
    await expect(tabs.getByRole('button', { name: 'Notes', exact: true })).toBeHidden();
    await expect(tabs.getByRole('button', { name: 'Untitled 2', exact: true })).toBeVisible();
  });
});
