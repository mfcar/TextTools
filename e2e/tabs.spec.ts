import { expect, test } from '@playwright/test';
import { openApp } from './helpers';

test.describe('Tab context menu', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('pins a tab so it keeps a pin affordance', async ({ page }) => {
    const tabs = page.getByRole('toolbar', { name: 'Open documents' });
    await page.getByRole('button', { name: 'New document', exact: true }).click();
    await expect(tabs.getByRole('button', { name: 'Untitled 2', exact: true })).toBeVisible();

    await tabs.getByRole('button', { name: 'Untitled 2', exact: true }).click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Pin' }).click();

    await expect(page.locator('.workspace__tab--pinned')).toHaveCount(1);
  });

  test('duplicates a tab through the context menu', async ({ page }) => {
    const tabs = page.getByRole('toolbar', { name: 'Open documents' });
    await tabs.getByRole('button', { name: 'Untitled 1', exact: true }).click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Duplicate' }).click();

    await expect(tabs.getByRole('button', { name: 'Untitled 1 copy', exact: true })).toBeVisible();
  });

  test('finds and activates a document from the tab list dropdown', async ({ page }) => {
    await page.getByRole('button', { name: 'New document', exact: true }).click();
    await page.getByRole('button', { name: 'New document', exact: true }).click();

    await page.getByRole('button', { name: 'All documents' }).click();
    const panel = page.getByRole('dialog', { name: 'All documents' });
    await expect(panel).toBeVisible();

    await panel.getByRole('textbox', { name: 'Search documents' }).fill('Untitled 3');
    await panel.getByRole('button', { name: 'Untitled 3', exact: true }).click();

    await expect(panel).toBeHidden();
    await expect(
      page
        .getByRole('toolbar', { name: 'Open documents' })
        .getByRole('button', { name: 'Untitled 3', exact: true }),
    ).toHaveAttribute('aria-current', 'true');
  });
});
