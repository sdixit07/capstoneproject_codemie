import { useEffect, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProductList from './ProductList';
import CategoryFilter from './CategoryFilter';
import { fetchCategories, fetchProducts } from './api/productsApi';

function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pageInfo, setPageInfo] = useState({ number: 0, size: 12, totalPages: 0, totalElements: 0, first: true, last: true });
  const [sortMeta, setSortMeta] = useState({ by: 'price', direction: 'asc' });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // load categories once
  useEffect(() => {
    fetchCategories()
      .then(data => setCategories(data))
      .catch(err => setError(err.message));
  }, []);

  // refetch products whenever query changes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchProducts({
          page,
          size,
          search: searchTerm,
          categoryId: selectedCategory,
          sort: `price,${sortOrder}`
        });
        if (cancelled) return;
        setProducts(resp.content || []);
        setPageInfo(resp.page || { number: 0, size, totalPages: 0, totalElements: 0, first: true, last: true });
        setSortMeta(resp.sort || { by: 'price', direction: sortOrder });
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page, size, searchTerm, selectedCategory, sortOrder]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0); // reset to first page on new search
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setPage(0);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId ? Number(categoryId) : null);
    setPage(0);
  };

  const handlePrevPage = () => setPage(p => Math.max(0, p - 1));
  const handleNextPage = () => setPage(p => (pageInfo.last ? p : p + 1));

  return (
    <div className='container'>
      <h1>Product Catalog</h1><br />

      <div className='row align-items-center mb-4'>
        <div className='col-md-3 col-sm-12 mb-2'>
          <CategoryFilter categories={categories} onSelect={handleCategorySelect} />
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
          <select className='form-control' value={sortOrder} onChange={handleSortChange}>
            <option value='asc'>Sort by Price: Low to High</option>
            <option value='desc'>Sort by Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className='d-lex justify-content-between align-items-center mb-3'>
        <div>
          <strong>Results:</strong> {pageInfo.totalElements || 0}
        </div>
        <div>
          <button className='btn btn-outline-primary me-2' onClick={handlePrevPage} disabled={pageInfo.first}>
            Prev
          </button>
          <span>Page {(pageInfo.number || 0) + 1} of {pageInfo.totalPages || 1}</span>
          <button className='btn btn-outline-primary ms-2' onClick={handleNextPage} disabled={pageInfo.last}>
            Next
          </button>
        </div>
      </div>

      {error && (<div className='alert alert-danger'>{error}</div>)}
      {loading && <p>Loading...</p>}

      <div>
        {!|oading && (products.length ? (
          <ProductList products={products} />
        ) : (
          <p>No products to display.</p>
        ))}
      </div>
    </div>
  );
}

export default App;
