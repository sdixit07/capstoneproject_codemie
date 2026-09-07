package org.ecom.productcatalog.repository;

import jakarta.persistence.criteria.Join;
import org.ecom.productcatalog.Product;
import org.springframework.data.jpa.domain.Specification;

import static org.springframework.data.jpa.domain.Specification.where;

public final class ProductSpecifications {

    private ProductSpecifications() {}

    public static Specification<Product> withCategoryId(Long categoryId) {
        if (categoryId == null) {
            return null;
        }
        return (root, query, cb) -> {
            Join<object, object> category = root.join("category");
            return cb.equal(category.get("id"), categoryId);
        };
    }

    public static Specification<Product> withSearch(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        String term = "%" + search.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), term),
                cb.like(cb.lower(root.get("description")), term)
        );
    }

    public static Specification<Product> build(String search, Long categoryId) {
        return where(withSearch(search))
                .and(withCategoryId(categoryId));
    }
}
