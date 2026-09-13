package org.ecom.productcatalog.service;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Unit tests for the paging bounds and the deterministic sort used by the product endpoints. */
class ProductServicePagingTests {

    @Test
    void buildPageable_usesRequestedPageAndSize() {
        Pageable pageable = ProductService.buildPageable(2, 25, "id", "asc");

        assertEquals(2, pageable.getPageNumber());
        assertEquals(25, pageable.getPageSize());
        assertEquals(Sort.by(Sort.Direction.ASC, "id"), pageable.getSort());
    }

    @Test
    void buildPageable_appendsIdAscAsTiebreaker() {
        assertEquals(Sort.by(Sort.Direction.DESC, "price").and(Sort.by(Sort.Direction.ASC, "id")),
                ProductService.buildPageable(0, 10, "price", "desc").getSort());
        assertEquals(Sort.by(Sort.Direction.ASC, "name").and(Sort.by(Sort.Direction.ASC, "id")),
                ProductService.buildPageable(0, 10, "name", "asc").getSort());
    }

    @Test
    void buildPageable_doesNotDuplicateIdWhenSortingById() {
        assertEquals(Sort.by(Sort.Direction.DESC, "id"),
                ProductService.buildDeterministicSort("id", "desc"));
        assertEquals(Sort.by(Sort.Direction.ASC, "id"),
                ProductService.buildDeterministicSort("bogus", "sideways"));
    }

    @Test
    void buildPageable_acceptsTheBoundaryValues() {
        assertEquals(ProductService.MIN_SIZE, ProductService.buildPageable(0, ProductService.MIN_SIZE, null, null).getPageSize());
        assertEquals(ProductService.MAX_SIZE, ProductService.buildPageable(0, ProductService.MAX_SIZE, null, null).getPageSize());
    }

    @Test
    void validatePaging_rejectsNegativePage() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> ProductService.validatePaging(-1, ProductService.DEFAULT_SIZE));
        assertTrue(ex.getMessage().contains("page must not be negative"), ex.getMessage());
    }

    @Test
    void validatePaging_rejectsSizeBelowMinimum() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> ProductService.validatePaging(0, 0));
        assertTrue(ex.getMessage().contains("size must be at least 1"), ex.getMessage());
    }

    @Test
    void validatePaging_rejectsSizeAboveMaximum() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> ProductService.validatePaging(0, ProductService.MAX_SIZE + 1));
        assertTrue(ex.getMessage().contains("size must not be greater than 50"), ex.getMessage());
    }
}
