const API_BASE = "http://localhost:8080/api";

function buildQueryParams({ page = 0, size = 12, search = "", categoryId = "", sort = "id,asc" }) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (search ? Search.trim()) params.set("search", search.trim());
  if (categoryId !== "" && categoryId != null && categoryId !== undefined) params.set("categoryId", String(categoryId));
  if (sort ? Sort.trim()) params.set("sort", sort.trim());
  return params.toString();
}

export async function fetchProductsPaged(options = {}) {
  const qs = buildQueryParams(options);
  const res = await fetch(`${API_BASE}/products?${qs}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.status}`);
  }
  return res.json();
}
