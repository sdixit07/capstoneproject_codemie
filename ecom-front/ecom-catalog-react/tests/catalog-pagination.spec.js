import { test, expect } from '@playwright/test';

const CARD = '.card';
// Mirrors VITE_PAGE_SIZE so a small-page run asserts against the same size the app used.
const PAGE_SIZE = Number(process.env.VITE_PAGE_SIZE) || 10;

const indicator = (page) => page.getByTestId('page-indicator');
const previous = (page) => page.getByRole('button', { name: 'Previous' });
const next = (page) => page.getByRole('button', { name: 'Next' });

test.describe('Catalog - server-side pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(CARD).first()).toBeVisible({ timeout: 30000 });
  });

  test('requests the first page with an explicit size and shows the indicator', async ({ page }) => {
    await expect(indicator(page)).toContainText('Page 1 of');

    // Never asserts a *full* page: the seeded catalog can be smaller than one
    // page. What matters is that the page is capped at the requested size.
    const cards = await page.locator(CARD).count();
    expect(cards).toBeGreaterThan(0);
    expect(cards).toBeLessThanOrEqual(PAGE_SIZE);
  });

  test('Previous is disabled on the first page', async ({ page }) => {
    await expect(previous(page)).toBeDisabled();
  });

  test('Next advances the page and asks the backend for it', async ({ page }) => {
    test.skip(await next(page).isDisabled(), 'catalog fits on a single page');

    const request = page.waitForRequest(req =>
      req.url().includes('/api/products') && req.url().includes('page=1'));

    await next(page).click();
    await request;

    await expect(indicator(page)).toContainText('Page 2 of');
    await expect(previous(page)).toBeEnabled();
  });

  test('Next is disabled once the last page is reached', async ({ page }) => {
    const label = await indicator(page).innerText();
    const lastPage = Number(label.match(/of (\d+)/)?.[1] ?? 1);

    for (let i = 1; i < lastPage; i += 1) {
      await next(page).click();
      await expect(indicator(page)).toContainText(`Page ${i + 1} of`);
    }

    await expect(next(page)).toBeDisabled();
  });

  test('changing the sort order resets back to the first page', async ({ page }) => {
    test.skip(await next(page).isDisabled(), 'catalog fits on a single page');

    await next(page).click();
    await expect(indicator(page)).toContainText('Page 2 of');

    const request = page.waitForRequest(req =>
      req.url().includes('/api/products') &&
      req.url().includes('page=0') &&
      req.url().includes('sortDir=desc'));

    await page.getByLabel('Sort products').selectOption('price:desc');
    await request;

    await expect(indicator(page)).toContainText('Page 1 of');
    await expect(previous(page)).toBeDisabled();
  });

  test('changing the category resets back to the first page', async ({ page }) => {
    test.skip(await next(page).isDisabled(), 'catalog fits on a single page');

    await next(page).click();
    await expect(indicator(page)).toContainText('Page 2 of');

    await page.getByLabel('Filter by category').selectOption({ index: 1 });

    await expect(indicator(page)).toContainText('Page 1 of');
    await expect(previous(page)).toBeDisabled();
  });
});
