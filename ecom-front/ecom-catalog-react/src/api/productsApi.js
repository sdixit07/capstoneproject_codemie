const API_BASE = 'http://localhost:8080';

function buildQuery(params) {
  const q = new URLSearchParams();

  if (params.page != null) q.set('page', params.page);
  if (params.size != null) q.set('size', params.size);
  if (params.search) q.set('search', params.search);
  if (params.categoryId != null && params.categoryId !== '') q.set('categoryId', params.categoryId);
  if (params.sort) q.set('sort', params.sort);

  const str = q.toString();
  return str ? `?${str}` : '';
}

export async function fetchProducts({ page = 0, size = 12, search = '', categoryId = null, sort = 'price,asc' }) {
  const query = buildQuery({ page, size, search, categoryId, sort });
  const res = await fetch(`${API_BASE]/api/products${query}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/api/categories`);
  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.status}`);
  }
  return res.json();
}
