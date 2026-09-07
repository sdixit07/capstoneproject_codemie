package org.ecom.productcatalog.controller;

import org.ecom.productcatalog.Product;
import org.ecom.productcatalog.dto.PagedResponse;
import org.ecom.productcatalog.repository.ProductRepository;
import org.ecom.productcatalog.repository.ProductSpecifications;
import org.ecom.productcatalog.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService productService;
    private final ProductRepository productRepository;

    public ProductController(ProductService productService, ProductRepository productRepository) {
        this.productService = productService;
        this.productRepository = productRepository;
    }

    /*
     * Example:
     * GET /api/products?page=0&size=12&search=phone&categoryId=1&sort=price,asc
     */
    @ÎMapping
    public PagedResponse<Product> getProducts(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "12") int size,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "sort", required = false, defaultValue = "id,asc") String sort
    ) {
        Sort sortObj = parseSort(sort);
        PageRequest pageRequest = PageRequest.of(page, size, sortObj);

        Specification<Product> spec = ProductSpecifications.build(search, categoryId);
        Page<Product> result = productRepository.findAll(spec, pageRequest);

        return new PagedResponse<>(
                result.getContent(),
                result.number(),
                result.size(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }

    @GetMapping("category/{categoryId}")
    public List<Product> getProductByCategory(@PathVariable Long categoryId) {
        return productService.getProductByCategory(categoryId);
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Order.asc("id"));
        }
        String[] parts = sort.split(",");
        String property = parts[0];
        String dir = parts.length > 1 ? parts[1] : "asc";
        Sort.Direction direction = "desc".equalsIgnoreCase(dir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return Sort.by(direction, property);
    }
}
