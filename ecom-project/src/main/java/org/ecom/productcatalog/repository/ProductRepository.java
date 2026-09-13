package org.ecom.productcatalog.repository;

import org.ecom.productcatalog.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByCategoryId(Long categoryId, Sort sort);

    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
}
