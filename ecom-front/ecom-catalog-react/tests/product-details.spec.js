import { test, expect } from '@playwright/test';

test.describe('Product Details – navigation and edge cases', () => {
  test('clicking a catalog card navigates to its product details page', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.locator('.card').first();
    await expect(firstCard).toBeVisible({ timeout: 30000 });
    const cardTitle = (await firstCard.locator('.card-title').innerText()).trim();

    await firstCard.click();

    await expect(page).toHaveURL(/\/products\/\d+$/);
    await expect(page.getByRole('heading', { name: 'Product Details' })).toBeVisible();
    await expect(page.locator('.card-title')).toHaveText(cardTitle);
  });

  test('deep link to an existing product id shows full details', async ({ page }) => {
    await page.goto('/products/1');

    await expect(page.getByRole('heading', { name: 'Product Details' })).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.card-title')).toBeVisible();
    await expect(page.locator('.card-text').first()).toBeVisible();
    await expect(page.getByText(/^\$/)).toBeVisible();
    await expect(page.getByText(/Category:/)).toBeVisible();
  });

  test('deep link to a non-existent product id shows not-found message with back link', async ({ page }) => {
    await page.goto('/products/999999');

    await expect(page.getByRole('heading', { name: 'Product not found' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('The product you are looking for does not exist.')).toBeVisible();
    const backLink = page.getByRole('link', { name: 'Back to catalog' });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('deep link to a non-numeric product id shows an error state', async ({ page }) => {
    await page.goto('/products/abc');

    await expect(page.getByRole('heading', { name: 'Unable to load product' })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('link', { name: 'Back to catalog' })).toBeVisible();
  });
});
