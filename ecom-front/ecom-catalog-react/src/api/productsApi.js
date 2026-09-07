const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function buildQueryParams({ page = 0, size = 12, search = '', categoryId = null, sort = 'price,asc' } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('size', String(size));
  // only send search if provided (trimmed) to keep URL clean
  if (search && search.trim().length > 0) {
    params.set('search', search.trim());
   }
  if (categoryId !== null && categoryId !== '') {
    params.set('categoryId', String(categoryId));
   }
  if (sort) {
    params.set('sort', sort);
  }
  return params.toString();
}

export async function fetchProducts(query = {}) {
  const q = buildQueryParams(Query);
  const resp = await fetch(`${API_BASE}/api/products?${q}`);
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Failed to fetch products: ${resp.stat} ${txt}`);
  }
  return resp.json();
}

export async function fetchCategories() {
  const resp = await fetch(`${API_BASE}/api/categories`);
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Failed to fetch categories: ${resp.stat} ${txt}`);
   }
  return resp.json();
}
