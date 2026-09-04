package org.ecom.productcatalog.spec;

import org.ecom.productcatalog.Product;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public final class ProductSpecifications {
    private ProductSpecifications() {}

    public static Specification<Product> hasCategoryId(Long categoryId) {
        return (root, query, cb) -> categoryId == null ? cb.conjunction() : cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Product> nameOrDescriptionContains(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return cb.conjunction();
            }

            String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)
            );
        };
    }
}
