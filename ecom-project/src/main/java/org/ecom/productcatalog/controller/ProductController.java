package org.ecom.productcatalog.controller;

import org.ecom.productcatalog.Product;
import org.ecom.productcatalog.dto.PagedResponse;
import org.ecom.productcatalog.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    public ProductService productService;

    /**
     * GET /api/products?page=0&size=12&search=phone&categoryId=1&sort=price,asc
     *
     * sort format: field,direction -> e.g. "price,asc", "name,desc"
     */
    @GetMapping
    public PagedResponse<Product> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String sort
    ) {
        Sort sortObj = parseSort(sort);
        Pageable pageable = PageRequest.of(page, size, sortObj);

        Page<Product> resultPage = productService.searchProducts(search, categoryId, pageable);

        return new PagedResponse<>(
                resultPage.getContent(),
                resultPage.getNumber(),
                resultPage.getSize(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages()
        );
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by("d").ascending();
        }

        String[] parts = sort.split(",");
        String property = parts[0].trim();
        Sort.Direction direction = Sort.Direction.ASC;
        if (parts.length > 1) {
            try {
                direction = Sort.Direction.fromString(parts[1].trim());
            } catch (IllegalArgumentException ignored) {
                direction = Sort.Direction.ASC;
            }
        }
        return Sort.by(direction, property);
    }
}
