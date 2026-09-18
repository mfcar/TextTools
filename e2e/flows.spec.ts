import { Page, expect, test } from '@playwright/test';
import { openApp, openPalette, typeInEditor } from './helpers';

async function applyUppercase(page: Page): Promise<void> {
  await openPalette(page);
  await page.getByRole('combobox', { name: 'Search tools' }).fill('uppercase');
  await page
    .getByRole('option', { name: /Uppercase/ })
    .first()
    .click();
}

async function saveHistoryAsFlow(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name: 'More history actions' }).click();
  await page.getByRole('menuitem', { name: 'Save as flow' }).click();
  const dialog = page.getByRole('dialog', { name: 'Save history as flow' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Flow name' }).fill(name);
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(dialog).toBeHidden();
}

async function openFlows(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Manage flows' }).click();
  await expect(page.getByRole('dialog', { name: 'Flows' })).toBeVisible();
}

test.describe('Flows', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
    await typeInEditor(page, 'hello');
    await applyUppercase(page);
    await expect(page.locator('.cm-content')).toHaveText('HELLO');
  });

  test('saves the current history as a flow', async ({ page }) => {
    await saveHistoryAsFlow(page, 'Shout');
    await openFlows(page);

    const dialog = page.getByRole('dialog', { name: 'Flows' });
    await expect(dialog.getByText('Shout')).toBeVisible();
    await expect(dialog.getByText('1 step', { exact: false })).toBeVisible();
  });

  test('moves focus between flows with the arrow keys', async ({ page }) => {
    await saveHistoryAsFlow(page, 'First');
    await typeInEditor(page, 'again');
    await applyUppercase(page);
    await saveHistoryAsFlow(page, 'Second');
    await openFlows(page);

    const items = page.locator('.flows__item');
    await items.first().click();
    await expect(items.first()).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(items.first()).toBeFocused();
  });

  test('runs a saved flow on the active document', async ({ page }) => {
    await saveHistoryAsFlow(page, 'Shout');
    await typeInEditor(page, 'world');
    await expect(page.locator('.cm-content')).toHaveText('world');

    await openFlows(page);
    await page.getByRole('button', { name: 'Run Shout' }).click();

    await expect(page.locator('.cm-content')).toHaveText('WORLD');
  });

  test('shows flow-applied steps as an expandable group in history', async ({ page }) => {
    await saveHistoryAsFlow(page, 'Shout');
    await typeInEditor(page, 'world');

    await openFlows(page);
    await page.getByRole('button', { name: 'Run Shout' }).click();
    await expect(page.locator('.cm-content')).toHaveText('WORLD');
    await page.getByRole('button', { name: 'Close' }).click();

    const group = page.locator('.history__group');
    await expect(group).toBeVisible();
    await expect(group).toContainText('Shout');
    await expect(page.locator('.history__step--child')).toHaveCount(0);

    await page.getByRole('button', { name: 'Expand Shout' }).click();
    await expect(page.locator('.history__step--child')).toHaveCount(1);
  });

  test('creates a flow from scratch with the tool picker', async ({ page }) => {
    await openFlows(page);
    await page.getByRole('button', { name: 'New flow' }).click();

    const editor = page.getByRole('dialog', { name: 'New flow' });
    await expect(editor).toBeVisible();
    await editor.getByRole('textbox', { name: 'Name' }).fill('From scratch');
    await editor.getByRole('button', { name: 'Add step' }).click();
    await editor.getByRole('textbox', { name: 'Search tools' }).fill('uppercase');
    await editor
      .getByRole('button', { name: /Uppercase/ })
      .first()
      .click();
    await editor.getByRole('button', { name: 'Create flow' }).click();
    await expect(editor).toBeHidden();

    const dialog = page.getByRole('dialog', { name: 'Flows' });
    await expect(dialog.getByText('From scratch')).toBeVisible();
    await expect(dialog.getByText('1 step', { exact: false })).toBeVisible();
  });

  test('asks for a flagged parameter upfront when running a flow', async ({ page }) => {
    await openFlows(page);
    await page.getByRole('button', { name: 'New flow' }).click();

    const editor = page.getByRole('dialog', { name: 'New flow' });
    await editor.getByRole('textbox', { name: 'Name' }).fill('Echo');
    await editor.getByRole('button', { name: 'Add step' }).click();
    await editor.getByRole('textbox', { name: 'Search tools' }).fill('repeat');
    await editor
      .getByRole('button', { name: /Repeat/ })
      .first()
      .click();
    await editor.getByRole('checkbox', { name: /Ask for .* when the flow runs/ }).check();
    await editor.getByRole('button', { name: 'Create flow' }).click();
    await expect(editor).toBeHidden();

    await page.getByRole('button', { name: 'Run Echo' }).click();

    const runDialog = page.getByRole('dialog', { name: /Run/ });
    await expect(runDialog).toBeVisible();
    await runDialog.getByRole('spinbutton', { name: 'Times' }).fill('2');
    await runDialog.getByRole('button', { name: 'Run flow' }).click();

    await expect(page.locator('.cm-content')).toHaveText('HELLOHELLO');
  });

  test('edits a flow and records a new version with a diff', async ({ page }) => {
    await saveHistoryAsFlow(page, 'Shout');
    await openFlows(page);
    await page.getByRole('button', { name: 'Edit Shout' }).click();

    const editor = page.getByRole('dialog', { name: 'Edit flow' });
    await expect(editor).toBeVisible();
    await editor.getByRole('textbox', { name: 'Description' }).fill('Uppercases the text');
    await editor.getByRole('button', { name: 'Save version' }).click();

    await expect(editor.getByRole('heading', { name: 'Compare versions' })).toBeVisible();
    await expect(editor.locator('.diff-view')).toBeVisible();
  });
});
