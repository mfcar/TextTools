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
});
