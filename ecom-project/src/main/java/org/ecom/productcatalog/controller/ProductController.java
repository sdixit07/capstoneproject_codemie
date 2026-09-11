package org.ecom.productcatalog.controller;

import org.ecom.productcatalog.Product;
import org.ecom.productcatalog.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    public ProductService productService;

    /**
     * Lists the catalog. Every query parameter is optional; with no parameters
     * the full product list is returned exactly as before.
     *
     * @param categoryId filter by category id
     * @param minPrice   inclusive lower price bound (price >= minPrice)
     * @param maxPrice   inclusive upper price bound (price <= maxPrice)
     * @param search     case insensitive match on name or description
     * @param sort       "field,direction" e.g. "price,desc"
     */
    @GetMapping
    public List<Product> getAllProducts(@RequestParam(required = false) Long categoryId,
                                        @RequestParam(required = false) Double minPrice,
                                        @RequestParam(required = false) Double maxPrice,
                                        @RequestParam(required = false) String search,
                                        @RequestParam(required = false) String sort){
        return productService.getProducts(categoryId, minPrice, maxPrice, search, sort);
    }

    @GetMapping("category/{categoryId}")
    public List<Product> getProductByCategory(@PathVariable Long categoryId){
        return productService.getProductByCategory(categoryId);
    }
}
