import { expect, test } from '@playwright/test';
import { openApp, typeInEditor } from './helpers';

test.describe('Multi-window reconcile', () => {
  test('reflects edits made in another window', async ({ context }) => {
    const first = await context.newPage();
    await openApp(first);
    await typeInEditor(first, 'from window one');
    await first.waitForTimeout(2500);

    const second = await context.newPage();
    await openApp(second);
    await expect(second.locator('.cm-content')).toContainText('from window one');

    await first.bringToFront();
    await typeInEditor(first, 'updated from window one');
    await first.waitForTimeout(2500);

    await second.bringToFront();
    await expect(second.locator('.cm-content')).toContainText('updated from window one');

    await first.close();
    await second.close();
  });
});
