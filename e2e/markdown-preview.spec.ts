import { expect, test } from '@playwright/test';
import { openApp, typeInEditor } from './helpers';

test.describe('Markdown preview', () => {
  test('renders sanitized Markdown and toggles back to the editor', async ({ page }) => {
    await openApp(page);
    await typeInEditor(page, '# Hello\n\nSome **bold** text.');

    await page.getByRole('button', { name: 'Editor language' }).click();
    await page.getByRole('menuitem', { name: 'Markdown', exact: true }).click();

    await page.getByRole('button', { name: 'Toggle Markdown preview' }).click();

    const preview = page.locator('.markdown-preview');
    await expect(preview.locator('h1')).toHaveText('Hello');
    await expect(preview.locator('strong')).toHaveText('bold');

    await page.getByRole('button', { name: 'Toggle Markdown preview' }).click();
    await expect(page.locator('.cm-content')).toBeVisible();
  });
});
