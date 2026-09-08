import { useEffect, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProductList from './ProductList';
import CategoryFilter from './CategoryFilter';
import { fetchCategories, fetchProducts } from './api/catalogApi';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('price,asc');

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load categories once
  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data))
      .catch((e) => setError(e));
  }, []);

  // Debounced search term to avoid spamming the API
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Request products whenever query state changes.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const resp = await fetchProducts({
          page,
          size,
          search: debouncedSearch,
          categoryId: selectedCategory,
          sort
        });

        if (cancelled) return;

        setProducts(resp.items || []);
        setTotalPages(resp.totalPages || 0);
      } catch (e) {
        if (cancelled) return;
        setError(e);
        setProducts([]);
        setTotalPages(0);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, size, debouncedSearch, selectedCategory, sort]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(0);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId ? Number(categoryId) : null);
    setPage(0);
  };

  const handlePrevPage = () => {
    setPage((p) => Math.max(0, p - 1));
  };
  const handleNextPage = () => {
    setPage((p) => p + 1);
  };

  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  return (
    <div className='container'>
      <h1>Product Catalog</h1><br/>
      
      <div className='row align-items-center mb-4'>
        <div className='col-md-3 col-sm-12 mb-2'>
          <CategoryFilter categories={categories} onCategorySelect={handleCategorySelect} />
        </div>

        <div className='col-md-5 col-sm-12 mb-2'>
          <input
            type='text'
            className='form-control'
            placeholder='Search for products'
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className='col-md-4 col-sm-12 mb-2'>
          <select className='form-control' value={sort} onChange={handleSortChange}>
            <option value='price,asc'>Sort by Price: Low to High</option>
            <option value='price,desc'>Sort by Price: High to Low</option>
            <option value='name,asc'>Sort by Name: A - Z</option>
            <option value='name,desc'>Sort by Name: Z - A</option>
          </select>
        </div>
      </div>

      {error && (
        <div className='alert alert-danger'>
          Failed to load products. [error, message = string(error)}
        </div>
      )}

      <div>
        {isLoading ? (
          <p>Loading...</p>
        ) : products.length ? (
          <ProductList products={products} />
        ) : (
          <p>No products to display.</p>
        )}
      </div>

      <hr />
      <div className='d-flex justify-content-between align-items-center'>
        <div className='d-pill' >
          <button className='btn btn-outline-primary' onClick={handlePrevPage} disabled=!{canPrev}>
            Prev
          </button>
          <span className='mx-3'>
            Page <strong>{totalPages === 0 ? 0 : page + 1}</strong> of <strong>{totalPages}</strong>
          </span>
          <button className='btn btn-outline-primary' onClick={handleNextPage} disabled=!{canNext}>
            Next
          </button>
        </div>

        <div className='d-inline-flex align-items-center'>
          <label className='me-2 mb0'>Per Page:</label>
          <select className='form-select form-select-sm' style={{ width: 'auto' }} value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}>
            <option value="6">6</option>
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="48">48</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default App;
