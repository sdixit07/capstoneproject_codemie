import { useEffect, useMemo, useState } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import ProductList from './ProductList'
import CategoryFilter from './CategoryFilter'
import { fetchCategories, fetchProducts } from './api/catalogApi'

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortorder, setSortOrder] = useState("asc");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sort = useMemo(() => `price,${sortorder}`, [sortorder]);

  useEffect(() => {
    fetchCategories()
      .then(data => setCategories(data))
      .catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    fetchProducts({
      page,
      size,
      search: searchTerm,
      categoryId: selectedCategory,
      sort
    })
      .then(data => {
        if (ignore) return;
        setProducts(data.items || []);
        setTotalPages(data.totalPages ?? 0);
        setTotalElements(data.totalElements ?? 0);
      })
      .catch(e => {
        if (ignore) return;
        setError(e.message);
      })
      .finally(() => {
        if (ignore) return;
        setLoading(false);
      });

    return () => {
      ignore = true;
    }
  }, [page, size, searchTerm, selectedCategory, sort]);

  const handleSearchChange = (event) =>{
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleSortChange = (event) =>{
    setSortOrder(event.target.value);
    setPage(0);
  };

  const handleCategorySelect = (categoryId) =>{
    setSelectedCategory(categoryId ? Number(categoryId) : null);
    setPage(0);
  };

  const handleSizeChange = (event) => {
    setSize(Number(event.target.value));
    setPage(0);
  }

  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  return (
    <div className='container'>
      <h1>Product Catalog</h1><br/>

      <div className='row align-items-center mb-3'>
        <div className='col-md-3 col-sm-12 mb-2'>
          <CategoryFilter categories={categories}  onSelect={handleCategorySelect}/>
        </div>

        <div className='col-md-5 col-sm-12 mb-2'>
          <input 
            type='text'
            className='form-control'
            placeholder='Search for products'
            value={searchTerm}
            onChange={handleSearchChange} />
        </div>

        <div className='col-md-2 col-sm-12 mb-2'>
          <select className='form-control' value={sortorder} onChange={handleSortChange}>
            <option value="asc">Sort by Price: Low to High</option>
            <option value="desc">Sort by Price: High to Low</option>
          </select>
        </div>

        <div className='col-md-2 col-sm-12 mb-2'>
          <select className='form-control' value={size} onChange={handleSizeChange}>
            <option value={6}>6 / page</option>
            <option value={12}>12 / page</option>
            <option value={24}>24 / page</option>
          </select>
        </div>
      </div>

      <div className='d-flex justify-content-between align-items-center mb-3'>
        <div>
          {totalElements ? (
            <small className='text-muted'>
              Showing page {page + 1} of {Math.max(totalPages, 1)} ({totalElements} items)
            </small>
          ) : null}
        </div>

        <div className='btn-group' role='group' aria-label='Pagination'>
          <button className='btn btn-outline-primary' disabled={!canPrev || loading} onClick={() => setPage(p => Math.max(0, p - 1))}>
            Prev
          </button>
          <button className='btn btn-outline-primary' disabled={!canNext || loading} onClick={() => setPage(p => p + 1)}>
            Next
          </button>
        </div>
      </div>

      {error ? <div className='alert alert-danger'>{error}</div> : null}
      {loading ? <p>Loading...</p> : null}

      <div>
        {products.length ?(
          <ProductList products={products} />
        ):(
          !loading ? <p>No products to display.</p> : null
        )}
      </div>
      
    </div>
  )
}

export default App
