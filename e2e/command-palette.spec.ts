import { expect, test } from '@playwright/test';
import { openApp, openPalette, typeInEditor } from './helpers';

test.describe('Command palette', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
  });

  test('opens from the header button and closes on the scrim', async ({ page }) => {
    await openPalette(page);

    await page.getByRole('button', { name: 'Close command palette' }).click({
      position: { x: 5, y: 5 },
    });
    await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeHidden();
  });

  test('opens with the Ctrl+K hotkey and closes on Escape', async ({ page }) => {
    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeHidden();
  });

  test('searches and runs a tool against the active document', async ({ page }) => {
    await typeInEditor(page, 'hello world');

    await openPalette(page);
    await page.getByRole('combobox', { name: 'Search tools' }).fill('uppercase');
    await page
      .getByRole('option', { name: /Uppercase/ })
      .first()
      .click();

    await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeHidden();
    await expect(page.locator('.cm-content')).toHaveText('HELLO WORLD');
  });

  test('runs a parameterized tool through the two-stage form', async ({ page }) => {
    await typeInEditor(page, 'ab');

    await openPalette(page);
    await page.getByRole('combobox', { name: 'Search tools' }).fill('repeat');
    await page
      .getByRole('option', { name: /Repeat/ })
      .first()
      .click();

    const times = page.getByRole('spinbutton', { name: 'Times' });
    await expect(times).toBeVisible();
    await times.fill('3');
    await page.getByRole('button', { name: 'Run', exact: true }).click();

    await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeHidden();
    await expect(page.locator('.cm-content')).toHaveText('ababab');
  });
});
