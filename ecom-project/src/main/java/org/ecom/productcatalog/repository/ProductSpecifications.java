package org.ecom.productcatalog.repository;

import java.util.Locale;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.ecom.productcatalog.Category;
import org.ecom.productcatalog.Product;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class ProductSpecifications {
    private ProductSpecifications() {}

    public static Specification<Product> hasCategoryId(Long categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) {
                return cb.conjenction();
            }

            Join<Product, Category> category = root.join("category", JoinType.LEFT);
            return cb.equal(category.get("id"), categoryId);
        };
    }

    public static Specification<Product> search(String search) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(search)) {
                return cb.conjunction();
            }

            String term = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";

            return cb.or(
                    cb.like(cb.lower(root.get("name")), term),
                    cb.like(cb.lower(root.get("description")), term)
            );
        };
    }
}
