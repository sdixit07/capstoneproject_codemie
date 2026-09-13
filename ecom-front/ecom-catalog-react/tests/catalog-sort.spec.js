import { test, expect } from '@playwright/test';

const CARD = '.card';

const cardPrices = async (page) => {
  const texts = await page.locator(`${CARD} strong`).allInnerTexts();
  return texts.map(t => Number(t.replace('$', '').trim()));
};

const cardNames = (page) => page.locator(`${CARD} .card-title`).allInnerTexts();

test.describe('Catalog - server-side sorting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(CARD).first()).toBeVisible({ timeout: 30000 });
  });

  test('loads the catalog with the default sort options', async ({ page }) => {
    await expect(page.getByLabel('Sort products')).toHaveValue('id:asc');
    await expect(page.locator(CARD).first()).toBeVisible();
  });

  test('sorting by price descending calls the backend and reorders the list', async ({ page }) => {
    const request = page.waitForRequest(req =>
      req.url().includes('/api/products') &&
      req.url().includes('sortBy=price') &&
      req.url().includes('sortDir=desc'));

    await page.getByLabel('Sort products').selectOption('price:desc');
    await request;

    await expect.poll(async () => {
      const prices = await cardPrices(page);
      return JSON.stringify(prices) === JSON.stringify([...prices].sort((a, b) => b - a));
    }).toBe(true);
  });

  test('sorting by price ascending reorders the list the other way', async ({ page }) => {
    await page.getByLabel('Sort products').selectOption('price:asc');

    await expect.poll(async () => {
      const prices = await cardPrices(page);
      return JSON.stringify(prices) === JSON.stringify([...prices].sort((a, b) => a - b));
    }).toBe(true);
  });

  test('sorting by name works', async ({ page }) => {
    await page.getByLabel('Sort products').selectOption('name:asc');

    await expect.poll(async () => {
      const names = await cardNames(page);
      return JSON.stringify(names) === JSON.stringify([...names].sort());
    }).toBe(true);
  });

  test('sorting is applied to the by-category view as well', async ({ page }) => {
    const categorySelect = page.getByLabel('Filter by category');
    await categorySelect.selectOption({ index: 1 });

    const request = page.waitForRequest(req =>
      /\/api\/products\/category\/\d+/.test(req.url()) &&
      req.url().includes('sortBy=price') &&
      req.url().includes('sortDir=desc'));

    await page.getByLabel('Sort products').selectOption('price:desc');
    await request;

    await expect.poll(async () => {
      const prices = await cardPrices(page);
      return prices.length > 0 &&
        JSON.stringify(prices) === JSON.stringify([...prices].sort((a, b) => b - a));
    }).toBe(true);
  });

  test('search still narrows the results', async ({ page }) => {
    const before = (await cardNames(page)).length;

    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('zzzzzz-no-such-product');

    await expect(page.getByText('No prodcuts to display.')).toBeVisible();
    expect(before).toBeGreaterThan(0);
  });
});
