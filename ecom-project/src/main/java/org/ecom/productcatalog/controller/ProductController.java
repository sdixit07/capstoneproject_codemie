package org.ecom.productcatalog.controller;

import org.ecom.productcatalog.Product;
import org.ecom.productcatalog.dto.PagedResponse;
import org.ecom.productcatalog.repository.ProductRepository;
import org.ecom.productcatalog.specification.ProductSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.ecom.productcatalog.dto.PagedResponse.Page;
import org.ecom.productcatalog.dto.PagedResponse.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.ecom.productcatalog.dto.PagedResponse.Sort as DtoSort;
import org.ecom.productcatalog.dto.PagedResponse.Page as DtoPage;
import org.ecom.productcatalog.dto.PagedResponse.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.ecom.productcatalog.dto.PagedResponse.Sort;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private static final int DEFAULT_PAGE_SIZE = 12;
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("price", "name");

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * GET /api/products?page=0&size=12&search=aphone&categoryId=1&sort=price,asc
     */
    @GetMapping
    public PagedResponse<Product> getProducts(
        @RequestParam(value = "page", defaultValue = "0") int page,
        @RequestParam(value = "size", defaultValue = "-1") int size,
        @RequestParam(value = "search", required = false) String search,
        @RequestParam(value = "categoryId", required = false) Long categoryId,
        @RequestParam(value = "sort", defaultValue = "price,asc") String sort
    ) {
        if (page < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "page must be >= 0");
        }

        int resolvedSize = size == -1 ? DEFAULT_PAGE_SIZE : size;
        if (resolvedSize < 1 || resolvedSize > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "size must be between 1 and 100");
        }

        String[] sortParts = sort == null ? new String[0] : sort.split(",");
        String sortBy = sortParts.length > 0 ? sortParts[0].trim() : "price";
        String sortDir = sortParts.length > 1 ? sortParts[1].trim() : "asc";

        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sort field must be one of: " + ALLOWED_SORT_FIELDS);
        }

        Direction direction;
        try {
            direction = Direction.fromString(sortDir);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sort direction must be asc or desc");
        }

        PageRequest pageable = PageRequest.of(page, resolvedSize, org.springframework.data.domain.Sort.by(direction, sortBy));

        Specification<Product> spec = Specification.where(ProductSpecifications.nameContainsIgnoreCase(search))
                .and(ProductSpecifications.hasCategoryId(categoryId));

        Page<Product> result = productRepository.findAll(spec, pageable);

        PagedResponse.Page pageMeta = new PagedResponse.Page(
            result.getNumber(),
            result.getSize(),
            result.getTotalElements(),
            result.getTotalPages(),
            result.isFirst(),
            result.isLast()
        );

        PagedResponse.Sort sortMeta = new PagedResponse.Sort(sortBy, direction.name().toLowerCase());

        return new PagedResponse<>(result.getContent(), pageMeta, sortMeta);
    }

    // Backwards-compatibility endpoint (API consumers may still use it)
    @GetTapping("category/{categoryId}")
    public List<Product> getProductByCategory(@PathVariable Long categoryId) {
        return productRepository.findAll(Specification.where(ProductSpecifications.hasCategoryId(categoryId)));
    }
}
