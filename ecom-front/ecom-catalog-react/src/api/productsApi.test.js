import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import {
  fetchCategories,
  fetchProducts,
  buildProductQuery,
  validatePriceRange
} from './productsApi';

describe('productsApi', () => {
  const origFetch = globalThis.fetch;

  const lastUrl = () => globalThis.fetch.mock.calls[0][0];

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  it('fetchProducts sends query params and returns json', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ([{ id: 1, name: 'Laptop', price: 999.99 }])
    });

    const data = await fetchProducts({ search: 'phone', categoryId: 2, sort: 'price,desc' });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(lastUrl()).toContain('/api/products?');
    expect(lastUrl()).toContain('search=phone');
    expect(lastUrl()).toContain('categoryId=2');
    expect(lastUrl()).toContain('sort=price%2Cdesc');
    expect(Array.isArray(data)).toBe(true);
  });

  it('fetchCategories sends request to /api/categories', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ([])
    });

    const data = await fetchCategories();

    expect(lastUrl()).toContain('/api/categories');
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('price range query params', () => {
  const origFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ([]) });
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  const lastUrl = () => globalThis.fetch.mock.calls[0][0];

  it('omits price params entirely when both fields are blank', async () => {
    await fetchProducts({ minPrice: '', maxPrice: '   ' });

    expect(lastUrl()).toBe('http://localhost:8080/api/products');
    expect(lastUrl()).not.toContain('minPrice');
    expect(lastUrl()).not.toContain('maxPrice');
  });

  it('sends minPrice only', async () => {
    await fetchProducts({ minPrice: '100' });

    expect(lastUrl()).toContain('minPrice=100');
    expect(lastUrl()).not.toContain('maxPrice');
  });

  it('sends maxPrice only', async () => {
    await fetchProducts({ maxPrice: 250.5 });

    expect(lastUrl()).toContain('maxPrice=250.5');
    expect(lastUrl()).not.toContain('minPrice');
  });

  it('sends both bounds together with the category filter', async () => {
    await fetchProducts({ categoryId: 3, minPrice: '100', maxPrice: '500' });

    const url = lastUrl();
    expect(url).toContain('categoryId=3');
    expect(url).toContain('minPrice=100');
    expect(url).toContain('maxPrice=500');
  });

  it('buildProductQuery drops undefined and null values', () => {
    expect(buildProductQuery({ minPrice: undefined, maxPrice: null })).toBe('');
    expect(buildProductQuery({})).toBe('');
    expect(buildProductQuery()).toBe('');
    expect(buildProductQuery({ minPrice: 0 })).toBe('minPrice=0');
  });

  it('throws a descriptive error when the backend rejects the range', async () => {
    globalThis.fetch.mockResolvedValue({ ok: false, status: 400, json: async () => ({}) });

    await expect(fetchProducts({ minPrice: '500', maxPrice: '100' }))
      .rejects.toThrow('HTTP 400');
  });
});

describe('validatePriceRange', () => {
  it('accepts empty, partial and ordered ranges', () => {
    expect(validatePriceRange('', '')).toBeNull();
    expect(validatePriceRange('100', '')).toBeNull();
    expect(validatePriceRange('', '100')).toBeNull();
    expect(validatePriceRange('100', '500')).toBeNull();
    expect(validatePriceRange('100', '100')).toBeNull();
  });

  it('rejects min greater than max', () => {
    expect(validatePriceRange('500', '100')).toMatch(/greater than max price/i);
  });

  it('rejects negative bounds', () => {
    expect(validatePriceRange('-1', '')).toMatch(/negative/i);
    expect(validatePriceRange('', '-1')).toMatch(/negative/i);
  });

  it('rejects non numeric bounds', () => {
    expect(validatePriceRange('cheap', '')).toMatch(/numeric/i);
  });
});
