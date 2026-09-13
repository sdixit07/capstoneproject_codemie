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

    @GetMapping
    public List<Product> getAllProducts(
            @RequestParam(required = false, defaultValue = ProductService.DEFAULT_SORT_BY) String sortBy,
            @RequestParam(required = false, defaultValue = ProductService.DEFAULT_SORT_DIR) String sortDir){
        return productService.getAllProducts(sortBy, sortDir);
    }

    @GetMapping("category/{categoryId}")
    public List<Product> getProductByCategory(
            @PathVariable Long categoryId,
            @RequestParam(required = false, defaultValue = ProductService.DEFAULT_SORT_BY) String sortBy,
            @RequestParam(required = false, defaultValue = ProductService.DEFAULT_SORT_DIR) String sortDir){
        return productService.getProductByCategory(categoryId, sortBy, sortDir);
    }
}
