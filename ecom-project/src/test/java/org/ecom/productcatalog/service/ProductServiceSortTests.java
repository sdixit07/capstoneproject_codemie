package org.ecom.productcatalog.service;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Unit tests for the sort allow-list used by the product endpoints. */
class ProductServiceSortTests {

    @Test
    void buildSort_defaultsToIdAsc() {
        assertEquals(Sort.by(Sort.Direction.ASC, "id"), ProductService.buildSort(null, null));
    }

    @Test
    void buildSort_acceptsAllowListedFields() {
        assertEquals(Sort.by(Sort.Direction.ASC, "name"), ProductService.buildSort("name", "asc"));
        assertEquals(Sort.by(Sort.Direction.DESC, "price"), ProductService.buildSort("price", "desc"));
        assertEquals(Sort.by(Sort.Direction.DESC, "id"), ProductService.buildSort("id", "desc"));
    }

    @Test
    void buildSort_normalisesCaseAndWhitespace() {
        assertEquals(Sort.by(Sort.Direction.DESC, "price"), ProductService.buildSort(" Price ", " DESC "));
    }

    @Test
    void buildSort_rejectsFieldsOutsideAllowList() {
        assertEquals(Sort.by(Sort.Direction.ASC, "id"), ProductService.buildSort("description", "asc"));
        assertEquals(Sort.by(Sort.Direction.DESC, "id"), ProductService.buildSort("category.name", "desc"));
        assertEquals(Sort.by(Sort.Direction.ASC, "id"), ProductService.buildSort("", "asc"));
    }

    @Test
    void buildSort_rejectsUnknownDirection() {
        assertEquals(Sort.by(Sort.Direction.ASC, "price"), ProductService.buildSort("price", "descending"));
        assertEquals(Sort.by(Sort.Direction.ASC, "price"), ProductService.buildSort("price", ""));
    }
}
