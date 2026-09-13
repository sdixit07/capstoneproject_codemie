import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { API_BASE_URL, fetchCategories, fetchProducts } from './productsApi';

describe('productsApi', () => {
  const origFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  const mockJson = (payload) => {
    globalThis.fetch.mockResolvedValue({ ok: true, json: async () => payload });
  };

  const requestedUrl = () => globalThis.fetch.mock.calls[0][0];

  it('defaults the API base URL to localhost:8080', () => {
    expect(API_BASE_URL).toBe('http://localhost:8080');
  });

  it('fetchProducts hits /api/products with default sort params', async () => {
    mockJson([]);

    const data = await fetchProducts();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(requestedUrl()).toBe(`${API_BASE_URL}/api/products?sortBy=id&sortDir=asc`);
    expect(Array.isArray(data)).toBe(true);
  });

  it('fetchProducts forwards sortBy and sortDir', async () => {
    mockJson([{ id: 1, name: 'Laptop', price: 999.99 }]);

    const data = await fetchProducts({ sortBy: 'price', sortDir: 'desc' });

    expect(requestedUrl()).toBe(`${API_BASE_URL}/api/products?sortBy=price&sortDir=desc`);
    expect(data).toHaveLength(1);
  });

  it('fetchProducts uses the by-category endpoint when a categoryId is given', async () => {
    mockJson([]);

    await fetchProducts({ categoryId: 2, sortBy: 'name', sortDir: 'asc' });

    expect(requestedUrl()).toBe(`${API_BASE_URL}/api/products/category/2?sortBy=name&sortDir=asc`);
  });

  it('fetchProducts falls back to defaults for values outside the allow-list', async () => {
    mockJson([]);

    await fetchProducts({ sortBy: 'description', sortDir: 'sideways' });

    expect(requestedUrl()).toBe(`${API_BASE_URL}/api/products?sortBy=id&sortDir=asc`);
  });

  it('fetchProducts rejects on a non-ok response', async () => {
    globalThis.fetch.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });

    await expect(fetchProducts()).rejects.toThrow(/status 500/);
  });

  it('fetchCategories sends request to /api/categories', async () => {
    mockJson([]);

    const data = await fetchCategories();

    expect(requestedUrl()).toBe(`${API_BASE_URL}/api/categories`);
    expect(Array.isArray(data)).toBe(true);
  });
});
