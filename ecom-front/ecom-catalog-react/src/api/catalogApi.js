const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function buildQuery(params) {
  const qp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    qp.set(k, String(v));
  });
  const s = qp.toString();
  return s ? `?${s}` : '';
}

export async function fetchProducts({ page = 0, size = 12, search = '', categoryId = null, sort = 'price,asc' } = {}) {
  const qs = buildQuery({ page, size, search, categoryId, sort });
  const res = await fetch(`${API_BASE_URL}/api/products${qs}`);
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE_URL}/api/categories`);
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
  return res.json();
}
