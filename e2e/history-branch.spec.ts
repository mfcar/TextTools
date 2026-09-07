import { expect, test } from '@playwright/test';
import { openApp, openPalette, typeInEditor } from './helpers';

async function applyUppercase(page: import('@playwright/test').Page): Promise<void> {
  await openPalette(page);
  await page.getByRole('combobox', { name: 'Search tools' }).fill('uppercase');
  await page
    .getByRole('option', { name: /Uppercase/ })
    .first()
    .click();
  await expect(page.locator('.cm-content')).toHaveText('HELLO');
}

test.describe('History sort & branch', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
    await typeInEditor(page, 'hello');
    await applyUppercase(page);
  });

  test('toggles the history sort order', async ({ page }) => {
    await page.getByRole('button', { name: 'Sort newest first' }).click();
    await expect(page.getByRole('button', { name: 'Sort oldest first' })).toBeVisible();
  });

  test('branches a history step into a new named document', async ({ page }) => {
    await page.getByRole('button', { name: 'Branch from Uppercase' }).click();

    const dialog = page.getByRole('dialog', { name: 'Branch into a new document' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('textbox', { name: 'Document name' }).fill('Branch A');
    await dialog.getByRole('button', { name: 'Create' }).click();

    await expect(
      page
        .getByRole('toolbar', { name: 'Open documents' })
        .getByRole('button', { name: 'Branch A', exact: true }),
    ).toBeVisible();
    await expect(page.locator('.cm-content')).toHaveText('HELLO');
  });
});
