import { test, expect } from '@playwright/test';

const CARD = '.card';
const PAGE_SIZE = 10;

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
    await expect(page.locator(CARD)).toHaveCount(PAGE_SIZE, { timeout: 10000 });
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
