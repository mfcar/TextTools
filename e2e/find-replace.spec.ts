import { expect, test } from '@playwright/test';
import { openApp, typeInEditor } from './helpers';

test.describe('Find and replace', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
    await typeInEditor(page, 'foo bar foo baz');
  });

  test('opens the find panel from the toolbar button', async ({ page }) => {
    await expect(page.locator('.cm-search')).toBeHidden();
    await page.getByRole('button', { name: 'Find and replace' }).click();

    const panel = page.locator('.cm-search');
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('textbox', { name: 'Find' })).toBeVisible();
    await expect(panel.getByRole('textbox', { name: 'Replace' })).toBeVisible();
  });

  test('replaces all matches in the document', async ({ page }) => {
    await page.getByRole('button', { name: 'Find and replace' }).click();

    const panel = page.locator('.cm-search');
    await panel.getByRole('textbox', { name: 'Find' }).fill('foo');
    await panel.getByRole('textbox', { name: 'Replace' }).fill('qux');
    await panel.getByRole('button', { name: 'replace all' }).click();

    await expect(page.locator('.cm-content')).toContainText('qux bar qux baz');
  });

  test('opens the find panel with the keyboard shortcut', async ({ page }) => {
    await page.locator('.cm-content').click();
    await page.keyboard.press('ControlOrMeta+f');
    await expect(page.locator('.cm-search')).toBeVisible();
  });

  test('toggles the panel and reflects the active state on the Find button', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Find and replace' });

    await button.click();
    await expect(page.locator('.cm-search')).toBeVisible();
    await expect(button).toHaveAttribute('aria-pressed', 'true');

    await button.click();
    await expect(page.locator('.cm-search')).toBeHidden();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
  });
});
