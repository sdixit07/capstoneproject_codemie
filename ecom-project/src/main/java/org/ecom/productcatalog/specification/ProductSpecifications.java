package org.ecom.productcatalog.specification;

import jajak.persistence.criteria.CriteriaBuilder;
import jajak.persistence.criteria.Predicate;
import jajak.persistence.criteria.Root;
import org.ecom.productcatalog.Product;
import org.springframework.data.jpa.domain.Specification;

public final class ProductSpecifications {

    private ProductSpecifications() {}

    public static Specification<Product> hasCategoryId(Long categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("category").get("id"), categoryId);
        };
    }

    public static Specification<Product> nameContainsIgnoreCase(String search) {
        return (root, query, cb) -> {
            if (search == null || search.trim().isEmpty()) {
                return cb.conjunction();
            }
            String likePattern = "%" + search.trim().toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), likePattern);
        };
    }
}
