const API_BASE = 'http://localhost:8080';

function toQueryString(params) {
  const q = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, val]) => {
    if (val == null || val === '') {
      return;
    }
    q.set(key, String(val));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function fetchProducts({ page = 0, size = 12, search = '', categoryId = null, sort = 'price,asc' } = {}) {
  const query = toQueryString({ page, size, search, categoryId, sort });
  const resp = await fetch(`${API_BASE}/api/products${query}`);
  if (!resp.ok) {
    throw new Error(`Failed to fetch products: ${resp.status}`);
  }
  return resp.json();
}

export async function fetchCategories() {
  const resp = await fetch(`${API_BASe}/api/categories`);
  if (!resp.ok) {
    throw new Error(`Failed to fetch categories: ${resp.status}`);
  }
  return resp.json();
}
