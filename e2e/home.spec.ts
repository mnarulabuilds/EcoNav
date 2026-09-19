import { test, expect } from '@playwright/test';

test('home page loads and shows CityConnect', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /One platform for citizens/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Citizen portal/i })).toBeVisible();
});

test('not-found page renders', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
  await expect(page.getByRole('heading', { name: /not found/i })).toBeVisible();
});
