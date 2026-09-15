const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Wraps a fetch call and normalizes failures (HTTP non-2xx or network errors)
 * into a single Error shape so UI code can rely on `error.message`.
 */
const request = async (url, friendlyName) => {
  let response;
  try {
    response = await fetch(url);
  } catch {
    // Network failure, CORS issue, server unreachable, etc.
    throw new Error(`Unable to reach the server while loading ${friendlyName}. Please check your connection and try again.`);
  }

  if (!response.ok) {
    throw new Error(`Failed to load ${friendlyName} (HTTP ${response.status}). Please try again.`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error(`Received an unexpected response while loading ${friendlyName}.`);
  }
};

export const fetchProducts = async (searchTerm = '') => {
  const url = searchTerm
    ? `${API_BASE_URL}/products?search=${encodeURIComponent(searchTerm)}`
    : `${API_BASE_URL}/products`;

  return request(url, 'products');
};

export const fetchCategories = async () => {
  return request(`${API_BASE_URL}/categories`, 'categories');
};
