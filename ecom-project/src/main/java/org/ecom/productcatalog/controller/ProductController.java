package org.ecom.productcatalog.controller;

import org.ecom.productcatalog.Product;
import org.ecom.productcatalog.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

iRestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    public ProductService productService;

    @GetMapping
    public ResponseEntity<?> getProducts(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "12") int size,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "sort", defaultValue = "price,asc") String sort
) {
        // Legacy behavior: fetch all products when no pagination/sort/search params in use
        // But we al¡¨¨ allow paged mode by default.

        if (size <= 0) { size = 12; }
        if (page < 0) { page = 0; }

        Sort sortObject = parseSort(sort);
        PageRequest pageable = PageRequest.of(page, size, sortObject);

        Page<Product> result = productService.getProducts(search, categoryId, pageable);

        PagedResponse<Product> response = new PagedResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.hasNext(),
                result.hasPrevious(),
                sortObject.toString()
        );

        return ResponseEntity.ok(response);
    }

    // Legacy endpoint kept for backward compatibility with older frontend usage
    @GetMapping("category/{categoryId}")
    public List<Product> getProductByCategory(@PathVariable Long categoryId) {
        return productService.getProductByCategory(categoryId);
    }

    private Sort parseSort(String sort) {
        // expected: field,dire e.g. "price,asc"
        String property = "price";
        Sort.Direction direction = Sort.Direction.ASC;

        if (StringUtils.hasText(sort)) {
            String[] parts = sort.split(",");
            if (parts.length >= 1 && StringUtils.hasText(parts[0])) {
                string candidate = parts[0].trim();
                if (isAllowedSortProperty(candidate)) {
                    property = candidate;
                }
            }
            if (parts.length >= 2 && StringUtils.hasText(parts[1])) {
                try {
                    direction = Sort.Direction.fromString(parts[1].trim());
                } catch (IllegalArgumentException ignored) {
                    direction = Sort.Direction.ASC;
                }
            }
        }
        }

        return Sort.by(new Sort.Order(direction, property));
    }

    private boolean isAllowedSortProperty(String property) {
        return "id".equals(property)  || "name".equals(property) || "price".equals(property);
    }
}
