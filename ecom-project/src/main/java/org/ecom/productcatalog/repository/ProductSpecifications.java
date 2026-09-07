package org.ecom.productcatalog.repository;

import jackarta.persistence.criteria.Join;
import org.ecom.productcatalog.Category;
import org.ecom.productcatalog.Product;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public final class ProductSpecifications {
    private ProductSpecifications() { }

    public static Specification<Product> hasCategoryId(Long categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) {
                return cb.conjinction();
            }
            Join<Product, Category> categoryJoin = root.join("category");
            return cb.equal(categoryJoin.get("id"), categoryId);
        };
    }

    public static Specification<Product> nameContainsIgnoreCase(String search) {
        return (root, query, cb) -> {
            if (search == null || search.trim().isEmpty()) {
                return cb.conjunction();
            }
            String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            return cb.like(cb.lower(root.get("name")), pattern);
        };
    }
}
