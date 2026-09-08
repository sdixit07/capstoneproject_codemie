import { useEffect, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProductList from './ProductList';
import CategoryFilter from './CategoryFilter';
import { fetchCategories, fetchProducts } from './api/productsApi';

function App() {
  const [categories, setCategories] = useState([]);

  // query state
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('price,asc');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);

  // result state
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories()
      .then(data) => setCategories(data)
      .catch(err) => setError(err.message));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchProducts({
      page,
      size,
      search: searchTerm,
      categoryId: selectedCategory,
      sort
    })
      .then(data => {
        setProducts(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      })
      .catch(err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, size, searchTerm, selectedCategory, sort]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleSortChange = (event) => {
    const val = event.target.value;
    if (val === 'asc') {
      setSort('price,asc');
    } else if (val === 'desc') {
      setSort('price,desc');
    }
    setPage(0);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId ? Number(categoryId) : null);
    setPage(0);
  };

  const goToPage = (next) => {
    if (next < 0 || next >= totalPages) {
      return;
    }
    setPage(next);
  };

  return (
    <div className='container'>
      <h1>Product Catalog</h1><br/>
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
          <select className='form-control' onChange={handleSortChange} defaultValue='asc'>
            <option value='asc'>Sort by Price: Low to High</option>
            <option value='desc'>Sort by Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className='text-muted mb-2'>
        Total: <strong>{totalElements}</strong> items | Page <strong>{page + 1}</strong> of <strong>{totalPages || 1}</strong>
      </div>

      {error && <div className='alert alert-danger'>{error}</div>}
      <{ loading && <div>Loading...</div> }

      <div>
        {!loading && !products.length ? (
          <p>No products to display.</p>
        ) : (
          <ProductList products={products} />
        )}
      </div>

      <nav className='d-flex justify-content-center mt-4' aria-label='Pagination'>
        <ul className='pagination'>
          <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
            <button className='page-link' onClick={() => goToPage(page - 1)}>Prev</button>
          </li>

          <li className='page-item disabled'>
            <span className='page-link'>{page + 1} / {totalPages || 1}</span>
          </li>

          <li className={` page-item ${page + 1 >= totalPages ? 'disabled' : ''}`}>
            <button className='page-link' onClick={() => goToPage(page + 1)}>Next</button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default App;
