import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openApp, openPalette } from './helpers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.describe('Accessibility', () => {
  test('main workspace has no WCAG A/AA violations', async ({ page }) => {
    await openApp(page);

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test('command palette has no WCAG A/AA violations', async ({ page }) => {
    await openApp(page);
    await openPalette(page);

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .include('[role="dialog"]')
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('shortcuts help dialog has no WCAG A/AA violations', async ({ page }) => {
    await openApp(page);
    await page.keyboard.press('ControlOrMeta+/');
    await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .include('[role="dialog"]')
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('tab list dropdown has no WCAG A/AA violations', async ({ page }) => {
    await openApp(page);
    await page.getByRole('button', { name: 'All documents' }).click();
    await expect(page.getByRole('dialog', { name: 'All documents' })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .include('[role="dialog"]')
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('tab context menu has no WCAG A/AA violations', async ({ page }) => {
    await openApp(page);
    await page
      .getByRole('toolbar', { name: 'Open documents' })
      .getByRole('button', { name: 'Untitled 1', exact: true })
      .click({ button: 'right' });
    await expect(page.getByRole('menuitem', { name: 'Pin' })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .include('[role="menu"]')
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
