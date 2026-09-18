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
    await page.getByRole('button', { name: 'More history actions' }).click();
    await page.getByRole('menuitem', { name: 'Sort newest first' }).click();

    await page.getByRole('button', { name: 'More history actions' }).click();
    await expect(page.getByRole('menuitem', { name: 'Sort oldest first' })).toBeVisible();
  });

  test('branches a history step into a new named document', async ({ page }) => {
    await page.getByRole('button', { name: 'Actions for Uppercase' }).click();
    await page.getByRole('menuitem', { name: 'Branch into a separate document' }).click();

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

  test('opens a history row action menu with a right-click', async ({ page }) => {
    await page.locator('.history__row', { hasText: 'Uppercase' }).click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Branch into a separate document' }).click();

    await expect(page.getByRole('dialog', { name: 'Branch into a new document' })).toBeVisible();
  });

  test('keeps history rows within the sidebar without horizontal scroll', async ({ page }) => {
    const overflow = await page
      .locator('.history__scroll')
      .evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
