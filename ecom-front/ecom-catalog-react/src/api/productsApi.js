// Central place for talking to the product catalog backend.
// The base URL is configurable so the same build can point at a different API host.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Kept in sync with the allow-list on the backend (ProductService.ALLOWED_SORT_FIELDS).
export const SORT_FIELDS = ['id', 'name', 'price'];
export const SORT_DIRECTIONS = ['asc', 'desc'];
export const DEFAULT_SORT_BY = 'id';
export const DEFAULT_SORT_DIR = 'asc';

const buildSortParams = (sortBy, sortDir) => {
  const params = new URLSearchParams();
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
 * Fetches products from the backend. Sorting is always done server side:
 * when a categoryId is given the "by category" endpoint is used, otherwise
 * the full catalog endpoint. Both accept sortBy and sortDir.
 */
export const fetchProducts = ({ categoryId, sortBy, sortDir } = {}) => {
  const params = buildSortParams(sortBy, sortDir);
  const path = categoryId ? `/api/products/category/${categoryId}` : '/api/products';
  return getJson(`${API_BASE_URL}${path}?${params.toString()}`);
};

export const fetchCategories = () => getJson(`${API_BASE_URL}/api/categories`);
