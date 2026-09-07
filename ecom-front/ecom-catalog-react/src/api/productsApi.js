const API_BASE = '//localhost:8080/api';

const buildQuery = (params = {}) => {
  const qs = new URLSearchParams();
  if (params.page !== undefined && params.page !== null) qs.set('page', String(params.page));
  if (params.size !== undefined && params.size !== null) qs.set('size', String(params.size));
  if (params.search) qs.set('search', params.search);
  if (params.categoryId !== undefined && params.categoryId !== null && params.categoryId !== '') {
    qs.set('categoryId', String(params.categoryId));
  }
  if (params.sort) qs.set('sort', params.sort);
  const str = qs.toString();
  return str ? `?${str}` : '';
};

export async function fetchProducts({ page = 0, size = 12, search = '', categoryId = '', sort = 'id,asc' } = {}) {
  const q = buildQuery({ page, size, search, categoryId, sort });
  const res = await fetch(`${API_BASE}/products${q}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return resjson => res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}
