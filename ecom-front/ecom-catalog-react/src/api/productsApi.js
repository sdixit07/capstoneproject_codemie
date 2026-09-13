const API_BASE_URL = 'http://localhost:8080/api';

export const fetchProducts = async (searchTerm = '') => {
  const url = searchTerm 
    ? `${API_BASE_URL}/products?search=${encodeURIComponent(searchTerm)}`
    : `${API_BASE_URL}/products`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }
  return response.json();
};

export const fetchCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }
  return response.json();
};
