import { expect, test } from '@playwright/test';
import { openApp, typeInEditor } from './helpers';

test.describe('Document actions', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
    await typeInEditor(page, 'copy and download me');
  });

  test('copies the document text and confirms via snackbar', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.getByRole('button', { name: 'Copy text' }).click();
    await expect(page.getByText('Copied to clipboard.')).toBeVisible();
  });

  test('downloads the document as a .txt file named after the tab', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download as text file' }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('Untitled 1.txt');
  });
});
