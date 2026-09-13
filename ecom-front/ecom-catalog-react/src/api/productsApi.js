// Central place for talking to the product catalog backend.
// The base URL is configurable so the same build can point at a different API host.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Kept in sync with the allow-list on the backend (ProductService.ALLOWED_SORT_FIELDS).
export const SORT_FIELDS = ['id', 'name', 'price'];
export const SORT_DIRECTIONS = ['asc', 'desc'];
export const DEFAULT_SORT_BY = 'id';
export const DEFAULT_SORT_DIR = 'asc';

// Kept in sync with the paging bounds on the backend (ProductService.MIN_SIZE / MAX_SIZE).
export const DEFAULT_PAGE = 0;
export const DEFAULT_PAGE_SIZE = 10;
export const MIN_PAGE_SIZE = 1;
export const MAX_PAGE_SIZE = 50;

const clampPage = (page) => {
  const parsed = Number(page);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : DEFAULT_PAGE;
};

const clampSize = (size) => {
  const parsed = Number(size);
  if (!Number.isInteger(parsed)) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(parsed, MIN_PAGE_SIZE), MAX_PAGE_SIZE);
};

// Paging params are clamped client side too: the backend answers 400 for out of
// range values, and a broken URL should not turn into a broken page.
const buildQueryParams = ({ page, size, sortBy, sortDir }) => {
  const params = new URLSearchParams();
  params.set('page', String(clampPage(page)));
  params.set('size', String(clampSize(size)));
  params.set('sortBy', SORT_FIELDS.includes(sortBy) ? sortBy : DEFAULT_SORT_BY);
  params.set('sortDir', SORT_DIRECTIONS.includes(sortDir) ? sortDir : DEFAULT_SORT_DIR);
  return params;
};

const getJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request to ${url} failed with status ${response.status}`);
  }
  return response.json();
};

/**
 * Normalises whatever the backend sends into a single predictable page shape.
 *
 * Tolerated inputs:
 *  - the PagedResponse DTO: { content, page, size, totalElements, totalPages, sort }
 *  - a raw Spring Data Page, where the index lives in `number` and paging data
 *    may sit under `pageable`
 *  - a bare array, from an older unpaged backend
 */
export const normalizePage = (payload, fallback = {}) => {
  const requestedPage = clampPage(fallback.page);
  const requestedSize = clampSize(fallback.size);

  if (Array.isArray(payload)) {
    return {
      content: payload,
      page: requestedPage,
      size: requestedSize,
      totalElements: payload.length,
      totalPages: 1,
      sort: '',
    };
  }

  if (!payload || typeof payload !== 'object') {
    return {
      content: [], page: requestedPage, size: requestedSize,
      totalElements: 0, totalPages: 0, sort: '',
    };
  }

  const content = Array.isArray(payload.content) ? payload.content : [];
  // `page` is the DTO field, `number` is what a raw Spring Data Page uses.
  const page = [payload.page, payload.number, payload.pageable?.pageNumber]
    .find(value => Number.isInteger(value));
  const size = [payload.size, payload.pageable?.pageSize]
    .find(value => Number.isInteger(value) && value > 0);
  const totalElements = Number.isInteger(payload.totalElements)
    ? payload.totalElements
    : content.length;
  const resolvedSize = size ?? requestedSize;
  const totalPages = Number.isInteger(payload.totalPages)
    ? payload.totalPages
    : Math.ceil(totalElements / resolvedSize);

  return {
    content,
    page: page ?? requestedPage,
    size: resolvedSize,
    totalElements,
    totalPages,
    sort: typeof payload.sort === 'string' ? payload.sort : '',
  };
};

/**
 * Fetches one page of products. Paging and sorting are both done server side:
 * when a categoryId is given the "by category" endpoint is used, otherwise the
 * full catalog endpoint. Both accept page, size, sortBy and sortDir.
 *
 * Always resolves to the normalised page shape, never to a bare array.
 */
export const fetchProducts = async ({ categoryId, page, size, sortBy, sortDir } = {}) => {
  const params = buildQueryParams({ page, size, sortBy, sortDir });
  const path = categoryId ? `/api/products/category/${categoryId}` : '/api/products';
  const payload = await getJson(`${API_BASE_URL}${path}?${params.toString()}`);
  return normalizePage(payload, { page, size });
};

export const fetchCategories = () => getJson(`${API_BASE_URL}/api/categories`);
