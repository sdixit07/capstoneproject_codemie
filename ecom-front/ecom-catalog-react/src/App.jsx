import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import ProductList from './ProductList'
import CategoryFilter from './CategoryFilter'
import LoadingIndicator from './components/LoadingIndicator'
import ErrorBanner from './components/ErrorBanner'
import { fetchProducts, fetchCategories } from './api/productsApi'

// Per-resource state model: { data, loading, error }
const createInitialResourceState = (data) => ({ data, loading: false, error: null });

function App() {
  const [products, setProducts] = useState(() => createInitialResourceState([]));
  const [categories, setCategories] = useState(() => createInitialResourceState([]));
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortorder, setSortOrder] = useState("asc");

  // Guards against the debounce effect re-fetching products immediately
  // after the initial load effect has already fetched them once.
  const isInitialSearchRender = useRef(true);

  const loadProducts = useCallback(async (term = "") => {
    setProducts((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchProducts(term);
      setProducts({ data, loading: false, error: null });
    } catch (err) {
      setProducts((prev) => ({ ...prev, loading: false, error: err.message || 'Failed to load products.' }));
    }
  }, []);

  const loadCategories = useCallback(async () => {
    setCategories((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchCategories();
      setCategories({ data, loading: false, error: null });
    } catch (err) {
      setCategories((prev) => ({ ...prev, loading: false, error: err.message || 'Failed to load categories.' }));
    }
  }, []);

  // Initial load of categories and products (independent, partial failure supported)
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  // Debounced search effect - skips the very first render since the
  // initial load effect above already fetches products once.
  useEffect(() => {
    if (isInitialSearchRender.current) {
      isInitialSearchRender.current = false;
      return;
    }

    const debounceTimer = setTimeout(() => {
      loadProducts(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, loadProducts]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId ? Number(categoryId) : null);
  };

  const handleRetryProducts = () => {
    loadProducts(searchTerm);
  };

  const handleRetryCategories = () => {
    loadCategories();
  };

  const handleRetryAll = () => {
    loadProducts(searchTerm);
    loadCategories();
  };

  // Apply client-side category filter and sort to server-returned products
  const filteredProducts = products.data
    .filter((product) => {
      return (
        (selectedCategory ? product.category.id === selectedCategory : true)
      )
    })
    .sort((a, b) => {
      if (sortorder === "asc") {
        return a.price - b.price
      } else {
        return b.price - a.price
      }
    });

  const isInitialLoad = products.loading && categories.loading && !products.data.length && !categories.data.length;
  const hasBothErrors = products.error && categories.error;

  return (
    <div className='container'>
      <h1>Product Catalog</h1><br/>

      <div className='row align-items-center mb-4'>
        <div className='col-md-3 col-sm-12 mb-2'>
          <CategoryFilter categories={categories.data} onSelect={handleCategorySelect} />
          {categories.loading && !isInitialLoad && (
            <LoadingIndicator label="Loading categories..." size="sm" />
          )}
        </div>

        <div className='col-md-5 col-sm-12 mb-2'>
        <input 
          type='text'
          className='form-control'
          placeholder='Search for products'
          value={searchTerm}
          onChange={handleSearchChange} />
        </div>

        <div className='col-md-4 col-sm-12 mb-2'>
          <select className='form-control' onChange={handleSortChange}>
            <option value="asc">Sort by Price: Low to High</option>
            <option value="desc">Sort by Price: High to Low</option>
          </select>
        </div>
      </div>

      {hasBothErrors && (
        <ErrorBanner
          title="Unable to load the catalog"
          message="We couldn't load products or categories. Please retry."
          onRetry={handleRetryAll}
          retryLabel="Retry All"
          disabled={products.loading || categories.loading}
        />
      )}

      {!hasBothErrors && products.error && (
        <ErrorBanner
          title="Unable to load products"
          message={products.error}
          onRetry={handleRetryProducts}
          retryLabel="Retry Products"
          disabled={products.loading}
        />
      )}

      {!hasBothErrors && categories.error && (
        <ErrorBanner
          title="Unable to load categories"
          message={categories.error}
          onRetry={handleRetryCategories}
          retryLabel="Retry Categories"
          disabled={categories.loading}
        />
      )}

      {isInitialLoad && <LoadingIndicator label="Loading catalog..." />}

      {!isInitialLoad && products.loading && (
        <LoadingIndicator label="Loading products..." />
      )}

      {!isInitialLoad && !products.loading && (
        <div>
          {filteredProducts.length ? (
            <ProductList products={filteredProducts} />
          ) : (
            !products.error && <p>No products found.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default App
