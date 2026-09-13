package org.ecom.productcatalog.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.ecom.productcatalog.Product;
import org.ecom.productcatalog.dto.PagedResponse;
import org.ecom.productcatalog.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    public ProductService productService;

    /**
     * One page of the catalog. Paging params are validated strictly (400 when out of range),
     * while sortBy / sortDir keep falling back to the defaults so a stale bookmark cannot
     * break the page. Ordering always ends with id ascending, so paging is deterministic.
     */
    @GetMapping
    public PagedResponse<Product> getAllProducts(
            @RequestParam(required = false, defaultValue = ProductService.DEFAULT_PAGE_PARAM) int page,
            @RequestParam(required = false, defaultValue = ProductService.DEFAULT_SIZE_PARAM) int size,
            @RequestParam(required = false, defaultValue = ProductService.DEFAULT_SORT_BY) String sortBy,
            @RequestParam(required = false, defaultValue = ProductService.DEFAULT_SORT_DIR) String sortDir){
        return PagedResponse.from(productService.getProductsPage(page, size, sortBy, sortDir));
    }

    /** Same contract as {@link #getAllProducts}, restricted to a single category. */
    @GetMapping("category/{categoryId}")
    public PagedResponse<Product> getProductByCategory(
            @PathVariable Long categoryId,
            @RequestParam(required = false, defaultValue = ProductService.DEFAULT_PAGE_PARAM) int page,
            @RequestParam(required = false, defaultValue = ProductService.DEFAULT_SIZE_PARAM) int size,
            @RequestParam(required = false, defaultValue = ProductService.DEFAULT_SORT_BY) String sortBy,
            @RequestParam(required = false, defaultValue = ProductService.DEFAULT_SORT_DIR) String sortDir){
        return PagedResponse.from(
                productService.getProductsByCategoryPage(categoryId, page, size, sortBy, sortDir));
    }

    /** Turns out of range paging params into a 400 with a readable body. */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidRequestParams(
            IllegalArgumentException ex, HttpServletRequest request){
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", HttpStatus.BAD_REQUEST.getReasonPhrase());
        body.put("message", ex.getMessage());
        body.put("path", request.getRequestURI());
        return ResponseEntity.badRequest().body(body);
    }
}
