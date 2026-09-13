import { useEffect, useState } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import ProductList from './ProductList'
import CategoryFilter from './CategoryFilter'
import Pagination from './Pagination'
import {
  fetchCategories,
  fetchProducts,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_DIR,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from './api/productsApi'

// value is "<sortBy>:<sortDir>" so a single select can drive both backend params.
const SORT_OPTIONS = [
  { value: 'id:asc', label: 'Sort by: Featured' },
  { value: 'price:asc', label: 'Sort by Price: Low to High' },
  { value: 'price:desc', label: 'Sort by Price: High to Low' },
  { value: 'name:asc', label: 'Sort by Name: A to Z' },
  { value: 'name:desc', label: 'Sort by Name: Z to A' },
];

const EMPTY_PAGE = {
  content: [],
  page: DEFAULT_PAGE,
  size: DEFAULT_PAGE_SIZE,
  totalElements: 0,
  totalPages: 0,
  sort: '',
};

function App() {
  // One page of products at a time - the full catalog is never fetched.
  const [productPage, setProductPage] = useState(EMPTY_PAGE);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(DEFAULT_SORT_BY);
  const [sortDir, setSortDir] = useState(DEFAULT_SORT_DIR);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories()
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(err => console.error('Unable to load categories', err));
  }, []);

  // Products are re-fetched whenever the page, the category or the sort order
  // changes, so both ordering and paging come from the backend.
  useEffect(() => {
    let ignore = false;

    fetchProducts({ categoryId: selectedCategory, page, size: DEFAULT_PAGE_SIZE, sortBy, sortDir })
      .then(data => {
        if (ignore) return;
        setProductPage(data);
        setError(null);
      })
      .catch(err => {
        if (ignore) return;
        console.error('Unable to load products', err);
        setProductPage(EMPTY_PAGE);
        setError('Unable to load products. Please try again.');
      });

    return () => { ignore = true; };
  }, [selectedCategory, sortBy, sortDir, page]);

  // Changing what is being looked at always restarts from the first page,
  // otherwise the user can land on a page that no longer exists.
  const handleSearchChange = (event) =>{
    setSearchTerm(event.target.value);
    setPage(DEFAULT_PAGE);
  };

  const handleSortChange = (event) =>{
    const [nextSortBy, nextSortDir] = event.target.value.split(':');
    setSortBy(nextSortBy);
    setSortDir(nextSortDir);
    setPage(DEFAULT_PAGE);
  };

  const handleCategorySelect = (categoryId) =>{
    setSelectedCategory(categoryId ? Number(categoryId) : null);
    setPage(DEFAULT_PAGE);
  };

  const handlePageChange = (nextPage) =>{
    if (nextPage < 0) return;
    setPage(nextPage);
  };

  // The backend has no name search yet, so the free text filter is applied to
  // the current page only - deliberately, since fetching the whole catalog to
  // search it is exactly what server side paging is meant to avoid.
  const visibleProducts = productPage.content.filter(product =>
    (product.name ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='container'>
      <h1>Product Catalog</h1><br/>

      <div className='row align-items-center mb-4'>
        <div className='col-md-3 col-sm-12 mb-2'>
          <CategoryFilter categories={categories}  onSelect={handleCategorySelect}/>
        </div>

        <div className='col-md-5 col-sm-12 mb-2'>
        <input 
          type='text'
          className='form-control'
          placeholder='Search for products'
          onChange={handleSearchChange} />
        </div>

        <div className='col-md-4 col-sm-12 mb-2'>
          <select
            id='sortSelect'
            aria-label='Sort products'
            className='form-control'
            value={`${sortBy}:${sortDir}`}
            onChange={handleSortChange}>
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>


      <div>
        {error ? (
          <p>{error}</p>
        ) : visibleProducts.length ?(
          //Display products
          <ProductList products={visibleProducts} />
        ):(
          <p>No prodcuts to display.</p>
        )}
      </div>

      {!error && (
        <Pagination
          page={productPage.page}
          totalPages={productPage.totalPages}
          totalElements={productPage.totalElements}
          onPageChange={handlePageChange} />
      )}

    </div>
  )
}

export default App
