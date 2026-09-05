package org.ecom.productcatalog.service;

import org.ecom.productcatalog.Product;
import org.ecom.productcatalog.dto.PagedResponse;
import org.ecom.productcatalog.repository.ProductRepository;
import org.ecom.productcatalog.repository.spec.ProductSpecifications;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    @Autowired
    public ProductRepository productRepository;

    public Page<Product> getProducts(int page, int size, String search, Long categoryId, Sort sort) {
        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<Product> spec = Specification.where(ProductSpecifications.search(search))
                .and(ProductSpecifications.hasCategoryId(categoryId));
        return productRepository.findAll(spec, pageable);
    }

    public static PagedResponse<Product> toPagedResponse(Page<Product> p) {
        return new PagedResponse<>(
                p.getContent(),
                p.getNumber(),
                p.getSize(),
                p.getTotalElements(),
                p.getTotalPages(),
                p.getNumberOfElements(),
                p.isFirst(),
                p.isLast()
        );
    }
}
