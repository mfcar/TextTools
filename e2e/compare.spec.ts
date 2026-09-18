import { expect, test } from '@playwright/test';
import { openApp, typeInEditor } from './helpers';

test.describe('Compare documents', () => {
  test('diffs the active document against another open document', async ({ page }) => {
    await openApp(page);
    await typeInEditor(page, 'line one\nline two');

    await page.getByRole('button', { name: 'New document' }).click();
    await typeInEditor(page, 'line one\nline changed');

    await page.getByRole('button', { name: 'Untitled 1', exact: true }).click();

    const compareButton = page.getByRole('button', { name: 'Compare document' });
    await expect(compareButton).toHaveAttribute('aria-pressed', 'false');
    await compareButton.click();
    await page.getByRole('menuitem', { name: 'With another document' }).click();
    await page.getByRole('menuitem', { name: 'Untitled 2', exact: true }).click();

    const merge = page.locator('.cm-mergeView');
    await expect(merge).toBeVisible();
    await expect(merge).toContainText('line two');
    await expect(merge).toContainText('line changed');
    await expect(page.locator('.cm-mergeView .cm-changedText').first()).toBeVisible();

    const closeButton = page.getByRole('button', { name: 'Close comparison' });
    await expect(closeButton).toHaveAttribute('aria-pressed', 'true');
    await closeButton.click();
    await expect(page.locator('.cm-mergeView')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Compare document' })).toBeVisible();
  });
});
