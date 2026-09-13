package org.ecom.productcatalog.service;

import org.ecom.productcatalog.Product;
import org.ecom.productcatalog.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class ProductService {

    /** Properties a client is allowed to sort by. Anything else falls back to the default. */
    public static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "name", "price");
    public static final String DEFAULT_SORT_BY = "id";
    public static final String DEFAULT_SORT_DIR = "asc";

    /** Paging bounds. Unlike the sort params these are validated strictly (400 on violation). */
    public static final int DEFAULT_PAGE = 0;
    public static final int DEFAULT_SIZE = 10;
    public static final int MIN_SIZE = 1;
    public static final int MAX_SIZE = 50;

    /** String forms of the paging defaults, for @RequestParam defaultValue (needs a constant). */
    public static final String DEFAULT_PAGE_PARAM = "0";
    public static final String DEFAULT_SIZE_PARAM = "10";

    @Autowired
    public ProductRepository productRepository;

    public List<Product> getAllProducts(){
        return getAllProducts(DEFAULT_SORT_BY, DEFAULT_SORT_DIR);
    }

    public List<Product> getAllProducts(String sortBy, String sortDir){
        return productRepository.findAll(buildSort(sortBy, sortDir));
    }

    public List<Product> getProductByCategory(Long categoryId){
        return getProductByCategory(categoryId, DEFAULT_SORT_BY, DEFAULT_SORT_DIR);
    }

    public List<Product> getProductByCategory(Long categoryId, String sortBy, String sortDir){
        return productRepository.findByCategoryId(categoryId, buildSort(sortBy, sortDir));
    }

    /** Returns one page of the whole catalog. */
    public Page<Product> getProductsPage(int page, int size, String sortBy, String sortDir){
        return productRepository.findAll(buildPageable(page, size, sortBy, sortDir));
    }

    /** Returns one page of a single category. */
    public Page<Product> getProductsByCategoryPage(Long categoryId, int page, int size, String sortBy, String sortDir){
        return productRepository.findByCategoryId(categoryId, buildPageable(page, size, sortBy, sortDir));
    }

    /**
     * Builds a {@link Pageable} for the given raw request params.
     *
     * @throws IllegalArgumentException if page or size are outside the supported bounds;
     *                                 the controller turns this into an HTTP 400.
     */
    public static Pageable buildPageable(int page, int size, String sortBy, String sortDir){
        validatePaging(page, size);
        return PageRequest.of(page, size, buildDeterministicSort(sortBy, sortDir));
    }

    /** Rejects out of range paging params instead of silently clamping them. */
    public static void validatePaging(int page, int size){
        if (page < 0) {
            throw new IllegalArgumentException("page must not be negative (was " + page + ")");
        }
        if (size < MIN_SIZE) {
            throw new IllegalArgumentException("size must be at least " + MIN_SIZE + " (was " + size + ")");
        }
        if (size > MAX_SIZE) {
            throw new IllegalArgumentException("size must not be greater than " + MAX_SIZE + " (was " + size + ")");
        }
    }

    /**
     * Same allow-list as {@link #buildSort(String, String)} but always ends with id ascending.
     * Without that tiebreaker two products with equal name or price could swap places between
     * requests, which makes paging skip or repeat rows.
     */
    public static Sort buildDeterministicSort(String sortBy, String sortDir){
        Sort sort = buildSort(sortBy, sortDir);
        if (sort.getOrderFor(DEFAULT_SORT_BY) != null) {
            return sort;
        }
        return sort.and(Sort.by(Sort.Direction.ASC, DEFAULT_SORT_BY));
    }

    /**
     * Builds a Spring Data {@link Sort} from raw request params. Unknown fields or
     * directions are ignored and silently replaced by the defaults (id, asc) so that
     * a bad query string never fails the request.
     */
    public static Sort buildSort(String sortBy, String sortDir){
        String field = sortBy == null ? "" : sortBy.trim();
        if (!ALLOWED_SORT_FIELDS.contains(field.toLowerCase())) {
            field = DEFAULT_SORT_BY;
        } else {
            field = field.toLowerCase();
        }

        String direction = sortDir == null ? "" : sortDir.trim().toLowerCase();
        Sort.Direction resolvedDirection = "desc".equals(direction)
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        return Sort.by(resolvedDirection, field);
    }
}
