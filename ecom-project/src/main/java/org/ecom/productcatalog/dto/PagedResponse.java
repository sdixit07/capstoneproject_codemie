package org.ecom.productcatalog.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Stable JSON envelope for a page of results.
 *
 * <p>Spring Data's {@code PageImpl} is deliberately not serialized directly: its JSON
 * structure is not part of Spring Data's public contract (Boot even warns about it), so
 * this small DTO pins the exact field names the clients rely on.</p>
 *
 * @param content       the items on the requested page
 * @param page          zero based index of the returned page
 * @param size          the requested page size
 * @param totalElements total number of items across all pages
 * @param totalPages    total number of pages for the requested size
 * @param sort          human readable description of the applied ordering, e.g. {@code "price: DESC,id: ASC"}
 */
public record PagedResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        String sort) {

    public static <T> PagedResponse<T> from(Page<T> page) {
        return new PagedResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getSort().toString());
    }
}
