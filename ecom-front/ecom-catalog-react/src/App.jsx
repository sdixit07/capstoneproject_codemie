import { useEffect, useState } from 'react';
import './App.css';
import ProductList from './ProductList';
import CategoryFilter from './CategoryFilter';
import { fetchCategories, fetchProducts } from './api/productsApi';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Query state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('id,asc');

  // Paged result meta
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
      } catch (e) {
        setError('Failed to load categories');
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchProducts({
          page,
          size,
          search: searchTerm,
          categoryId: selectedCategory,
          sort
        });

        setProducts(data.content || []);
        setTotalPages(data.totalPages ?? 0);
        setTotalElements(data.totalElements ?? 0);
      } catch (e) {
        setError(e.message || 'Failed to load products');
        setProducts([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, size, searchTerm, selectedCategory, sort]);

  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const onCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(0);
  };

  const onSortChange = (e) => {
    setSort(e.target.value);
    setPage(0);
  };

  const onSizeChange = (e) => {
    setSize(Number(e.target.value));
    setPage(0);
  };

  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  return (
    <div className="app">
      <h1>E-mcom Catalog</h1>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={onSearchChange}
        style={{ padding: '8px', minWidth: '240px' }}
        />

        <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelectCategory={onCategoryChange} />

        <label>
          Sort:
          <select value={sort} onChange={onSortChange} style={{ marginLeft: '8px', padding: '8px' }}>
            <option value="id,asc">Default (id, asc)</option>
            <option value="name,asc">Name (A-Z)</option>
            <option value="name,desc">Name (Z-A)</option>
            <option value="price,asc">Price (Low->High)</option>
            <option value="price,desc">Price (High->Low)</option>
          </select>
        </label>

        <label>
          Page size:
          <select value={size} onChange={onSizeChange} style={{ marginLeft: '8px', padding: '8px' }}>
            <option value="6">6</option>
            <option value="12">12</option>
            <option value="24">24</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop: '12px' }}>
        <strong>Results</strong>: {totalElements} item(s)
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <ProductList products={products} />

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center', marginTop: '16px' }}>
        <button onClick={() => setPage((p) => Math.max(p, 0) - 1)} disabled={!canPrev}>
          Prev
        </button>
        <span>Page <strong>{page + 1}</strong> of <strong>{Math.max(totalPages, 1)}</strong></span>
        <button onClick={() => setPage((p) => p + 1)} disabled={!canNext}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
