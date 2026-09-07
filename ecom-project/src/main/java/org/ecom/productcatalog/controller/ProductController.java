package org.ecom.productcatalog.controller;

import org.ecom.productcatalog.Product;
import org.ecom.productcatalog.dto.PagedResponse;
import org.ecom.productcatalog.service.ProductService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static java.lang.Math.min;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * GET /api/products?page=0&size=12&search=iphone&categoryId=1&sort=price,asc
     */
    @GetMapping
    public PagedResponse<Product> getProducts(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "12") int size,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "sort", defaultValue = "id,asc") String sort
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = min(Math.max(size, 1), 100);

        Sort sortObj = parseSort(sort);
        PageRequest pageable = PageRequest.of(safePage, safeSize, sortObj);

        Page<Product> pageResult = productService.findProducts(search, categoryId, pageable);

        return new PagedResponse<>(
            pageResult.getContent(),
            pageResult.number(),
            pageResult.size(),
            pageResult.getTotalElements(),
            pageResult.getTotalPages(),
            pageResult.isLast()
        );
    }

    /* Keep old endpoint for backwards compatibility */
    @GetMapping("category/{categoryId}")
    public List<Product> getProductByCategory(@PathVariable Long categoryId) {
        return productService.getProductByCategory(categoryId);
    }

    private Sort parseSort(String sort) {
        // expected: field,dir
        String[] parts = sort == null ? new String[0] : sort.split(",");
        String field = parts.length > 0 ? parts[0].trim() : "id";
        String dir = parts.length > 1 ? parts[1].trim() : "asc";

        if (!(field.equals("id") || field.equals("name") || field.equals("price"))) {
            field = "id";
        }

        Sort.Direction direction = "desc".equalsIgnoreCase(dir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return Sort.by(direction, field);
    }
}
