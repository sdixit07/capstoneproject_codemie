import { useEffect, useState } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import ProductList from './ProductList'
import CategoryFilter from './CategoryFilter'
import { fetchCategories, fetchProducts, DEFAULT_SORT_BY, DEFAULT_SORT_DIR } from './api/productsApi'

// value is "<sortBy>:<sortDir>" so a single select can drive both backend params.
const SORT_OPTIONS = [
  { value: 'id:asc', label: 'Sort by: Featured' },
  { value: 'price:asc', label: 'Sort by Price: Low to High' },
  { value: 'price:desc', label: 'Sort by Price: High to Low' },
  { value: 'name:asc', label: 'Sort by Name: A to Z' },
  { value: 'name:desc', label: 'Sort by Name: Z to A' },
];

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(DEFAULT_SORT_BY);
  const [sortDir, setSortDir] = useState(DEFAULT_SORT_DIR);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories()
      .then(data => setCategories(data))
      .catch(err => console.error('Unable to load categories', err));
  }, []);

  // Products are re-fetched whenever the category or the sort order changes,
  // so ordering always comes from the backend.
  useEffect(() => {
    let ignore = false;

    fetchProducts({ categoryId: selectedCategory, sortBy, sortDir })
      .then(data => {
        if (ignore) return;
        setProducts(data);
        setError(null);
      })
      .catch(err => {
        if (ignore) return;
        console.error('Unable to load products', err);
        setProducts([]);
        setError('Unable to load products. Please try again.');
      });

    return () => { ignore = true; };
  }, [selectedCategory, sortBy, sortDir]);

  const handleSearchChange = (event) =>{
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event) =>{
    const [nextSortBy, nextSortDir] = event.target.value.split(':');
    setSortBy(nextSortBy);
    setSortDir(nextSortDir);
  };

  const handleCategorySelect = (categoryId) =>{
    setSelectedCategory(categoryId ? Number(categoryId) : null);
  };

  // Only the free text search stays on the client; filtering by category and
  // sorting are both handled by the backend.
  const visibleProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      
    </div>
  )
}

export default App
