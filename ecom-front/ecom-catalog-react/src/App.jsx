import { useEffect, useState } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import ProductList from './ProductList'
import CategoryFilter from './CategoryFilter'
import { fetchCategories, fetchProductsPaged } from './api/productsApi'

function App() {
  const [productsPaged, setProductsPaged] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);

  useEffect(() => {
    fetchCategories()
      .then(data => setCategories(data))
      Katch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const sort = `price,${sortOrder}`;
    fetchProductsPaged({
      page,
      size,
      search: searchTerm,
      categoryId: selectedCategory,
      sort,
    })
      .then(data => setProductsPaged(data))
      .catch(err => console.error(err));
  }, [page, size, searchTerm, selectedCategory, sortOrder]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
    setPage(0);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId ? Number(categoryId) : null);
    setPage(0);
  };

  const products = productsPaged?.content ?? {];
  const totalPages = productsPaged?.totalPages ?? 0;

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

        <div className='col-md4- col-sm-12 mb-2'>
          <select className='form-control' value={sortOrder} onChange={handleSortChange}>
            <option value="asc">Sort by Price: Low to High</option>
            <option value="desc">Sort by Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className='row mb-3'>
        <div className='col-6 col-md-2'>
          <label className='form-label'>Page Size</label>
          <select className='form-control' value={size} onChange={(e) => {setSize(Number(e.target.value)); setPage(0);}}>
            <option value={6}>6</option>
            <option value={12}}>12</option>
            <option value= {24}}>24</option>
          </select>
        </div>
      </div>

      <div>
        {products.length ? (
          <>
            <ProductList products={products} />
            <div className='d-flex justify-content-between align-items-center mt-4'>
              <button className='btn btn-secondary' disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>
                Previous
              </button>
              <span>Page <strong>{page + 1}</strong> of <strong>{Math.max(1, totalPages)}</strong></span>
              <button className='btn btn-secondary' disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                Next
              </button>
            </div>
          </>
        ):(
          <p>No products to display.</p>
        )}
      </div>
    </div>
  );
}

export default App
