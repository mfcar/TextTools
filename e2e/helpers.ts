import { Page, expect } from '@playwright/test';

export async function openApp(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Untitled 1', exact: true })).toBeVisible();
  await expect(page.locator('.cm-content')).toBeVisible();
}

export async function typeInEditor(page: Page, text: string): Promise<void> {
  const editor = page.locator('.cm-content');
  await editor.click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type(text);
}

export async function openPalette(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Open command palette' }).click();
  await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible();
}
