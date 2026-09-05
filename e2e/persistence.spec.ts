import { expect, test } from '@playwright/test';
import { openApp, typeInEditor } from './helpers';

test.describe('Persistence', () => {
  test('restores documents after a reload', async ({ page }) => {
    await openApp(page);

    const tabs = page.getByRole('toolbar', { name: 'Open documents' });
    await typeInEditor(page, 'persist me');

    await tabs.getByRole('button', { name: 'Untitled 1', exact: true }).dblclick();
    const input = page.getByRole('textbox', { name: 'Rename Untitled 1' });
    await input.fill('Notes');
    await input.press('Enter');
    await expect(tabs.getByRole('button', { name: 'Notes', exact: true })).toBeVisible();

    await page.waitForTimeout(1200);
    await page.reload();

    await expect(tabs.getByRole('button', { name: 'Notes', exact: true })).toBeVisible();
    await expect(page.locator('.cm-content')).toHaveText('persist me');
  });
});
