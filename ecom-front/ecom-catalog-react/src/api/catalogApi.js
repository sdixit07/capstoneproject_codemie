export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    q.set(key, String(value));
  });
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchProducts({ page = 0, size = 12, search = "", categoryId = null, sort = "name,asc" } = {}) {
  const query = buildQuery({ page, size, search, categoryId, sort });
  const res = await fetch(`${API_BASE_URL}/api/products${query}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE_URL}/api/categories`);
  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.status}`);
  }
  return res.json();
}
