import { expect, test } from '@playwright/test';
import { openApp, typeInEditor } from './helpers';

test.describe('Editor language', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('picks a language from the menu', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Editor language' });
    await expect(trigger).toContainText('Plain text');

    await trigger.click();
    await page.getByRole('menuitem', { name: 'JSON', exact: true }).click();

    await expect(trigger).toContainText('JSON');
  });

  test('detects the language from the content', async ({ page }) => {
    await typeInEditor(page, '{ "hello": "world" }');

    await page.getByRole('button', { name: 'Editor language' }).click();
    await page.getByRole('menuitem', { name: 'Detect from content' }).click();

    await expect(page.getByRole('button', { name: 'Editor language' })).toContainText('JSON');
  });
});
