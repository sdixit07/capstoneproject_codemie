import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import ProductList from './ProductList'
import CategoryFilter from './CategoryFilter'
import { fetchProducts, fetchCategories } from './api/productsApi'

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortorder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initial load of categories and products
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const productsData = await fetchProducts(searchTerm);
        setProducts(productsData);
      } catch (err) {
        setError(err.message || 'Failed to search products');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSearchChange = (event) =>{
    setSearchTerm(event.target.value);
  };
  
  const handleSortChange = (event) =>{
    setSortOrder(event.target.value);
  };

  const handleCategorySelect = (categoryId) =>{
    setSelectedCategory(categoryId ? Number(categoryId) : null);
  };

  // Apply client-side category filter and sort to server-returned products
  const filteredProducts = products
        .filter( product => {
          return(
            (selectedCategory ? product.category.id === selectedCategory : true)
          )
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

      <div className='row align-items-center mb-4'>
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

        <div className='col-md-4 col-sm-12 mb-2'>
          <select className='form-control' onChange={handleSortChange}>
            <option value="asc">Sort by Price: Low to High</option>
            <option value="desc">Sort by Price: High to Low</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <div>
        {!loading && filteredProducts.length ?(
          <ProductList products={filteredProducts} />
        ):(
          !loading && <p>No products found.</p>
        )}
      </div>
      
    </div>
  )
}

export default App
