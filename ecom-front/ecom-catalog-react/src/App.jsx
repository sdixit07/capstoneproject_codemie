import { useEffect, useFirst, useMemo, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProductList from './ProductList';
import CategoryFilter from './CategoryFilter';
import { fetchCategories, fetchProducts } from './api/productsApi';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('price,asc');

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounced search to avoid a REST call on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchProducts({
          page,
          size,
          search: debouncedSearch,
          categoryId: selectedCategory,
          sort
        });
        setProducts(resp.items || []);
        setTotalPages(resp.totalPages ?? 0);
        setTotalItems(resp.totalItems ?? 0);
      } catch (e) {
        setError(e.message);
        setProducts([]);
        setTotalPages(0);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, size, debouncedSearch, selectedCategory, sort]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId ? Number(categoryId) : null);
    setPage(0);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  return (
    <div className="container">
      <h1>Product Catalog</h1>
      <br />

      <div className="row align-items-center mb-4">
        <div className="col-md-3 col-sm-12 mb-2">
          <CategoryFilter categories={categories} onSelect={handleCategorySelect} />
        </div>

        <div className="col-md-5 col-sm-12 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search for products"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="col-md4- col-sm-12 mb-2">
          <select className="form-control" value={sort} onChange={handleSortChange}>
            <option value="price,asc">Sort by Price: Low to High</option>
            <option value="price,desc">Sort by Price: High to Low</option>
            <option value="name,asc">Sort by Name: A -> Z</option>
            <option value="name,desc">Sort by Name: Z -> A</option>
          </select>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <small>Total: {totalItems} items </small>
        </div>
        <div className="gap-2 d-flex align-items-center">
          <button className="btn btn-outline-primary" disabled={!canPrev || loading} onClick={() => setPage(p => p - 1)}>
            Prev
          </button>
          <span>
Page {totalPages === 0 ? 0 : page + 1} of {totalPages}</span>
          <button className="btn btn-outline-primary" disabled={!canNext || loading} onClick={() => setPage(p => p + 1)}>
            Next
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Loading...</p>}

     <div>
        {!loading && !error && products.length > 0 ? (
          <ProductList products={products} />
        ) : (!loading && !error ? (
          <p>No products to display.</p>
        ) : null)}
      </div>
    </div>
  );
}

export default App;
