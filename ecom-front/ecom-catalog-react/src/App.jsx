import { useEffect, useState } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import ProductList from './ProductList'
import CategoryFilter from './CategoryFilter'
import PriceFilter from './PriceFilter'
import { fetchCategories, fetchProducts, validatePriceRange } from './api/productsApi'

// keystrokes are debounced so typing a price does not fire one request per digit
const PRICE_DEBOUNCE_MS = 300;

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortorder, setSortOrder] = useState("asc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceError, setPriceError] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    fetchCategories()
      .then(data => setCategories(data))
      .catch(error => setLoadError(error.message))
  }, []);

  // price filtering is done by the backend: /api/products?minPrice=..&maxPrice=..
  useEffect(() => {
    const validationError = validatePriceRange(minPrice, maxPrice);
    setPriceError(validationError);

    // invalid range: keep the current list and do not call the API at all
    if (validationError) {
      return;
    }

    const timer = setTimeout(() => {
      fetchProducts({ minPrice, maxPrice })
        .then(data => {
          setProducts(data);
          setLoadError(null);
        })
        .catch(error => setLoadError(error.message))
    }, PRICE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  const handleSearchChange = (event) =>{
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event) =>{
    setSortOrder(event.target.value);
  };

  const handleCategorySelect = (categoryId) =>{
    setSelectedCategory(categoryId ? Number(categoryId) : null);
  };

  // empties both price fields, clears the validation error and reloads the
  // unfiltered list (the effect above re-runs with no price params)
  const handleClearPriceFilter = () =>{
    setMinPrice("");
    setMaxPrice("");
    setPriceError(null);
  };

  const filteredProducts = products
        .filter( product => {
          return(
            (selectedCategory ? product.category.id === selectedCategory : true)
          ) && product.name.toLowerCase().includes(searchTerm.toLowerCase())
        })
        .sort((a,b) => {
          if(sortorder === "asc"){
            return a.price - b.price
          } else{
            return b.price - a.price
          }
        });

  return (
    <div className='container'>
      <h1>Product Catalog</h1><br/>

      <div className='row align-items-start mb-4'>
        <div className='col-md-3 col-sm-12 mb-2'>
          <CategoryFilter categories={categories}  onSelect={handleCategorySelect}/>
        </div>

        <div className='col-md-3 col-sm-12 mb-2'>
        <input
          type='text'
          className='form-control'
          placeholder='Search for products'
          onChange={handleSearchChange} />
        </div>

        <div className='col-md-3 col-sm-12 mb-2'>
          <select className='form-control' onChange={handleSortChange}>
            <option value="asc">Sort by Price: Low to High</option>
            <option value="desc">Sort by Price: High to Low</option>
          </select>
        </div>

        <div className='col-md-3 col-sm-12 mb-2'>
          <PriceFilter
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            onClear={handleClearPriceFilter}
            error={priceError} />
        </div>
      </div>

      {loadError && (
        <div className='alert alert-danger' role='alert'>{loadError}</div>
      )}

      <div>
        {filteredProducts.length ?(
          //Display products
          <ProductList products={filteredProducts} />
        ):(
          <p>No prodcuts to display.</p>
        )}
      </div>

    </div>
  )
}

export default App
