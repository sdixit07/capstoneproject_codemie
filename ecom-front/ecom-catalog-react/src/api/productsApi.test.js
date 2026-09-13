import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import {
  API_BASE_URL,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  fetchCategories,
  fetchProducts,
  normalizePage,
} from './productsApi';

describe('productsApi', () => {
  const origFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  // Mirrors the PagedResponse DTO the backend returns.
  const pagedPayload = (content = [], overrides = {}) => ({
    content,
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    totalElements: content.length,
    totalPages: content.length ? 1 : 0,
    sort: 'id: ASC',
    ...overrides,
  });

  const mockJson = (payload) => {
    globalThis.fetch.mockResolvedValue({ ok: true, json: async () => payload });
  };

  const requestedUrl = () => globalThis.fetch.mock.calls[0][0];

  it('defaults the API base URL to localhost:8080', () => {
    expect(API_BASE_URL).toBe('http://localhost:8080');
  });

  it('fetchProducts hits /api/products with default paging and sort params', async () => {
    mockJson(pagedPayload());

    const data = await fetchProducts();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(requestedUrl()).toBe(
      `${API_BASE_URL}/api/products?page=0&size=${DEFAULT_PAGE_SIZE}&sortBy=id&sortDir=asc`);
    expect(Array.isArray(data.content)).toBe(true);
  });

  it('fetchProducts forwards page and size', async () => {
    mockJson(pagedPayload());

    await fetchProducts({ page: 3, size: 25 });

    expect(requestedUrl()).toBe(
      `${API_BASE_URL}/api/products?page=3&size=25&sortBy=id&sortDir=asc`);
  });

  it('fetchProducts forwards sortBy and sortDir', async () => {
    mockJson(pagedPayload([{ id: 1, name: 'Laptop', price: 999.99 }]));

    const data = await fetchProducts({ sortBy: 'price', sortDir: 'desc' });

    expect(requestedUrl()).toBe(
      `${API_BASE_URL}/api/products?page=0&size=${DEFAULT_PAGE_SIZE}&sortBy=price&sortDir=desc`);
    expect(data.content).toHaveLength(1);
  });

  it('fetchProducts uses the by-category endpoint when a categoryId is given', async () => {
    mockJson(pagedPayload());

    await fetchProducts({ categoryId: 2, page: 1, sortBy: 'name', sortDir: 'asc' });

    expect(requestedUrl()).toBe(
      `${API_BASE_URL}/api/products/category/2?page=1&size=${DEFAULT_PAGE_SIZE}&sortBy=name&sortDir=asc`);
  });

  it('fetchProducts falls back to defaults for sort values outside the allow-list', async () => {
    mockJson(pagedPayload());

    await fetchProducts({ sortBy: 'description', sortDir: 'sideways' });

    expect(requestedUrl()).toBe(
      `${API_BASE_URL}/api/products?page=0&size=${DEFAULT_PAGE_SIZE}&sortBy=id&sortDir=asc`);
  });

  it('fetchProducts clamps paging params the backend would reject with a 400', async () => {
    mockJson(pagedPayload());

    await fetchProducts({ page: -5, size: 999 });

    expect(requestedUrl()).toBe(
      `${API_BASE_URL}/api/products?page=0&size=${MAX_PAGE_SIZE}&sortBy=id&sortDir=asc`);
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

describe('normalizePage', () => {
  it('passes the PagedResponse DTO through with its metadata intact', () => {
    const page = normalizePage({
      content: [{ id: 1 }, { id: 2 }],
      page: 2,
      size: 5,
      totalElements: 12,
      totalPages: 3,
      sort: 'price: DESC,id: ASC',
    });

    expect(page).toEqual({
      content: [{ id: 1 }, { id: 2 }],
      page: 2,
      size: 5,
      totalElements: 12,
      totalPages: 3,
      sort: 'price: DESC,id: ASC',
    });
  });

  it('reads the page index from a raw Spring Data Page', () => {
    const page = normalizePage({
      content: [{ id: 7 }],
      number: 1,
      size: 4,
      totalElements: 9,
      totalPages: 3,
    });

    expect(page.page).toBe(1);
    expect(page.size).toBe(4);
    expect(page.totalPages).toBe(3);
  });

  it('falls back to the pageable block when number and size are absent', () => {
    const page = normalizePage({
      content: [],
      pageable: { pageNumber: 2, pageSize: 20 },
      totalElements: 60,
    });

    expect(page.page).toBe(2);
    expect(page.size).toBe(20);
    expect(page.totalPages).toBe(3);
  });

  it('treats a bare array from an unpaged backend as a single page', () => {
    const page = normalizePage([{ id: 1 }, { id: 2 }], { page: 0, size: 10 });

    expect(page.content).toHaveLength(2);
    expect(page.totalElements).toBe(2);
    expect(page.totalPages).toBe(1);
  });

  it('returns an empty page for null or unexpected payloads', () => {
    expect(normalizePage(null).content).toEqual([]);
    expect(normalizePage(null).totalPages).toBe(0);
    expect(normalizePage('nope').content).toEqual([]);
  });

  it('derives totalPages when the backend omits it', () => {
    const page = normalizePage({ content: [{ id: 1 }], size: 10, totalElements: 34 });

    expect(page.totalPages).toBe(4);
  });
});
