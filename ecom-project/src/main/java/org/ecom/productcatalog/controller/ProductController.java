package org.ecom.productcatalog.controller;

import org.ecom.productcatalog.Product;
import org.ecom.productcatalog.dto.PagedResponse;
import org.ecom.productcatalog.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 12;
    private static final int MAX_SIZE = 100;
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "name", "price");

    @Autowired
    public ProductService productService;

    @GetMapping
    public PagedResponse<Product> getProducts(
            @RequestParam(name = "page", required = false) Integer page,
            @RequestParam(name = "size", required = false) Integer size,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestParam(name = "sort", required = false) String sort
    ){
        int p = (page == null || page < 0) ? DEFAULT_PAGE : page;
        int s = (size == null || size <= 0) ? DEFAULT_SIZE : Math.min(size, MAX_SIZE);

        Sort parsedSort = parseSort(sort);
        PageRequest pageable = PageRequest.of(p, s, parsedSort);

        Page<Product> resultPage = productService.searchProducts(search, categoryId, pageable);

        return new PagedResponse<>(
                resultPage.getContent(),
                resultPage.getNumber(),
                resultPage.getSize(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                resultPage.hasNext(),
                resultPage.hasPrevious(),
                sortToString(parsedSort)
        );
    }

    // Backward-compatible endpoint (can be removed later)
    @GetMapping("category/{categoryId}")
    public List<Product> getProductByCategory(@PathVariable Long categoryId){
        return productService.getProductByCategory(categoryId);
    }

    private Sort parseSort(String sort) {
        // expected format: field,direction e.g. name,asc
        String defaultSort = "name,asc";
        String value = (sort == null || sort.trim().isEmpty()) ? defaultSort : sort.trim();

        String[] parts = value.split(",");
        String field = parts.length > 0 ? parts[0].trim() : "name";
        String dir = parts.length > 1 ? parts[1].trim() : "asc";

        if (!ALLOWED_SORT_FIELDS.contains(field)) {
            field = "name";
        }

        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(dir);
        } catch (Exception ex) {
            direction = Sort.Direction.ASC;
        }

        return Sort.by(direction, field);
    }

    private String sortToString(Sort sort) {
        if (sort == null || sort.isUnsorted()) return "";
        Sort.Order order = sort.iterator().next();
        return order.getProperty() + "," + order.getDirection().name().toLowerCase();
    }
}
