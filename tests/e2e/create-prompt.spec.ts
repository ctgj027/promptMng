import { test, expect } from '@playwright/test';

test.describe('Prompt creation', () => {
  test.skip(true, 'Requires running Next.js dev server with mocked GitHub credentials.');

  test('allows authenticated users to submit a prompt and see PR URL', async ({ page }) => {
    await page.goto('/prompts');
    await page.getByRole('button', { name: 'Sign in' }).click();
    // OAuth flow would be mocked in a real test environment.
    await page.getByRole('button', { name: 'Create prompt' }).click();
    await page.getByLabel('Title').fill('Playwright Prompt');
    await page.getByLabel('Slug').fill('playwright-prompt');
    await page.getByLabel('Prompt body').fill('Hello from Playwright');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('https://github.com/')).toBeVisible();
  });
});
