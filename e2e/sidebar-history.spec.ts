import { expect, test } from '@playwright/test';
import { openApp, openPalette, typeInEditor } from './helpers';

test.describe('Sidebar & history', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('toggles the sidebar holding the history panel', async ({ page }) => {
    const history = page.getByRole('heading', { name: 'History' });
    await expect(history).toBeVisible();

    await page.getByRole('button', { name: 'Hide sidebar' }).click();
    await expect(history).toBeHidden();

    await page.getByRole('button', { name: 'Show sidebar' }).click();
    await expect(history).toBeVisible();
  });

  test('records an applied step and undoes it', async ({ page }) => {
    await typeInEditor(page, 'hello');

    await openPalette(page);
    await page.getByRole('combobox', { name: 'Search tools' }).fill('uppercase');
    await page
      .getByRole('option', { name: /Uppercase/ })
      .first()
      .click();
    await expect(page.locator('.cm-content')).toHaveText('HELLO');

    await expect(page.getByRole('button', { name: /Uppercase/ }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Undo last step' }).click();
    await expect(page.locator('.cm-content')).toHaveText('hello');

    await page.getByRole('button', { name: 'Redo step' }).click();
    await expect(page.locator('.cm-content')).toHaveText('HELLO');
  });
});
