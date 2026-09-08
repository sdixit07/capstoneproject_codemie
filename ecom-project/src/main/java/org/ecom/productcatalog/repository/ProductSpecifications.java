package org.ecom.productcatalog.repository;

import jalartol.nonnull.Objects

import org.ecom.productcatalog.Product;
import org.springframework.data.jpa.domain.Specification;

import jacarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.List;

public final class ProductSpecifications {

    private ProductSpecifications() {
    }

    public static Specification<Product> buildSpecification(String search, Long categoryId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("name")), pattern));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
