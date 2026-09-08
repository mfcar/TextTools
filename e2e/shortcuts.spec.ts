import { expect, test } from '@playwright/test';
import { openApp } from './helpers';

test.describe('Keyboard shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('opens the shortcuts help dialog with Ctrl+/', async ({ page }) => {
    await page.keyboard.press('ControlOrMeta+/');
    const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Open the command palette')).toBeVisible();

    await dialog.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toBeHidden();
  });

  test('renames the active document with F2', async ({ page }) => {
    await page.keyboard.press('F2');
    const input = page.getByRole('textbox', { name: 'Rename Untitled 1' });
    await expect(input).toBeVisible();

    await input.fill('Renamed');
    await input.press('Enter');
    await expect(
      page
        .getByRole('toolbar', { name: 'Open documents' })
        .getByRole('button', { name: 'Renamed', exact: true }),
    ).toBeVisible();
  });
});
